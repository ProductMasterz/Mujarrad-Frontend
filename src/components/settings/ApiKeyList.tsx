'use client';

import { useState } from 'react';
import { RotateCw, Trash2, Plus } from 'lucide-react';
import { useApiKeys } from '@/hooks/api/useApiKeys';
import { ApiKeyEmptyState } from './ApiKeyEmptyState';
import { CreateApiKeyDialog } from './CreateApiKeyDialog';
import { RotateApiKeyDialog } from './RotateApiKeyDialog';
import { RevokeApiKeyDialog } from './RevokeApiKeyDialog';

export function ApiKeyList() {
  const [activeOnly, setActiveOnly] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [rotateTarget, setRotateTarget] = useState<{ id: string; name: string } | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: keys, isLoading, error } = useApiKeys(activeOnly);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const maskPublicKey = (key: string) => {
    if (key.length <= 12) return key;
    return key.slice(0, 8) + '...' + key.slice(-4);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-[13px] text-red-500">Failed to load API keys</p>
        <p className="mt-1 text-[12px] text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  if (!keys || keys.length === 0) {
    return (
      <>
        <ApiKeyEmptyState onCreateClick={() => setShowCreateDialog(true)} />
        <CreateApiKeyDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-[12px] text-muted-foreground">Show active only</span>
        </label>

        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground transition hover:opacity-90"
          type="button"
        >
          <Plus className="size-3.5" />
          Create Key
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Public Key
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Created
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Last Used
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Expires
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {keys.map((key) => (
              <tr
                key={key.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/20"
              >
                <td className="px-4 py-3 text-[13px] font-medium text-foreground">
                  {key.name}
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-foreground">
                  {maskPublicKey(key.publicKey)}
                </td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground">
                  {formatDate(key.createdAt)}
                </td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground">
                  {formatDate(key.lastUsedAt)}
                </td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground">
                  {formatDate(key.expiresAt)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      key.isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {key.isActive ? 'Active' : 'Revoked'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {key.isActive && (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setRotateTarget({ id: key.id, name: key.name })}
                        className="rounded-md p-1.5 transition-colors hover:bg-muted"
                        title="Rotate secret"
                        type="button"
                      >
                        <RotateCw className="size-3.5 text-muted-foreground" />
                      </button>

                      <button
                        onClick={() => setRevokeTarget({ id: key.id, name: key.name })}
                        className="rounded-md p-1.5 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Revoke key"
                        type="button"
                      >
                        <Trash2 className="size-3.5 text-red-500" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateApiKeyDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />

      {rotateTarget && (
        <RotateApiKeyDialog
          isOpen={!!rotateTarget}
          onClose={() => setRotateTarget(null)}
          keyId={rotateTarget.id}
          keyName={rotateTarget.name}
        />
      )}

      {revokeTarget && (
        <RevokeApiKeyDialog
          isOpen={!!revokeTarget}
          onClose={() => setRevokeTarget(null)}
          keyId={revokeTarget.id}
          keyName={revokeTarget.name}
        />
      )}
    </div>
  );
}