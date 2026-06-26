import type { Layer1GraphState } from '../types/graph.types';
import type { ConstructiveQuestion } from '../types/layer1.types';
import { constructiveQuestionAiResponseSchema } from '../schemas/layer1.schema';
import { getConstructiveQuestionPrompt } from '../prompts/constructiveQuestionPrompt';
import { callAiProvider } from '../tools/aiProviderTool';
import { createIsoTimestamp, createSystemDesignId } from '../utils/id';

export async function generateQuestionNode(
  state: Layer1GraphState,
): Promise<{ question: ConstructiveQuestion | null; error?: string }> {
  try {
    if (!state.processedInput) {
      return {
        question: null,
        error: 'Processed input is required before generating clarification questions.',
      };
    }

    const prompt = getConstructiveQuestionPrompt(state);
    const response = await callAiProvider(
      [{ role: 'user', content: prompt }],
      { responseFormat: 'json_object', temperature: 0.3 },
    );

    const parsedJson = JSON.parse(response) as unknown;
    const parsed = constructiveQuestionAiResponseSchema.parse(parsedJson);

    const question: ConstructiveQuestion = {
      id: createSystemDesignId('question'),
      question: parsed.question,
      category: parsed.category,
      reasonForAsking: parsed.reasonForAsking,
      expectedAnswerType: parsed.expectedAnswerType,
      options: parsed.options,
      basedOn: {
        processedInputId: state.processedInput.id,
        chunkIds: state.processedInput.chunks.map((chunk) => chunk.id),
        previousQuestionIds: state.questions.map((question) => question.id),
        previousAnswerIds: state.qaHistory.map((answer) => answer.id),
        understandingFields: parsed.understandingFields,
        missingCategories: [
          ...(state.completeness?.missingCriticalItems ?? []),
          ...(state.completeness?.weakItems ?? []),
          ...(state.completeness?.suggestedNextQuestionCategory
            ? [state.completeness.suggestedNextQuestionCategory]
            : []),
        ],
      },
      createdAt: createIsoTimestamp(),
    };

    return { question };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown question generation error.';
    return { question: null, error: errorMessage };
  }
}
