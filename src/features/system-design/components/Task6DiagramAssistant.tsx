'use client';

import { useState } from 'react';

import { Task6AiUsagePanel } from './Task6AiUsagePanel';
import { useLayer1Store } from '../stores/useLayer1Store';

export function Task6DiagramAssistant() {
  const [instruction, setInstruction] =
    useState('');

  const [isLoading, setIsLoading] =
    useState(false);

  const [uiError, setUiError] =
    useState<string | null>(null);

  const graphState = useLayer1Store(
    (state) => state.graphState,
  );

  const syncFromGraphState = useLayer1Store(
    (state) => state.syncFromGraphState,
  );

  const handleAiRefine = async () => {
    const trimmed = instruction.trim();

    if (!trimmed) {
      return;
    }

    setIsLoading(true);
    setUiError(null);

    try {
      const latestState =
        useLayer1Store.getState().graphState;

      const response = await fetch(
        '/api/system-builder/layer1/refine-diagram',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: {
              type: 'refine_diagram',
              refinementInstruction: trimmed,
            },
            state: latestState,
          }),
        },
      );

      const result = await response.json();

      if (result.state) {
        syncFromGraphState(result.state);
      }

      if (!result.ok) {
        throw new Error(
          result.error ??
            result.message ??
            'AI refinement failed.',
        );
      }

      setInstruction('');
    } catch (error) {
      setUiError(
        error instanceof Error
          ? error.message
          : 'AI refinement failed.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="border-b border-slate-200 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
          Task 6
        </p>

        <h2 className="mt-1 text-xl font-black text-slate-950">
          Diagram Assistant
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Describe a diagram change. The current Draw.io XML
          will be refined through LangGraph.
        </p>
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {graphState.diagramRevisions.map(
            (revision, index) => (
              <div
                key={revision.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Revision {index + 1}
                </div>

                <div className="mt-1 text-sm leading-5 text-slate-700">
                  {revision.instruction}
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="border-t border-slate-200 p-4">
        {uiError && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {uiError}
          </div>
        )}

        <textarea
          value={instruction}
          onChange={(event) =>
            setInstruction(event.target.value)
          }
          placeholder="Example: Add an admin dashboard connected to the backend and database."
          disabled={isLoading}
          className="min-h-28 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
        />

        <button
          type="button"
          onClick={() =>
            void handleAiRefine()
          }
          disabled={
            isLoading ||
            !instruction.trim() ||
            !graphState.drawioXml
          }
          className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading
            ? 'Applying change...'
            : 'Apply AI Change'}
        </button>

        <div className="mt-4">
          <Task6AiUsagePanel
            calls={graphState.task6AiUsage.calls}
          />
        </div>
      </section>
    </>
  );
}
