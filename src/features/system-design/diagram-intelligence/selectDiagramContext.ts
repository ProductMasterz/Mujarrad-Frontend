import {
  diagramContextSelectionSchema,
} from '../schemas/diagramIntelligence.schema';

import type {
  CurrentDiagramAnalysis,
  DiagramContextSelection,
  DiagramRefinementIntent,
} from '../types/diagramIntelligence.types';

import type {
  Layer1GraphState,
} from '../types/graph.types';

import {
  callAiProviderWithUsage,
  type AiTokenUsage,
} from '../tools/aiProviderTool';

import {
  buildContextSelectionMessages,
} from '../prompts/diagram-intelligence/contextSelectionPrompt';

export interface SelectDiagramContextInput {
  instruction: string;

  intent: DiagramRefinementIntent;

  currentDiagramAnalysis?: CurrentDiagramAnalysis;

  state: Layer1GraphState;
}

export interface SelectDiagramContextResult {
  selection: DiagramContextSelection | null;

  usage: AiTokenUsage | null;

  warnings: string[];

  error?: string;
}

export async function selectDiagramContext(
  input: SelectDiagramContextInput,
): Promise<SelectDiagramContextResult> {
  if (!input.state.diagramGenerationContext) {
    return {
      selection: null,

      usage: null,

      warnings: [],

      error:
        'Diagram context selection requires diagramGenerationContext.',
    };
  }

  try {
    const result =
      await callAiProviderWithUsage(
        buildContextSelectionMessages(
          input,
        ),
        {
          modelRole: 'diagram',

          temperature: 0.1,



          responseFormat:
            'json_object',
        },
      );

    const parsed =
      parseJsonObject(
        result.content,
      );

    const selection =
      diagramContextSelectionSchema.parse(
        parsed,
      );

    return {
      selection,

      usage: result.usage,

      warnings: [],
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown context-selection error.';

    return {
      selection: null,

      usage: null,

      warnings: [
        `AI context selection was unavailable. ${message}`,
      ],

      error: message,
    };
  }
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
