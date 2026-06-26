'use client';

import type { Layer1StepId } from '../types/layer1.types';

const steps: {
  id: Layer1StepId;
  label: string;
}[] = [
  { id: 'input', label: 'Input' },
  { id: 'clarification', label: 'Clarify' },
  { id: 'diagram', label: 'Diagram' },
  { id: 'review', label: 'Review' },
  { id: 'final_docs', label: 'Final Docs' },
  { id: 'export', label: 'Export' },
];

interface Layer1StepNavigationProps {
  activeStep: Layer1StepId;
  completedSteps: Layer1StepId[];
  availableSteps: Layer1StepId[];
  onStepChange: (stepId: Layer1StepId) => void;
}

export function Layer1StepNavigation({
  activeStep,
  completedSteps,
  availableSteps,
  onStepChange,
}: Layer1StepNavigationProps) {
  return (
    <nav className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/70">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
        {steps.map((step) => {
          const isActive = activeStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const isAvailable = availableSteps.includes(step.id);

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isAvailable}
              onClick={() => onStepChange(step.id)}
              className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : isCompleted
                    ? 'bg-emerald-50 text-emerald-700'
                    : isAvailable
                      ? 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-50 text-slate-300'
              }`}
            >
              {step.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
