'use client';

import { useRef, useEffect, useState, KeyboardEvent, useCallback } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { BlockProps } from '../types';

export function MathBlock({
  block,
  isActive,
  onContentChange,
  onBackspace,
  onFocus,
  onMoveUp,
  onMoveDown,
  readOnly = false,
}: BlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [localContent, setLocalContent] = useState(block.content);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalContent(block.content);
    }
  }, [block.content, isFocused]);

  useEffect(() => {
    if (previewRef.current && !isFocused) {
      try {
        const latex = localContent || 'E = mc^2';
        katex.render(latex, previewRef.current, {
          displayMode: true,
          throwOnError: false,
          errorColor: '#ef4444',
          trust: false,
          strict: 'warn',
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid LaTeX');
      }
    }
  }, [localContent, isFocused]);

  useEffect(() => {
    if (isActive && isFocused && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isActive, isFocused]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 60)}px`;
    }
  }, [localContent, isFocused]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(block.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [block.content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    onContentChange(newContent);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setIsFocused(false);
      return;
    }

    if (e.key === 'Backspace' && localContent === '') {
      e.preventDefault();
      onBackspace();
      return;
    }

    if (e.key === 'ArrowUp' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
      e.preventDefault();
      onMoveUp();
      return;
    }

    if (e.key === 'ArrowDown' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
      e.preventDefault();
      onMoveDown();
      return;
    }
  };

  const handlePreviewClick = () => {
    if (!readOnly) {
      setIsFocused(true);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  const handleFocus = () => {
    onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            ∑ Math
          </span>
          {error && !isFocused && (
            <span className="text-xs text-red-500 dark:text-red-400">(error)</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="
            flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors
            hover:bg-zinc-100 hover:text-zinc-900
            dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100
          "
          title="Copy LaTeX"
        >
          {copied ? (
            <>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      <div className="p-4">
        {isFocused ? (
          <div>
            <textarea
              ref={textareaRef}
              value={localContent}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="
                min-h-[60px] w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 p-3
                font-mono text-sm text-zinc-900 outline-none
                focus:border-zinc-300 focus:ring-2 focus:ring-zinc-200
                dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100
                dark:focus:border-zinc-700 dark:focus:ring-zinc-800
              "
              placeholder="E = mc^2"
              spellCheck={false}
            />
            <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Press <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1 dark:border-zinc-700 dark:bg-zinc-900">Esc</kbd> to preview
            </div>
          </div>
        ) : (
          <div
            ref={previewRef}
            onClick={handlePreviewClick}
            className="
              flex min-h-[56px] cursor-pointer items-center justify-center overflow-x-auto rounded-xl p-2
              transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/60
            "
          />
        )}

        {error && !isFocused && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            Click to edit: {error}
          </div>
        )}
      </div>

      {localContent === '' && !isFocused && !readOnly && (
        <div className="absolute bottom-2 right-3 text-xs text-zinc-400 dark:text-zinc-500">
          Click to add equation
        </div>
      )}
    </div>
  );
}

export default MathBlock;