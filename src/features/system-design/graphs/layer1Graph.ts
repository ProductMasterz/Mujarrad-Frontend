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
  type DiagramRevision,
  type QuestionAnswer,
  type Task4AiOperation,
  type Task6AiOperation,
} from '../types/layer1.types';
import { checkCompletenessNode } from '../nodes/checkCompletenessNode';
import { generateDiagramNode } from '../nodes/generateDiagramNode';
import { generateFinalDocsNode } from '../nodes/generateFinalDocsNode';
import { generateQuestionNode } from '../nodes/generateQuestionNode';
import { refineDiagramNode } from '../nodes/refineDiagramNode';
import { saveLayer1ToMujarrad } from '../services/saveLayer1ToMujarrad';
import { updateUnderstandingNode } from '../nodes/updateUnderstandingNode';
import { processSystemDesignInput } from '../tools/inputProcessingTool';
import type { AiTokenUsage } from '../tools/aiProviderTool';
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

function appendTask4AiUsage(
  state: Layer1GraphState,
  operation: Task4AiOperation,
  usage: AiTokenUsage | null,
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
  usage: AiTokenUsage | null,
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
    const { question, usage, error } = await generateQuestionNode(state);

    if (error || !question) {
      return {
        ok: false,
        graphState: addGraphError(
          appendTask4AiUsage(
            state,
            'question_generation',
            usage,
          ),
          error ?? 'Failed to generate question.',
          'generate_question',
        ),
        message: error ?? 'Failed to generate question.',
      };
    }

    return {
      ok: true,
      graphState: {
        ...appendTask4AiUsage(
          state,
          'question_generation',
          usage,
        ),
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
    const diagramReadyState =
      state.diagramGenerationContext
        ? state
        : completeLayer1Step(
            {
              ...state,
              diagramGenerationContext:
                buildDiagramGenerationContext(
                  state,
                  'skipped_to_diagram',
                ),
              nextAction: 'generate_diagram',
              updatedAt: createIsoTimestamp(),
            },
            'clarification',
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
        state.diagramGenerationContext
          ? 'Generating diagram from Layer 1 context.'
          : 'Generating diagram from current understanding. Pending clarification questions were kept available.',
    };
  }

  if (event.type === 'refine_diagram') {
    if (!event.refinementInstruction) {
      return {
        ok: false,
        graphState: addGraphError(
          state,
          'Missing diagram refinement instruction.',
          'refine_diagram',
        ),
        message: 'Missing diagram refinement instruction.',
      };
    }

    if (!state.drawioXml) {
      return {
        ok: false,
        graphState: addGraphError(
          state,
          'No Draw.io XML exists to refine.',
          'refine_diagram',
        ),
        message: 'No Draw.io XML exists to refine.',
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
        graphState: addGraphError(
          state,
          'Missing Draw.io XML to sync.',
          'sync_diagram_xml',
        ),
        message: 'Missing Draw.io XML to sync.',
      };
    }

    const revision: DiagramRevision = {
      id: createSystemDesignId('diagram-revision'),
      xml: event.xml,
      mermaidSource:
        state.mermaidSource,
      activeRenderer:
        'drawio',
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
      xml: previousRevision.xml,
      mermaidSource:
        previousRevision.mermaidSource ??
        state.mermaidSource,
      activeRenderer:
        previousRevision.activeRenderer ??
        state.activeDiagramRenderer,
      instruction: 'Undo to previous diagram revision.',
      createdAt: createIsoTimestamp(),
    };

    return {
      ok: true,
      graphState: {
        ...state,
        drawioXml:
          previousRevision.xml,
        mermaidSource:
          previousRevision.mermaidSource ??
          state.mermaidSource,
        activeDiagramRenderer:
          previousRevision.activeRenderer ??
          state.activeDiagramRenderer,
        selectedDiagramRenderer:
          null,
        diagramApproved:
          false,
        diagramRevisions: [
          ...state.diagramRevisions,
          undoRevision,
        ],
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
          'reset_diagram_revision',
        ),
        message: 'No original generated diagram revision exists.',
      };
    }

    const resetRevision: DiagramRevision = {
      id: createSystemDesignId('diagram-revision'),
      xml: originalRevision.xml,
      mermaidSource:
        originalRevision.mermaidSource ??
        state.mermaidSource,
      activeRenderer:
        originalRevision.activeRenderer ??
        'drawio',
      instruction: 'Reset to original generated diagram.',
      createdAt: createIsoTimestamp(),
    };

    return {
      ok: true,
      graphState: {
        ...state,
        drawioXml:
          originalRevision.xml,
        mermaidSource:
          originalRevision.mermaidSource ??
          state.mermaidSource,
        activeDiagramRenderer:
          originalRevision.activeRenderer ??
          'drawio',
        selectedDiagramRenderer:
          null,
        diagramApproved:
          false,
        diagramRevisions: [
          ...state.diagramRevisions,
          resetRevision,
        ],
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
        drawioXml:
          event.xml ??
          state.drawioXml,

        mermaidSource:
          event.mermaidSource ??
          state.mermaidSource,

        activeDiagramRenderer:
          event.diagramRenderer ??
          state.activeDiagramRenderer,

        selectedDiagramRenderer:
          event.diagramRenderer ??
          state.activeDiagramRenderer,

        diagramImages:
          event.diagramImages ??
          state.diagramImages,

        diagramApproved:
          true,
        mujarradSave: {
          status: 'idle',
        },
        nextAction: 'save_layer1_to_mujarrad',
        updatedAt: createIsoTimestamp(),
      },
      'diagram',
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
        `${event.diagramRenderer === 'mermaid' ? 'Mermaid' : 'Draw.io'} diagram approved. Save Layer 1 to Mujarrad or skip to final artifact generation.`,
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
          'save_layer1_to_mujarrad',
        ),
        message: 'Missing Mujarrad save destination.',
      };
    }

    const result = await saveLayer1ToMujarrad(
      state,
      event.mujarradDestination,
    );

    if (!result.ok) {
      return {
        ok: false,
        graphState: addGraphWarning(
          {
            ...state,
            mujarradSave: {
              status: 'error',
              destination: event.mujarradDestination,
              error:
                result.error ??
                'Mujarrad backend save failed.',
            },
          },
          result.error ??
            'Mujarrad backend save failed.',
          'save_layer1_to_mujarrad',
          'save_layer1_to_mujarrad',
        ),
        message:
          result.error ??
          'Mujarrad backend save failed.',
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
      'save_to_mujarrad',
    );

    return {
      ok: true,
      graphState: {
        ...completedState,
        activeStep: 'final_artifacts',
        nextAction: 'generate_final_docs',
        updatedAt: createIsoTimestamp(),
      },
      message:
        'Mujarrad save skipped. Final artifact generation is available.',
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
        graphState: addGraphError(
          state,
          'Missing answer or current question.',
          'submit_answer',
        ),
        message: 'Missing answer or current question.',
      };
    }

    const answer: QuestionAnswer = {
      id: createSystemDesignId('answer'),
      questionId: state.currentQuestion.id,
      answer: event.answer,
      createdAt: createIsoTimestamp(),
    };

    return {
      ok: true,
      graphState: {
        ...state,
        qaHistory: [...state.qaHistory, answer],
        currentQuestion: {
          ...state.currentQuestion,
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
  if (
    !runtime.ok ||
    (
      runtime.event.type !== 'submit_input' &&
      runtime.event.type !== 'submit_answer'
    )
  ) {
    return {};
  }

  const { understanding, usage, error } =
    await updateUnderstandingNode(runtime.graphState);

  if (error) {
    return {
      ok: false,

      graphState:
        addGraphWarning(
          appendTask4AiUsage(
            runtime.graphState,
            'understanding_update',
            usage,
          ),
          error,
          'update_understanding',
          'update_understanding',
        ),

      skipCompleteness:
        true,

      message:
        `System understanding update failed: ${error}`,
    };
  }

  return {
    ok: true,
    graphState: {
      ...appendTask4AiUsage(
        runtime.graphState,
        'understanding_update',
        usage,
      ),
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
  if (
    !runtime.ok ||
    (
      runtime.event.type !== 'submit_input' &&
      runtime.event.type !== 'submit_answer'
    ) ||
    runtime.skipCompleteness
  ) {
    return {};
  }

  const { completeness, usage, error } =
    await checkCompletenessNode(runtime.graphState);

  if (!completeness) {
    return {
      ok: true,
      graphState: addGraphWarning(
        appendTask4AiUsage(
          runtime.graphState,
          'completeness_check',
          usage,
        ),
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
      ...appendTask4AiUsage(
        runtime.graphState,
        'completeness_check',
        usage,
      ),
      completeness,
      nextAction: 'check_completeness',
      updatedAt: createIsoTimestamp(),
    },
    message:
      error
        ? `Readiness calculated deterministically. Advisory completeness analysis was unavailable: ${error}`
        : 'Completeness checked.',
  };
}

async function decideNextActionGraphNode(
  runtime: RuntimeState,
): Promise<Partial<RuntimeState>> {
  if (
    !runtime.ok ||
    (
      runtime.event.type !== 'submit_input' &&
      runtime.event.type !== 'submit_answer'
    )
  ) {
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
      message:
        'Initial system understanding and clarification readiness calculated.',
    };
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

  const {
    xml,
    mermaidSource,
    summary,
    warnings,
    error,
  } = await generateDiagramNode(
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
    mermaidSource,
    activeRenderer:
      runtime.graphState.activeDiagramRenderer,
    instruction: 'Initial AI-generated diagram from Layer 1 context.',
    createdAt: createIsoTimestamp(),
  };

  return {
    ok: true,
    graphState: {
      ...runtime.graphState,
      drawioXml: xml,
      mermaidSource,
      activeDiagramRenderer:
        runtime.graphState.activeDiagramRenderer ??
        'drawio',
      selectedDiagramRenderer:
        null,
      diagramApproved:
        false,
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


async function refineDiagramGraphNode(
  runtime: RuntimeState,
): Promise<Partial<RuntimeState>> {
  if (!runtime.ok || runtime.event.type !== 'refine_diagram') {
    return {};
  }

  const instruction = runtime.event.refinementInstruction ?? '';

  const {
    xml,
    mermaidSource,
    summary,
    warnings,
    usageRecords,
    error,
  } = await refineDiagramNode(
    runtime.graphState,
    instruction,
  );

  const stateWithUsage =
    usageRecords.reduce(
      (currentState, record) =>
        appendTask6AiUsage(
          currentState,
          record.operation,
          record.usage,
        ),
      runtime.graphState,
    );

  if (error || !xml) {
    return {
      ok: false,
      graphState: addGraphWarning(
        stateWithUsage,
        error ?? 'Diagram refinement failed.',
        'refine_diagram',
        'wait_for_diagram_approval',
      ),
      message: error ?? 'Diagram refinement failed.',
    };
  }

  const revision: DiagramRevision = {
    id: createSystemDesignId('diagram-revision'),
    xml,
    mermaidSource,
    activeRenderer:
      stateWithUsage.activeDiagramRenderer,
    instruction,
    createdAt: createIsoTimestamp(),
  };

  return {
    ok: true,
    graphState: {
      ...stateWithUsage,
      drawioXml:
        stateWithUsage.activeDiagramRenderer ===
        'drawio'
          ? xml
          : stateWithUsage.drawioXml,

      mermaidSource:
        stateWithUsage.activeDiagramRenderer ===
        'mermaid'
          ? (
              mermaidSource ||
              stateWithUsage.mermaidSource
            )
          : stateWithUsage.mermaidSource,

      selectedDiagramRenderer:
        null,

      diagramApproved:
        false,
      diagramSummary:
        summary ||
        stateWithUsage.diagramSummary,
      diagramRevisions: [
        ...stateWithUsage.diagramRevisions,
        revision,
      ],
      nextAction: 'wait_for_diagram_approval',
      updatedAt: createIsoTimestamp(),
    },
    message:
      warnings.length > 0
        ? `Diagram refined with ${warnings.length} repair(s) applied.`
        : 'Diagram refined.',
  };
}

async function generateFinalDocsGraphNode(
  runtime: RuntimeState,
): Promise<Partial<RuntimeState>> {
  if (
    !runtime.ok ||
    runtime.event.type !== 'generate_final_docs'
  ) {
    return {};
  }

  const { bundle, error } = await generateFinalDocsNode(
    runtime.graphState,
  );

  if (error || !bundle) {
    return {
      ok: false,
      graphState: addGraphWarning(
        runtime.graphState,
        error ?? 'Final documentation generation failed.',
        'generate_final_docs',
        'generate_final_docs',
      ),
      message:
        error ?? 'Final documentation generation failed.',
    };
  }

  return {
    ok: true,
    graphState: {
      ...runtime.graphState,
      stage: 'export',
      activeStep: 'preview_artifacts',
      completedSteps: Array.from(
        new Set([
          ...runtime.graphState.completedSteps,
          'final_artifacts',
        ]),
      ),
      availableSteps: Array.from(
        new Set([
          ...runtime.graphState.availableSteps,
          'preview_artifacts',
        ]),
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

  if (
    runtime.event.type === 'submit_input' ||
    runtime.event.type === 'submit_answer'
  ) {
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
