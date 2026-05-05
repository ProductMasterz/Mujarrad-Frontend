'use client';

import { useRef, useEffect, useState, KeyboardEvent, useCallback, useId } from 'react';
import type { BlockProps } from '../types';

let mermaidModule: typeof import('mermaid') | null = null;

const DEFAULT_DIAGRAM = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`;

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

  useEffect(() => {
    if (!isFocused) {
      setLocalContent(block.content);
    }
  }, [block.content, isFocused]);

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
          <div class="p-4 text-center text-sm text-red-500">
            <p class="font-medium">Diagram syntax error</p>
            <p class="mt-1 text-xs opacity-75">Click to edit</p>
          </div>
        `;
      }
    };

    renderDiagram();
  }, [localContent, isFocused, isLoading, diagramId]);

  useEffect(() => {
    if (isActive && isFocused && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isActive, isFocused]);

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
    } catch {}
  }, [localContent]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    onContentChange(newContent);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setIsFocused(false);
      return;
    }

    if (e.key === 'Backspace' && localContent === '') {
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
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            ◇ Diagram
          </span>
          {error && !isFocused && (
            <span className="text-xs text-red-500 dark:text-red-400">(error)</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isFocused && (
            <div className="mr-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => insertTemplate('graph TD\n    A[Start] --> B[End]')}
                className="rounded-md bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                Flow
              </button>
              <button
                type="button"
                onClick={() => insertTemplate('sequenceDiagram\n    Alice->>Bob: Hello\n    Bob->>Alice: Hi!')}
                className="rounded-md bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                Seq
              </button>
              <button
                type="button"
                onClick={() => insertTemplate('pie title Distribution\n    "A" : 40\n    "B" : 30\n    "C" : 30')}
                className="rounded-md bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                Pie
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="
              flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors
              hover:bg-zinc-100 hover:text-zinc-900
              dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100
            "
            title="Copy Mermaid code"
          >
            {copied ? (
              <>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2z"
                  />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-200" />
          </div>
        ) : isFocused ? (
          <div>
            <textarea
              ref={textareaRef}
              value={localContent}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="
                min-h-[150px] w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 p-3
                font-mono text-sm text-zinc-900 outline-none
                focus:border-zinc-300 focus:ring-2 focus:ring-zinc-200
                dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100
                dark:focus:border-zinc-700 dark:focus:ring-zinc-800
              "
              placeholder={DEFAULT_DIAGRAM}
              spellCheck={false}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>
                Press <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1 dark:border-zinc-700 dark:bg-zinc-900">Esc</kbd> to preview
              </span>
              <a
                href="https://mermaid.js.org/syntax/flowchart.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline dark:text-blue-400"
              >
                Syntax reference ↗
              </a>
            </div>
          </div>
        ) : (
          <div
            ref={previewRef}
            onClick={handlePreviewClick}
            className="
              min-h-[100px] cursor-pointer overflow-x-auto rounded-xl p-2 transition-colors
              hover:bg-zinc-50 dark:hover:bg-zinc-900/60
              [&>svg]:max-w-full
            "
          />
        )}
      </div>

      {localContent === '' && !isFocused && !readOnly && (
        <div className="absolute bottom-2 right-3 text-xs text-zinc-400 dark:text-zinc-500">
          Click to add diagram
        </div>
      )}
    </div>
  );
}

export default MermaidBlock;