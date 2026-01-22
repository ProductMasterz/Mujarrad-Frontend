'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useRotateApiKey } from '@/hooks/api/useApiKeys';
import { ApiKeySecretDisplay } from './ApiKeySecretDisplay';
import type { ApiKeyResponse } from '@/types/backend-dtos';

type RotateApiKeyDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  keyId: string;
  keyName: string;
};

export function RotateApiKeyDialog({ isOpen, onClose, keyId, keyName }: RotateApiKeyDialogProps) {
  const [currentSecret, setCurrentSecret] = useState('');
  const [secretError, setSecretError] = useState('');
  const [rotatedKey, setRotatedKey] = useState<ApiKeyResponse | null>(null);

  const rotateMutation = useRotateApiKey();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecretError('');

    if (!currentSecret.trim()) {
      setSecretError('Current secret key is required');
      return;
    }

    rotateMutation.mutate(
      { keyId, data: { currentSecretKey: currentSecret.trim() } },
      {
        onSuccess: (data) => {
          setRotatedKey(data);
        },
        onError: (error) => {
          setSecretError((error as Error).message || 'Failed to rotate key. Check your current secret.');
        },
      }
    );
  };

  const handleClose = () => {
    setCurrentSecret('');
    setSecretError('');
    setRotatedKey(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={rotatedKey ? undefined : handleClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-[440px] mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f2f2f2]">
          <h2 className="text-[15px] font-medium text-[#333]">
            {rotatedKey ? 'Key Rotated' : `Rotate Key: ${keyName}`}
          </h2>
          {!rotatedKey && (
            <button onClick={handleClose} className="p-1 hover:bg-[#f5f5f5] rounded-lg transition-colors">
              <X className="size-4 text-[#828282]" />
            </button>
          )}
        </div>

        <div className="px-5 py-4">
          {rotatedKey ? (
            <ApiKeySecretDisplay
              secretKey={rotatedKey.secretKey}
              publicKey={rotatedKey.publicKey}
              onConfirm={handleClose}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-[13px] text-[#4f4f4f]">
                Enter your current secret key to verify ownership. A new secret will be generated
                while keeping the same public key.
              </p>

              <div className="space-y-1.5">
                <label className="text-[12px] text-[#828282] font-medium">
                  Current Secret Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={currentSecret}
                  onChange={(e) => { setCurrentSecret(e.target.value); setSecretError(''); }}
                  placeholder="Enter your current secret key"
                  className="w-full px-3 py-2 text-[13px] border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#248bf2] transition-colors font-mono"
                  autoFocus
                />
                {secretError && <p className="text-[12px] text-red-500">{secretError}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-[13px] text-[#828282] hover:bg-[#f5f5f5] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rotateMutation.isPending}
                  className="px-4 py-2 bg-[#248bf2] text-white text-[13px] font-medium rounded-lg hover:bg-[#1a6fcc] transition-colors disabled:opacity-50"
                >
                  {rotateMutation.isPending ? 'Rotating...' : 'Rotate Secret'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
