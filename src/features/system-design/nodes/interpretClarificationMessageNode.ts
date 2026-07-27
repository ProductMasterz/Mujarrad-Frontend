import { z } from 'zod';

import type { ClarificationMessageInterpretation } from '../types/layer1.types';
import type { Layer1GraphState } from '../types/graph.types';
import { callAiProviderWithUsage, type AiTokenUsage } from '../tools/aiProviderTool';
import {
  deriveAdditionalRequirementsFromConversation,
  deriveAnsweredQuestionsFromConversation,
} from '../utils/conversationDerivations';
import { compactJson } from '../utils/llmContextFormat';
import { buildSlimUnderstandingContext } from '../utils/systemDesignAiContext';

const interpretationSchema = z.object({
  intent: z.enum([
    'answer_current_question',
    'assume_current_answer',
    'add_requirement',
    'correct_existing_information',
    'ask_about_understanding',
    'ask_about_missing_information',
    'ask_about_current_question',
    'general_inquiry',
  ]),
  assistantMessage: z.string().min(1).max(4000),
  concreteAnswer: z.string().min(1).max(4000).optional(),
  assumedByAi: z.boolean().default(false),
  additionalRequirement: z.string().min(1).max(4000).optional(),
  changesCanonicalEvidence: z.boolean(),
});

function parseJsonObject(rawContent: string): unknown {
  const trimmed = rawContent.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    return JSON.parse(
      trimmed
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```\s*$/, '')
        .trim()
    );
  }
}

function buildPrompt(state: Layer1GraphState, message: string): string {
  const currentQuestion = state.currentQuestion
    ? {
        id: state.currentQuestion.id,
        question: state.currentQuestion.question,
        category: state.currentQuestion.category,
        reasonForAsking: state.currentQuestion.reasonForAsking,
      }
    : null;

  const answeredQuestions = deriveAnsweredQuestionsFromConversation(
    state.conversation,
    state.questions
  );

  const additionalRequirements = deriveAdditionalRequirementsFromConversation(state.conversation);

  return `You are the conversational clarification assistant for a system-design workflow.

The user may:

- answer the pending architecture question
- ask you to choose or assume the best answer
- add a new requirement
- correct existing system information
- ask what is currently understood
- ask what information is still missing
- ask why the pending question matters
- ask a normal architecture-related inquiry

Do not treat every message as an answer.

When the user says "you decide", "assume it", "choose the best option", or equivalent:

1. infer a concrete architecture answer from the available context
2. explain the assumption briefly
3. return that concrete answer in concreteAnswer
4. set assumedByAi to true
5. never store the vague instruction itself as the answer

When the user asks an inquiry:

- answer the inquiry directly
- intent MUST be "general_inquiry"
- do not create canonical evidence
- omit additionalRequirement
- set changesCanonicalEvidence to false

When the user adds or corrects a requirement:

- place the concise canonical requirement in additionalRequirement
- set changesCanonicalEvidence to true

CURRENT_PENDING_QUESTION
${compactJson(currentQuestion)}

CURRENT_UNDERSTANDING
${compactJson(buildSlimUnderstandingContext(state.understanding))}

ANSWERED_QUESTIONS
${compactJson(answeredQuestions)}

ADDITIONAL_REQUIREMENTS
${compactJson(additionalRequirements)}

COMPLETENESS
${compactJson(state.completeness)}

USER_MESSAGE
${message}

Return exactly one JSON object:

{
  "intent": "one allowed intent",
  "assistantMessage": "helpful direct reply",
  "concreteAnswer": "concrete answer when this resolves the pending question",
  "assumedByAi": false,
  "additionalRequirement": "canonical requirement when applicable",
  "changesCanonicalEvidence": false
}

Rules:

- Use answer_current_question only when the message directly answers the pending question.
- Use assume_current_answer when the user asks you to decide or assume the pending answer.
- Use add_requirement for a newly introduced requirement.
- Use correct_existing_information for a correction or replacement.
- Do not invent canonical requirements during inquiries.
- Keep the assistant reply concise but useful.
- Return JSON only.
- No markdown.
- No code fences.
- Never output "inquiry".
- Use "general_inquiry".
- Never output empty strings.`;
}

export async function interpretClarificationMessageNode(
  state: Layer1GraphState,
  message: string
): Promise<{
  interpretation: ClarificationMessageInterpretation | null;
  usage: AiTokenUsage | null;
  error?: string;
}> {
  let usage: AiTokenUsage | null = null;

  try {
    const prompt = buildPrompt(state, message);

    const request = async (retry = false) =>
      callAiProviderWithUsage(
        [
          {
            role: 'user',
            content: retry
              ? `${prompt}

RETRY REQUIREMENT

Return one smaller valid JSON object only.
Ensure every string, array, and object is closed.`
              : prompt,
          },
        ],
        {
          modelRole: 'clarification',
          responseFormat: 'json_object',
          temperature: retry ? 0.05 : 0.15,
          maxTokens: 1200,
        }
      );

    const requestAndParse = async (retry = false) => {
      const result = await request(retry);
      usage = result.usage;

      const parsed = parseJsonObject(result.content);

      if (parsed && typeof parsed === 'object') {
        const obj = parsed as Record<string, unknown>;

        if (obj.intent === 'inquiry') {
          obj.intent = 'general_inquiry';
        }

        for (const key of ['concreteAnswer', 'additionalRequirement', 'assistantMessage']) {
          const value = obj[key];

          if (typeof value === 'string' && value.trim() === '') {
            delete obj[key];
          }
        }
      }

      return interpretationSchema.parse(parsed);
    };

    try {
      return {
        interpretation: await requestAndParse(),
        usage,
      };
    } catch {
      return {
        interpretation: await requestAndParse(true),
        usage,
      };
    }
  } catch (error) {
    return {
      interpretation: null,
      usage,
      error:
        error instanceof Error ? error.message : 'Clarification message interpretation failed.',
    };
  }
}
