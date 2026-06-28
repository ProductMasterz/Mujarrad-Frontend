'use client';

import { useEffect, useState } from 'react';

import type { CompletenessReport } from '../types/layer1.types';

/**
 * At-a-glance clarification progress.
 *
 * The number of clarification questions is intentionally open-ended (it adapts
 * to the input), so instead of a fixed "question N of M" we show readiness:
 * a progress bar driven by the completeness score, a short orientation on what
 * is still unclear, and a clear signal once the design is diagram-ready.
 *
 * The displayed score is clamped to be non-decreasing within a session so the
 * bar never visibly jumps backwards if the AI re-scores slightly lower.
 */
export function Layer1ReadinessHeader({
  report,
}: {
  report: CompletenessReport | null;
}) {
  const [displayScore, setDisplayScore] = useState(report?.overallScore ?? 0);

  useEffect(() => {
    if (!report) {
      setDisplayScore(0);
      return;
    }

    setDisplayScore((prev) => Math.max(prev, report.overallScore));
  }, [report]);

  const ready = Boolean(report?.readyForDiagram);
  const missing = report?.missingCriticalItems ?? [];
  const topMissing = missing.slice(0, 3);

  const statusLabel = ready
    ? 'Enough detail to generate a diagram'
    : displayScore > 0
      ? 'Building understanding — keep going'
      : 'Just getting started';

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition ${
        ready
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Clarification readiness
          </p>
          <p
            className={`mt-1 text-sm font-bold ${
              ready ? 'text-emerald-700' : 'text-slate-700'
            }`}
          >
            {statusLabel}
          </p>
        </div>

        <div className="flex items-baseline gap-1">
          <span
            className={`text-3xl font-black ${
              ready ? 'text-emerald-600' : 'text-blue-600'
            }`}
          >
            {displayScore}
          </span>
          <span className="text-sm font-medium text-slate-400">%</span>
        </div>
      </div>

      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            ready ? 'bg-emerald-500' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, displayScore))}%` }}
        />
      </div>

      {ready ? (
        <p className="mt-3 text-sm font-medium text-emerald-700">
          You can generate the diagram now, or keep refining for more detail.
        </p>
      ) : topMissing.length > 0 ? (
        <p className="mt-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-700">
            {missing.length} key area{missing.length === 1 ? '' : 's'} still
            unclear:
          </span>{' '}
          {topMissing.join(', ')}
          {missing.length > topMissing.length ? '…' : ''}
        </p>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Answer a few questions to build readiness. You can proceed to the
          diagram at any time.
        </p>
      )}
    </div>
  );
}
