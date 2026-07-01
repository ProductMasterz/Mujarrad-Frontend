import { describe, expect, it } from '@jest/globals';

import {
  completeLayer1Step,
  createInitialLayer1GraphState,
  getAvailableSteps,
  getNextLayer1Step,
  getStageForStep,
  layer1StepOrder,
} from '../layer1GraphState';
import type { Layer1StepId } from '../../types/layer1.types';

describe('layer1StepOrder', () => {
  it('defines the canonical Layer 1 step sequence', () => {
    expect(layer1StepOrder).toEqual([
      'input',
      'clarification',
      'specification',
      'diagram',
      'review',
      'export',
    ]);
  });
});

describe('getNextLayer1Step', () => {
  it('returns the following step for each step in the sequence', () => {
    expect(getNextLayer1Step('input')).toBe('clarification');
    expect(getNextLayer1Step('clarification')).toBe('specification');
    expect(getNextLayer1Step('specification')).toBe('diagram');
    expect(getNextLayer1Step('diagram')).toBe('review');
    expect(getNextLayer1Step('review')).toBe('export');
  });

  it('returns null after the last step', () => {
    expect(getNextLayer1Step('export')).toBeNull();
  });
});

describe('getStageForStep', () => {
  it('maps each step id to its corresponding stage', () => {
    expect(getStageForStep('input')).toBe('input');
    expect(getStageForStep('clarification')).toBe('clarification');
    expect(getStageForStep('specification')).toBe('specification');
    expect(getStageForStep('diagram')).toBe('diagram');
    expect(getStageForStep('review')).toBe('diagram_review');
    expect(getStageForStep('export')).toBe('export');
  });
});

describe('getAvailableSteps', () => {
  it('always includes the input step, even with no completed steps', () => {
    expect(getAvailableSteps([])).toEqual(['input']);
  });

  it('unlocks the next step after a step is completed', () => {
    expect(getAvailableSteps(['input'])).toEqual(['input', 'clarification']);
  });

  it('unlocks every completed step plus the next available step', () => {
    const available = getAvailableSteps(['input', 'clarification', 'specification']);
    expect(available).toEqual(['input', 'clarification', 'specification', 'diagram']);
  });

  it('does not unlock a step beyond export', () => {
    const available = getAvailableSteps(layer1StepOrder as Layer1StepId[]);
    expect(available).toEqual(layer1StepOrder);
  });

  it('preserves the canonical step order regardless of input order', () => {
    const available = getAvailableSteps(['specification', 'input']);
    expect(available).toEqual(['input', 'clarification', 'specification', 'diagram']);
  });
});

describe('createInitialLayer1GraphState', () => {
  it('starts on the input step with no completed steps', () => {
    const state = createInitialLayer1GraphState();

    expect(state.activeStep).toBe('input');
    expect(state.completedSteps).toEqual([]);
    expect(state.availableSteps).toEqual(['input']);
    expect(state.stage).toBe('input');
    expect(state.nextAction).toBe('process_input');
  });

  it('starts with empty collections and no approved artifacts', () => {
    const state = createInitialLayer1GraphState();

    expect(state.rawInputs).toEqual([]);
    expect(state.questions).toEqual([]);
    expect(state.qaHistory).toEqual([]);
    expect(state.diagramRevisions).toEqual([]);
    expect(state.errors).toEqual([]);
    expect(state.approvedLayer1Artifacts).toBeUndefined();
  });

  it('generates unique run ids across calls', () => {
    const first = createInitialLayer1GraphState();
    const second = createInitialLayer1GraphState();

    expect(first.runId).not.toBe(second.runId);
  });
});

describe('completeLayer1Step', () => {
  it('marks the step as completed and advances the active step', () => {
    const initial = createInitialLayer1GraphState();
    const next = completeLayer1Step(initial, 'input');

    expect(next.completedSteps).toEqual(['input']);
    expect(next.activeStep).toBe('clarification');
    expect(next.stage).toBe('clarification');
    expect(next.availableSteps).toEqual(['input', 'clarification']);
  });

  it('does not duplicate a step id that is completed twice', () => {
    const initial = createInitialLayer1GraphState();
    const first = completeLayer1Step(initial, 'input');
    const second = completeLayer1Step(first, 'input');

    expect(second.completedSteps).toEqual(['input']);
  });

  it('stays on the final step when completing export', () => {
    const initial = createInitialLayer1GraphState();
    const finalState = completeLayer1Step(initial, 'export');

    expect(finalState.activeStep).toBe('export');
    expect(finalState.completedSteps).toContain('export');
  });

  it('updates the updatedAt timestamp', () => {
    const initial = createInitialLayer1GraphState();
    const next = completeLayer1Step(initial, 'input');

    expect(next.updatedAt).toEqual(expect.any(String));
  });
});
