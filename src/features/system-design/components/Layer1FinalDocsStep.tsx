'use client';

import { useLayer1Store } from '../stores/useLayer1Store';

export function Layer1FinalDocsStep() {
  const graphState = useLayer1Store(
    (state) => state.graphState,
  );

  const artifacts =
    graphState.approvedLayer1Artifacts;

  const markdown =
    artifacts?.markdownSpec ??
    'Final documentation will appear automatically after Review completes.';

  const isGenerated = Boolean(artifacts);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Task 7
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Final Documentation
          </h2>
        </div>

        <button
          type="button"
          disabled
          className="rounded-xl bg-slate-300 px-5 py-3 text-sm font-bold text-white cursor-not-allowed"
        >
          {isGenerated
            ? 'Generated'
            : 'Waiting for Review'}
        </button>
      </div>

      <div className="mt-6 rounded-2xl border bg-slate-50 p-5">
        <pre className="whitespace-pre-wrap text-sm">
          {markdown}
        </pre>
      </div>
    </section>
  );
}