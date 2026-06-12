import type {
  Layer1GraphEvent,
  Layer1GraphResult,
  Layer1GraphState,
} from '../types/graph.types';
import { processSystemDesignInput } from '../tools/inputProcessingTool';
import { createIsoTimestamp, createSystemDesignId } from '../utils/id';
import {
  completeLayer1Step,
  createInitialLayer1GraphState,
} from './layer1GraphState';

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

export async function runLayer1GraphEvent(
  event: Layer1GraphEvent,
  existingState?: Layer1GraphState,
): Promise<Layer1GraphResult> {
  const state = existingState ?? createInitialLayer1GraphState();

  if (event.type === 'start_run') {
    return {
      ok: true,
      state,
      message: 'Layer 1 run initialized.',
    };
  }

  if (event.type === 'reset_run') {
    return {
      ok: true,
      state: createInitialLayer1GraphState(),
      message: 'Layer 1 run reset.',
    };
  }

  if (event.type === 'submit_input') {
    if (!event.rawInput) {
      return {
        ok: false,
        state: addGraphError(state, 'Missing raw input.', 'layer1GraphRunner'),
        message: 'Missing raw input.',
      };
    }

    const processingResult = processSystemDesignInput(event.rawInput);

    if (!processingResult.processedInput) {
      return {
        ok: false,
        state: {
          ...addGraphError(
            state,
            processingResult.errors[0] ?? 'Input processing failed.',
            'process_input',
          ),
          rawInputs: [...state.rawInputs, event.rawInput],
        },
        processingResult,
        message: processingResult.errors[0] ?? 'Input processing failed.',
      };
    }

    const completedState = completeLayer1Step(
      {
        ...state,
        rawInputs: [...state.rawInputs, event.rawInput],
        processedInput: processingResult.processedInput,
        stage: 'clarification',
        nextAction: 'ask_question',
        updatedAt: createIsoTimestamp(),
      },
      'input',
    );

    return {
      ok: true,
      state: {
        ...completedState,
        nextAction: 'ask_question',
      },
      processingResult,
      message: 'Input processed. Clarification is available.',
    };
  }

  if (event.type === 'complete_step') {
    if (!event.stepId) {
      return {
        ok: false,
        state: addGraphError(state, 'Missing step id.', 'complete_step'),
        message: 'Missing step id.',
      };
    }

    return {
      ok: true,
      state: completeLayer1Step(state, event.stepId),
      message: `${event.stepId} completed.`,
    };
  }

  return {
    ok: true,
    state,
    message: 'State synchronized.',
  };
}
