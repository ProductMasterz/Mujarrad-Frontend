import type { Layer1GraphState } from '../types/graph.types';
import type { SystemUnderstanding } from '../types/layer1.types';
import { getUnderstandingUpdatePrompt } from '../prompts/understandingUpdatePrompt';
import { callAiProvider } from '../tools/aiProviderTool';

export async function updateUnderstandingNode(
  state: Layer1GraphState,
): Promise<{ understanding: SystemUnderstanding; error?: string }> {
  try {
    const prompt = getUnderstandingUpdatePrompt(state);
    const response = await callAiProvider(
      [{ role: 'user', content: prompt }],
      { responseFormat: 'json_object', temperature: 0.2 }
    );

    let parsed: any;
    try {
      parsed = JSON.parse(response);
    } catch (err) {
      console.error('Failed to parse updateUnderstandingNode response:', response);
      return { understanding: state.understanding, error: 'Invalid JSON response from AI provider' };
    }

    // Ensure it loosely matches SystemUnderstanding
    const updatedUnderstanding: SystemUnderstanding = {
      ...state.understanding,
      ...parsed,
    };

    return { understanding: updatedUnderstanding };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { understanding: state.understanding, error: errorMessage };
  }
}
