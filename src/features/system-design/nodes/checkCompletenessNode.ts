import type { Layer1GraphState } from '../types/graph.types';
import type { CompletenessReport } from '../types/layer1.types';
import { getCompletenessPrompt } from '../prompts/completenessPrompt';
import { callAiProvider } from '../tools/aiProviderTool';

export async function checkCompletenessNode(
  state: Layer1GraphState,
): Promise<{ completeness: CompletenessReport; error?: string }> {
  try {
    const prompt = getCompletenessPrompt(state);
    const response = await callAiProvider(
      [{ role: 'user', content: prompt }],
      { responseFormat: 'json_object', temperature: 0.2 }
    );

    let parsed: any;
    try {
      parsed = JSON.parse(response);
    } catch (err) {
      console.error('Failed to parse checkCompletenessNode response:', response);
      return { completeness: state.completeness as any, error: 'Invalid JSON response from AI provider' };
    }

    const completeness: CompletenessReport = {
      overallScore: parsed.overallScore || 0,
      readyForSpec: !!parsed.readyForSpec,
      readyForDiagram: !!parsed.readyForDiagram,
      categories: parsed.categories || [],
      missingCriticalItems: parsed.missingCriticalItems || [],
      weakItems: parsed.weakItems || [],
      suggestedNextQuestionCategory: parsed.suggestedNextQuestionCategory,
    };

    return { completeness };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { completeness: state.completeness as any, error: errorMessage };
  }
}
