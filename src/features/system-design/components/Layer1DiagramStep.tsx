'use client';

import { useState } from 'react';

import { useLayer1Store } from '../stores/useLayer1Store';
import { Layer1DiagramReview } from './Layer1DiagramReview';

export function Layer1DiagramStep() {
  const [isLoading, setIsLoading] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);

  const graphState = useLayer1Store((state) => state.graphState);
  const syncFromGraphState = useLayer1Store((state) => state.syncFromGraphState);

  const { diagramGenerationContext, drawioXml, diagramSummary } = graphState;
  const hasDiagram = Boolean(drawioXml);

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

  const handleContinue = async () => {
    setIsLoading(true);
    setUiError(null);

    try {
      const response = await fetch('/api/system-builder/layer1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: { type: 'complete_step', stepId: 'diagram' },
          state: graphState,
        }),
      });

      const result = await response.json();

      if (result.state) {
        syncFromGraphState(result.state);
      }

      if (!result.ok) {
        const message =
          result.error ?? result.message ?? 'Failed to continue.';
        setUiError(message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to continue.';
      setUiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Task 5
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            Diagram
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !diagramGenerationContext}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading
              ? 'Generating...'
              : hasDiagram
                ? 'Regenerate diagram'
                : 'Generate diagram'}
          </button>

          {hasDiagram && (
            <button
              type="button"
              onClick={handleContinue}
              disabled={isLoading}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              Continue to Diagram Review
            </button>
          )}
        </div>
      </div>

      {!diagramGenerationContext && (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-medium text-slate-600">
          Diagram generation is not ready yet. Complete or skip clarification so
          the Layer 1 context can be prepared.
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
            Edit the diagram directly below. Your changes are saved to this Layer
            1 run automatically.
          </p>

          <Layer1DiagramReview />
        </div>
      )}
    </section>
  );
}
