'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white text-[#6b7280]"
      >
        <Monitor className="h-4 w-4" />
      </button>
    );
  }

  const icon =
    theme === 'dark' ? (
      <Moon className="h-4 w-4" />
    ) : theme === 'light' ? (
      <Sun className="h-4 w-4" />
    ) : (
      <Monitor className="h-4 w-4" />
    );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white text-[#4b5563] transition hover:bg-[#f9fafb] hover:text-[#111827] dark:border-[#374151] dark:bg-[#111827] dark:text-[#d1d5db] dark:hover:bg-[#1f2937] dark:hover:text-white"
        aria-label="Change theme"
        title="Theme"
      >
        {icon}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[160px] rounded-xl border border-[#e5e7eb] bg-white p-2 shadow-lg dark:border-[#374151] dark:bg-[#111827]">
          <button
            type="button"
            onClick={() => {
              setTheme('light');
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#111827] hover:bg-[#f3f4f6] dark:text-[#f9fafb] dark:hover:bg-[#1f2937]"
          >
            <Sun className="h-4 w-4" />
            Light
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme('dark');
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#111827] hover:bg-[#f3f4f6] dark:text-[#f9fafb] dark:hover:bg-[#1f2937]"
          >
            <Moon className="h-4 w-4" />
            Dark
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme('system');
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#111827] hover:bg-[#f3f4f6] dark:text-[#f9fafb] dark:hover:bg-[#1f2937]"
          >
            <Monitor className="h-4 w-4" />
            System
          </button>
        </div>
      )}
    </div>
  );
}