import type { Layer1GraphState } from '../types/graph.types';
import type { CompletenessReport } from '../types/layer1.types';
import { completenessReportSchema } from '../schemas/layer1.schema';
import { getCompletenessPrompt } from '../prompts/completenessPrompt';
import { callAiProvider } from '../tools/aiProviderTool';

export async function checkCompletenessNode(
  state: Layer1GraphState,
): Promise<{ completeness: CompletenessReport | null; error?: string }> {
  try {
    const prompt = getCompletenessPrompt(state);
    const response = await callAiProvider(
      [{ role: 'user', content: prompt }],
      { responseFormat: 'json_object', temperature: 0.2 },
    );

    const parsedJson = JSON.parse(response) as unknown;
    const completeness = completenessReportSchema.parse(parsedJson);

    return { completeness };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown completeness check error.';
    return { completeness: state.completeness, error: errorMessage };
  }
}
