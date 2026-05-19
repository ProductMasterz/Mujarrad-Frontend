'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateApiKey } from '@/hooks/api/useApiKeys';
import { ApiKeySecretDisplay } from './ApiKeySecretDisplay';
import type { ApiKeyResponse } from '@/types/backend-dtos';

type CreateApiKeyDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CreateApiKeyDialog({ isOpen, onClose }: CreateApiKeyDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [nameError, setNameError] = useState('');
  const [createdKey, setCreatedKey] = useState<ApiKeyResponse | null>(null);

  const createMutation = useCreateApiKey();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNameError('');

    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }

    createMutation.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        expiresAt: expiresAt || undefined,
      },
      {
        onSuccess: (data) => {
          setCreatedKey(data);
        },
      }
    );
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setExpiresAt('');
    setNameError('');
    setCreatedKey(null);
    onClose();
  };

  const handleSecretConfirm = () => {
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={createdKey ? undefined : handleClose}
      />

      <div className="relative w-full max-w-[440px] rounded-2xl border border-border bg-background text-foreground shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-[15px] font-semibold text-foreground">
            {createdKey ? 'API Key Created' : 'Create API Key'}
          </h2>

          {!createdKey && (
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
          {createdKey ? (
            <ApiKeySecretDisplay
              secretKey={createdKey.secretKey}
              publicKey={createdKey.publicKey}
              onConfirm={handleSecretConfirm}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-muted-foreground">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError('');
                  }}
                  placeholder="e.g. My App Production Key"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  maxLength={255}
                  autoFocus
                />
                {nameError && <p className="text-[12px] text-red-500">{nameError}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-muted-foreground">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this key for?"
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  rows={2}
                  maxLength={5000}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-muted-foreground">
                  Expiration Date
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground outline-none transition-colors focus:border-primary"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-[11px] text-muted-foreground">
                  Leave empty for no expiration
                </p>
              </div>

              {createMutation.error && (
                <p className="text-[12px] text-red-500">
                  {(createMutation.error as Error).message || 'Failed to create API key'}
                </p>
              )}

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
                  disabled={createMutation.isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Key'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}