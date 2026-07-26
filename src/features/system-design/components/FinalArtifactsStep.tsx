'use client';

import { useState } from 'react';

import { useLayer1Store } from '../stores/useLayer1Store';
import type {
  Layer1GraphEvent,
  Layer1GraphResult,
  Layer1GraphState,
} from '../types/graph.types';

import {
  AnimatePresence,
  MotionInteractive,
  MotionPanel,
  MotionStatus,
} from './SystemDesignMotion';

async function postLayer1Event(args: {
  event: Layer1GraphEvent;
  graphState: Layer1GraphState;
}): Promise<Layer1GraphResult & { error?: string }> {
  const response = await fetch('/api/system-builder/layer1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event: args.event,
      state: args.graphState,
    }),
  });

  const result =
    (await response.json()) as Layer1GraphResult & {
      error?: string;
    };

  if (!response.ok) {
    return {
      ...result,
      ok: false,
      error:
        result.error ??
        result.message ??
        'Layer 1 request failed.',
    };
  }

  return result;
}

export function FinalArtifactsStep() {
  const graphState = useLayer1Store(
    (state) => state.graphState,
  );

  const syncFromGraphState = useLayer1Store(
    (state) => state.syncFromGraphState,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);

  const hasApprovedDiagram =
    graphState.diagramApproved &&
    Boolean(
      graphState.selectedDiagramRenderer,
    );

  const hasGeneratedArtifacts = Boolean(
    graphState.approvedLayer1Artifacts,
  );

  const handleGenerateFiles = async () => {
    setIsLoading(true);
    setUiError(null);

    try {
      const result = await postLayer1Event({
        event: {
          type: 'generate_final_docs',
        },
        graphState,
      });

      if (result.state) {
        syncFromGraphState(result.state);
      }

      if (!result.ok) {
        setUiError(
          result.error ??
            result.message ??
            'Final artifact generation failed.',
        );
      }
    } catch (error) {
      setUiError(
        error instanceof Error
          ? error.message
          : 'Final artifact generation failed.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToPreview = () => {
    syncFromGraphState({
      ...graphState,
      activeStep: 'preview_artifacts',
      availableSteps: Array.from(
        new Set([
          ...graphState.availableSteps,
          'preview_artifacts',
        ]),
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
        Task 7
      </p>

      <h2 className="mt-2 text-2xl font-black text-slate-950">
        Generate Layer 1 files
      </h2>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
        Generate the deterministic Layer 1 artifact package from the approved
        diagram and cumulative system understanding. This creates the Markdown
        specification, Draw.io XML, diagram exports, token report, and handoff
        bundle. The next step lets you preview and download each file.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatusCard
          label="Approved diagram"
          value={hasApprovedDiagram ? 'Ready' : 'Missing'}
          good={hasApprovedDiagram}
        />

        <StatusCard
          label="Generated files"
          value={hasGeneratedArtifacts ? 'Ready' : 'Not generated'}
          good={hasGeneratedArtifacts}
        />

        <StatusCard
          label="Next step"
          value="Preview files"
          good={hasGeneratedArtifacts}
        />
      </div>

      <AnimatePresence>
        {uiError ? (
          <MotionPanel
            motionKey={uiError}
            className="mt-5"
          >
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {uiError}
            </div>
          </MotionPanel>
        ) : null}
      </AnimatePresence>

      <div className="mt-8 flex flex-wrap gap-3">
        <MotionInteractive
          disabled={
            isLoading ||
            !hasApprovedDiagram
          }
        >
          <button
            type="button"
            onClick={() =>
              void handleGenerateFiles()
            }
            disabled={isLoading || !hasApprovedDiagram}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {isLoading
              ? 'Generating files...'
              : hasGeneratedArtifacts
                ? 'Regenerate Files'
                : 'Generate Files'}
          </button>
        </MotionInteractive>

        <MotionInteractive
          disabled={!hasGeneratedArtifacts}
        >
          <button
            type="button"
            onClick={handleGoToPreview}
            disabled={!hasGeneratedArtifacts}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            Preview Generated Files
          </button>
        </MotionInteractive>
      </div>
    </section>
  );
}

function StatusCard({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good: boolean;
}) {
  return (
    <MotionStatus
      motionKey={`${label}-${value}`}
      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
    >
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div
        className={`mt-2 text-lg font-black ${
          good ? 'text-emerald-700' : 'text-slate-500'
        }`}
      >
        {value}
      </div>
    </MotionStatus>
  );
}
