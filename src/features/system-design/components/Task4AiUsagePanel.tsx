import type { AiUsageRecord } from '../types/layer1.types';

interface Task4AiUsagePanelProps {
  calls: AiUsageRecord[];
}

const operationLabels: Record<AiUsageRecord['operation'], string> = {
  question_generation: 'Question generation',
  understanding_update: 'Understanding update',
  completeness_check: 'Completeness check',
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function Task4AiUsagePanel({
  calls,
}: Task4AiUsagePanelProps) {
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

  const operationTotals = calls.reduce<
    Record<
      AiUsageRecord['operation'],
      {
        calls: number;
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      }
    >
  >(
    (result, call) => {
      const current = result[call.operation];

      result[call.operation] = {
        calls: current.calls + 1,
        promptTokens: current.promptTokens + call.promptTokens,
        completionTokens:
          current.completionTokens + call.completionTokens,
        totalTokens: current.totalTokens + call.totalTokens,
      };

      return result;
    },
    {
      question_generation: {
        calls: 0,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
      understanding_update: {
        calls: 0,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
      completeness_check: {
        calls: 0,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    },
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900">
            Task 4 AI Usage
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Provider-reported token usage for clarification only.
          </p>
        </div>

        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {calls.length} {calls.length === 1 ? 'call' : 'calls'}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Input
          </div>
          <div className="mt-1 text-lg font-bold text-slate-900">
            {formatNumber(totals.promptTokens)}
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Output
          </div>
          <div className="mt-1 text-lg font-bold text-slate-900">
            {formatNumber(totals.completionTokens)}
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Total
          </div>
          <div className="mt-1 text-lg font-bold text-slate-900">
            {formatNumber(totals.totalTokens)}
          </div>
        </div>
      </div>

      {calls.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-700">
            Usage breakdown
          </summary>

          <div className="mt-3 space-y-3">
            {(
              Object.keys(operationTotals) as Array<
                AiUsageRecord['operation']
              >
            ).map((operation) => {
              const usage = operationTotals[operation];

              return (
                <div
                  key={operation}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-800">
                      {operationLabels[operation]}
                    </span>

                    <span className="text-xs text-slate-500">
                      {usage.calls}{' '}
                      {usage.calls === 1 ? 'call' : 'calls'}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="block text-slate-400">
                        Input
                      </span>
                      <span className="font-semibold">
                        {formatNumber(usage.promptTokens)}
                      </span>
                    </div>

                    <div>
                      <span className="block text-slate-400">
                        Output
                      </span>
                      <span className="font-semibold">
                        {formatNumber(usage.completionTokens)}
                      </span>
                    </div>

                    <div>
                      <span className="block text-slate-400">
                        Total
                      </span>
                      <span className="font-semibold">
                        {formatNumber(usage.totalTokens)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      )}

      {calls.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">
          Usage will appear after the first Task 4 AI call.
        </p>
      )}
    </div>
  );
}
