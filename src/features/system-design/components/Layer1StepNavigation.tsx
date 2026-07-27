'use client';

import type { Layer1StepId } from '../types/layer1.types';

const laterSteps: {
  id: Layer1StepId;
  label: string;
}[] = [
  { id: 'diagram', label: 'Diagram' },
  { id: 'save_to_mujarrad', label: 'Save to Mujarrad' },
  { id: 'final_artifacts', label: 'Generate Files' },
  { id: 'preview_artifacts', label: 'Preview Files' },
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
  const isDefinitionActive =
    activeStep === 'input' || activeStep === 'clarification';

  const isDefinitionCompleted =
    completedSteps.includes('input') &&
    completedSteps.includes('clarification');

  const definitionTarget: Layer1StepId =
    availableSteps.includes('clarification')
      ? 'clarification'
      : 'input';

  const isDefinitionAvailable =
    availableSteps.includes('input') ||
    availableSteps.includes('clarification');

  return (
    <nav className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/70">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        <button
          type="button"
          disabled={!isDefinitionAvailable}
          onClick={() => onStepChange(definitionTarget)}
          className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
            isDefinitionActive
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
              : isDefinitionCompleted
                ? 'bg-emerald-50 text-emerald-700'
                : isDefinitionAvailable
                  ? 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-50 text-slate-300'
          }`}
        >
          Define System
        </button>

        {laterSteps.map((step) => {
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
