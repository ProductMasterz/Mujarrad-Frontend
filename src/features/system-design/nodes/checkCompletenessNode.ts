import type { Layer1GraphState } from '../types/graph.types';
import type { CompletenessReport } from '../types/layer1.types';
import { completenessReportSchema } from '../schemas/layer1.schema';
import { getCompletenessPrompt } from '../prompts/completenessPrompt';
import {
  applyDeterministicReadiness,
} from '../utils/completeness';
import {
  callAiProviderWithUsage,
  type AiTokenUsage,
} from '../tools/aiProviderTool';

export async function checkCompletenessNode(
  state: Layer1GraphState,
): Promise<{
  completeness: CompletenessReport | null;
  usage: AiTokenUsage | null;
  error?: string;
}> {
  let usage: AiTokenUsage | null = null;

  try {
    const prompt = getCompletenessPrompt(state);

    const result = await callAiProviderWithUsage(
      [{ role: 'user', content: prompt }],
      {
        modelRole: 'clarification',
        responseFormat: 'json_object',
        temperature: 0.2,

      },
    );

    usage = result.usage;

    const parsedJson = JSON.parse(result.content) as unknown;
    const aiCompleteness =
      completenessReportSchema.parse(
        parsedJson,
      );

    const completeness =
      applyDeterministicReadiness(
        state.understanding,
        aiCompleteness,
        state.qaHistory.length,
      );

    return {
      completeness,
      usage,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : 'Unknown completeness check error.';

    const fallbackReport:
      CompletenessReport = {
        overallScore: 0,

        readyForDiagram:
          false,

        categories:
          state.completeness
            ?.categories ??
          [],

        missingCriticalItems:
          state.completeness
            ?.missingCriticalItems ??
          [],

        weakItems:
          state.completeness
            ?.weakItems ??
          [],

        suggestedNextQuestionCategory:
          state.completeness
            ?.suggestedNextQuestionCategory,
      };

    const completeness =
      applyDeterministicReadiness(
        state.understanding,
        fallbackReport,
        state.qaHistory.length,
      );

    return {
      completeness,

      usage,

      error:
        errorMessage,
    };
  }
}
