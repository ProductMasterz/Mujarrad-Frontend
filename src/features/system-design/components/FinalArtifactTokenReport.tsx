'use client';

import type {
  Layer1TokenEfficiencyReport,
} from '../types/layer1.types';

interface FinalArtifactTokenReportProps {
  report: Layer1TokenEfficiencyReport;
}

function formatName(format: string): string {
  return format
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function FinalArtifactTokenReport({
  report,
}: FinalArtifactTokenReportProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Task 7 Report
          </p>

          <h3 className="mt-1 text-lg font-black text-slate-950">
            Layer 2 Token Comparison
          </h3>

          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Equivalent structured representations generated from the same
            canonical Layer 1 artifact.
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
          <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Recommended
          </div>

          <div className="mt-1 text-lg font-black text-emerald-950">
            {formatName(
              report.recommendedLayer2Format,
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-[70px_minmax(150px,1fr)_150px_130px] gap-3 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            <div>Rank</div>
            <div>Format</div>
            <div>Est. tokens</div>
            <div>Saving</div>
          </div>

          {report.entries.map((entry) => (
            <div
              key={entry.format}
              className="grid grid-cols-[70px_minmax(150px,1fr)_150px_130px] gap-3 border-t border-slate-100 px-4 py-3 text-sm"
            >
              <div className="font-black text-slate-950">
                #{entry.rank}
              </div>

              <div className="font-bold text-slate-800">
                {formatName(entry.format)}
              </div>

              <div className="font-mono text-slate-700">
                {entry.estimatedTokens.toLocaleString()}
              </div>

              <div className="font-semibold text-emerald-700">
                {entry.relativeSavingsPercent.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Lowest Token Format
          </div>

          <div className="mt-1 text-base font-black text-slate-950">
            {formatName(report.lowestTokenFormat)}
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Estimation Method
          </div>

          <div className="mt-1 font-mono text-xs text-slate-800">
            {report.estimateFormula}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
        These are generic token estimates. Exact token counts will depend on
        the tokenizer used by the selected Layer 2 model.
      </div>
    </section>
  );
}
