import type { Layer1GraphState } from '../types/graph.types';
import {
  createEmptySystemUnderstanding,
  type Layer1Stage,
  type Layer1StepId,
} from '../types/layer1.types';
import { createIsoTimestamp, createSystemDesignId } from '../utils/id';

export const layer1StepOrder: Layer1StepId[] = [
  'input',
  'clarification',
  'specification',
  'diagram',
  'review',
  'export',
];

export function getNextLayer1Step(
  stepId: Layer1StepId,
): Layer1StepId | null {
  const currentIndex = layer1StepOrder.indexOf(stepId);
  return layer1StepOrder[currentIndex + 1] ?? null;
}

export function getStageForStep(stepId: Layer1StepId): Layer1Stage {
  const stageByStep: Record<Layer1StepId, Layer1Stage> = {
    input: 'input',
    clarification: 'clarification',
    specification: 'specification',
    diagram: 'diagram',
    review: 'diagram_review',
    export: 'export',
  };

  return stageByStep[stepId];
}

export function getAvailableSteps(
  completedSteps: Layer1StepId[],
): Layer1StepId[] {
  const available = new Set<Layer1StepId>(['input']);

  completedSteps.forEach((stepId) => {
    available.add(stepId);

    const nextStep = getNextLayer1Step(stepId);

    if (nextStep) {
      available.add(nextStep);
    }
  });

  return layer1StepOrder.filter((stepId) => available.has(stepId));
}

export function createInitialLayer1GraphState(): Layer1GraphState {
  const now = createIsoTimestamp();

  return {
    id: createSystemDesignId('layer1-run'),
    runId: createSystemDesignId('layer1-run'),
    createdAt: now,
    updatedAt: now,
    stage: 'input',

    activeStep: 'input',
    completedSteps: [],
    availableSteps: ['input'],

    rawInputs: [],
    processedInput: null,

    currentQuestion: null,
    questions: [],
    qaHistory: [],

    understanding: createEmptySystemUnderstanding(),
    completeness: null,

    markdownSpec: '',
    markdownApproved: false,

    drawioXml: '',
    diagramImage: undefined,
    diagramSummary: '',
    diagramApproved: false,
    diagramRevisions: [],

    errors: [],
    nextAction: 'process_input',
  };
}

export function completeLayer1Step(
  state: Layer1GraphState,
  stepId: Layer1StepId,
): Layer1GraphState {
  const completedSteps = state.completedSteps.includes(stepId)
    ? state.completedSteps
    : [...state.completedSteps, stepId];

  const nextStep = getNextLayer1Step(stepId);
  const activeStep = nextStep ?? stepId;
  const availableSteps = getAvailableSteps(completedSteps);

  return {
    ...state,
    stage: getStageForStep(activeStep),
    activeStep,
    completedSteps,
    availableSteps,
    updatedAt: createIsoTimestamp(),
  };
}
