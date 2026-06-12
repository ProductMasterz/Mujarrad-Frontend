'use client';

export type Layer1StepId =
  | 'input'
  | 'clarification'
  | 'specification'
  | 'diagram'
  | 'review'
  | 'export';

interface Layer1Step {
  id: Layer1StepId;
  label: string;
}

interface Layer1StepNavigationProps {
  activeStep: Layer1StepId;
  completedSteps: Layer1StepId[];
  availableSteps: Layer1StepId[];
  onStepChange: (stepId: Layer1StepId) => void;
}

const steps: Layer1Step[] = [
  { id: 'input', label: 'Input' },
  { id: 'clarification', label: 'Clarify' },
  { id: 'specification', label: 'Spec' },
  { id: 'diagram', label: 'Diagram' },
  { id: 'review', label: 'Review' },
  { id: 'export', label: 'Export' },
];

export function Layer1StepNavigation({
  activeStep,
  completedSteps,
  availableSteps,
  onStepChange,
}: Layer1StepNavigationProps) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/90 p-3 shadow-md shadow-slate-200/60 backdrop-blur">
      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const isSelected = activeStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const isAvailable = availableSteps.includes(step.id);

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isAvailable}
              onClick={() => onStepChange(step.id)}
              className={[
                'flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-black transition',
                isSelected
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : isAvailable
                    ? 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50'
                    : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300',
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                  isSelected
                    ? 'bg-white text-slate-950'
                    : isCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : isAvailable
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-300',
                ].join(' ')}
              >
                {isCompleted ? '✓' : index + 1}
              </span>

              {step.label}

              <span
                className={[
                  'rounded-full px-2 py-0.5 text-[10px] uppercase',
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-700'
                    : isSelected
                      ? 'bg-white/15 text-white'
                      : isAvailable
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-400',
                ].join(' ')}
              >
                {isCompleted ? 'Done' : isAvailable ? 'Open' : 'Locked'}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}