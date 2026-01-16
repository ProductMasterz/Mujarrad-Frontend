'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';
import type { BlockProps } from '../types';

/**
 * QuoteBlock - Block quote with left border accent
 *
 * Renders text with italic styling and a left border.
 */
export function QuoteBlock({
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
    // Enter - create new text block (not quote)
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

  return (
    <div className="border-l-4 pl-4" style={{ borderColor: '#d1d5db' }}>
      <div
        ref={contentRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        className="outline-none min-h-[1.5em] italic"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        data-placeholder="Quote..."
        style={{
          wordBreak: 'break-word',
          color: '#4b5563',
          caretColor: '#4b5563',
        }}
      />
    </div>
  );
}

export default QuoteBlock;
