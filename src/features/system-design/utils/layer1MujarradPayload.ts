import type { Layer1GraphState } from '../types/graph.types';
import {
  deriveAdditionalRequirementsFromConversation,
  deriveClarificationMessagesFromConversation,
  deriveQuestionAnswersFromConversation,
} from './conversationDerivations';

function getRawInputText(state: Layer1GraphState): string[] {
  return state.rawInputs
    .map((input) => input.rawText)
    .filter((text): text is string => Boolean(text?.trim()));
}

export function buildLayer1MujarradPayload(state: Layer1GraphState) {
  const answers = deriveQuestionAnswersFromConversation(state.conversation);
  const clarificationMessages = deriveClarificationMessagesFromConversation(state.conversation);
  const additionalRequirements = deriveAdditionalRequirementsFromConversation(state.conversation);

  return {
    packageType: 'mujarrad_layer1_system_design_text_node',
    version: 1,
    runId: state.runId,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,

    contentPolicy: {
      storesTextOnly: true,
      storesFiles: false,
      storesDiagramImages: false,
      storesDrawioXml: false,
      note: 'This backend node stores the Layer 1 text knowledge package only. Downloadable files remain in Task 7 final artifacts.',
    },

    sourceText: {
      rawInputText: getRawInputText(state),
      processedInput: state.processedInput
        ? {
            id: state.processedInput.id,
            sourceInputIds: state.processedInput.sourceInputIds,
            normalizedText: state.processedInput.normalizedText,
            inputSize: state.processedInput.inputSize,
            chunkCount: state.processedInput.chunks.length,
          }
        : null,
    },

    clarification: {
      questions: state.questions.map((question) => ({
        id: question.id,
        question: question.question,
        category: question.category,
        reasonForAsking: question.reasonForAsking,
        expectedAnswerType: question.expectedAnswerType,
        answer: question.answer,
        answeredAt: question.answeredAt,
        createdAt: question.createdAt,
      })),
      answers,
      messages: clarificationMessages,
      additionalRequirements,
      currentPendingQuestion: state.currentQuestion
        ? {
            id: state.currentQuestion.id,
            question: state.currentQuestion.question,
            category: state.currentQuestion.category,
            answer: state.currentQuestion.answer,
            answeredAt: state.currentQuestion.answeredAt,
          }
        : null,
    },

    finalUnderstanding: state.understanding,
    completeness: state.completeness,

    diagramTextSummary: {
      approved: state.diagramApproved,
      summary: state.diagramSummary,
      revisionCount: state.diagramRevisions.length,
      revisions: state.diagramRevisions.map((revision) => ({
        id: revision.id,
        instruction: revision.instruction ?? null,
        activeRenderer: revision.activeRenderer ?? null,
        createdAt: revision.createdAt,
      })),
    },

    approvedArtifacts: state.approvedLayer1Artifacts
      ? {
          approvedAt: state.approvedLayer1Artifacts.approvedAt,
          selectedDiagramRenderer:
            state.approvedLayer1Artifacts.selectedDiagramRenderer,
          diagramSummary:
            state.approvedLayer1Artifacts.diagramSummary,
          manifest:
            state.approvedLayer1Artifacts.manifest,
          tokenEfficiencyReport:
            state.approvedLayer1Artifacts.tokenEfficiencyReport,
        }
      : null,

    metadata: {
      completedSteps: state.completedSteps,
      availableSteps: state.availableSteps,
      nextAction: state.nextAction,
    },
  };
}
