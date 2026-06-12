'use client';

import { useMemo, useState } from 'react';

import { Layer1InputPanel } from './Layer1InputPanel';
import {
  Layer1StepId,
  Layer1StepNavigation,
} from './Layer1StepNavigation';

const stepOrder: Layer1StepId[] = [
  'input',
  'clarification',
  'specification',
  'diagram',
  'review',
  'export',
];

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

function getNextStep(stepId: Layer1StepId): Layer1StepId | null {
  const currentIndex = stepOrder.indexOf(stepId);
  return stepOrder[currentIndex + 1] ?? null;
}

export function Layer1Shell() {
  const [activeStep, setActiveStep] = useState<Layer1StepId>('input');
  const [completedSteps, setCompletedSteps] = useState<Layer1StepId[]>([]);

  const availableSteps = useMemo(() => {
    const available = new Set<Layer1StepId>(['input']);

    completedSteps.forEach((stepId) => {
      available.add(stepId);

      const nextStep = getNextStep(stepId);
      if (nextStep) {
        available.add(nextStep);
      }
    });

    return stepOrder.filter((stepId) => available.has(stepId));
  }, [completedSteps]);

  function completeStep(stepId: Layer1StepId) {
    setCompletedSteps((currentSteps) => {
      if (currentSteps.includes(stepId)) {
        return currentSteps;
      }

      return [...currentSteps, stepId];
    });

    const nextStep = getNextStep(stepId);

    if (nextStep) {
      setActiveStep(nextStep);
    }
  }

  function handleStepChange(stepId: Layer1StepId) {
    if (!availableSteps.includes(stepId)) {
      return;
    }

    setActiveStep(stepId);
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
        <Layer1InputPanel onProceed={() => completeStep('input')} />
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
              onClick={() => completeStep(activeStep)}
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