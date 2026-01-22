'use client';

import { Key } from 'lucide-react';

type ApiKeyEmptyStateProps = {
  onCreateClick: () => void;
};

export function ApiKeyEmptyState({ onCreateClick }: ApiKeyEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-12 rounded-full bg-[#f0f7ff] flex items-center justify-center mb-4">
        <Key className="size-6 text-[#248bf2]" />
      </div>
      <p className="text-[15px] text-[#333] font-medium mb-1">No API keys yet</p>
      <p className="text-[13px] text-[#828282] mb-6 max-w-[300px]">
        Create an API key to integrate your applications with Mujarrad.
      </p>
      <button
        onClick={onCreateClick}
        className="px-4 py-2 bg-[#248bf2] text-white text-[13px] font-medium rounded-lg hover:bg-[#1a6fcc] transition-colors"
      >
        Create your first API key
      </button>
    </div>
  );
}
