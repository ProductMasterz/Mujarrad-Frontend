import type { Task6AiUsageRecord } from '../types/layer1.types';

interface Task6AiUsagePanelProps {
  calls: Task6AiUsageRecord[];
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function Task6AiUsagePanel({
  calls,
}: Task6AiUsagePanelProps) {
  const totals = calls.reduce(
    (result, call) => ({
      promptTokens: result.promptTokens + call.promptTokens,
      completionTokens:
        result.completionTokens + call.completionTokens,
      totalTokens: result.totalTokens + call.totalTokens,
    }),
    {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    },
  );

  const lastCall = calls[calls.length - 1];

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Task 6 AI Usage
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            Provider-reported refinement token usage only.
          </p>
        </div>

        <div className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600">
          {calls.length}{' '}
          {calls.length === 1 ? 'refinement' : 'refinements'}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-white p-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Input
          </div>
          <div className="mt-1 text-sm font-bold text-slate-900">
            {formatNumber(totals.promptTokens)}
          </div>
        </div>

        <div className="rounded-lg bg-white p-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Output
          </div>
          <div className="mt-1 text-sm font-bold text-slate-900">
            {formatNumber(totals.completionTokens)}
          </div>
        </div>

        <div className="rounded-lg bg-white p-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Total
          </div>
          <div className="mt-1 text-sm font-bold text-slate-900">
            {formatNumber(totals.totalTokens)}
          </div>
        </div>
      </div>

      {lastCall ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-bold text-slate-700">
            Last refinement details
          </summary>

          <div className="mt-3 space-y-2 rounded-lg bg-white p-3 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Input</span>
              <span className="font-semibold text-slate-800">
                {formatNumber(lastCall.promptTokens)}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Output</span>
              <span className="font-semibold text-slate-800">
                {formatNumber(lastCall.completionTokens)}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Total</span>
              <span className="font-semibold text-slate-800">
                {formatNumber(lastCall.totalTokens)}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-2">
              <div className="text-slate-500">Provider</div>
              <div className="mt-0.5 break-all font-semibold text-slate-800">
                {lastCall.provider}
              </div>
            </div>

            <div>
              <div className="text-slate-500">Model</div>
              <div className="mt-0.5 break-all font-semibold text-slate-800">
                {lastCall.model}
              </div>
            </div>
          </div>
        </details>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          Usage will appear after the first AI refinement.
        </p>
      )}
    </div>
  );
}
