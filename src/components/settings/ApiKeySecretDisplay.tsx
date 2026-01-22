'use client';

import { useState } from 'react';
import { Copy, Check, AlertTriangle } from 'lucide-react';

type ApiKeySecretDisplayProps = {
  secretKey: string;
  publicKey: string;
  onConfirm: () => void;
};

export function ApiKeySecretDisplay({ secretKey, publicKey, onConfirm }: ApiKeySecretDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-[13px] text-amber-800">
          This secret will only be shown once. Copy it now and store it securely.
          You will not be able to see it again.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-[12px] text-[#828282] font-medium">Public Key</label>
        <div className="px-3 py-2 bg-[#f9f9f9] rounded-lg text-[13px] text-[#4f4f4f] font-mono break-all">
          {publicKey}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[12px] text-[#828282] font-medium">Secret Key</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-[#f9f9f9] rounded-lg text-[13px] text-[#4f4f4f] font-mono break-all border border-[#e0e0e0]">
            {secretKey}
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 p-2 rounded-lg hover:bg-[#f5f5f5] transition-colors border border-[#e0e0e0]"
            title="Copy secret key"
          >
            {copied ? (
              <Check className="size-4 text-green-600" />
            ) : (
              <Copy className="size-4 text-[#828282]" />
            )}
          </button>
        </div>
        {copied && (
          <p className="text-[12px] text-green-600">Copied to clipboard</p>
        )}
      </div>

      <button
        onClick={onConfirm}
        className="w-full py-2 px-4 bg-[#248bf2] text-white text-[13px] font-medium rounded-lg hover:bg-[#1a6fcc] transition-colors"
      >
        I&apos;ve saved my key
      </button>
    </div>
  );
}
