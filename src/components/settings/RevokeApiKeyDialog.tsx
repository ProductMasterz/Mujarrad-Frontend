'use client';

import { X, AlertTriangle } from 'lucide-react';
import { useRevokeApiKey } from '@/hooks/api/useApiKeys';

type RevokeApiKeyDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  keyId: string;
  keyName: string;
};

export function RevokeApiKeyDialog({ isOpen, onClose, keyId, keyName }: RevokeApiKeyDialogProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-[400px] mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f2f2f2]">
          <h2 className="text-[15px] font-medium text-[#333]">Revoke API Key</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#f5f5f5] rounded-lg transition-colors">
            <X className="size-4 text-[#828282]" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="size-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-[13px] text-red-800">
              This action is permanent. Any applications using this key will immediately lose access.
            </p>
          </div>

          <p className="text-[13px] text-[#4f4f4f]">
            Are you sure you want to revoke <span className="font-medium">{keyName}</span>?
          </p>

          {revokeMutation.error && (
            <p className="text-[12px] text-red-500">
              {(revokeMutation.error as Error).message || 'Failed to revoke key'}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[13px] text-[#828282] hover:bg-[#f5f5f5] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRevoke}
              disabled={revokeMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white text-[13px] font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {revokeMutation.isPending ? 'Revoking...' : 'Revoke Key'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
