import type { Layer1GraphState } from '../types/graph.types';
import type { CompletenessReport } from '../types/layer1.types';
import { completenessReportSchema } from '../schemas/layer1.schema';
import { getCompletenessPrompt } from '../prompts/completenessPrompt';
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
        maxTokens: 700,
      },
    );

    usage = result.usage;

    const parsedJson = JSON.parse(result.content) as unknown;
    const completeness = completenessReportSchema.parse(parsedJson);

    return {
      completeness,
      usage,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : 'Unknown completeness check error.';

    return {
      completeness: state.completeness,
      usage,
      error: errorMessage,
    };
  }
}
