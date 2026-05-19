'use client';

import { useEffect, useRef, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

type DeleteSpaceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  spaceName: string;
  onDelete: () => Promise<void>;
};

export function DeleteSpaceModal({
  isOpen,
  onClose,
  spaceName,
  onDelete,
}: DeleteSpaceModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmedConfirmText = confirmText.trim();
  const canDelete = trimmedConfirmText === spaceName;

  useEffect(() => {
    if (!isOpen) return;

    setConfirmText('');
    setError(null);
    setIsLoading(false);

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!canDelete) {
      setError(`Type "${spaceName}" exactly to confirm deletion.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onDelete();
      onClose();
    } catch (err) {
      console.error('Failed to delete space:', err);

      const message =
        err instanceof Error
          ? err.message
          : 'Failed to delete space. Please try again.';

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      <div className="relative w-full max-w-[480px] rounded-2xl border border-border bg-background text-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300">
              <AlertTriangle className="h-5 w-5" strokeWidth={1.8} />
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-[-0.24px] text-foreground">
                Delete space and all contents?
              </h2>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                This is a permanent action.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            aria-label="Close delete space dialog"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
            You are about to delete{' '}
            <span className="font-semibold">&ldquo;{spaceName}&rdquo;</span>. This will delete the
            space and all nodes, contexts, blocks, relationships, and chat-created content
            inside it.
          </div>

          <p className="mt-4 text-sm font-medium text-destructive">
            This action cannot be undone.
          </p>

          <label
            htmlFor="delete-space-confirm"
            className="mt-5 block text-sm font-medium text-foreground"
          >
            Type the exact space name to confirm
          </label>

          <input
            ref={inputRef}
            id="delete-space-confirm"
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              setError(null);
            }}
            disabled={isLoading}
            className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-[15px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-red-500 focus:ring-2 focus:ring-red-500/15 disabled:cursor-not-allowed disabled:bg-muted"
            placeholder={spaceName}
            autoComplete="off"
          />

          {error && (
            <p className="mt-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="h-10 rounded-full border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || !canDelete}
              className="flex h-10 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </>
              ) : (
                'Delete space and all contents'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}