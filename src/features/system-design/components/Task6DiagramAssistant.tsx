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
      <header className="shrink-0 border-b border-slate-200 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
          Task 6
        </p>

        <h2 className="mt-1 text-xl font-black text-slate-950">
          Diagram Assistant
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Describe a change to the current Mermaid diagram
          will be refined through LangGraph.
        </p>
      </header>

      <section className="shrink-0 p-4">
        {uiError && (
          <div
            role="alert"
            className="mb-3 max-h-20 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium leading-5 text-red-700 [overflow-wrap:anywhere]"
          >
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
          className="h-32 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
        />

        <button
          type="button"
          onClick={() =>
            void handleAiRefine()
          }
          disabled={
            isLoading ||
            !instruction.trim() ||
            !graphState.mermaidSource
          }
          className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading
            ? 'Applying change...'
            : 'Apply AI Change'}
        </button>

        <div className="mt-4 max-h-44 overflow-y-auto">
          <Task6AiUsagePanel
            calls={graphState.task6AiUsage.calls}
          />
        </div>
      </section>
    </>
  );
}
