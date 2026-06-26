'use client';

import type { CompletenessReport } from '../types/layer1.types';

export function Layer1CompletenessPanel({
  report,
}: {
  report: CompletenessReport | null;
}) {
  if (!report) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500">
        Completeness evaluation pending...
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Completeness</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-blue-600">
            {report.overallScore}
          </span>
          <span className="text-sm text-slate-500">/ 100</span>
        </div>
      </div>

      <div
        className={`rounded-xl border p-3 text-sm ${
          report.readyForDiagram
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-amber-200 bg-amber-50 text-amber-700'
        }`}
      >
        <div className="mb-1 font-bold">Diagram Ready</div>
        <div>{report.readyForDiagram ? 'Yes' : 'No - Needs more detail'}</div>
      </div>

      {report.missingCriticalItems.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-bold text-red-600">
            Critical Missing Information
          </h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
            {report.missingCriticalItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {report.weakItems.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-bold text-amber-600">
            Areas Needing Improvement
          </h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
            {report.weakItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
