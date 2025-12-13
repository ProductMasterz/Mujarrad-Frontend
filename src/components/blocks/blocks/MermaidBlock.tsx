'use client';

import { useRef, useEffect, useState, KeyboardEvent, useCallback, useId } from 'react';
import type { BlockProps } from '../types';

// Dynamic import mermaid to avoid SSR issues
let mermaidModule: typeof import('mermaid') | null = null;

const DEFAULT_DIAGRAM = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`;

/**
 * MermaidBlock - Inline-editable Mermaid diagram block
 *
 * Like Notion: Click on the diagram to edit the Mermaid code.
 * Diagram renders when you click outside or press Escape.
 */
export function MermaidBlock({
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
  const [isLoading, setIsLoading] = useState(true);
  const uniqueId = useId().replace(/:/g, '-');
  const diagramId = `mermaid-${uniqueId}`;

  // Sync local content when block changes externally
  useEffect(() => {
    if (!isFocused) {
      setLocalContent(block.content);
    }
  }, [block.content, isFocused]);

  // Load mermaid on mount
  useEffect(() => {
    const loadMermaid = async () => {
      if (!mermaidModule) {
        mermaidModule = await import('mermaid');
        mermaidModule.default.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'strict',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        });
      }
      setIsLoading(false);
    };
    loadMermaid();
  }, []);

  // Render diagram when not editing
  useEffect(() => {
    const renderDiagram = async () => {
      if (!previewRef.current || isFocused || isLoading || !mermaidModule) return;

      const content = localContent || DEFAULT_DIAGRAM;

      try {
        previewRef.current.innerHTML = '';
        const { svg } = await mermaidModule.default.render(diagramId, content);
        previewRef.current.innerHTML = svg;
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid Mermaid syntax');
        previewRef.current.innerHTML = `
          <div class="text-red-500 text-sm p-4 text-center">
            <p class="font-medium">Diagram syntax error</p>
            <p class="text-xs mt-1 opacity-75">Click to edit</p>
          </div>
        `;
      }
    };

    renderDiagram();
  }, [localContent, isFocused, isLoading, diagramId]);

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
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [localContent, isFocused]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(localContent || DEFAULT_DIAGRAM);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [localContent]);

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

  const insertTemplate = (template: string) => {
    setLocalContent(template);
    onContentChange(template);
  };

  return (
    <div className="group relative rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            ◇ Diagram
          </span>
          {error && !isFocused && (
            <span className="text-red-500 text-xs">(error)</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Template buttons when editing */}
          {isFocused && (
            <div className="flex items-center gap-1 mr-2">
              <button
                type="button"
                onClick={() => insertTemplate('graph TD\n    A[Start] --> B[End]')}
                className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
              >
                Flow
              </button>
              <button
                type="button"
                onClick={() => insertTemplate('sequenceDiagram\n    Alice->>Bob: Hello\n    Bob->>Alice: Hi!')}
                className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
              >
                Seq
              </button>
              <button
                type="button"
                onClick={() => insertTemplate('pie title Distribution\n    "A" : 40\n    "B" : 30\n    "C" : 30')}
                className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
              >
                Pie
              </button>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Copy Mermaid code"
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
      </div>

      {/* Content area */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-blue-500 rounded-full" />
          </div>
        ) : isFocused ? (
          // Edit mode - Mermaid source
          <div>
            <textarea
              ref={textareaRef}
              value={localContent}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full min-h-[150px] p-3 font-mono text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={DEFAULT_DIAGRAM}
              spellCheck={false}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>
                Press <kbd className="px-1 bg-gray-100 dark:bg-gray-800 rounded">Esc</kbd> to preview
              </span>
              <a
                href="https://mermaid.js.org/syntax/flowchart.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Syntax reference ↗
              </a>
            </div>
          </div>
        ) : (
          // Preview mode - Rendered diagram
          <div
            ref={previewRef}
            onClick={handlePreviewClick}
            className="min-h-[100px] flex items-center justify-center cursor-pointer overflow-x-auto hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors [&>svg]:max-w-full"
          >
            {/* Mermaid diagram renders here */}
          </div>
        )}
      </div>

      {/* Empty hint */}
      {localContent === '' && !isFocused && !readOnly && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          Click to add diagram
        </div>
      )}
    </div>
  );
}

export default MermaidBlock;
