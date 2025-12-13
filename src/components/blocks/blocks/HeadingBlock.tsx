'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';
import type { BlockProps } from '../types';
import { BLOCK_TYPES } from '../types';

/**
 * HeadingBlock - H1, H2, H3 heading blocks
 *
 * Renders heading text with appropriate size based on block type.
 */
export function HeadingBlock({
  block,
  isActive,
  onContentChange,
  onDelete,
  onEnter,
  onBackspace,
  onFocus,
  onMoveUp,
  onMoveDown,
  readOnly = false,
}: BlockProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Get heading styles based on type
  const getHeadingStyles = () => {
    switch (block.type) {
      case BLOCK_TYPES.HEADING_1:
        return 'text-3xl font-bold';
      case BLOCK_TYPES.HEADING_2:
        return 'text-2xl font-semibold';
      case BLOCK_TYPES.HEADING_3:
        return 'text-xl font-medium';
      default:
        return 'text-lg font-medium';
    }
  };

  // Sync content with DOM
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerText !== block.content) {
      contentRef.current.innerText = block.content;
    }
  }, [block.content]);

  // Focus management
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
    // Enter - create new text block below
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter();
      return;
    }

    // Backspace on empty - delete block
    if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      onBackspace();
      return;
    }

    // Move up
    if (e.key === 'ArrowUp' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
      e.preventDefault();
      onMoveUp();
      return;
    }

    // Move down
    if (e.key === 'ArrowDown' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
      e.preventDefault();
      onMoveDown();
      return;
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

  return (
    <div
      ref={contentRef}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      className={`outline-none min-h-[1.5em] text-gray-900 dark:text-gray-100 ${getHeadingStyles()}`}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      data-placeholder={getPlaceholder()}
      style={{
        wordBreak: 'break-word',
      }}
    />
  );
}

export default HeadingBlock;
