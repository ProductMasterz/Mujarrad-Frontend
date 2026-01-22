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
          <div key={i} className="h-14 bg-[#f9f9f9] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-[13px] text-red-500">Failed to load API keys</p>
        <p className="text-[12px] text-[#828282] mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  if (!keys || keys.length === 0) {
    return (
      <>
        <ApiKeyEmptyState onCreateClick={() => setShowCreateDialog(true)} />
        <CreateApiKeyDialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} />
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
            className="rounded border-[#e0e0e0] text-[#248bf2] focus:ring-[#248bf2]"
          />
          <span className="text-[12px] text-[#828282]">Show active only</span>
        </label>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#248bf2] text-white text-[12px] font-medium rounded-lg hover:bg-[#1a6fcc] transition-colors"
        >
          <Plus className="size-3.5" />
          Create Key
        </button>
      </div>

      <div className="border border-[#f2f2f2] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#f2f2f2]">
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#828282] uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#828282] uppercase tracking-wider">Public Key</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#828282] uppercase tracking-wider">Created</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#828282] uppercase tracking-wider">Last Used</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#828282] uppercase tracking-wider">Expires</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#828282] uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-2.5 text-[11px] font-medium text-[#828282] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id} className="border-b border-[#f2f2f2] last:border-b-0 hover:bg-[#fafafa]">
                <td className="px-4 py-3 text-[13px] text-[#333] font-medium">{key.name}</td>
                <td className="px-4 py-3 text-[12px] text-[#4f4f4f] font-mono">{maskPublicKey(key.publicKey)}</td>
                <td className="px-4 py-3 text-[12px] text-[#828282]">{formatDate(key.createdAt)}</td>
                <td className="px-4 py-3 text-[12px] text-[#828282]">{formatDate(key.lastUsedAt)}</td>
                <td className="px-4 py-3 text-[12px] text-[#828282]">{formatDate(key.expiresAt)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    key.isActive
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {key.isActive ? 'Active' : 'Revoked'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {key.isActive && (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setRotateTarget({ id: key.id, name: key.name })}
                        className="p-1.5 hover:bg-[#f0f0f0] rounded-md transition-colors"
                        title="Rotate secret"
                      >
                        <RotateCw className="size-3.5 text-[#828282]" />
                      </button>
                      <button
                        onClick={() => setRevokeTarget({ id: key.id, name: key.name })}
                        className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                        title="Revoke key"
                      >
                        <Trash2 className="size-3.5 text-red-400" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateApiKeyDialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} />

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
