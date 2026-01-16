'use client';

import { useRef, useEffect, KeyboardEvent, useState } from 'react';
import type { BlockProps, CalloutType } from '../types';
import { CALLOUT_TYPES } from '../types';

interface CalloutBlockProps extends BlockProps {
  onCalloutTypeChange?: (type: CalloutType) => void;
}

// Callout type configurations
const CALLOUT_CONFIG: Record<CalloutType, {
  icon: string;
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}> = {
  [CALLOUT_TYPES.INFO]: {
    icon: 'ℹ️',
    label: 'Info',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-800',
  },
  [CALLOUT_TYPES.WARNING]: {
    icon: '⚠️',
    label: 'Warning',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-800',
  },
  [CALLOUT_TYPES.ERROR]: {
    icon: '❌',
    label: 'Error',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-400',
    textColor: 'text-red-800',
  },
  [CALLOUT_TYPES.SUCCESS]: {
    icon: '✅',
    label: 'Success',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-400',
    textColor: 'text-green-800',
  },
};

/**
 * CalloutBlock - Highlighted information box
 *
 * Features:
 * - Multiple callout types (info, warning, error, success)
 * - Type selector dropdown
 * - Editable content
 * - Color-coded based on type
 */
export function CalloutBlock({
  block,
  isActive,
  onContentChange,
  onDelete,
  onEnter,
  onBackspace,
  onFocus,
  onMoveUp,
  onMoveDown,
  onCalloutTypeChange,
  readOnly = false,
}: CalloutBlockProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const calloutType = (block.calloutType as CalloutType) || CALLOUT_TYPES.INFO;
  const config = CALLOUT_CONFIG[calloutType];

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
    // Enter - create new block (unless Shift is held for line break)
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

  const handleTypeChange = (newType: CalloutType) => {
    if (onCalloutTypeChange) {
      onCalloutTypeChange(newType);
    }
    setShowTypeSelector(false);
  };

  return (
    <div
      className={`
        relative rounded-lg border-l-4 p-4
        ${config.bgColor}
        ${config.borderColor}
      `}
    >
      {/* Header with icon and type selector */}
      <div className="flex items-center gap-2 mb-2">
        {/* Icon button (opens type selector) */}
        <button
          onClick={() => !readOnly && setShowTypeSelector(!showTypeSelector)}
          disabled={readOnly}
          className={`
            text-lg flex-shrink-0 transition-transform
            ${!readOnly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}
          `}
          title="Change callout type"
        >
          {config.icon}
        </button>

        {/* Type label */}
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.label}
        </span>

        {/* Type selector dropdown */}
        {showTypeSelector && (
          <div className="absolute top-12 left-4 z-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]">
            {Object.entries(CALLOUT_CONFIG).map(([type, typeConfig]) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type as CalloutType)}
                className={`
                  w-full px-3 py-2 text-left text-sm flex items-center gap-2 text-gray-900
                  hover:bg-gray-100
                  ${type === calloutType ? 'bg-gray-50' : ''}
                `}
              >
                <span>{typeConfig.icon}</span>
                <span>{typeConfig.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editable content */}
      <div
        ref={contentRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        className={`
          outline-none min-h-[1.5em] leading-relaxed
          ${config.textColor}
        `}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={() => setShowTypeSelector(false)}
        data-placeholder="Type your callout content..."
        style={{
          wordBreak: 'break-word',
        }}
      />

      {/* Placeholder when empty */}
      {block.content === '' && !readOnly && (
        <div className={`absolute left-14 top-[52px] pointer-events-none text-gray-400`}>
          Type your callout content...
        </div>
      )}

      {/* Click outside to close type selector */}
      {showTypeSelector && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowTypeSelector(false)}
        />
      )}
    </div>
  );
}

export default CalloutBlock;
