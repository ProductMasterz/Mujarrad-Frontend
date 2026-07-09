import {
  analyzeRefinementIntent,
} from '../diagram-intelligence/analyzeRefinementIntent';

import {
  buildCompactSemanticDiagram,
} from '../diagram-intelligence/buildCompactSemanticDiagram';

import {
  compileSemanticDiagramToDrawio,
} from '../diagram-intelligence/compileSemanticDiagramToDrawio';

import type {
  Layer1GraphState,
} from '../types/graph.types';

import type {
  CurrentDiagramAnalysis,
  DiagramContextSelection,
  DiagramRefinementIntent,
  DiagramTransformationPlan,
  SemanticDiagramModel,
  DiagramType,
} from '../types/diagramIntelligence.types';

import type {
  Task6AiOperation,
} from '../types/layer1.types';

import {
  DIAGRAM_REFINEMENT_SYSTEM_PROMPT,
  getDiagramRefinementPrompt,
} from '../prompts/diagramRefinementPrompt';

import {
  callAiProviderWithUsage,
  type AiTokenUsage,
} from '../tools/aiProviderTool';

import {
  extractAndRepairDrawioXml,
} from '../utils/drawioXml';

export interface Task6NodeUsageRecord {
  operation: Task6AiOperation;

  usage: AiTokenUsage;
}

function resolveRefinementTargetDiagramType(
  instruction: string,
  intent: DiagramRefinementIntent,
): DiagramType {
  const normalized =
    instruction.toLowerCase();

  if (/\bactivity diagram\b/.test(normalized)) {
    return 'uml_activity';
  }

  if (/\bsequence diagram\b/.test(normalized)) {
    return 'uml_sequence';
  }

  if (/\bdeployment diagram\b/.test(normalized)) {
    return 'uml_deployment';
  }

  if (/\bcomponent diagram\b/.test(normalized)) {
    return 'uml_component';
  }

  if (/\bstate machine\b/.test(normalized)) {
    return 'uml_state_machine';
  }

  if (/\bc4 context\b/.test(normalized)) {
    return 'c4_context';
  }

  if (/\bc4 container\b/.test(normalized)) {
    return 'c4_container';
  }

  if (/\bc4 component\b/.test(normalized)) {
    return 'c4_component';
  }

  if (/\bdata flow\b/.test(normalized)) {
    return 'data_flow';
  }

  if (/\bevent[- ]driven\b/.test(normalized)) {
    return 'event_driven_topology';
  }

  if (/\brag\b|retrieval augmented/.test(normalized)) {
    return 'rag_architecture';
  }

  if (/\bagent\b|agentic|multi-agent/.test(normalized)) {
    return 'agent_architecture';
  }

  if (
    intent.targetDiagramType !==
    'auto'
  ) {
    return intent.targetDiagramType;
  }

  return 'software_architecture';
}

export interface RefineDiagramNodeResult {
  xml: string | null;

  summary: string;

  warnings: string[];

  usageRecords: Task6NodeUsageRecord[];

  intent?: DiagramRefinementIntent;

  currentDiagramAnalysis?: CurrentDiagramAnalysis;

  contextSelection?: DiagramContextSelection;

  transformationPlan?: DiagramTransformationPlan;

  semanticDiagram?: SemanticDiagramModel;

  error?: string;
}

export async function refineDiagramNode(
  state: Layer1GraphState,
  refinementInstruction: string,
): Promise<RefineDiagramNodeResult> {
  const instruction =
    refinementInstruction.trim();

  const usageRecords:
    Task6NodeUsageRecord[] = [];

  const warnings: string[] = [];

  if (!instruction) {
    return {
      xml: null,

      summary: '',

      warnings,

      usageRecords,

      error:
        'Refinement instruction is required.',
    };
  }

  if (!state.diagramGenerationContext) {
    return {
      xml: null,

      summary: '',

      warnings,

      usageRecords,

      error:
        'Diagram refinement requires diagramGenerationContext from Task 4.',
    };
  }

  if (!state.drawioXml.trim()) {
    return {
      xml: null,

      summary: '',

      warnings,

      usageRecords,

      error:
        'No current Draw.io XML exists to refine.',
    };
  }

  try {
    const intentResult =
      await analyzeRefinementIntent(
        instruction,
      );

    warnings.push(
      ...intentResult.warnings,
    );

    if (intentResult.usage) {
      usageRecords.push({
        operation:
          'refinement_intent_analysis',

        usage:
          intentResult.usage,
      });
    }

    if (
      intentResult.intent.pipelineDepth !==
      'fast_edit'
    ) {
      const targetDiagramType =
        resolveRefinementTargetDiagramType(
          instruction,
          intentResult.intent,
        );

      const compactResult =
        await buildCompactSemanticDiagram({
          understanding:
            state.understanding,

          targetDiagramType,

          audience:
            intentResult.intent.audience,

          refinementInstruction:
            instruction,

          currentDiagramSummary:
            state.diagramSummary,
        });

      warnings.push(
        ...compactResult.warnings,
      );

      if (compactResult.usage) {
        usageRecords.push({
          operation:
            'semantic_diagram_synthesis',

          usage:
            compactResult.usage,
        });
      }

      if (
        compactResult.error ||
        !compactResult.semanticDiagram
      ) {
        return {
          xml:
            null,

          summary:
            '',

          warnings,

          usageRecords,

          intent:
            intentResult.intent,

          error:
            compactResult.error
              ? `Compact diagram reconstruction failed: ${compactResult.error}`
              : 'Compact diagram reconstruction did not produce a valid semantic target.',
        };
      }

      const semanticDiagram =
        compactResult.semanticDiagram;

      const compiled =
        compileSemanticDiagramToDrawio(
          semanticDiagram,
        );

      warnings.push(
        ...compiled.warnings,
      );

      const repaired =
        extractAndRepairDrawioXml(
          compiled.xml,
        );

      warnings.push(
        ...repaired.warnings,
      );

      if (!repaired.valid) {
        return {
          xml:
            null,

          summary:
            '',

          warnings,

          usageRecords,

          intent:
            intentResult.intent,

          semanticDiagram,

          error:
            'Compact Task 6 reconstruction compiled to invalid Draw.io XML.',
        };
      }

      return {
        xml:
          repaired.xml,

        summary:
          `Compact ${intentResult.intent.pipelineDepth.replaceAll('_', ' ')} refinement applied: ${instruction}`,

        warnings,

        usageRecords,

        intent:
          intentResult.intent,

        semanticDiagram,
      };
    }

    const refinementResult =
      await callAiProviderWithUsage(
        [
          {
            role: 'system',

            content:
              DIAGRAM_REFINEMENT_SYSTEM_PROMPT,
          },
          {
            role: 'user',

            content:
              getDiagramRefinementPrompt({
                state,

                currentXml:
                  state.drawioXml,

                refinementInstruction:
                  instruction,

                refinementIntent:
                  intentResult.intent,
              }),
          },
        ],
        {
          modelRole: 'diagram',

          temperature: 0,



          responseFormat: 'text',
        },
      );

    if (refinementResult.usage) {
      usageRecords.push({
        operation:
          'diagram_refinement',

        usage:
          refinementResult.usage,
      });
    }

    const repaired =
      extractAndRepairDrawioXml(
        refinementResult.content,
      );

    warnings.push(
      ...repaired.warnings,
    );

    if (!repaired.valid) {
      return {
        xml: null,

        summary: '',

        warnings,

        usageRecords,

        intent:
          intentResult.intent,


        error:
          'The AI did not return valid Draw.io XML. Please try a clearer refinement instruction.',
      };
    }

    return {
      xml:
        repaired.xml,

      summary:
        `AI fast edit applied: ${instruction}`,

      warnings,

      usageRecords,

      intent:
        intentResult.intent,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Diagram refinement failed.';

    return {
      xml: null,

      summary: '',

      warnings,

      usageRecords,

      error: message,
    };
  }
}
