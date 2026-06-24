import type { Layer1GraphState } from '../types/graph.types';
import type { ConstructiveQuestion } from '../types/layer1.types';
import { createIsoTimestamp, createSystemDesignId } from '../utils/id';
import { getConstructiveQuestionPrompt } from '../prompts/constructiveQuestionPrompt';
import { callAiProvider } from '../tools/aiProviderTool';

export async function generateQuestionNode(
  state: Layer1GraphState,
): Promise<{ question: ConstructiveQuestion; error?: string }> {
  try {
    const prompt = getConstructiveQuestionPrompt(state);
    const response = await callAiProvider(
      [{ role: 'user', content: prompt }],
      { responseFormat: 'json_object', temperature: 0.7 }
    );

    let parsed: any;
    try {
      parsed = JSON.parse(response);
    } catch (err) {
      console.error('Failed to parse generateQuestionNode response:', response);
      return { question: null as any, error: 'Invalid JSON response from AI provider' };
    }

    const question: ConstructiveQuestion = {
      id: createSystemDesignId('question'),
      question: parsed.question || 'Could you provide more details?',
      category: parsed.category || 'goal',
      reasonForAsking: parsed.reasonForAsking || 'To clarify requirements.',
      expectedAnswerType: parsed.expectedAnswerType || 'long_text',
      options: parsed.options,
      basedOn: {},
      createdAt: createIsoTimestamp(),
    };

    return { question };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { question: null as any, error: errorMessage };
  }
}
