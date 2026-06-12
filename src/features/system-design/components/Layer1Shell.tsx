'use client';

import { Layer1InputPanel } from './Layer1InputPanel';
import { Layer1StepNavigation } from './Layer1StepNavigation';
import { useLayer1Store } from '../stores/useLayer1Store';
import type { Layer1StepId } from '../types/layer1.types';

const stepMessages: Record<
  Exclude<Layer1StepId, 'input'>,
  {
    title: string;
    task: string;
  }
> = {
  clarification: {
    title: 'Clarification',
    task: 'Task 4',
  },
  specification: {
    title: 'Specification',
    task: 'Task 6',
  },
  diagram: {
    title: 'Diagram',
    task: 'Task 7',
  },
  review: {
    title: 'Review',
    task: 'Task 7',
  },
  export: {
    title: 'Export',
    task: 'Task 8',
  },
};

async function postLayer1Event(
  event: {
    type: 'complete_step';
    stepId: Layer1StepId;
  },
  graphState: ReturnType<typeof useLayer1Store.getState>['graphState'],
) {
  const response = await fetch('/api/system-builder/layer1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event,
      state: graphState,
    }),
  });

  return (await response.json()) as {
    ok: boolean;
    state?: typeof graphState;
    message?: string;
    error?: string;
  };
}

export function Layer1Shell() {
  const graphState = useLayer1Store((state) => state.graphState);
  const syncFromGraphState = useLayer1Store(
    (state) => state.syncFromGraphState,
  );

  const activeStep = graphState.activeStep;
  const completedSteps = graphState.completedSteps;
  const availableSteps = graphState.availableSteps;

  async function handleStepChange(stepId: Layer1StepId) {
    if (!availableSteps.includes(stepId)) {
      return;
    }

    syncFromGraphState({
      ...graphState,
      activeStep: stepId,
    });
  }

  async function handleCompleteStep(stepId: Layer1StepId) {
    const result = await postLayer1Event(
      {
        type: 'complete_step',
        stepId,
      },
      graphState,
    );

    if (result.ok && result.state) {
      syncFromGraphState(result.state);
    }
  }

  return (
    <div className="space-y-6">
      <Layer1StepNavigation
        activeStep={activeStep}
        completedSteps={completedSteps}
        availableSteps={availableSteps}
        onStepChange={handleStepChange}
      />

      {activeStep === 'input' ? (
        <Layer1InputPanel />
      ) : (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                {stepMessages[activeStep].task}
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                {stepMessages[activeStep].title}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => void handleCompleteStep(activeStep)}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Proceed
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-medium text-slate-600">
            This step will be implemented in {stepMessages[activeStep].task}.
          </div>
        </section>
      )}
    </div>
  );
}