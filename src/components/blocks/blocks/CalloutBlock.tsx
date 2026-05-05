'use client';

import { useRef, useEffect, KeyboardEvent, useState } from 'react';
import type { BlockProps, CalloutType } from '../types';
import { CALLOUT_TYPES } from '../types';

interface CalloutBlockProps extends BlockProps {
  onCalloutTypeChange?: (type: CalloutType) => void;
}

const CALLOUT_CONFIG: Record<
  CalloutType,
  {
    icon: string;
    label: string;
    shellClassName: string;
    labelClassName: string;
    contentClassName: string;
  }
> = {
  [CALLOUT_TYPES.INFO]: {
    icon: 'ℹ️',
    label: 'Info',
    shellClassName: 'border-blue-300 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40',
    labelClassName: 'text-blue-800 dark:text-blue-300',
    contentClassName: 'text-blue-900 dark:text-blue-100',
  },
  [CALLOUT_TYPES.WARNING]: {
    icon: '⚠️',
    label: 'Warning',
    shellClassName: 'border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40',
    labelClassName: 'text-amber-800 dark:text-amber-300',
    contentClassName: 'text-amber-900 dark:text-amber-100',
  },
  [CALLOUT_TYPES.ERROR]: {
    icon: '❌',
    label: 'Error',
    shellClassName: 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40',
    labelClassName: 'text-red-800 dark:text-red-300',
    contentClassName: 'text-red-900 dark:text-red-100',
  },
  [CALLOUT_TYPES.SUCCESS]: {
    icon: '✅',
    label: 'Success',
    shellClassName: 'border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40',
    labelClassName: 'text-emerald-800 dark:text-emerald-300',
    contentClassName: 'text-emerald-900 dark:text-emerald-100',
  },
};

export function CalloutBlock({
  block,
  isActive,
  onContentChange,
  onEnter,
  onBackspace,
  onFocus,
  onMoveUp,
  onMoveDown,
  onCalloutTypeChange,
  readOnly = false,
}: CalloutBlockProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const calloutType = (block.calloutType as CalloutType) || CALLOUT_TYPES.INFO;
  const config = CALLOUT_CONFIG[calloutType];

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

  useEffect(() => {
    if (!showTypeSelector) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setShowTypeSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTypeSelector]);

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

  const handleTypeChange = (newType: CalloutType) => {
    onCalloutTypeChange?.(newType);
    setShowTypeSelector(false);
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative rounded-2xl border px-4 py-3 ${config.shellClassName}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => !readOnly && setShowTypeSelector((prev) => !prev)}
          disabled={readOnly}
          className={`${!readOnly ? 'cursor-pointer hover:scale-105' : 'cursor-default'} text-lg transition-transform`}
          title="Change callout type"
        >
          {config.icon}
        </button>

        <span className={`text-sm font-semibold ${config.labelClassName}`}>
          {config.label}
        </span>

        {showTypeSelector && (
          <div className="absolute left-4 top-12 z-20 min-w-[140px] rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
            {Object.entries(CALLOUT_CONFIG).map(([type, typeConfig]) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type as CalloutType)}
                className={`
                  flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm
                  text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-900
                  ${type === calloutType ? 'bg-zinc-100 dark:bg-zinc-900' : ''}
                `}
              >
                <span>{typeConfig.icon}</span>
                <span>{typeConfig.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={contentRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        className={`
          min-h-[1.75em] rounded-xl px-2 py-1.5 text-[15px] leading-7 outline-none transition-colors
          hover:bg-white/40 focus:bg-white/50 dark:hover:bg-black/10 dark:focus:bg-black/10
          ${config.contentClassName}
        `}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        data-placeholder="Type your callout content..."
        style={{ wordBreak: 'break-word' }}
      />
    </div>
  );
}

export default CalloutBlock;