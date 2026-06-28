'use client';

import { useEffect } from 'react';

import { Layer1DiagramStep } from './Layer1DiagramStep';
import { Layer1GraphViewer } from './Layer1GraphViewer';
import { Layer1InputPanel } from './Layer1InputPanel';
import { Layer1QuestionLoop } from './Layer1QuestionLoop';
import { Layer1StepNavigation } from './Layer1StepNavigation';
import { useLayer1Store } from '../stores/useLayer1Store';
import type { Layer1StepId } from '../types/layer1.types';

const stepMessages: Record<
  Exclude<Layer1StepId, 'input' | 'clarification'>,
  {
    title: string;
    task: string;
  }
> = {
  diagram: {
    title: 'Diagram',
    task: 'Task 5',
  },
  review: {
    title: 'Diagram Review',
    task: 'Task 6',
  },
  final_docs: {
    title: 'Final Documentation',
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
  const hasHydrated = useLayer1Store((state) => state.hasHydrated);
  const syncFromGraphState = useLayer1Store(
    (state) => state.syncFromGraphState,
  );

  useEffect(() => {
    void useLayer1Store.persist.rehydrate();
  }, []);

  const activeStep = graphState.activeStep;
  const completedSteps = graphState.completedSteps;
  const availableSteps = graphState.availableSteps;

  if (!hasHydrated) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/70">
        <div className="text-lg font-black text-slate-950">
          Loading saved Layer 1 run...
        </div>
        <div className="mt-2 text-sm font-medium text-slate-500">
          Restoring local System Builder state.
        </div>
      </div>
    );
  }

  function handleStepChange(stepId: Layer1StepId) {
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
      <div className="flex justify-end">
        <Layer1GraphViewer graphState={graphState} />
      </div>

      <Layer1StepNavigation
        activeStep={activeStep}
        completedSteps={completedSteps}
        availableSteps={availableSteps}
        onStepChange={handleStepChange}
      />

      {activeStep === 'input' ? (
        <Layer1InputPanel />
      ) : activeStep === 'clarification' ? (
        <Layer1QuestionLoop />
      ) : activeStep === 'diagram' ? (
        <Layer1DiagramStep />
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
