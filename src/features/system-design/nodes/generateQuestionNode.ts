import type { Layer1GraphState } from '../types/graph.types';
import type { ConstructiveQuestion } from '../types/layer1.types';
import { constructiveQuestionAiResponseSchema } from '../schemas/layer1.schema';
import { getConstructiveQuestionPrompt } from '../prompts/constructiveQuestionPrompt';
import {
  callAiProviderWithUsage,
  type AiTokenUsage,
} from '../tools/aiProviderTool';
import { createIsoTimestamp, createSystemDesignId } from '../utils/id';

export async function generateQuestionNode(
  state: Layer1GraphState,
): Promise<{
  question: ConstructiveQuestion | null;
  usage: AiTokenUsage | null;
  error?: string;
}> {
  let usage: AiTokenUsage | null = null;

  try {
    if (!state.processedInput) {
      return {
        question: null,
        usage,
        error: 'Processed input is required before generating clarification questions.',
      };
    }

    const prompt = getConstructiveQuestionPrompt(state);
    const result = await callAiProviderWithUsage(
      [{ role: 'user', content: prompt }],
      {
        modelRole: 'clarification',
        responseFormat: 'json_object',
        temperature: 0.3,
      },
    );

    usage = result.usage;

    const parsedJson = JSON.parse(result.content) as unknown;
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

    return { question, usage };
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : 'Unknown question generation error.';

    return {
      question: null,
      usage,
      error: errorMessage,
    };
  }
}
