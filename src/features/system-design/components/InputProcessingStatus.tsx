import type {
  InputProcessingStatus as InputProcessingStatusValue,
  InputProcessingWarning,
} from '../types/input.types';

interface InputProcessingStatusProps {
  status: InputProcessingStatusValue;
  warnings: InputProcessingWarning[];
  errors?: string[];
}

const statusLabels: Record<InputProcessingStatusValue, string> = {
  idle: 'Waiting for input',
  normalizing: 'Normalizing input',
  chunking: 'Chunking input',
  compressing: 'Preparing context summary',
  ready: 'Input ready',
  failed: 'Input needs attention',
};

export function InputProcessingStatus({
  status,
  warnings,
  errors = [],
}: InputProcessingStatusProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Input Processing
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {statusLabels[status]}
          </p>
        </div>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
          {status}
        </span>
      </div>

      {warnings.length > 0 ? (
        <div className="mt-4 space-y-2">
          {warnings.map((warning) => (
            <p
              key={`${warning.code}-${warning.message}`}
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800"
            >
              {warning.message}
            </p>
          ))}
        </div>
      ) : null}

      {errors.length > 0 ? (
        <div className="mt-4 space-y-2">
          {errors.map((error) => (
            <p
              key={error}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700"
            >
              {error}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
