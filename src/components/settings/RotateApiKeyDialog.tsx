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

export function RotateApiKeyDialog({
  isOpen,
  onClose,
  keyId,
  keyName,
}: RotateApiKeyDialogProps) {
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
          setSecretError(
            (error as Error).message || 'Failed to rotate key. Check your current secret.'
          );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={rotatedKey ? undefined : handleClose}
      />

      <div className="relative mx-4 w-full max-w-[440px] rounded-2xl border border-border bg-background text-foreground shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-[15px] font-semibold text-foreground">
            {rotatedKey ? 'Key Rotated' : `Rotate Key: ${keyName}`}
          </h2>

          {!rotatedKey && (
            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              type="button"
            >
              <X className="size-4" />
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
              <p className="text-[13px] text-muted-foreground">
                Enter your current secret key to verify ownership. A new secret will be generated
                while keeping the same public key.
              </p>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-muted-foreground">
                  Current Secret Key <span className="text-red-500">*</span>
                </label>

                <input
                  type="password"
                  value={currentSecret}
                  onChange={(e) => {
                    setCurrentSecret(e.target.value);
                    setSecretError('');
                  }}
                  placeholder="Enter your current secret key"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  autoFocus
                />

                {secretError && <p className="text-[12px] text-red-500">{secretError}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg px-4 py-2 text-[13px] text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={rotateMutation.isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
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