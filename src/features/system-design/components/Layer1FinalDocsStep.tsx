'use client';

import { useState } from 'react';

import { useLayer1Store } from '../stores/useLayer1Store';

export function Layer1FinalDocsStep() {
  const graphState =
    useLayer1Store(
      (state) => state.graphState,
    );
    console.log(
  'approvedLayer1Artifacts',
  graphState.approvedLayer1Artifacts,
);

  const syncFromGraphState =
    useLayer1Store(
      (state) =>
        state.syncFromGraphState,
    );

  const [loading, setLoading] =
    useState(false);

  async function handleGenerate() {
    try {
      setLoading(true);

      const response =
        await fetch(
          '/api/system-builder/layer1',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              event: {
                type:
                  'complete_step',
                stepId:
                  'review',
              },

              state:
                graphState,
            }),
          },
        );

      const result =
        await response.json();
console.log('API RESULT', result);
      if (
        result.ok &&
        result.state
      ) {
        syncFromGraphState(
          result.state,
        );{
          console.log(
    'STATE RETURNED',
    result.state,
  );

  console.log(
    'ARTIFACTS',
    result.state
      .approvedLayer1Artifacts,
  );

  syncFromGraphState(
    result.state,
  );
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const artifacts =
    graphState.approvedLayer1Artifacts;

  const markdown =
    artifacts?.markdownSpec ??
    'Final documentation has not been generated yet.';

  const isGenerated =
    Boolean(
      artifacts?.markdownSpec,
    );

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
          disabled={
            loading ||
            isGenerated
          }
          onClick={() =>
            void handleGenerate()
          }
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
        >
          {loading
            ? 'Generating...'
            : isGenerated
            ? 'Generated ✓'
            : 'Generate'}
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