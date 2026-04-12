'use client';

import { X, AlertTriangle } from 'lucide-react';
import { useRevokeApiKey } from '@/hooks/api/useApiKeys';

type RevokeApiKeyDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  keyId: string;
  keyName: string;
};

export function RevokeApiKeyDialog({
  isOpen,
  onClose,
  keyId,
  keyName,
}: RevokeApiKeyDialogProps) {
  const revokeMutation = useRevokeApiKey();

  const handleRevoke = () => {
    revokeMutation.mutate(keyId, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative mx-4 w-full max-w-[400px] rounded-2xl border border-border bg-background text-foreground shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-[15px] font-semibold text-foreground">Revoke API Key</h2>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-[13px] text-red-800 dark:text-red-200">
              This action is permanent. Any applications using this key will immediately lose
              access.
            </p>
          </div>

          <p className="text-[13px] text-muted-foreground">
            Are you sure you want to revoke <span className="font-medium text-foreground">{keyName}</span>?
          </p>

          {revokeMutation.error && (
            <p className="text-[12px] text-red-500">
              {(revokeMutation.error as Error).message || 'Failed to revoke key'}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-[13px] text-muted-foreground transition hover:bg-muted hover:text-foreground"
              type="button"
            >
              Cancel
            </button>

            <button
              onClick={handleRevoke}
              disabled={revokeMutation.isPending}
              className="rounded-lg bg-red-600 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              type="button"
            >
              {revokeMutation.isPending ? 'Revoking...' : 'Revoke Key'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}