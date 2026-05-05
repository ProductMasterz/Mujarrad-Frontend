'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';
import type { BlockProps } from '../types';

interface TodoBlockProps extends BlockProps {
  onCheckedChange?: (checked: boolean) => void;
}

export function TodoBlock({
  block,
  isActive,
  onContentChange,
  onEnter,
  onBackspace,
  onFocus,
  onMoveUp,
  onMoveDown,
  readOnly = false,
  onCheckedChange,
}: TodoBlockProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const isChecked = block.checked ?? false;

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerText !== block.content) {
      if (document.activeElement === contentRef.current) {
        return;
      }
      contentRef.current.innerText = block.content;
    }
  }, [block.content]);

  useEffect(() => {
    if (isActive && contentRef.current) {
      contentRef.current.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isActive]);

  const handleInput = () => {
    if (contentRef.current) {
      onContentChange(contentRef.current.innerText);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter();
      return;
    }

    if (e.key === 'Backspace' && block.content === '') {
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
    }
  };

  const handleCheckboxChange = () => {
    if (!readOnly) {
      onCheckedChange?.(!isChecked);
    }
  };

  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={handleCheckboxChange}
        disabled={readOnly}
        className={`
          mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border
          transition-colors
          ${
            isChecked
              ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
              : 'border-zinc-300 bg-white text-transparent hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-600'
          }
          ${readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        `}
        aria-label={isChecked ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {isChecked && (
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>

      <div
        ref={contentRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        className={`
          min-h-[1.75em] flex-1 rounded-xl px-2 py-1.5
          text-[15px] leading-7 outline-none transition-colors
          hover:bg-zinc-50/80 focus:bg-zinc-50/80
          dark:hover:bg-zinc-900/60 dark:focus:bg-zinc-900/60
          ${
            isChecked
              ? 'text-zinc-400 line-through dark:text-zinc-500'
              : 'text-zinc-900 caret-zinc-900 dark:text-zinc-100 dark:caret-zinc-100'
          }
        `}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        data-placeholder="To-do..."
        style={{ wordBreak: 'break-word' }}
      />
    </div>
  );
}

export default TodoBlock;