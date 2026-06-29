'use client';

import { Layer1DiagramReview } from '../Layer1DiagramReview';

interface DiagramWorkspacePanelProps {
  confidence: number;
  ready: boolean;
  isGenerating: boolean;
  isBusy: boolean;
  hasDiagram: boolean;
  summary?: string;
  error?: string | null;
  onGenerate: () => void;
  onContinue?: () => void;
}

export function DiagramWorkspacePanel({
  confidence,
  ready,
  isGenerating,
  isBusy,
  hasDiagram,
  summary,
  error,
  onGenerate,
  onContinue,
}: DiagramWorkspacePanelProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(confidence)));

  const confidenceLabel = isGenerating
    ? 'Generating diagram…'
    : isBusy
      ? 'Analyzing your answers…'
      : ready
        ? 'Confident — ready to diagram'
        : 'AI confidence';

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* AI confidence — shown above the diagram area as a live loading bar */}
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <p
            className={`text-sm font-bold ${
              ready ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
            }`}
          >
            {confidenceLabel}
          </p>
          <span className="flex items-baseline gap-0.5">
            <span
              className={`text-2xl font-black ${
                ready ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'
              }`}
            >
              {clamped}
            </span>
            <span className="text-xs font-medium text-muted-foreground">%</span>
          </span>
        </div>

        <div className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              ready ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
            }`}
            style={{ width: `${clamped}%` }}
          />
          {isBusy ? (
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          ) : null}
        </div>
      </div>

      {/* Generate controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <p className="text-xs font-medium text-muted-foreground">
          {hasDiagram
            ? 'Edit the diagram directly — changes are saved to this run.'
            : 'Generate the first diagram whenever you are ready.'}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/30 transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating
              ? 'Generating…'
              : hasDiagram
                ? 'Regenerate diagram'
                : 'Generate diagram'}
          </button>

          {hasDiagram && onContinue ? (
            <button
              type="button"
              onClick={onContinue}
              disabled={isGenerating}
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-accent disabled:opacity-50"
            >
              Continue
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mx-5 mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-700 dark:text-amber-300">
          {error}
        </div>
      ) : null}

      {summary && hasDiagram ? (
        <div className="mx-5 mt-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <span className="font-bold text-foreground">Summary: </span>
          {summary}
        </div>
      ) : null}

      {/* Diagram area */}
      <div className="min-h-0 flex-1 p-5">
        {hasDiagram ? (
          <div className="h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <Layer1DiagramReview />
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/40 text-center">
            {isGenerating ? (
              <>
                <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                <p className="mt-4 text-sm font-semibold text-foreground">
                  Drafting your diagram…
                </p>
              </>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="8.5" y="14" width="7" height="7" rx="1.5" />
                    <path d="M6.5 10v2a2 2 0 0 0 2 2h3.5" />
                    <path d="M17.5 10v2a2 2 0 0 1-2 2H12" />
                  </svg>
                </div>
                <p className="mt-4 text-sm font-semibold text-foreground">
                  Your diagram will appear here
                </p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  Keep chatting to raise the confidence, or hit
                  &nbsp;<span className="font-semibold text-foreground">Generate diagram</span>&nbsp;
                  at any time.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
