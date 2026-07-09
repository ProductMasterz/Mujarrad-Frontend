import {
  diagramRefinementIntentSchema,
} from '../schemas/diagramIntelligence.schema';

import type {
  DiagramRefinementIntent,
} from '../types/diagramIntelligence.types';

import {
  callAiProviderWithUsage,
  type AiTokenUsage,
} from '../tools/aiProviderTool';

import {
  buildRefinementIntentMessages,
} from '../prompts/diagram-intelligence/refinementIntentPrompt';

import {
  routeDiagramRefinement,
  type DiagramPipelineRoute,
} from './refinementRouter';

export interface AnalyzeRefinementIntentResult {
  intent: DiagramRefinementIntent;

  deterministicRoute: DiagramPipelineRoute;

  usage: AiTokenUsage | null;

  source:
    | 'deterministic'
    | 'ai'
    | 'deterministic_fallback';

  warnings: string[];
}

export async function analyzeRefinementIntent(
  instruction: string,
): Promise<AnalyzeRefinementIntentResult> {
  const normalizedInstruction =
    instruction.trim();

  if (!normalizedInstruction) {
    throw new Error(
      'Diagram refinement instruction is empty.',
    );
  }

  const deterministicRoute =
    routeDiagramRefinement(
      normalizedInstruction,
    );

  if (
    deterministicRoute.depth ===
    'fast_edit'
  ) {
    return {
      intent:
        createFastEditIntent(
          normalizedInstruction,
          deterministicRoute,
        ),

      deterministicRoute,

      usage: null,

      source: 'deterministic',

      warnings: [],
    };
  }

  try {
    const result =
      await callAiProviderWithUsage(
        buildRefinementIntentMessages({
          instruction:
            normalizedInstruction,

          deterministicRoute,
        }),
        {
          modelRole: 'diagram',

          temperature: 0.1,



          responseFormat:
            'json_object',
        },
      );

    const parsedJson =
      parseJsonObject(result.content);

    const intent =
      diagramRefinementIntentSchema.parse(
        parsedJson,
      );

    return {
      intent,

      deterministicRoute,

      usage: result.usage,

      source: 'ai',

      warnings: [],
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown intent-analysis error.';

    return {
      intent:
        createFallbackIntent(
          normalizedInstruction,
          deterministicRoute,
        ),

      deterministicRoute,

      usage: null,

      source:
        'deterministic_fallback',

      warnings: [
        `AI intent analysis failed; deterministic routing was used instead. ${message}`,
      ],
    };
  }
}

function createFastEditIntent(
  instruction: string,
  route: DiagramPipelineRoute,
): DiagramRefinementIntent {
  return {
    pipelineDepth: 'fast_edit',

    operation:
      route.likelyOperation,

    scope: 'single_element',

    targetDiagramType: 'auto',

    audience: 'auto',

    goals: [
      'preserve_meaning',
    ],

    preservationPolicy: 'strict',

    requiresSystemContext: false,

    requiresCurrentDiagramAnalysis: true,

    requiresArchitectureReasoning: false,

    requiresRepresentationExpert: false,

    requiresLayoutPlanning: false,

    requiresCriticReview: false,

    requiresRepairLoop: false,

    userGoal: instruction,

    confidence: 0.9,

    rationale: route.reason,
  };
}

function createFallbackIntent(
  instruction: string,
  route: DiagramPipelineRoute,
): DiagramRefinementIntent {
  const expert =
    route.depth ===
    'expert_reconstruction';

  return {
    pipelineDepth: route.depth,

    operation:
      route.likelyOperation,

    scope: expert
      ? 'whole_system'
      : 'whole_diagram',

    targetDiagramType: 'auto',

    audience: 'auto',

    goals: [
      'preserve_meaning',
      'improve_architecture',
      'improve_readability',
    ],

    preservationPolicy: expert
      ? 'architectural_changes_allowed'
      : 'preserve_core_architecture',

    requiresSystemContext: true,

    requiresCurrentDiagramAnalysis: true,

    requiresArchitectureReasoning: true,

    requiresRepresentationExpert:
      expert,

    requiresLayoutPlanning: true,

    requiresCriticReview: true,

    requiresRepairLoop: expert,

    userGoal: instruction,

    confidence: 0.55,

    rationale:
      `${route.reason} AI analysis was unavailable, so the deterministic route was converted into a safe fallback intent.`,
  };
}

function parseJsonObject(
  rawContent: string,
): unknown {
  const trimmed =
    rawContent.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced =
      trimmed
        .replace(
          /^```json\s*/i,
          '',
        )
        .replace(
          /^```\s*/,
          '',
        )
        .replace(
          /```\s*$/,
          '',
        )
        .trim();

    return JSON.parse(fenced);
  }
}
