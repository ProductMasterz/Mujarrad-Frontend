'use client';

import { useActionLogStore, type ActionType } from '@/stores/actionLogStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, List, Trash2, Plus, Link, Pencil, FileText } from 'lucide-react';

const actionConfig: Record<ActionType, { label: string; icon: typeof Plus; color: string }> = {
  create_job: { label: 'Created job', icon: FileText, color: '#248bf2' },
  create_node: { label: 'Added node', icon: Plus, color: '#10b981' },
  wire_edge: { label: 'Wired', icon: Link, color: '#8b5cf6' },
  delete: { label: 'Deleted', icon: Trash2, color: '#ef4444' },
  update: { label: 'Updated', icon: Pencil, color: '#f59e0b' },
};

const actionLabel: Record<ActionType, string> = {
  create_job: 'Created job',
  create_node: 'Added node',
  wire_edge: 'Wired',
  delete: 'Deleted',
  update: 'Updated',
};

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function ActionLogFeed() {
  const entries = useActionLogStore((s) => s.entries);
  const isOpen = useActionLogStore((s) => s.isOpen);
  const toggleOpen = useActionLogStore((s) => s.toggleOpen);
  const clearLog = useActionLogStore((s) => s.clearLog);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={toggleOpen}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-lg transition hover:bg-muted"
      >
        <List className="h-4 w-4" />
        <span>Action Log</span>
        {entries.length > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            {entries.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-[400px] flex-col rounded-2xl border border-border bg-background shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <List className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Action Log</h3>
          {entries.length > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {entries.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {entries.length > 0 && (
            <button
              type="button"
              onClick={clearLog}
              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              title="Clear log"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={toggleOpen}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ScrollArea className="max-h-[400px]">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <List className="mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No actions yet</p>
            <p className="text-xs text-muted-foreground/60">
              Actions will appear as you create nodes and connections
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry) => {
              const config = actionConfig[entry.actionType];
              const Icon = config.icon;

              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 px-4 py-3 transition hover:bg-muted/30"
                >
                  <div
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${config.color}18` }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {actionLabel[entry.actionType]}
                      </span>
                      <span className="truncate text-sm text-foreground/80">
                        {entry.entityName}
                      </span>
                    </div>
                    {entry.details && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {entry.details}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
