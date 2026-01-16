'use client';

import { KeyboardEvent } from 'react';
import type { BlockProps } from '../types';

/**
 * DividerBlock - Horizontal line separator
 *
 * Non-editable block that displays a horizontal rule.
 */
export function DividerBlock({
  block,
  isActive,
  onDelete,
  onEnter,
  onBackspace,
  onFocus,
  onMoveUp,
  onMoveDown,
  readOnly = false,
}: Omit<BlockProps, 'onContentChange' | 'onTypeChange'>) {

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Enter - create new text block below
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter();
      return;
    }

    // Backspace or Delete - delete divider
    if (e.key === 'Backspace' || e.key === 'Delete') {
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
    <div
      tabIndex={0}
      className={`
        py-2 outline-none cursor-pointer
        ${isActive ? 'ring-2 ring-blue-500 ring-offset-2 rounded' : ''}
      `}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      role="separator"
      aria-label="Divider"
    >
      <hr className="border-t-2 border-gray-200" />
    </div>
  );
}

export default DividerBlock;
