'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';
import type { BlockProps } from '../types';

/**
 * TextBlock - Plain text paragraph block
 */
export function TextBlock({
  block,
  isActive,
  onContentChange,
  onEnter,
  onBackspace,
  onFocus,
  onMoveUp,
  onMoveDown,
  readOnly = false,
}: BlockProps) {
  const contentRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={contentRef}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      className="
        min-h-[1.75em] w-full rounded-xl px-2 py-1.5
        text-[15px] leading-7 outline-none transition-colors
        text-zinc-900 caret-zinc-900
        placeholder:text-zinc-400
        hover:bg-zinc-50/80
        focus:bg-zinc-50/80
        dark:text-zinc-100 dark:caret-zinc-100
        dark:hover:bg-zinc-900/60
        dark:focus:bg-zinc-900/60
      "
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      data-placeholder="Type '/' for commands..."
      style={{ wordBreak: 'break-word' }}
    />
  );
}

export default TextBlock;