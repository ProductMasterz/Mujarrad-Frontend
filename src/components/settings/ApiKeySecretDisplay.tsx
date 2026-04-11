'use client';

import { useState } from 'react';
import { Copy, Check, AlertTriangle } from 'lucide-react';

type ApiKeySecretDisplayProps = {
  secretKey: string;
  publicKey: string;
  onConfirm: () => void;
};

export function ApiKeySecretDisplay({
  secretKey,
  publicKey,
  onConfirm,
}: ApiKeySecretDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-[13px] text-amber-800 dark:text-amber-200">
          This secret will only be shown once. Copy it now and store it securely.
          You will not be able to see it again.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-[12px] font-medium text-muted-foreground">
          Public Key
        </label>
        <div className="break-all rounded-lg border border-border bg-muted/30 px-3 py-2 font-mono text-[13px] text-foreground">
          {publicKey}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[12px] font-medium text-muted-foreground">
          Secret Key
        </label>

        <div className="flex items-center gap-2">
          <div className="flex-1 break-all rounded-lg border border-border bg-muted/30 px-3 py-2 font-mono text-[13px] text-foreground">
            {secretKey}
          </div>

          <button
            onClick={handleCopy}
            className="shrink-0 rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title="Copy secret key"
            type="button"
          >
            {copied ? (
              <Check className="size-4 text-green-600 dark:text-green-400" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>
        </div>

        {copied && (
          <p className="text-[12px] text-green-600 dark:text-green-400">
            Copied to clipboard
          </p>
        )}
      </div>

      <button
        onClick={onConfirm}
        className="w-full rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition hover:opacity-90"
        type="button"
      >
        I&apos;ve saved my key
      </button>
    </div>
  );
}