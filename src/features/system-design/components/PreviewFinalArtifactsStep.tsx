'use client';

import { useMemo, useState } from 'react';

import { FinalArtifactTokenReport } from './FinalArtifactTokenReport';
import { useLayer1Store } from '../stores/useLayer1Store';
import {
  downloadFinalArtifact,
  downloadLayer1ArtifactBundle,
} from '../utils/artifactDownload';
import {
  buildFinalArtifactExplorerItems,
  type FinalArtifactId,
} from '../utils/finalArtifactExplorer';

import {
  AnimatePresence,
  MotionInteractive,
  MotionPanel,
  MotionStatus,
} from './SystemDesignMotion';

export function PreviewFinalArtifactsStep() {
  const [selectedId, setSelectedId] =
    useState<FinalArtifactId>('markdown');

  const [isDownloadingBundle, setIsDownloadingBundle] =
    useState(false);

  const [uiError, setUiError] =
    useState<string | null>(null);

  const bundle = useLayer1Store(
    (state) =>
      state.graphState.approvedLayer1Artifacts,
  );

  const items = useMemo(
    () =>
      bundle
        ? buildFinalArtifactExplorerItems(bundle)
        : [],
    [bundle],
  );

  const selected =
    items.find((item) => item.id === selectedId) ??
    items[0];

  if (!bundle) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
          Task 8
        </p>

        <h2 className="mt-2 text-2xl font-black text-slate-950">
          Preview Files
        </h2>

        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-medium text-slate-600">
          Final Layer 1 artifacts are not available yet.
          Approve the diagram first so Task 7 can
          generate them.
        </div>
      </section>
    );
  }

  const handleBundleDownload = async () => {
    setIsDownloadingBundle(true);
    setUiError(null);

    try {
      await downloadLayer1ArtifactBundle(bundle);
    } catch (error) {
      setUiError(
        error instanceof Error
          ? error.message
          : 'Failed to download the artifact bundle.',
      );
    } finally {
      setIsDownloadingBundle(false);
    }
  };

  const handleCopy = async () => {
    if (!selected?.content) {
      return;
    }

    setUiError(null);

    try {
      await navigator.clipboard.writeText(
        selected.content,
      );
    } catch (error) {
      setUiError(
        error instanceof Error
          ? error.message
          : 'Failed to copy artifact content.',
      );
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Task 8
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              Preview Files
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Inspect every generated representation,
              compare token cost, download artifacts,
              and prepare the Layer 2 handoff.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <MotionInteractive
              disabled={isDownloadingBundle}
            >
              <button
                type="button"
                onClick={() =>
                  void handleBundleDownload()
                }
                disabled={isDownloadingBundle}
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {isDownloadingBundle
                  ? 'Preparing ZIP...'
                  : 'Download Full Bundle'}
              </button>
            </MotionInteractive>

            <button
              type="button"
              disabled
              title="Layer 2 handoff will be wired next."
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              Prepare Layer 2 Handoff
            </button>
          </div>
        </div>

        <AnimatePresence>
          {uiError ? (
            <MotionPanel
              motionKey={uiError}
              className="mt-4"
            >
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                {uiError}
              </div>
            </MotionPanel>
          ) : null}
        </AnimatePresence>

        <div className="mt-6 grid min-h-[68vh] grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
            {items.map((item) => {
              const isSelected =
                selected?.id === item.id;

              return (
                <MotionInteractive
                  key={item.id}
                  selected={isSelected}
                  disabled={!item.available}
                  className="mb-1 w-full"
                >
                  <button
                    type="button"
                    disabled={!item.available}
                    onClick={() =>
                      setSelectedId(item.id)
                    }
                    className={`w-full rounded-xl px-3 py-3 text-left transition ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : item.available
                          ? 'bg-white text-slate-800 hover:bg-slate-100'
                          : 'bg-transparent text-slate-400'
                    }`}
                  >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold">
                      {item.label}
                    </span>

                    <span className="text-xs font-bold">
                      {item.available
                        ? 'Ready'
                        : 'Missing'}
                    </span>
                  </div>

                  {item.tokenEntry && (
                    <div
                      className={`mt-1 text-xs ${
                        isSelected
                          ? 'text-blue-100'
                          : 'text-slate-500'
                      }`}
                    >
                      #{item.tokenEntry.rank}
                      {' · '}
                      {item.tokenEntry.estimatedTokens.toLocaleString()}
                      {' est. tokens'}
                    </div>
                  )}
                  </button>
                </MotionInteractive>
              );
            })}
          </aside>

          <AnimatePresence mode="wait">
            {selected ? (
              <MotionPanel
                motionKey={selected.id}
                className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
              <div className="border-b border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-950">
                      {selected.label}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      {selected.description}
                    </p>

                    <div className="mt-2 font-mono text-xs text-slate-500">
                      {selected.fileName}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selected.content && (
                      <MotionInteractive>
                        <button
                          type="button"
                          onClick={() =>
                            void handleCopy()
                          }
                          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Copy
                        </button>
                      </MotionInteractive>
                    )}

                    <MotionInteractive>
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            setUiError(null);
                            downloadFinalArtifact(
                              selected,
                            );
                          } catch (error) {
                            setUiError(
                              error instanceof Error
                                ? error.message
                                : 'Download failed.',
                            );
                          }
                        }}
                        className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
                      >
                        Download
                      </button>
                    </MotionInteractive>
                  </div>
                </div>

                {selected.tokenEntry && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Metric
                      label="Rank"
                      value={`#${selected.tokenEntry.rank}`}
                    />

                    <Metric
                      label="Est. tokens"
                      value={selected.tokenEntry.estimatedTokens.toLocaleString()}
                    />

                    <Metric
                      label="Characters"
                      value={selected.tokenEntry.characterCount.toLocaleString()}
                    />

                    <Metric
                      label="UTF-8 bytes"
                      value={selected.tokenEntry.utf8Bytes.toLocaleString()}
                    />
                  </div>
                )}
              </div>

              <div className="min-h-0 flex-1 overflow-auto bg-slate-950 p-4">
                {selected.previewKind === 'image' &&
                selected.dataUrl ? (
                  <div className="flex min-h-full items-center justify-center rounded-xl bg-white p-4">
                    <img
                      src={selected.dataUrl}
                      alt={selected.label}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-slate-100">
                    {selected.content}
                  </pre>
                )}
              </div>
              </MotionPanel>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      <FinalArtifactTokenReport
        report={bundle.tokenEfficiencyReport}
      />
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <MotionStatus
      motionKey={`${label}-${value}`}
      className="rounded-xl bg-slate-50 p-3"
    >
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div className="mt-1 text-sm font-black text-slate-950">
        {value}
      </div>
    </MotionStatus>
  );
}
