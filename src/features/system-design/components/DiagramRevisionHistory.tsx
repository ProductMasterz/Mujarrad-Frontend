'use client';

import { useLayer1Store } from '../stores/useLayer1Store';

export function DiagramRevisionHistory() {
  const revisions = useLayer1Store(
    (state) => state.graphState.diagramRevisions,
  );

  if (revisions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h4 className="text-sm font-black text-slate-950">Revision History</h4>

      <div className="mt-3 max-h-48 space-y-2 overflow-auto pr-1">
        {revisions.map((revision, index) => (
          <div
            key={revision.id}
            className="rounded-xl border border-slate-100 bg-slate-50 p-3"
          >
            <div className="text-xs font-bold text-slate-500">
              {index === 0 ? 'Original' : `Revision ${index}`}
            </div>
            <div className="mt-1 text-xs font-medium text-slate-700">
              {revision.instruction}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
