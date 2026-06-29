import { Annotation, END, START, StateGraph } from '@langchain/langgraph';

import { layer1GraphEventSchema } from '../schemas/graph.schema';
import type {
  Layer1GraphEvent,
  Layer1GraphResult,
  Layer1GraphState,
} from '../types/graph.types';
import type { InputProcessingResult } from '../types/input.types';
import {
  createEmptySystemUnderstanding,
  type ConstructiveQuestion,
  type DiagramRevision,
  type QuestionAnswer,
} from '../types/layer1.types';
import { checkCompletenessNode } from '../nodes/checkCompletenessNode';
import { generateDiagramNode } from '../nodes/generateDiagramNode';
import { generateQuestionNode } from '../nodes/generateQuestionNode';
import { updateUnderstandingNode } from '../nodes/updateUnderstandingNode';
import { processSystemDesignInput } from '../tools/inputProcessingTool';
import { createIsoTimestamp, createSystemDesignId } from '../utils/id';
import { isReadyForDiagram } from '../utils/completeness';
import { buildDiagramGenerationContext } from '../utils/diagramGenerationContext';
import {
  completeLayer1Step,
  createInitialLayer1GraphState,
} from './layer1GraphState';

type RuntimeState = {
  event: Layer1GraphEvent;
  graphState: Layer1GraphState;
  ok: boolean;
  message?: string;
  processingResult?: InputProcessingResult;
  skipCompleteness?: boolean;
};

const RuntimeAnnotation = Annotation.Root({
  event: Annotation<Layer1GraphEvent>(),
  graphState: Annotation<Layer1GraphState>(),
  ok: Annotation<boolean>(),
  message: Annotation<string | undefined>(),
  processingResult: Annotation<InputProcessingResult | undefined>(),
  skipCompleteness: Annotation<boolean | undefined>(),
});

function addGraphError(
  state: Layer1GraphState,
  message: string,
  source: string,
): Layer1GraphState {
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

function addGraphWarning(
  state: Layer1GraphState,
  message: string,
  source: string,
  nextAction: Layer1GraphState['nextAction'] = state.nextAction,
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
        'dispatch_event',
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

        currentQuestion: null,
        questions: [],
        qaHistory: [],
        understanding: createEmptySystemUnderstanding(),
        completeness: null,

        diagramGenerationContext: null,
        drawioXml: '',
        diagramImage: undefined,
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
      'input',
    );

    return {
      ok: true,
      graphState: {
        ...completedState,
        nextAction: 'ask_question',
      },
      processingResult,
      message: 'Input processed. Clarification is available.',
    };
  }

  if (event.type === 'generate_question') {
    const { question, error } = await generateQuestionNode(state);

    if (error || !question) {
      return {
        ok: false,
        graphState: addGraphError(
          state,
          error ?? 'Failed to generate question.',
          'generate_question',
        ),
        message: error ?? 'Failed to generate question.',
      };
    }

    return {
      ok: true,
      graphState: {
        ...state,
        currentQuestion: question,
        questions: [...state.questions, question],
        nextAction: 'wait_for_answer',
        updatedAt: createIsoTimestamp(),
      },
      message: 'Generated next clarification question.',
    };
  }

  if (event.type === 'skip_to_diagram') {
    const completedState = completeLayer1Step(
      {
        ...state,
        nextAction: 'generate_diagram',
        updatedAt: createIsoTimestamp(),
      },
      'clarification',
    );

    return {
      ok: true,
      graphState: {
        ...completedState,
        diagramGenerationContext: buildDiagramGenerationContext(
          completedState,
          runtime.event.type === 'skip_to_diagram'
            ? 'skipped_to_diagram'
            : 'ready_for_diagram',
        ),
        nextAction: 'generate_diagram',
        updatedAt: createIsoTimestamp(),
      },
      message: 'Clarification skipped. Ready for diagram generation.',
    };
  }

  if (event.type === 'generate_diagram') {
    if (!state.diagramGenerationContext) {
      return {
        ok: false,
        graphState: addGraphError(
          state,
          'Diagram generation requires a prepared diagramGenerationContext. Complete or skip clarification first.',
          'generate_diagram',
        ),
        message: 'Diagram generation context is not ready.',
      };
    }

    return {
      ok: true,
      graphState: {
        ...state,
        nextAction: 'generate_diagram',
        updatedAt: createIsoTimestamp(),
      },
      message: 'Generating diagram from Layer 1 context.',
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
    if (!event.answer) {
      return {
        ok: false,
        graphState: addGraphError(state, 'Missing answer.', 'submit_answer'),
        message: 'Missing answer.',
      };
    }

    // Allow free-form messages even when the assistant has not posed a
    // question (e.g. the user proactively adds detail). Synthesize a
    // lightweight question so the answer is still recorded and folded into the
    // understanding. Synthetic questions are tagged 'freeform' so the UI does
    // not render them as assistant turns.
    const isSynthetic = !state.currentQuestion;
    const question: ConstructiveQuestion = state.currentQuestion ?? {
      id: createSystemDesignId('question'),
      question: 'Additional details from the user',
      category: 'freeform',
      reasonForAsking: 'User-provided additional context.',
      basedOn: {},
      expectedAnswerType: 'long_text',
      createdAt: createIsoTimestamp(),
    };

    const answer: QuestionAnswer = {
      id: createSystemDesignId('answer'),
      questionId: question.id,
      answer: event.answer,
      createdAt: createIsoTimestamp(),
    };

    return {
      ok: true,
      graphState: {
        ...state,
        questions: isSynthetic ? [...state.questions, question] : state.questions,
        qaHistory: [...state.qaHistory, answer],
        currentQuestion: {
          ...question,
          answer: event.answer,
          answeredAt: createIsoTimestamp(),
        },
        nextAction: 'update_understanding',
        updatedAt: createIsoTimestamp(),
      },
      message: 'Answer recorded.',
    };
  }

  return {
    ok: true,
    graphState: state,
    message: 'State synchronized.',
  };
}

async function updateUnderstandingGraphNode(
  runtime: RuntimeState,
): Promise<Partial<RuntimeState>> {
  if (!runtime.ok || runtime.event.type !== 'submit_answer') {
    return {};
  }

  const { understanding, error } = await updateUnderstandingNode(runtime.graphState);

  if (error) {
    return {
      ok: true,
      graphState: addGraphWarning(
        runtime.graphState,
        error,
        'update_understanding',
        'ask_question',
      ),
      skipCompleteness: true,
      message:
        'Answer saved. Understanding update failed, but the user can continue or skip to diagram.',
    };
  }

  return {
    ok: true,
    graphState: {
      ...runtime.graphState,
      understanding,
      nextAction: 'check_completeness',
      updatedAt: createIsoTimestamp(),
    },
    message: 'Understanding updated.',
  };
}

async function checkCompletenessGraphNode(
  runtime: RuntimeState,
): Promise<Partial<RuntimeState>> {
  if (!runtime.ok || runtime.event.type !== 'submit_answer' || runtime.skipCompleteness) {
    return {};
  }

  const { completeness, error } = await checkCompletenessNode(runtime.graphState);

  if (error || !completeness) {
    return {
      ok: true,
      graphState: addGraphWarning(
        runtime.graphState,
        error ?? 'Completeness check failed.',
        'check_completeness',
        'ask_question',
      ),
      message:
        'Answer saved. Completeness check failed, but the user can continue or skip to diagram.',
    };
  }

  return {
    ok: true,
    graphState: {
      ...runtime.graphState,
      completeness,
      nextAction: 'check_completeness',
      updatedAt: createIsoTimestamp(),
    },
    message: 'Completeness checked.',
  };
}

async function decideNextActionGraphNode(
  runtime: RuntimeState,
): Promise<Partial<RuntimeState>> {
  if (!runtime.ok || runtime.event.type !== 'submit_answer') {
    return {};
  }

  if (runtime.skipCompleteness) {
    return {
      ok: true,
      graphState: {
        ...runtime.graphState,
        nextAction: 'ask_question',
        updatedAt: createIsoTimestamp(),
      },
      message:
        'Answer saved. More clarification can continue, or the user can skip to diagram.',
    };
  }

  if (isReadyForDiagram(runtime.graphState.completeness)) {
    const completedState = completeLayer1Step(runtime.graphState, 'clarification');

    return {
      ok: true,
      graphState: {
        ...completedState,
        diagramGenerationContext: buildDiagramGenerationContext(
          completedState,
          'ready_for_diagram',
        ),
        nextAction: 'generate_diagram',
        updatedAt: createIsoTimestamp(),
      },
      message: 'Clarification complete. Ready for diagram generation.',
    };
  }

  return {
    ok: true,
    graphState: {
      ...runtime.graphState,
      nextAction: 'ask_question',
      updatedAt: createIsoTimestamp(),
    },
    message: 'More clarification needed.',
  };
}

async function generateDiagramGraphNode(
  runtime: RuntimeState,
): Promise<Partial<RuntimeState>> {
  if (!runtime.ok || runtime.event.type !== 'generate_diagram') {
    return {};
  }

  const { xml, summary, warnings, error } = await generateDiagramNode(
    runtime.graphState,
  );

  if (error || !xml) {
    return {
      ok: false,
      graphState: addGraphWarning(
        runtime.graphState,
        error ?? 'Diagram generation failed.',
        'generate_diagram',
        'generate_diagram',
      ),
      message: error ?? 'Diagram generation failed.',
    };
  }

  const revision: DiagramRevision = {
    id: createSystemDesignId('diagram-revision'),
    xml,
    instruction: 'Initial AI-generated diagram from Layer 1 context.',
    createdAt: createIsoTimestamp(),
  };

  return {
    ok: true,
    graphState: {
      ...runtime.graphState,
      drawioXml: xml,
      diagramSummary: summary,
      diagramRevisions: [...runtime.graphState.diagramRevisions, revision],
      nextAction: 'wait_for_diagram_review',
      updatedAt: createIsoTimestamp(),
    },
    message:
      warnings.length > 0
        ? `Diagram generated with ${warnings.length} repair(s) applied.`
        : 'Diagram generated.',
  };
}

function routeAfterDispatch(runtime: RuntimeState): string {
  if (!runtime.ok) {
    return END;
  }

  if (runtime.event.type === 'submit_answer') {
    return 'update_understanding';
  }

  if (runtime.event.type === 'generate_diagram') {
    return 'generate_diagram';
  }

  return END;
}

const workflow = new StateGraph(RuntimeAnnotation)
  .addNode('dispatch_event', dispatchEventNode)
  .addNode('update_understanding', updateUnderstandingGraphNode)
  .addNode('check_completeness', checkCompletenessGraphNode)
  .addNode('decide_next_action', decideNextActionGraphNode)
  .addNode('generate_diagram', generateDiagramGraphNode)
  .addEdge(START, 'dispatch_event')
  .addConditionalEdges('dispatch_event', routeAfterDispatch)
  .addEdge('update_understanding', 'check_completeness')
  .addEdge('check_completeness', 'decide_next_action')
  .addEdge('decide_next_action', END)
  .addEdge('generate_diagram', END);

const compiledLayer1Graph = workflow.compile();

export async function invokeLayer1Graph(
  event: Layer1GraphEvent,
  existingState?: Layer1GraphState,
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
