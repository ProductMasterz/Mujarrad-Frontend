'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';
import type { BlockProps } from '../types';
import { BLOCK_TYPES } from '../types';

export function HeadingBlock({
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

  const getHeadingStyles = () => {
    switch (block.type) {
      case BLOCK_TYPES.HEADING_1:
        return 'text-4xl font-bold tracking-tight';
      case BLOCK_TYPES.HEADING_2:
        return 'text-3xl font-semibold tracking-tight';
      case BLOCK_TYPES.HEADING_3:
        return 'text-2xl font-semibold';
      default:
        return 'text-xl font-medium';
    }
  };

  const getPlaceholder = () => {
    switch (block.type) {
      case BLOCK_TYPES.HEADING_1:
        return 'Heading 1';
      case BLOCK_TYPES.HEADING_2:
        return 'Heading 2';
      case BLOCK_TYPES.HEADING_3:
        return 'Heading 3';
      default:
        return 'Heading';
    }
  };

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
      className={`
        min-h-[1.4em] w-full rounded-xl px-2 py-1
        outline-none transition-colors
        ${getHeadingStyles()}
        text-zinc-950 caret-zinc-950
        hover:bg-zinc-50/70 focus:bg-zinc-50/70
        dark:text-zinc-50 dark:caret-zinc-50
        dark:hover:bg-zinc-900/60 dark:focus:bg-zinc-900/60
      `}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      data-placeholder={getPlaceholder()}
      style={{ wordBreak: 'break-word' }}
    />
  );
}

export default HeadingBlock;