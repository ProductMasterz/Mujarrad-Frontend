import { z } from 'zod';

import type { Layer1GraphState } from '../types/graph.types';

import type { ConstructiveQuestion } from '../types/layer1.types';

import { getConstructiveQuestionPrompt } from '../prompts/constructiveQuestionPrompt';

import { callAiProviderWithUsage, type AiTokenUsage } from '../tools/aiProviderTool';

import { deriveQuestionAnswersFromConversation } from '../utils/conversationDerivations';
import { createIsoTimestamp, createSystemDesignId } from '../utils/id';

const compactQuestionSchema = z.object({
  q: z.string().min(1).max(500),

  c: z.string().min(1).max(80),

  r: z.string().min(1).max(300),

  t: z.enum(['short_text', 'long_text', 'list', 'yes_no', 'choice', 'number', 'structured']),

  f: z.array(z.string()).max(8).default([]),
});

type CompactQuestion = z.infer<typeof compactQuestionSchema>;

function parseJsonObject(rawContent: string): unknown {
  const trimmed = rawContent.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const unfenced = trimmed
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/```\s*$/, '')
      .trim();

    return JSON.parse(unfenced);
  }
}

export async function generateQuestionNode(state: Layer1GraphState): Promise<{
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

    const requestQuestion = async (retry = false) =>
      callAiProviderWithUsage(
        [
          {
            role: 'user' as const,

            content: retry
              ? `${prompt}

RETRY REQUIREMENT

The previous response was unavailable, incomplete, malformed, or failed validation.

Return a SMALLER complete JSON object.

Use exactly:

{"q":"one concise question","c":"short_category","r":"short reason","t":"long_text","f":[]}

Requirements:

- q must be one complete question
- c must be short snake_case
- r must be one short sentence
- t must be one allowed answer type
- f must contain at most 5 short field names
- no markdown
- no code fences
- no commentary
- close every string, array, and object`
              : prompt,
          },
        ],
        {
          modelRole: 'clarification',

          responseFormat: 'json_object',

          temperature: retry ? 0.05 : 0.2,
        }
      );

    const requestAndParse = async (
      retry = false
    ): Promise<{
      parsed: CompactQuestion;

      usage: AiTokenUsage | null;
    }> => {
      const result = await requestQuestion(retry);

      const parsed = compactQuestionSchema.parse(parseJsonObject(result.content));

      return {
        parsed,

        usage: result.usage,
      };
    };

    let parsed: CompactQuestion;

    try {
      const firstAttempt = await requestAndParse();

      parsed = firstAttempt.parsed;

      usage = firstAttempt.usage;
    } catch {
      const retryAttempt = await requestAndParse(true);

      parsed = retryAttempt.parsed;

      usage = retryAttempt.usage;
    }

    const question: ConstructiveQuestion = {
      id: createSystemDesignId('question'),

      question: parsed.q,

      category: parsed.c,

      reasonForAsking: parsed.r,

      expectedAnswerType: parsed.t,

      options: [],

      basedOn: {
        processedInputId: state.processedInput.id,

        chunkIds: state.processedInput.chunks.map((chunk) => chunk.id),

        previousQuestionIds: state.questions.map((question) => question.id),

        previousAnswerIds: deriveQuestionAnswersFromConversation(state.conversation).map(
          (answer) => answer.id
        ),

        understandingFields: parsed.f,

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

    return {
      question,

      usage,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown question generation error.';

    return {
      question: null,

      usage,

      error: errorMessage,
    };
  }
}
