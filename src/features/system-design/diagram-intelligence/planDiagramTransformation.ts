import {
  diagramTransformationPlanSchema,
} from '../schemas/diagramIntelligence.schema';

import type {
  CurrentDiagramAnalysis,
  DiagramContextSelection,
  DiagramRefinementIntent,
  DiagramTransformationPlan,
} from '../types/diagramIntelligence.types';

import {
  callAiProviderWithUsage,
  type AiTokenUsage,
} from '../tools/aiProviderTool';

import {
  buildTransformationPlanMessages,
} from '../prompts/diagram-intelligence/transformationPlanPrompt';

export interface PlanDiagramTransformationInput {
  instruction: string;

  intent: DiagramRefinementIntent;

  currentDiagramAnalysis?: CurrentDiagramAnalysis;

  contextSelection?: DiagramContextSelection;
}

export interface PlanDiagramTransformationResult {
  plan: DiagramTransformationPlan | null;

  usage: AiTokenUsage | null;

  warnings: string[];

  error?: string;
}

export async function planDiagramTransformation(
  input: PlanDiagramTransformationInput,
): Promise<PlanDiagramTransformationResult> {
  let usage: AiTokenUsage | null = null;

  try {
    const baseMessages =
      buildTransformationPlanMessages(
        input,
      );

    const requestPlan = async (
      retry = false,
    ) => {
      const messages = retry
        ? [
            ...baseMessages,
            {
              role: 'user' as const,
              content: `RETRY REQUIREMENT

Your previous response could not be parsed or validated as the required transformation-plan JSON.

Return exactly one complete JSON object matching the required structure.

Requirements:
- Use only allowed enum values.
- Never invent combined diagram-type values.
- Keep arrays concise and focused.
- Keep strategy, reasons, decisions, risks, and assumptions short.
- Do not include markdown, code fences, commentary, or trailing text.
- Before finishing, ensure every opened string, object, and array is closed.`,
            },
          ]
        : baseMessages;

      return callAiProviderWithUsage(
        messages,
        {
          modelRole: 'diagram',

          temperature: retry
            ? 0.05
            : 0.15,



          responseFormat:
            'json_object',
        },
      );
    };

    const parseAndValidatePlan = (
      content: string,
    ): DiagramTransformationPlan => {
      const parsed =
        normalizeTransformationPlanInput(
          parseJsonObject(
            content,
          ),
        );

      return diagramTransformationPlanSchema.parse(
        parsed,
      );
    };

    let result =
      await requestPlan();

    usage = result.usage;

    let plan:
      DiagramTransformationPlan;

    try {
      plan =
        parseAndValidatePlan(
          result.content,
        );
    } catch {
      result =
        await requestPlan(true);

      usage = result.usage;

      plan =
        parseAndValidatePlan(
          result.content,
        );
    }

    return {
      plan,

      usage,

      warnings: [],
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown transformation-planning error.';

    return {
      plan: null,

      usage,

      warnings: [
        `AI transformation planning was unavailable. ${message}`,
      ],

      error: message,
    };
  }
}

function normalizeTransformationPlanInput(
  value: unknown,
): unknown {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    return value;
  }

  const record = {
    ...value,
  } as Record<string, unknown>;

  record.sourceDiagramType =
    normalizeDiagramTypeValue(
      record.sourceDiagramType,
    );

  record.targetDiagramType =
    normalizeDiagramTypeValue(
      record.targetDiagramType,
    );

  return record;
}

function normalizeDiagramTypeValue(
  value: unknown,
): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized =
    value
      .trim()
      .toLowerCase()
      .replace(
        /[\s-]+/g,
        '_',
      );

  const aliases:
    Record<string, string> = {
      system_context:
        'c4_context',

      context_diagram:
        'c4_context',

      system_context_diagram:
        'c4_context',

      container_diagram:
        'c4_container',

      system_container:
        'c4_container',

      component_diagram:
        'c4_component',

      system_context_and_container:
        'system_architecture',

      context_and_container:
        'system_architecture',

      architecture_diagram:
        'system_architecture',

      system_diagram:
        'system_architecture',

      software_system_architecture:
        'software_architecture',

      cloud_system_architecture:
        'cloud_architecture',

      event_driven_architecture:
        'event_driven_topology',

      event_driven:
        'event_driven_topology',

      rag_system:
        'rag_architecture',

      rag_pipeline:
        'rag_architecture',

      agent_system:
        'agent_architecture',

      agentic_architecture:
        'agent_architecture',

      activity_diagram:
        'uml_activity',

      sequence_diagram:
        'uml_sequence',

      deployment_diagram:
        'uml_deployment',

      class_diagram:
        'uml_class',

      state_diagram:
        'uml_state_machine',

      state_machine:
        'uml_state_machine',

      er_diagram:
        'entity_relationship',

      erd:
        'entity_relationship',

      business_process_diagram:
        'business_process',

      swimlane_diagram:
        'swimlane',
    };

  return (
    aliases[normalized] ??
    normalized
  );
}

function parseJsonObject(
  rawContent: string,
): unknown {
  const trimmed =
    rawContent.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const unfenced =
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

    return JSON.parse(unfenced);
  }
}
