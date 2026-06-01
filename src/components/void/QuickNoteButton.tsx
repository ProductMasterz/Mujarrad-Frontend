'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { QuickNotePopover } from './QuickNotePopover';

export function QuickNoteButton() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <QuickNotePopover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <button
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827] dark:text-[#d1d5db] dark:hover:bg-[#1f2937] dark:hover:text-white"
          aria-label="Quick Note"
        >
          <Plus className="size-6" strokeWidth={1.5} />
        </button>
        {hovered && !open && (
          <div className="absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 rounded bg-[#333] px-[8px] py-[4px] text-[11px] whitespace-nowrap text-white">
            Quick Note
          </div>
        )}
      </div>
    </QuickNotePopover>
  );
}
