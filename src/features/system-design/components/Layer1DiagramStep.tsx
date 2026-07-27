'use client';

import { useState } from 'react';

import { useLayer1Store } from '../stores/useLayer1Store';
import { Layer1DiagramReview } from './Layer1DiagramReview';

export function Layer1DiagramStep() {
  const [isLoading, setIsLoading] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);

  const graphState = useLayer1Store((state) => state.graphState);
  const syncFromGraphState = useLayer1Store((state) => state.syncFromGraphState);

  const { diagramGenerationContext, mermaidSource, diagramSummary } = graphState;
  const hasDiagram = Boolean(mermaidSource);

  const handleGenerate = async () => {
    setIsLoading(true);
    setUiError(null);

    try {
      const response = await fetch(
        '/api/system-builder/layer1/generate-diagram',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: { type: 'generate_diagram' },
            state: graphState,
          }),
        },
      );

      const result = await response.json();

      if (result.state) {
        syncFromGraphState(result.state);
      }

      if (!result.ok) {
        const message =
          result.error ?? result.message ?? 'Failed to generate diagram.';
        setUiError(message);
        console.error('Failed to generate diagram:', message);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate diagram.';
      setUiError(message);
      console.error('Failed to generate diagram:', err);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Tasks 5 and 6
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            Diagram Generation and Refinement
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!hasDiagram && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Generate Diagram'}
            </button>
          )}

        </div>
      </div>

      {!diagramGenerationContext && !hasDiagram && (
        <div className="mt-5 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-5 text-sm font-medium text-blue-800">
          You can generate a diagram now. If a clarification question is still
          unanswered, the graph will build the diagram from the current
          understanding and keep the pending question available.
        </div>
      )}

      {diagramGenerationContext && !hasDiagram && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
          <div className="font-black">Layer 1 context is prepared</div>
          <div className="mt-1">
            The diagram will be generated from the cumulative understanding,
            processed input, and answered clarification questions — not the raw
            input alone.
          </div>
          <div className="mt-2 text-xs">
            Status: {diagramGenerationContext.status} · Answered Q&amp;A:{' '}
            {diagramGenerationContext.answeredQuestions.length}
          </div>
        </div>
      )}

      {uiError && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
          <div className="font-bold">Diagram generation failed</div>
          <div className="mt-1">{uiError}</div>
        </div>
      )}

      {hasDiagram && (
        <div className="mt-6 space-y-4">
          {diagramSummary && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-bold text-slate-900">Diagram summary</div>
              <div className="mt-1">{diagramSummary}</div>
            </div>
          )}

          <p className="text-sm font-medium text-slate-500">
            Review, edit, and refine the generated diagram below. Manual edits
            and AI refinements remain inside this Diagram step until you accept
            the final version.
          </p>

          <Layer1DiagramReview />
        </div>
      )}
    </section>
  );
}
