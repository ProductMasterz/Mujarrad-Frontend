import { Annotation, END, START, StateGraph } from '@langchain/langgraph';

import { layer1GraphEventSchema } from '../schemas/graph.schema';
import type { Layer1GraphEvent, Layer1GraphResult, Layer1GraphState } from '../types/graph.types';
import type { InputProcessingResult } from '../types/input.types';
import {
  createEmptySystemUnderstanding,
  type DiagramRevision,
  type QuestionAnswer,
  type Task4AiOperation,
  type Task6AiOperation,
} from '../types/layer1.types';
import { checkCompletenessNode } from '../nodes/checkCompletenessNode';
import { generateDiagramNode } from '../nodes/generateDiagramNode';
import { generateFinalDocsNode } from '../nodes/generateFinalDocsNode';
import { generateQuestionNode } from '../nodes/generateQuestionNode';
import { interpretClarificationMessageNode } from '../nodes/interpretClarificationMessageNode';
import { refineDiagramNode } from '../nodes/refineDiagramNode';
import { saveLayer1ToMujarrad } from '../services/saveLayer1ToMujarrad';
import { updateUnderstandingNode } from '../nodes/updateUnderstandingNode';
import { processSystemDesignInput } from '../tools/inputProcessingTool';
import type { AiTokenUsage } from '../tools/aiProviderTool';
import { createIsoTimestamp, createSystemDesignId } from '../utils/id';
import { buildDiagramGenerationContext } from '../utils/diagramGenerationContext';
import {
  deriveAdditionalRequirementsFromConversation,
  deriveClarificationMessagesFromConversation,
  deriveQuestionAnswersFromConversation,
} from '../utils/conversationDerivations';
import { completeLayer1Step, createInitialLayer1GraphState } from './layer1GraphState';

type RuntimeState = {
  event: Layer1GraphEvent;
  graphState: Layer1GraphState;
  ok: boolean;
  message?: string;
  processingResult?: InputProcessingResult;
  skipCompleteness?: boolean;
  canonicalEvidenceChanged?: boolean;
};

const RuntimeAnnotation = Annotation.Root({
  event: Annotation<Layer1GraphEvent>(),
  graphState: Annotation<Layer1GraphState>(),
  ok: Annotation<boolean>(),
  message: Annotation<string | undefined>(),
  processingResult: Annotation<InputProcessingResult | undefined>(),
  skipCompleteness: Annotation<boolean | undefined>(),
  canonicalEvidenceChanged: Annotation<boolean | undefined>(),
});

function addGraphError(state: Layer1GraphState, message: string, source: string): Layer1GraphState {
  return {
    ...state,
    errors: [
      ...state.errors,
      {
        id: createSystemDesignId('layer1-error'),
        message,
        source,
        createdAt: createIsoTimestamp(),
      },
    ],
    nextAction: 'error',
    updatedAt: createIsoTimestamp(),
  };
}

function appendTask4AiUsage(
  state: Layer1GraphState,
  operation: Task4AiOperation,
  usage: AiTokenUsage | null
): Layer1GraphState {
  if (!usage) {
    return state;
  }

  return {
    ...state,
    task4AiUsage: {
      calls: [
        ...state.task4AiUsage.calls,
        {
          id: createSystemDesignId('ai-usage'),
          operation,
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
          provider: usage.provider,
          model: usage.model,
          createdAt: createIsoTimestamp(),
        },
      ],
    },
    updatedAt: createIsoTimestamp(),
  };
}

function appendTask6AiUsage(
  state: Layer1GraphState,
  operation: Task6AiOperation,
  usage: AiTokenUsage | null
): Layer1GraphState {
  if (!usage) {
    return state;
  }

  return {
    ...state,
    task6AiUsage: {
      calls: [
        ...state.task6AiUsage.calls,
        {
          id: createSystemDesignId('ai-usage'),
          operation,
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
          provider: usage.provider,
          model: usage.model,
          createdAt: createIsoTimestamp(),
        },
      ],
    },
    updatedAt: createIsoTimestamp(),
  };
}

function addGraphWarning(
  state: Layer1GraphState,
  message: string,
  source: string,
  nextAction: Layer1GraphState['nextAction'] = state.nextAction
): Layer1GraphState {
  return {
    ...state,
    errors: [
      ...state.errors,
      {
        id: createSystemDesignId('layer1-warning'),
        message,
        source,
        createdAt: createIsoTimestamp(),
      },
    ],
    nextAction,
    updatedAt: createIsoTimestamp(),
  };
}

async function dispatchEventNode(runtime: RuntimeState): Promise<Partial<RuntimeState>> {
  const eventValidation = layer1GraphEventSchema.safeParse(runtime.event);

  if (!eventValidation.success) {
    return {
      ok: false,
      graphState: addGraphError(
        runtime.graphState,
        'Invalid Layer 1 graph event.',
        'dispatch_event'
      ),
      message: 'Invalid Layer 1 graph event.',
    };
  }

  const event = eventValidation.data;
  const state = runtime.graphState;

  if (event.type === 'start_run') {
    return {
      ok: true,
      graphState: state,
      message: 'Layer 1 run initialized.',
    };
  }

  if (event.type === 'reset_run') {
    return {
      ok: true,
      graphState: createInitialLayer1GraphState(),
      message: 'Layer 1 run reset.',
    };
  }

  if (event.type === 'sync_state') {
    return {
      ok: true,
      graphState: state,
      message: 'State synchronized.',
    };
  }

  if (event.type === 'submit_input') {
    if (!event.rawInput) {
      return {
        ok: false,
        graphState: addGraphError(state, 'Missing raw input.', 'submit_input'),
        message: 'Missing raw input.',
      };
    }

    const processingResult = processSystemDesignInput(event.rawInput);

    if (!processingResult.processedInput) {
      const message = processingResult.errors[0] ?? 'Input processing failed.';

      return {
        ok: false,
        graphState: {
          ...addGraphError(state, message, 'process_input'),
          rawInputs: [...state.rawInputs, event.rawInput],
        },
        processingResult,
        message,
      };
    }

    const completedState = completeLayer1Step(
      {
        ...state,
        rawInputs: [...state.rawInputs, event.rawInput],
        processedInput: processingResult.processedInput,
        conversation: (() => {
          const userMessageTimestamp = createIsoTimestamp();
          const assistantMessageTimestamp = createIsoTimestamp();

          return [
            {
              id: createSystemDesignId('conversation-message'),
              role: 'user' as const,
              kind: 'user_input' as const,
              content: processingResult.processedInput.normalizedText,
              createdAt: userMessageTimestamp,
              metadata: {
                source: 'initial_description',
              },
            },
            {
              id: createSystemDesignId('conversation-message'),
              role: 'assistant' as const,
              kind: 'assistant_message' as const,
              content:
                'I have analysed your system description. You can ask me to clarify the current understanding, add more requirements, ask a clarification question, or generate the diagram.',
              createdAt: assistantMessageTimestamp,
              metadata: {
                source: 'input_analysis',
              },
            },
          ];
        })(),

        currentQuestion: null,
        questions: [],
        understanding: createEmptySystemUnderstanding(),
        completeness: null,

        task4AiUsage: {
          calls: [],
        },

        task6AiUsage: {
          calls: [],
        },

        mujarradSave: {
          status: 'idle',
        },

        diagramGenerationContext: null,
        drawioXml: '',
        diagramImages: undefined,
        diagramRevisions: [],
        diagramApproved: false,

        markdownSpec: '',
        markdownApproved: false,
        approvedLayer1Artifacts: undefined,

        stage: 'clarification',
        activeStep: 'clarification',
        nextAction: 'ask_question',
        updatedAt: createIsoTimestamp(),
      },
      'input'
    );

    return {
      ok: true,
      graphState: {
        ...completedState,
        nextAction: 'ask_question',
      },
      processingResult,
      canonicalEvidenceChanged: true,
      message: 'Input processed. Clarification is available.',
    };
  }

  if (event.type === 'generate_question') {
    const { question, usage, error } = await generateQuestionNode(state);

    if (error || !question) {
      return {
        ok: false,
        graphState: addGraphError(
          appendTask4AiUsage(state, 'question_generation', usage),
          error ?? 'Failed to generate question.',
          'generate_question'
        ),
        message: error ?? 'Failed to generate question.',
      };
    }

    return {
      ok: true,
      graphState: {
        ...appendTask4AiUsage(state, 'question_generation', usage),
        currentQuestion: question,
        questions: [...state.questions, question],
        conversation: [
          ...state.conversation,
          {
            id: question.id,
            role: 'assistant',
            kind: 'assistant_question',
            content: question.question,
            createdAt: createIsoTimestamp(),
            questionId: question.id,
            metadata: {
              category: question.category,
              reasonForAsking: question.reasonForAsking,
            },
          },
        ],
        nextAction: 'wait_for_answer',
        updatedAt: createIsoTimestamp(),
      },
      message: 'Generated next clarification question.',
    };
  }

  if (event.type === 'send_clarification_message') {
    const userMessage = event.message?.trim();

    if (!userMessage) {
      return {
        ok: false,
        graphState: addGraphError(
          state,
          'Missing clarification message.',
          'send_clarification_message'
        ),
        message: 'Missing clarification message.',
      };
    }

    const { interpretation: rawInterpretation, error } =
      await interpretClarificationMessageNode(state, userMessage);

    const normalizedUserMessage = userMessage.trim();

    const looksLikeDirectQuestion =
      normalizedUserMessage.endsWith('?') ||
      /^(what|why|how|when|where|who|which|can|could|would|should|do|does|is|are|tell me|show me|explain)\b/i.test(
        normalizedUserMessage
      );

    const asksAboutWorkflowState =
      /\b(completeness|complete|readiness|understanding|what you understand|missing information|missing details|current question|history|progress|score)\b/i.test(
        normalizedUserMessage
      ) &&
      /\b(ask|tell|show|explain|know|about|what|why|how|status)\b/i.test(
        normalizedUserMessage
      );

    const explicitlyAddsRequirement =
      /^(add|also add|new requirement|another requirement|requirement:)\b/i.test(
        normalizedUserMessage
      );

    const explicitlyCorrectsInformation =
      /^(correction|correct|change|replace|instead|actually|no,|not )\b/i.test(
        normalizedUserMessage
      );

    const currentQuestionAlreadyAnswered =
      Boolean(state.currentQuestion) &&
      deriveQuestionAnswersFromConversation(state.conversation).some(
        (item) => item.questionId === state.currentQuestion?.id
      );

    const shouldForcePendingAnswer =
      Boolean(state.currentQuestion) &&
      !currentQuestionAlreadyAnswered &&
      !looksLikeDirectQuestion &&
      !asksAboutWorkflowState &&
      !explicitlyAddsRequirement &&
      !explicitlyCorrectsInformation &&
      rawInterpretation?.intent !== 'assume_current_answer';

    const interpretation =
      shouldForcePendingAnswer && rawInterpretation
        ? {
            ...rawInterpretation,
            intent: 'answer_current_question' as const,
            assistantMessage: `Recorded as the answer to the current question: ${normalizedUserMessage}`,
            concreteAnswer: normalizedUserMessage,
            changesCanonicalEvidence: true,
            assumedByAi: false,
          }
        : rawInterpretation;

    if (error || !interpretation) {
      return {
        ok: false,
        graphState: addGraphWarning(
          state,
          error ?? 'Could not interpret clarification message.',
          'send_clarification_message',
          state.currentQuestion ? 'wait_for_answer' : 'ask_question'
        ),
        message: error ?? 'Could not interpret clarification message.',
      };
    }

    const timestamp = createIsoTimestamp();

    const userChatMessage = {
      id: createSystemDesignId('clarification-message'),
      role: 'user' as const,
      content: userMessage,
      intent: interpretation.intent,
      createdAt: timestamp,
    };

    const assistantChatMessage = {
      id: createSystemDesignId('clarification-message'),
      role: 'assistant' as const,
      content: interpretation.assistantMessage,
      intent: interpretation.intent,
      createdAt: timestamp,
    };

    let nextState: Layer1GraphState = {
      ...state,
      conversation: [
        ...state.conversation,
        {
          id: userChatMessage.id,
          role: 'user',
          kind: 'user_input',
          content: userMessage,
          createdAt: timestamp,
          metadata: {
            intent: interpretation.intent,
          },
        },
        {
          id: assistantChatMessage.id,
          role: 'assistant',
          kind: 'assistant_message',
          content: interpretation.assistantMessage,
          createdAt: timestamp,
          metadata: {
            intent: interpretation.intent,
          },
        },
      ],
      updatedAt: timestamp,
    };

    const resolvesCurrentQuestion =
      Boolean(state.currentQuestion) &&
      Boolean(interpretation.concreteAnswer) &&
      (interpretation.intent === 'answer_current_question' ||
        interpretation.intent === 'assume_current_answer');

    if (resolvesCurrentQuestion && state.currentQuestion && interpretation.concreteAnswer) {
      const questionAnswers = deriveQuestionAnswersFromConversation(state.conversation);
      const existingAnswer = questionAnswers.find(
        (item) => item.questionId === state.currentQuestion?.id
      );

      const answerRecord: QuestionAnswer = {
        id: existingAnswer?.id ?? createSystemDesignId('answer'),
        questionId: state.currentQuestion.id,
        answer: interpretation.concreteAnswer,
        createdAt: existingAnswer?.createdAt ?? timestamp,
        updatedAt: existingAnswer ? timestamp : undefined,
        assumedByAi: interpretation.assumedByAi,
      };

      nextState = {
        ...nextState,
        conversation: nextState.conversation.map((message) => {
          const answerMessageId = interpretation.assumedByAi
            ? assistantChatMessage.id
            : userChatMessage.id;

          return message.id === answerMessageId
            ? {
                ...message,
                content: interpretation.concreteAnswer!,
                questionId: state.currentQuestion!.id,
                answerId: answerRecord.id,
                metadata: {
                  ...message.metadata,
                  source: 'question_answer',
                  assumedByAi: interpretation.assumedByAi,
                },
              }
            : message;
        }),
        currentQuestion: {
          ...state.currentQuestion,
          answer: interpretation.concreteAnswer,
          answeredAt: timestamp,
        },
      };
    }

    if (interpretation.changesCanonicalEvidence && interpretation.additionalRequirement) {
      const requirement = {
        id: createSystemDesignId('additional-requirement'),
        text: interpretation.additionalRequirement,
        createdAt: timestamp,
      };

      nextState = {
        ...nextState,
        conversation: nextState.conversation.map((message) =>
          message.id === userChatMessage.id
            ? {
                ...message,
                requirementId: requirement.id,
                metadata: {
                  ...message.metadata,
                  source: message.answerId
                    ? 'question_answer_and_requirement'
                    : 'additional_requirement',
                },
              }
            : message
        ),
      };
    }

    const currentQuestionAnswered =
      Boolean(nextState.currentQuestion) &&
      deriveQuestionAnswersFromConversation(nextState.conversation).some(
        (item) => item.questionId === nextState.currentQuestion?.id
      );

    return {
      ok: true,
      graphState: {
        ...nextState,
        nextAction:
          nextState.currentQuestion && !currentQuestionAnswered
            ? 'wait_for_answer'
            : 'ask_question',
        updatedAt: timestamp,
      },
      canonicalEvidenceChanged:
        interpretation.changesCanonicalEvidence &&
        (resolvesCurrentQuestion || Boolean(interpretation.additionalRequirement)),
      message: interpretation.assistantMessage,
    };
  }

  if (event.type === 'edit_question_answer') {
    const replacementAnswer = event.answer?.trim();

    if (!event.answerId || !replacementAnswer) {
      return {
        ok: false,
        graphState: addGraphError(
          state,
          'Missing answer id or replacement answer.',
          'edit_question_answer'
        ),
        message: 'Missing answer id or replacement answer.',
      };
    }

    const questionAnswers = deriveQuestionAnswersFromConversation(state.conversation);
    const existingAnswer = questionAnswers.find((item) => item.id === event.answerId);

    if (!existingAnswer) {
      return {
        ok: false,
        graphState: addGraphError(state, 'Answer was not found.', 'edit_question_answer'),
        message: 'Answer was not found.',
      };
    }

    const timestamp = createIsoTimestamp();

    return {
      ok: true,
      graphState: {
        ...state,
        conversation: state.conversation.map((message) =>
          message.answerId === event.answerId
            ? {
                ...message,
                content: replacementAnswer,
                metadata: {
                  ...message.metadata,
                  assumedByAi: false,
                  editedAt: timestamp,
                },
              }
            : message
        ),
        currentQuestion:
          state.currentQuestion?.id === existingAnswer.questionId
            ? {
                ...state.currentQuestion,
                answer: replacementAnswer,
                answeredAt: timestamp,
              }
            : state.currentQuestion,
        nextAction: 'ask_question',
        updatedAt: timestamp,
      },
      canonicalEvidenceChanged: true,
      message: 'Answer updated.',
    };
  }

  if (event.type === 'delete_question_answer') {
    if (!event.answerId) {
      return {
        ok: false,
        graphState: addGraphError(state, 'Missing answer id.', 'delete_question_answer'),
        message: 'Missing answer id.',
      };
    }

    const questionAnswers = deriveQuestionAnswersFromConversation(state.conversation);
    const existingAnswer = questionAnswers.find((item) => item.id === event.answerId);

    if (!existingAnswer) {
      return {
        ok: false,
        graphState: addGraphError(state, 'Answer was not found.', 'delete_question_answer'),
        message: 'Answer was not found.',
      };
    }

    const question = state.questions.find((item) => item.id === existingAnswer.questionId);

    return {
      ok: true,
      graphState: {
        ...state,
        conversation: state.conversation.filter((message) => message.answerId !== event.answerId),
        currentQuestion:
          state.currentQuestion?.id === existingAnswer.questionId
            ? {
                ...state.currentQuestion,
                answer: undefined,
                answeredAt: undefined,
              }
            : question
              ? {
                  ...question,
                  answer: undefined,
                  answeredAt: undefined,
                }
              : state.currentQuestion,
        nextAction: question ? 'wait_for_answer' : 'ask_question',
        updatedAt: createIsoTimestamp(),
      },
      canonicalEvidenceChanged: true,
      message: 'Answer deleted.',
    };
  }

  if (event.type === 'delete_question') {
    if (!event.questionId) {
      return {
        ok: false,
        graphState: addGraphError(state, 'Missing question id.', 'delete_question'),
        message: 'Missing question id.',
      };
    }

    return {
      ok: true,
      graphState: {
        ...state,
        questions: state.questions.filter((item) => item.id !== event.questionId),
        conversation: state.conversation.filter(
          (message) => message.questionId !== event.questionId
        ),
        currentQuestion:
          state.currentQuestion?.id === event.questionId ? null : state.currentQuestion,
        nextAction: 'ask_question',
        updatedAt: createIsoTimestamp(),
      },
      canonicalEvidenceChanged: true,
      message: 'Question deleted.',
    };
  }

  if (event.type === 'edit_additional_requirement') {
    const replacementText = event.requirementText?.trim();

    if (!event.requirementId || !replacementText) {
      return {
        ok: false,
        graphState: addGraphError(
          state,
          'Missing requirement id or replacement text.',
          'edit_additional_requirement'
        ),
        message: 'Missing requirement id or replacement text.',
      };
    }

    const additionalRequirements = deriveAdditionalRequirementsFromConversation(state.conversation);
    const requirementExists = additionalRequirements.some(
      (item) => item.id === event.requirementId
    );

    if (!requirementExists) {
      return {
        ok: false,
        graphState: addGraphError(
          state,
          'Requirement was not found.',
          'edit_additional_requirement'
        ),
        message: 'Requirement was not found.',
      };
    }

    const timestamp = createIsoTimestamp();

    return {
      ok: true,
      graphState: {
        ...state,
        conversation: state.conversation.map((message) =>
          message.requirementId === event.requirementId
            ? {
                ...message,
                content: replacementText,
                metadata: {
                  ...message.metadata,
                  editedAt: timestamp,
                },
              }
            : message
        ),
        updatedAt: timestamp,
      },
      canonicalEvidenceChanged: true,
      message: 'Requirement updated.',
    };
  }

  if (event.type === 'delete_additional_requirement') {
    if (!event.requirementId) {
      return {
        ok: false,
        graphState: addGraphError(
          state,
          'Missing requirement id.',
          'delete_additional_requirement'
        ),
        message: 'Missing requirement id.',
      };
    }

    const additionalRequirements = deriveAdditionalRequirementsFromConversation(state.conversation);
    const requirementExists = additionalRequirements.some(
      (item) => item.id === event.requirementId
    );

    if (!requirementExists) {
      return {
        ok: false,
        graphState: addGraphError(
          state,
          'Requirement was not found.',
          'delete_additional_requirement'
        ),
        message: 'Requirement was not found.',
      };
    }

    return {
      ok: true,
      graphState: {
        ...state,
        conversation: state.conversation.filter(
          (message) => message.requirementId !== event.requirementId
        ),
        updatedAt: createIsoTimestamp(),
      },
      canonicalEvidenceChanged: true,
      message: 'Requirement deleted.',
    };
  }

  if (event.type === 'skip_to_diagram') {
    const completedState = completeLayer1Step(
      {
        ...state,
        nextAction: 'generate_diagram',
        updatedAt: createIsoTimestamp(),
      },
      'clarification'
    );

    return {
      ok: true,
      graphState: {
        ...completedState,
        diagramGenerationContext: buildDiagramGenerationContext(
          completedState,
          runtime.event.type === 'skip_to_diagram' ? 'skipped_to_diagram' : 'ready_for_diagram'
        ),
        nextAction: 'generate_diagram',
        updatedAt: createIsoTimestamp(),
      },
      message: 'Clarification skipped. Ready for diagram generation.',
    };
  }

  if (event.type === 'generate_diagram') {
    const diagramReadyState = completeLayer1Step(
      {
        ...state,
        diagramGenerationContext: buildDiagramGenerationContext(
          state,
          state.completeness?.readyForDiagram
            ? 'ready_for_diagram'
            : 'skipped_to_diagram'
        ),
        nextAction: 'generate_diagram',
        updatedAt: createIsoTimestamp(),
      },
      'clarification'
    );

    return {
      ok: true,
      graphState: {
        ...diagramReadyState,
        stage: 'diagram',
        activeStep: 'diagram',
        nextAction: 'generate_diagram',
        updatedAt: createIsoTimestamp(),
      },
      message:
        'Generating diagram from the latest cumulative understanding and clarification evidence.',
    };
  }

  if (event.type === 'refine_diagram') {
    if (!event.refinementInstruction) {
      return {
        ok: false,
        graphState: addGraphError(
          state,
          'Missing diagram refinement instruction.',
          'refine_diagram'
        ),
        message: 'Missing diagram refinement instruction.',
      };
    }

    if (!state.mermaidSource.trim()) {
      return {
        ok: false,
        graphState: addGraphError(state, 'No Mermaid diagram exists to refine.', 'refine_diagram'),
        message: 'No Mermaid diagram exists to refine.',
      };
    }

    return {
      ok: true,
      graphState: {
        ...state,
        nextAction: 'refine_diagram',
        updatedAt: createIsoTimestamp(),
      },
      message: 'Refining diagram.',
    };
  }

  if (event.type === 'sync_diagram_xml') {
    if (!event.xml) {
      return {
        ok: false,
        graphState: addGraphError(state, 'Missing Draw.io XML to sync.', 'sync_diagram_xml'),
        message: 'Missing Draw.io XML to sync.',
      };
    }

    const revision: DiagramRevision = {
      id: createSystemDesignId('diagram-revision'),
      xml: event.xml,
      mermaidSource: state.mermaidSource,
      activeRenderer: 'drawio',
      instruction: 'Manual Draw.io edit.',
      createdAt: createIsoTimestamp(),
    };

    return {
      ok: true,
      graphState: {
        ...state,
        drawioXml: event.xml,
        diagramRevisions: [...state.diagramRevisions, revision],
        nextAction: 'wait_for_diagram_approval',
        updatedAt: createIsoTimestamp(),
      },
      message: 'Manual diagram edit synchronized.',
    };
  }

  if (event.type === 'undo_diagram_revision') {
    if (state.diagramRevisions.length < 2) {
      return {
        ok: true,
        graphState: {
          ...state,
          nextAction: 'wait_for_diagram_approval',
          updatedAt: createIsoTimestamp(),
        },
        message: 'No previous diagram revision to restore.',
      };
    }

    const previousRevision = state.diagramRevisions[state.diagramRevisions.length - 2];

    const undoRevision: DiagramRevision = {
      id: createSystemDesignId('diagram-revision'),
      xml: '',
      mermaidSource: previousRevision.mermaidSource ?? state.mermaidSource,
      activeRenderer: 'mermaid',
      instruction: 'Undo to previous Mermaid diagram revision.',
      createdAt: createIsoTimestamp(),
    };

    return {
      ok: true,
      graphState: {
        ...state,
        drawioXml: '',
        mermaidSource: previousRevision.mermaidSource ?? state.mermaidSource,
        activeDiagramRenderer: 'mermaid',
        selectedDiagramRenderer: null,
        diagramApproved: false,
        diagramRevisions: [...state.diagramRevisions, undoRevision],
        nextAction: 'wait_for_diagram_approval',
        updatedAt: createIsoTimestamp(),
      },
      message: 'Restored previous diagram revision.',
    };
  }

  if (event.type === 'reset_diagram_revision') {
    const originalRevision = state.diagramRevisions[0];

    if (!originalRevision) {
      return {
        ok: false,
        graphState: addGraphError(
          state,
          'No original generated diagram revision exists.',
          'reset_diagram_revision'
        ),
        message: 'No original generated diagram revision exists.',
      };
    }

    const resetRevision: DiagramRevision = {
      id: createSystemDesignId('diagram-revision'),
      xml: '',
      mermaidSource: originalRevision.mermaidSource ?? state.mermaidSource,
      activeRenderer: 'mermaid',
      instruction: 'Reset to original generated Mermaid diagram.',
      createdAt: createIsoTimestamp(),
    };

    return {
      ok: true,
      graphState: {
        ...state,
        drawioXml: '',
        mermaidSource: originalRevision.mermaidSource ?? state.mermaidSource,
        activeDiagramRenderer: 'mermaid',
        selectedDiagramRenderer: null,
        diagramApproved: false,
        diagramRevisions: [...state.diagramRevisions, resetRevision],
        nextAction: 'wait_for_diagram_approval',
        updatedAt: createIsoTimestamp(),
      },
      message: 'Diagram reset to original generated version.',
    };
  }

  if (event.type === 'approve_diagram') {
    const completedState = completeLayer1Step(
      {
        ...state,
        drawioXml: '',

        mermaidSource: event.mermaidSource ?? state.mermaidSource,

        activeDiagramRenderer: 'mermaid',

        selectedDiagramRenderer: 'mermaid',

        diagramImages: event.diagramImages ?? state.diagramImages,

        diagramApproved: true,
        mujarradSave: {
          status: 'idle',
        },
        nextAction: 'save_layer1_to_mujarrad',
        updatedAt: createIsoTimestamp(),
      },
      'diagram'
    );

    return {
      ok: true,
      graphState: {
        ...completedState,
        diagramApproved: true,
        activeStep: 'save_to_mujarrad',
        nextAction: 'save_layer1_to_mujarrad',
        updatedAt: createIsoTimestamp(),
      },
      message:
        'Mermaid diagram approved. Save Layer 1 to Mujarrad or skip to final artifact generation.',
    };
  }

  if (event.type === 'save_layer1_to_mujarrad') {
    if (!event.mujarradDestination) {
      return {
        ok: false,
        graphState: addGraphWarning(
          {
            ...state,
            mujarradSave: {
              status: 'error',
              error: 'Missing Mujarrad save destination.',
            },
          },
          'Missing Mujarrad save destination.',
          'save_layer1_to_mujarrad',
          'save_layer1_to_mujarrad'
        ),
        message: 'Missing Mujarrad save destination.',
      };
    }

    const result = await saveLayer1ToMujarrad(state, event.mujarradDestination);

    if (!result.ok) {
      return {
        ok: false,
        graphState: addGraphWarning(
          {
            ...state,
            mujarradSave: {
              status: 'error',
              destination: event.mujarradDestination,
              error: result.error ?? 'Mujarrad backend save failed.',
            },
          },
          result.error ?? 'Mujarrad backend save failed.',
          'save_layer1_to_mujarrad',
          'save_layer1_to_mujarrad'
        ),
        message: result.error ?? 'Mujarrad backend save failed.',
      };
    }

    return {
      ok: true,
      graphState: {
        ...state,
        mujarradSave: {
          status: 'saved',
          destination: event.mujarradDestination,
          backendNodeId: result.backendNodeId,
          savedAt: createIsoTimestamp(),
        },
        nextAction: 'generate_final_docs',
        updatedAt: createIsoTimestamp(),
      },
      message: 'Layer 1 saved to Mujarrad.',
    };
  }

  if (event.type === 'skip_mujarrad_save') {
    const completedState = completeLayer1Step(
      {
        ...state,
        mujarradSave: {
          ...state.mujarradSave,
          status: 'skipped',
          skippedAt: createIsoTimestamp(),
        },
        nextAction: 'generate_final_docs',
        updatedAt: createIsoTimestamp(),
      },
      'save_to_mujarrad'
    );

    return {
      ok: true,
      graphState: {
        ...completedState,
        activeStep: 'final_artifacts',
        nextAction: 'generate_final_docs',
        updatedAt: createIsoTimestamp(),
      },
      message: 'Mujarrad save skipped. Final artifact generation is available.',
    };
  }

  if (event.type === 'complete_step') {
    if (!event.stepId) {
      return {
        ok: false,
        graphState: addGraphError(state, 'Missing step id.', 'complete_step'),
        message: 'Missing step id.',
      };
    }

    return {
      ok: true,
      graphState: completeLayer1Step(state, event.stepId),
      message: `${event.stepId} completed.`,
    };
  }

  if (event.type === 'submit_answer') {
    if (!event.answer || !state.currentQuestion) {
      return {
        ok: false,
        graphState: addGraphError(state, 'Missing answer or current question.', 'submit_answer'),
        message: 'Missing answer or current question.',
      };
    }

    const timestamp = createIsoTimestamp();

    const answer: QuestionAnswer = {
      id: createSystemDesignId('answer'),
      questionId: state.currentQuestion.id,
      answer: event.answer,
      createdAt: timestamp,
    };

    return {
      ok: true,
      graphState: {
        ...state,
        conversation: [
          ...state.conversation,
          {
            id: answer.id,
            role: 'user',
            kind: 'user_input',
            content: event.answer,
            createdAt: timestamp,
            questionId: state.currentQuestion.id,
            answerId: answer.id,
            metadata: {
              source: 'question_answer',
            },
          },
        ],
        currentQuestion: {
          ...state.currentQuestion,
          answer: event.answer,
          answeredAt: timestamp,
        },
        nextAction: 'update_understanding',
        updatedAt: timestamp,
      },
      canonicalEvidenceChanged: true,
      message: 'Answer recorded.',
    };
  }

  return {
    ok: true,
    graphState: state,
    message: 'State synchronized.',
  };
}

async function updateUnderstandingGraphNode(runtime: RuntimeState): Promise<Partial<RuntimeState>> {
  if (!runtime.ok || !runtime.canonicalEvidenceChanged) {
    return {};
  }

  const { understanding, usage, error } = await updateUnderstandingNode(runtime.graphState);

  if (error) {
    return {
      ok: false,
      graphState: addGraphWarning(
        appendTask4AiUsage(runtime.graphState, 'understanding_update', usage),
        error,
        'update_understanding',
        runtime.graphState.currentQuestion ? 'wait_for_answer' : 'ask_question'
      ),
      skipCompleteness: true,
      message: `System understanding update failed: ${error}`,
    };
  }

  return {
    ok: true,
    graphState: {
      ...appendTask4AiUsage(runtime.graphState, 'understanding_update', usage),
      understanding,
      diagramGenerationContext: null,
      nextAction: 'check_completeness',
      updatedAt: createIsoTimestamp(),
    },
    message: 'Understanding updated.',
  };
}

async function checkCompletenessGraphNode(runtime: RuntimeState): Promise<Partial<RuntimeState>> {
  if (!runtime.ok || !runtime.canonicalEvidenceChanged || runtime.skipCompleteness) {
    return {};
  }

  const { completeness, usage, error } = await checkCompletenessNode(runtime.graphState);

  if (!completeness) {
    return {
      ok: true,
      graphState: addGraphWarning(
        appendTask4AiUsage(runtime.graphState, 'completeness_check', usage),
        error ?? 'Completeness check failed.',
        'check_completeness',
        runtime.graphState.currentQuestion ? 'wait_for_answer' : 'ask_question'
      ),
      message: 'Understanding was saved, but completeness analysis was unavailable.',
    };
  }

  return {
    ok: true,
    graphState: {
      ...appendTask4AiUsage(runtime.graphState, 'completeness_check', usage),
      completeness,
      nextAction: 'check_completeness',
      updatedAt: createIsoTimestamp(),
    },
    message: error
      ? `Readiness calculated deterministically. Advisory analysis was unavailable: ${error}`
      : 'Completeness checked.',
  };
}

async function decideNextActionGraphNode(runtime: RuntimeState): Promise<Partial<RuntimeState>> {
  if (!runtime.ok || !runtime.canonicalEvidenceChanged) {
    return {};
  }

  if (runtime.event.type === 'submit_input') {
    return {
      ok: true,
      graphState: {
        ...runtime.graphState,
        nextAction: 'ask_question',
        updatedAt: createIsoTimestamp(),
      },
      message: 'Initial system understanding and clarification readiness calculated.',
    };
  }

  const hasPendingQuestion =
    Boolean(runtime.graphState.currentQuestion) &&
    !deriveQuestionAnswersFromConversation(runtime.graphState.conversation).some(
      (item) => item.questionId === runtime.graphState.currentQuestion?.id
    );

  return {
    ok: true,
    graphState: {
      ...runtime.graphState,
      nextAction: hasPendingQuestion ? 'wait_for_answer' : 'ask_question',
      updatedAt: createIsoTimestamp(),
    },
    message: runtime.graphState.completeness?.readyForDiagram
      ? 'Understanding updated. The diagram is ready when the user chooses to continue.'
      : 'Understanding updated. Clarification can continue.',
  };
}

async function generateDiagramGraphNode(runtime: RuntimeState): Promise<Partial<RuntimeState>> {
  if (!runtime.ok || runtime.event.type !== 'generate_diagram') {
    return {};
  }

  const { xml, mermaidSource, summary, warnings, error } = await generateDiagramNode(
    runtime.graphState
  );

  if (error || !mermaidSource.trim()) {
    return {
      ok: false,
      graphState: addGraphWarning(
        runtime.graphState,
        error ?? 'Diagram generation failed.',
        'generate_diagram',
        'generate_diagram'
      ),
      message: error ?? 'Diagram generation failed.',
    };
  }

  const revision: DiagramRevision = {
    id: createSystemDesignId('diagram-revision'),
    xml: '',
    mermaidSource,
    activeRenderer: 'mermaid',
    instruction: 'Initial AI-generated diagram from Layer 1 context.',
    createdAt: createIsoTimestamp(),
  };

  return {
    ok: true,
    graphState: {
      ...runtime.graphState,
      drawioXml: '',
      mermaidSource,
      activeDiagramRenderer: 'mermaid',
      selectedDiagramRenderer: null,
      diagramApproved: false,
      diagramSummary: summary,
      diagramRevisions: [...runtime.graphState.diagramRevisions, revision],
      stage: 'diagram',
      activeStep: 'diagram',
      nextAction: 'wait_for_diagram_approval',
      updatedAt: createIsoTimestamp(),
    },
    message:
      warnings.length > 0
        ? `Diagram generated with ${warnings.length} repair(s) applied.`
        : 'Diagram generated.',
  };
}

async function refineDiagramGraphNode(runtime: RuntimeState): Promise<Partial<RuntimeState>> {
  if (!runtime.ok || runtime.event.type !== 'refine_diagram') {
    return {};
  }

  const instruction = runtime.event.refinementInstruction ?? '';

  const { xml, mermaidSource, summary, warnings, usageRecords, error } = await refineDiagramNode(
    runtime.graphState,
    instruction
  );

  const stateWithUsage = usageRecords.reduce(
    (currentState, record) => appendTask6AiUsage(currentState, record.operation, record.usage),
    runtime.graphState
  );

  if (error || !mermaidSource.trim()) {
    return {
      ok: false,
      graphState: addGraphWarning(
        stateWithUsage,
        error ?? 'Diagram refinement failed.',
        'refine_diagram',
        'wait_for_diagram_approval'
      ),
      message: error ?? 'Diagram refinement failed.',
    };
  }

  const revision: DiagramRevision = {
    id: createSystemDesignId('diagram-revision'),
    xml: '',
    mermaidSource,
    activeRenderer: 'mermaid',
    instruction,
    createdAt: createIsoTimestamp(),
  };

  return {
    ok: true,
    graphState: {
      ...stateWithUsage,
      drawioXml: '',

      mermaidSource: mermaidSource || stateWithUsage.mermaidSource,

      activeDiagramRenderer: 'mermaid',

      selectedDiagramRenderer: null,

      diagramApproved: false,
      diagramSummary: summary || stateWithUsage.diagramSummary,
      diagramRevisions: [...stateWithUsage.diagramRevisions, revision],
      nextAction: 'wait_for_diagram_approval',
      updatedAt: createIsoTimestamp(),
    },
    message:
      warnings.length > 0
        ? `Diagram refined with ${warnings.length} repair(s) applied.`
        : 'Diagram refined.',
  };
}

async function generateFinalDocsGraphNode(runtime: RuntimeState): Promise<Partial<RuntimeState>> {
  if (!runtime.ok || runtime.event.type !== 'generate_final_docs') {
    return {};
  }

  const { bundle, error } = await generateFinalDocsNode(runtime.graphState);

  if (error || !bundle) {
    return {
      ok: false,
      graphState: addGraphWarning(
        runtime.graphState,
        error ?? 'Final documentation generation failed.',
        'generate_final_docs',
        'generate_final_docs'
      ),
      message: error ?? 'Final documentation generation failed.',
    };
  }

  return {
    ok: true,
    graphState: {
      ...runtime.graphState,
      stage: 'export',
      activeStep: 'preview_artifacts',
      completedSteps: Array.from(
        new Set([...runtime.graphState.completedSteps, 'final_artifacts'])
      ),
      availableSteps: Array.from(
        new Set([...runtime.graphState.availableSteps, 'preview_artifacts'])
      ),
      markdownSpec: bundle.markdownSpec,
      markdownApproved: true,
      approvedLayer1Artifacts: bundle,
      nextAction: 'complete',
      updatedAt: createIsoTimestamp(),
    },
    message:
      'Final Layer 1 artifacts generated successfully. Artifact inspection and handoff are ready.',
  };
}

function routeAfterDispatch(runtime: RuntimeState): string {
  if (!runtime.ok) {
    return END;
  }

  if (runtime.canonicalEvidenceChanged) {
    return 'update_understanding';
  }

  if (runtime.event.type === 'generate_diagram') {
    return 'generate_diagram';
  }

  if (runtime.event.type === 'refine_diagram') {
    return 'refine_diagram';
  }

  if (runtime.event.type === 'generate_final_docs') {
    return 'generate_final_docs';
  }

  return END;
}

const workflow = new StateGraph(RuntimeAnnotation)
  .addNode('dispatch_event', dispatchEventNode)
  .addNode('update_understanding', updateUnderstandingGraphNode)
  .addNode('check_completeness', checkCompletenessGraphNode)
  .addNode('decide_next_action', decideNextActionGraphNode)
  .addNode('generate_diagram', generateDiagramGraphNode)
  .addNode('refine_diagram', refineDiagramGraphNode)
  .addNode('generate_final_docs', generateFinalDocsGraphNode)
  .addEdge(START, 'dispatch_event')
  .addConditionalEdges('dispatch_event', routeAfterDispatch)
  .addEdge('update_understanding', 'check_completeness')
  .addEdge('check_completeness', 'decide_next_action')
  .addEdge('decide_next_action', END)
  .addEdge('generate_diagram', END)
  .addEdge('refine_diagram', END)
  .addEdge('generate_final_docs', END);

const compiledLayer1Graph = workflow.compile();

export async function invokeLayer1Graph(
  event: Layer1GraphEvent,
  existingState?: Layer1GraphState
): Promise<Layer1GraphResult> {
  const initialState: RuntimeState = {
    event,
    graphState: existingState ?? createInitialLayer1GraphState(),
    ok: true,
  };

  const result = (await compiledLayer1Graph.invoke(initialState)) as RuntimeState;

  return {
    ok: result.ok,
    state: result.graphState,
    processingResult: result.processingResult,
    message: result.message,
  };
}
