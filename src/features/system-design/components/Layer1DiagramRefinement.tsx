'use client';

import { useState } from 'react';

import { useLayer1Store } from '../stores/useLayer1Store';
import {
  captureRegisteredFinalDiagram,
} from '../utils/finalDiagramCaptureBridge';

type Task6EventType =
  | 'undo_diagram_revision'
  | 'reset_diagram_revision';

async function postLayer1Event(args: {
  event: Record<string, unknown>;
  graphState: unknown;
}) {
  const response = await fetch(
    '/api/system-builder/layer1',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: args.event,
        state: args.graphState,
      }),
    },
  );

  return response.json();
}

export function Layer1DiagramRefinement() {
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

  const revisionCount =
    graphState.diagramRevisions.length;

  const canUndo = revisionCount >= 2;
  const canReset = revisionCount >= 1;

  const canApprove = Boolean(
    graphState.drawioXml,
  );

  const handleSimpleEvent = async (
    type: Task6EventType,
  ) => {
    setIsLoading(true);
    setUiError(null);

    try {
      const latestState =
        useLayer1Store.getState().graphState;

      const result = await postLayer1Event({
        event: {
          type,
        },
        graphState: latestState,
      });

      if (result.state) {
        syncFromGraphState(result.state);
      }

      if (!result.ok) {
        setUiError(
          result.error ??
            result.message ??
            'Action failed.',
        );
      }
    } catch (error) {
      setUiError(
        error instanceof Error
          ? error.message
          : 'Action failed.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveDiagram = async () => {
    setIsLoading(true);
    setUiError(null);

    try {
      const captured =
        await captureRegisteredFinalDiagram();

      const latestState =
        useLayer1Store.getState().graphState;

      const result = await postLayer1Event({
        event: {
          type: 'approve_diagram',
          xml: captured.xml,
          diagramImages:
            captured.diagramImages,
        },
        graphState: latestState,
      });

      if (result.state) {
        syncFromGraphState(result.state);
      }

      if (!result.ok) {
        setUiError(
          result.error ??
            result.message ??
            'Diagram approval failed.',
        );
      }
    } catch (error) {
      setUiError(
        error instanceof Error
          ? error.message
          : 'Failed to capture and approve the final diagram.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Diagram Controls
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-600">
            Review the current diagram before
            final approval.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {revisionCount} revision
          {revisionCount === 1 ? '' : 's'}
        </span>
      </div>

      {uiError ? (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {uiError}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() =>
            void handleSimpleEvent(
              'undo_diagram_revision',
            )
          }
          disabled={isLoading || !canUndo}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
        >
          Undo
        </button>

        <button
          type="button"
          onClick={() =>
            void handleSimpleEvent(
              'reset_diagram_revision',
            )
          }
          disabled={isLoading || !canReset}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
        >
          Reset
        </button>
      </div>

      <button
        type="button"
        onClick={() =>
          void handleApproveDiagram()
        }
        disabled={
          isLoading ||
          !canApprove
        }
        className="mt-2 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        {isLoading
          ? 'Processing...'
          : graphState.diagramApproved
            ? 'Approve Updated Diagram'
            : 'Accept Diagram'}
      </button>
    </section>
  );
}
