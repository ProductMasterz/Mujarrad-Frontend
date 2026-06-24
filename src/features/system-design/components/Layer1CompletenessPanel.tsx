'use client';

import type { CompletenessReport } from '../types/layer1.types';

export function Layer1CompletenessPanel({ report }: { report: CompletenessReport | null }) {
  if (!report) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500">
        Completeness evaluation pending...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Completeness</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-blue-600">{report.overallScore}</span>
          <span className="text-sm text-slate-500">/ 100</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className={`p-3 rounded-xl border ${report.readyForDiagram ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
          <div className="font-bold mb-1">Diagram Ready</div>
          <div>{report.readyForDiagram ? 'Yes' : 'No - Needs more detail'}</div>
        </div>
        <div className={`p-3 rounded-xl border ${report.readyForSpec ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
          <div className="font-bold mb-1">Spec Ready</div>
          <div>{report.readyForSpec ? 'Yes' : 'No - Needs more detail'}</div>
        </div>
      </div>

      {report.missingCriticalItems.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-red-600 mb-2">Critical Missing Information</h4>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            {report.missingCriticalItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {report.weakItems.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-amber-600 mb-2">Areas Needing Improvement</h4>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            {report.weakItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
