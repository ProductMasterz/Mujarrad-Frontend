'use client';

import { Key } from 'lucide-react';

type ApiKeyEmptyStateProps = {
  onCreateClick: () => void;
};

export function ApiKeyEmptyState({ onCreateClick }: ApiKeyEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
        <Key className="size-6 text-primary" />
      </div>

      <p className="mb-1 text-[15px] font-medium text-foreground">No API keys yet</p>

      <p className="mb-6 max-w-[300px] text-[13px] text-muted-foreground">
        Create an API key to integrate your applications with Mujarrad.
      </p>

      <button
        onClick={onCreateClick}
        className="rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition hover:opacity-90"
        type="button"
      >
        Create your first API key
      </button>
    </div>
  );
}