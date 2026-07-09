import {
  currentDiagramAnalysisSchema,
} from '../schemas/diagramIntelligence.schema';

import type {
  CurrentDiagramAnalysis,
  DiagramRefinementIntent,
} from '../types/diagramIntelligence.types';

import {
  callAiProviderWithUsage,
  type AiTokenUsage,
} from '../tools/aiProviderTool';

import {
  buildCurrentDiagramAnalysisMessages,
} from '../prompts/diagram-intelligence/currentDiagramAnalysisPrompt';

export interface AnalyzeCurrentDiagramInput {
  instruction: string;

  intent: DiagramRefinementIntent;

  currentXml: string;

  existingSummary: string;
}

export interface AnalyzeCurrentDiagramResult {
  analysis: CurrentDiagramAnalysis | null;

  usage: AiTokenUsage | null;

  warnings: string[];

  error?: string;
}

export async function analyzeCurrentDiagram(
  input: AnalyzeCurrentDiagramInput,
): Promise<AnalyzeCurrentDiagramResult> {
  if (!input.currentXml.trim()) {
    return {
      analysis: null,

      usage: null,

      warnings: [],

      error:
        'Current Draw.io XML is required for diagram analysis.',
    };
  }

  try {
    const result =
      await callAiProviderWithUsage(
        buildCurrentDiagramAnalysisMessages(
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

    const analysis =
      currentDiagramAnalysisSchema.parse(
        parsed,
      );

    return {
      analysis,

      usage: result.usage,

      warnings: [],
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown current-diagram analysis error.';

    return {
      analysis: null,

      usage: null,

      warnings: [
        `Current diagram AI analysis was unavailable. ${message}`,
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
