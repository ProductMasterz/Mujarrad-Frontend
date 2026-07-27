import type { Layer1GraphState } from '../types/graph.types';
import type {
  DiagramGenerationQuestionAnswer,
  Layer1DiagramGenerationContext,
} from '../types/layer1.types';
import { deriveQuestionAnswersFromConversation } from './conversationDerivations';
import { createIsoTimestamp, createSystemDesignId } from './id';

function buildOriginalUserText(state: Layer1GraphState): string {
  return state.rawInputs
    .map((input) => input.rawText)
    .filter(Boolean)
    .join('\n\n---\n\n');
}

function buildAnsweredQuestions(state: Layer1GraphState): DiagramGenerationQuestionAnswer[] {
  return deriveQuestionAnswersFromConversation(state.conversation).map((answer) => {
    const question = state.questions.find((item) => item.id === answer.questionId);

    return {
      questionId: answer.questionId,
      question: question?.question ?? answer.questionId,
      answer: answer.answer,
      category: question?.category,
      reasonForAsking: question?.reasonForAsking,
      createdAt: answer.createdAt,
    };
  });
}

function buildCumulativeUnderstandingText(state: Layer1GraphState): string {
  const answeredQuestions = buildAnsweredQuestions(state);

  return [
    '# Cumulative Layer 1 Understanding',
    '',
    '## Original User Input',
    buildOriginalUserText(state) || '(none)',
    '',
    '## Processed Input',
    state.processedInput ? JSON.stringify(state.processedInput, null, 2) : '(none)',
    '',
    '## Structured Understanding',
    JSON.stringify(state.understanding, null, 2),
    '',
    '## Clarification Q&A',
    answeredQuestions.length
      ? answeredQuestions
          .map((item, index) => `### Q${index + 1}: ${item.question}\nAnswer: ${item.answer}`)
          .join('\n\n')
      : '(no answered clarification questions)',
    '',
    '## Completeness',
    state.completeness ? JSON.stringify(state.completeness, null, 2) : '(not evaluated)',
  ].join('\n');
}

export function buildDiagramGenerationContext(
  state: Layer1GraphState,
  status: Layer1DiagramGenerationContext['status']
): Layer1DiagramGenerationContext {
  const answeredQuestionIds = new Set(
    deriveQuestionAnswersFromConversation(state.conversation).map((answer) => answer.questionId)
  );

  return {
    id: createSystemDesignId('diagram-context'),
    runId: state.runId,
    createdAt: createIsoTimestamp(),
    source: 'layer1_cumulative_understanding',
    status,

    processedInput: state.processedInput,
    originalUserText: buildOriginalUserText(state),
    cumulativeUnderstandingText: buildCumulativeUnderstandingText(state),

    understanding: state.understanding,
    answeredQuestions: buildAnsweredQuestions(state),
    unansweredQuestions: state.questions.filter(
      (question) => !answeredQuestionIds.has(question.id)
    ),
    completeness: state.completeness,

    task5Instructions: {
      mustUseOnlyThisContext: true,
      mustNotUseRawInputAlone: true,
      // Legacy field retained for backward-compatible
      // serialized Layer 1 context types. In the active
      // workflow it means a diagram artifact must be
      // generated, and that artifact is Mermaid.
      mustGenerateDrawioXml: false,
      mustNotGenerateFinalMarkdownYet: true,
    },

    mujarradPersistenceDraft: {
      futureNodeType: 'system_design_layer1_run',
      shouldCreateOrUpdateMujarradNodeLater: true,
      includesInitialInput: true,
      includesQuestionHistory: true,
      includesUnderstanding: true,
      includesCompleteness: true,
      includesDiagramContext: true,
    },
  };
}
