import type { Layer1GraphState } from '../types/graph.types';
import {
  deriveAdditionalRequirementsFromConversation,
  deriveAnsweredQuestionsFromConversation,
} from '../utils/conversationDerivations';
import { compactJson } from '../utils/llmContextFormat';

export function getUnderstandingUpdatePrompt(state: Layer1GraphState): string {
  const clarificationEvidence = deriveAnsweredQuestionsFromConversation(
    state.conversation,
    state.questions
  ).map((entry) => ({
    question: entry.question,
    answer: entry.answer,
    assumedByAi: entry.assumedByAi,
  }));

  const additionalRequirements = deriveAdditionalRequirementsFromConversation(state.conversation);

  return `You are a senior system architect rebuilding the complete cumulative SystemUnderstanding.

Rebuild the understanding only from the current canonical evidence below.

Do not preserve facts merely because they existed in a previous generated understanding.

This rebuild behavior is required because users may edit or delete earlier answers and requirements.

INITIAL_PROCESSED_INPUT
${state.processedInput ? compactJson(state.processedInput) : 'none'}

CURRENT_CLARIFICATION_EVIDENCE
${compactJson(clarificationEvidence)}

CURRENT_ADDITIONAL_REQUIREMENTS
${compactJson(additionalRequirements)}

OBJECTIVE

Produce one complete architecture-ready SystemUnderstanding.

Identify when supported:

- system goal and business outcome
- primary users
- secondary users
- roles
- permissions
- workflows and ordered workflow steps
- alternative workflows
- inputs and outputs
- entities and data movement
- business rules
- decision logic
- validation rules
- integrations
- notifications
- reporting
- security requirements
- failures and recovery
- edge cases
- assumptions
- unresolved architectural questions

RULES

1. Use only the current evidence above.
2. Edited evidence replaces older evidence.
3. Deleted evidence must not survive.
4. AI-assumed answers are valid assumptions and must be represented carefully.
5. Merge equivalent concepts.
6. Do not invent unsupported technology or behavior.
7. Keep descriptions concise but architecture-significant.
8. Put unresolved gaps in openQuestions.
9. confidence must be a decimal between 0 and 1 representing how complete the current understanding is.

Confidence guidelines:
- 0.00–0.20 = almost nothing is known.
- 0.21–0.40 = only basic idea is known.
- 0.41–0.60 = core workflow is understood but major gaps remain.
- 0.61–0.80 = most architecture is understood with only a few missing details.
- 0.81–0.95 = nearly complete.
- 0.96–1.00 = complete and implementation-ready.

Never always return 0.
Never always return 1.
Choose the confidence based on the available evidence.

10. Return the complete SystemUnderstanding object.
11. Return valid JSON only.
12. No markdown.
13. No code fences.
14. No commentary.`;
}
