'use client';

import type { ReactNode } from 'react';

interface BlockShellProps {
  badge: string;
  label: string;
  toneClassName?: string;
  children: ReactNode;
}

export function BlockShell({
  badge,
  label,
  toneClassName = '',
  children,
}: BlockShellProps) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div
        className={`
          mt-1 inline-flex min-w-[52px] shrink-0 items-center justify-center
          rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1
          text-[11px] font-semibold uppercase tracking-[0.12em]
          dark:border-zinc-800 dark:bg-zinc-900
          ${toneClassName}
        `}
        title={label}
      >
        {badge}
      </div>

      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}

export default BlockShell;