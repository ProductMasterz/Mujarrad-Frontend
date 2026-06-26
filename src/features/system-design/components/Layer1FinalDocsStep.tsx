'use client';

import { useLayer1Store } from '../stores/useLayer1Store';

export function Layer1FinalDocsStep() {
  const graphState = useLayer1Store((state) => state.graphState);

const markdown =
  graphState.approvedLayer1Artifacts?.markdownSpec ??
  'Final documentation has not been generated yet.';
  
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
          Task 7
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
          Final Documentation
        </h2>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <pre className="whitespace-pre-wrap text-sm text-slate-700">
          {markdown}
        </pre>
      </div>
    </section>
  );
}