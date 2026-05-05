'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';
import type { BlockProps } from '../types';

interface TodoBlockProps extends BlockProps {
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * TodoBlock - Checkbox/task list block
 *
 * Renders a checkbox with text content.
 * Checked items display with strikethrough text.
 */
export function TodoBlock({
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
  onCheckedChange,
}: TodoBlockProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const isChecked = block.checked ?? false;

  // Sync content with DOM
  // IMPORTANT: Only sync if not focused (user not actively typing) to avoid cursor reset
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerText !== block.content) {
      if (document.activeElement === contentRef.current) {
        return;
      }
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
    // Enter - create new todo (unchecked)
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

  const handleCheckboxChange = () => {
    if (!readOnly) {
      onCheckedChange?.(!isChecked);
    }
  };

  return (
    <div className="flex items-start gap-2">
      {/* Checkbox */}
      <button
        type="button"
        onClick={handleCheckboxChange}
        disabled={readOnly}
        className={`
          flex-shrink-0 w-4 h-4 mt-1 rounded border-2
          transition-colors duration-150
          ${isChecked
            ? 'bg-blue-500 border-blue-500'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        `}
        aria-label={isChecked ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {isChecked && (
          <svg
            className="w-full h-full text-white"
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

      {/* Content */}
      <div
        ref={contentRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        className={`
          flex-1 outline-none min-h-[1.5em]
          ${isChecked ? 'line-through' : ''}
        `}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        data-placeholder="To-do..."
        style={{
          wordBreak: 'break-word',
          color: isChecked ? '#9ca3af' : '#111827',
          caretColor: '#111827',
        }}
      />
    </div>
  );
}

export default TodoBlock;
