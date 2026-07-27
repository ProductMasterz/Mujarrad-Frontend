import type { Layer1GraphState } from '../types/graph.types';
import { deriveAnsweredQuestionsFromConversation } from '../utils/conversationDerivations';
import { compactJson, compactQaHistory } from '../utils/llmContextFormat';
import { suggestedQuestionCategoryExamples } from '../utils/questionCategories';

function buildHistoryText(state: Layer1GraphState): string {
  return compactQaHistory(
    deriveAnsweredQuestionsFromConversation(state.conversation, state.questions).map((entry) => ({
      question: entry.question,
      answer: entry.answer,
    }))
  );
}

export function getCompletenessPrompt(state: Layer1GraphState): string {
  return `You are a senior system architect evaluating whether enough information exists to create a useful professional system diagram.

You are evaluating DIAGRAM READINESS, not final documentation completeness.

PROCESSED_INPUT
${state.processedInput ? compactJson(state.processedInput) : 'none'}

COMPLETE_QA_HISTORY
${buildHistoryText(state)}

CURRENT_CUMULATIVE_UNDERSTANDING
${compactJson(state.understanding)}

CORE EVALUATION PRINCIPLE

A system is ready for an initial professional diagram when its essential structure and behavior are sufficiently understood.

Do not require every implementation detail.

Do not mark the system ready merely because many words were provided.

Evaluate architectural clarity.

EVALUATION DIMENSIONS

Consider:

1. Purpose
   Is the system goal clear?

2. Actors
   Are the important human and external actors known?

3. Boundary
   Is it reasonably clear what belongs inside and outside the system?

4. Main workflow
   Can the main end-to-end behavior be traced?

5. Responsibilities
   Are major responsibilities or capabilities identifiable?

6. Decisions
   Are important branching rules or decision points known?

7. Data
   Are important inputs, outputs, and core entities identifiable?

8. Integrations
   Are important external dependencies known?

9. Security
   Are important roles, permissions, or sensitive interactions understood when relevant?

10. Failure behavior
    Are critical failures or recovery expectations understood when relevant?

11. Representation readiness
    Is there enough information to choose and create a useful architecture, workflow, data-flow, process, or other appropriate system diagram?

SCORING GUIDANCE

0-20:
The idea is extremely vague.

21-40:
The goal is understood, but major actors, flow, or boundaries are missing.

41-60:
The basic system is understood, but important workflow or architecture gaps remain.

61-75:
Enough exists for a useful initial diagram, though important improvements remain.

76-90:
Strong architecture-ready understanding.

91-100:
Exceptionally complete for Layer 1 diagram generation.

RULES

1. Recalculate readiness from all accumulated evidence on every run.
2. Do not preserve the previous score merely for consistency.
3. Meaningful answers should change the score when they resolve or reveal important gaps.
4. Score from 0 to 100.
5. readyForDiagram should become true when a useful initial professional diagram can be created.
6. Do not require final implementation details.
7. Do not require final documentation completeness.
8. MissingCriticalItems must contain only gaps that materially block diagram correctness.
9. weakItems should contain important improvements that do not fully block diagram generation.
10. suggestedNextQuestionCategory must target the single highest-value unresolved area.
11. Use short snake_case category names.
12. Example categories:
${suggestedQuestionCategoryExamples.join(', ')}
13. Keep notes concise.
14. Return exactly one complete JSON object.
15. Return valid JSON only.
16. Do not include markdown, code fences, commentary, or trailing text.

Return:

{"overallScore":0,"readyForDiagram":false,"categories":[{"category":"main_workflow","status":"weak","score":50,"notes":"The major flow exists but important decisions remain unclear."}],"missingCriticalItems":[],"weakItems":[],"suggestedNextQuestionCategory":"main_workflow"}`;
}
