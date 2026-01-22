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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={createdKey ? undefined : handleClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-[440px] mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f2f2f2]">
          <h2 className="text-[15px] font-medium text-[#333]">
            {createdKey ? 'API Key Created' : 'Create API Key'}
          </h2>
          {!createdKey && (
            <button onClick={handleClose} className="p-1 hover:bg-[#f5f5f5] rounded-lg transition-colors">
              <X className="size-4 text-[#828282]" />
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
                <label className="text-[12px] text-[#828282] font-medium">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError(''); }}
                  placeholder="e.g. My App Production Key"
                  className="w-full px-3 py-2 text-[13px] border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#248bf2] transition-colors"
                  maxLength={255}
                  autoFocus
                />
                {nameError && <p className="text-[12px] text-red-500">{nameError}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] text-[#828282] font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this key for?"
                  className="w-full px-3 py-2 text-[13px] border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#248bf2] transition-colors resize-none"
                  rows={2}
                  maxLength={5000}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] text-[#828282] font-medium">Expiration Date</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#248bf2] transition-colors"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-[11px] text-[#bdbdbd]">Leave empty for no expiration</p>
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
                  className="px-4 py-2 text-[13px] text-[#828282] hover:bg-[#f5f5f5] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-[#248bf2] text-white text-[13px] font-medium rounded-lg hover:bg-[#1a6fcc] transition-colors disabled:opacity-50"
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
