'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';
import type { BlockProps } from '../types';
import { BLOCK_TYPES } from '../types';

interface ListBlockProps extends BlockProps {
  listNumber?: number;
}

/**
 * ListBlock - Bullet and numbered list blocks
 *
 * Renders list items with appropriate indicator (bullet or number).
 * Consecutive list blocks of the same type appear as a unified list.
 */
export function ListBlock({
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
  listNumber = 1,
}: ListBlockProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const isBullet = block.type === BLOCK_TYPES.BULLET_LIST;

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
    // Enter - create new list item (same type)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter();
      return;
    }

    // Backspace on empty - delete or convert to text
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

  return (
    <div className="flex items-start gap-2">
      {/* List indicator */}
      <span className="flex-shrink-0 select-none w-6 text-right" style={{ color: '#6b7280' }}>
        {isBullet ? '•' : `${listNumber}.`}
      </span>

      {/* Content */}
      <div
        ref={contentRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        className="flex-1 outline-none min-h-[1.5em]"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        data-placeholder="List item..."
        style={{
          wordBreak: 'break-word',
          color: '#111827',
          caretColor: '#111827',
        }}
      />
    </div>
  );
}

export default ListBlock;
