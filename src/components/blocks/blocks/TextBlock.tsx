'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';
import type { BlockProps } from '../types';

/**
 * TextBlock - Plain text paragraph block
 *
 * This is the default block type for general content.
 * Supports inline wikilinks via [[Page Name]] syntax.
 */
export function TextBlock({
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

  // Sync content with DOM when block content changes externally
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerText !== block.content) {
      contentRef.current.innerText = block.content;
    }
  }, [block.content]);

  // Focus management
  useEffect(() => {
    if (isActive && contentRef.current) {
      contentRef.current.focus();
      // Move cursor to end
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
    // Enter - create new block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter();
      return;
    }

    // Backspace on empty block - delete
    if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      onBackspace();
      return;
    }

    // Cmd/Ctrl + Shift + ArrowUp - move block up
    if (e.key === 'ArrowUp' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
      e.preventDefault();
      onMoveUp();
      return;
    }

    // Cmd/Ctrl + Shift + ArrowDown - move block down
    if (e.key === 'ArrowDown' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
      e.preventDefault();
      onMoveDown();
      return;
    }
  };

  return (
    <div
      ref={contentRef}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      className="outline-none min-h-[1.5em] text-gray-900 dark:text-gray-100 leading-relaxed"
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      data-placeholder="Type '/' for commands..."
      style={{
        wordBreak: 'break-word',
      }}
    />
  );
}

export default TextBlock;
