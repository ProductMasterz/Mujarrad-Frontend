'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useLayer1Store } from '../../stores/useLayer1Store';

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) {
    return '';
  }

  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString();
}

export function ChatHistoryMenu() {
  const history = useLayer1Store((state) => state.history);
  const activeId = useLayer1Store(
    (state) => state.graphState.runId || state.graphState.id,
  );
  const startNewRun = useLayer1Store((state) => state.startNewRun);
  const loadRun = useLayer1Store((state) => state.loadRun);
  const deleteRun = useLayer1Store((state) => state.deleteRun);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const sorted = useMemo(
    () =>
      [...history].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [history],
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-bold text-foreground transition hover:bg-accent"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v5h5" />
          <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
          <path d="M12 7v5l4 2" />
        </svg>
        History
        {sorted.length > 0 ? (
          <span className="rounded-full bg-muted px-1.5 text-xs font-bold text-muted-foreground">
            {sorted.length}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
          <button
            type="button"
            onClick={() => {
              startNewRun();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 border-b border-border px-4 py-3 text-left text-sm font-bold text-foreground transition hover:bg-accent"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            New design
          </button>

          <div className="max-h-80 overflow-y-auto py-1">
            {sorted.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No saved designs yet.
              </p>
            ) : (
              sorted.map((entry) => {
                const isActive = entry.id === activeId;
                return (
                  <div
                    key={entry.id}
                    className={`group flex items-center gap-2 px-2 ${
                      isActive ? 'bg-accent/60' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        loadRun(entry.id);
                        setOpen(false);
                      }}
                      className="flex min-w-0 flex-1 flex-col rounded-lg px-2 py-2 text-left transition hover:bg-accent"
                    >
                      <span className="truncate text-sm font-semibold text-foreground">
                        {entry.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(entry.updatedAt)}
                        {isActive ? ' · current' : ''}
                      </span>
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => deleteRun(entry.id)}
                      className="shrink-0 rounded-lg p-2 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
