'use client';

import { useRef, useEffect, useState, KeyboardEvent, useCallback } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { BlockProps } from '../types';

/**
 * MathBlock - Inline-editable LaTeX math equation block
 *
 * Like Notion: Click on the rendered math to edit.
 * Shows rendered math, click to edit LaTeX source.
 */
export function MathBlock({
  block,
  isActive,
  onContentChange,
  onBackspace,
  onFocus,
  onMoveUp,
  onMoveDown,
  readOnly = false,
}: BlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [localContent, setLocalContent] = useState(block.content);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync local content when block changes externally
  useEffect(() => {
    if (!isFocused) {
      setLocalContent(block.content);
    }
  }, [block.content, isFocused]);

  // Render math with KaTeX when not editing
  useEffect(() => {
    if (previewRef.current && !isFocused) {
      try {
        const latex = localContent || 'E = mc^2';
        katex.render(latex, previewRef.current, {
          displayMode: true,
          throwOnError: false,
          errorColor: '#ef4444',
          trust: false,
          strict: 'warn',
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid LaTeX');
      }
    }
  }, [localContent, isFocused]);

  // Focus management
  useEffect(() => {
    if (isActive && isFocused && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isActive, isFocused]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 60)}px`;
    }
  }, [localContent, isFocused]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(block.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [block.content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    onContentChange(newContent);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Escape - exit editing
    if (e.key === 'Escape') {
      setIsFocused(false);
      return;
    }

    // Backspace on empty - delete block
    if (e.key === 'Backspace' && localContent === '') {
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

  const handlePreviewClick = () => {
    if (!readOnly) {
      setIsFocused(true);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  const handleFocus = () => {
    onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="group relative rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm font-medium">
            ∑ Math
          </span>
          {error && !isFocused && (
            <span className="text-red-500 text-xs">(error)</span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          title="Copy LaTeX"
        >
          {copied ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Content area */}
      <div className="p-4">
        {isFocused ? (
          // Edit mode - LaTeX source
          <div>
            <textarea
              ref={textareaRef}
              value={localContent}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full min-h-[60px] p-2 font-mono text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="E = mc^2"
              spellCheck={false}
            />
            <div className="mt-2 text-xs text-gray-500">
              Press <kbd className="px-1 bg-gray-100 rounded">Esc</kbd> to preview or click outside
            </div>
          </div>
        ) : (
          // Preview mode - Rendered math
          <div
            ref={previewRef}
            onClick={handlePreviewClick}
            className="min-h-[40px] flex items-center justify-center cursor-pointer overflow-x-auto hover:bg-gray-50 rounded transition-colors"
          >
            {/* KaTeX renders here */}
          </div>
        )}

        {/* Error display */}
        {error && !isFocused && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            Click to edit: {error}
          </div>
        )}
      </div>

      {/* Empty hint */}
      {localContent === '' && !isFocused && !readOnly && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          Click to add equation
        </div>
      )}
    </div>
  );
}

export default MathBlock;
