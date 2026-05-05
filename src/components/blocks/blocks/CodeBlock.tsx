'use client';

import { useRef, useEffect, useState, KeyboardEvent, useCallback } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import type { BlockProps } from '../types';

const LANGUAGES = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' },
  { value: 'shell', label: 'Shell' },
  { value: 'dockerfile', label: 'Dockerfile' },
];

interface CodeBlockProps extends BlockProps {
  onLanguageChange?: (language: string) => void;
}

export function CodeBlock({
  block,
  isActive,
  onContentChange,
  onBackspace,
  onFocus,
  onMoveUp,
  onMoveDown,
  onLanguageChange,
  readOnly = false,
}: CodeBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const [localContent, setLocalContent] = useState(block.content);
  const [copied, setCopied] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const language = block.language || 'plaintext';

  useEffect(() => {
    if (!isFocused) {
      setLocalContent(block.content);
    }
  }, [block.content, isFocused]);

  useEffect(() => {
    if (highlightRef.current && !isFocused) {
      const code = highlightRef.current.querySelector('code');
      if (code) {
        code.textContent = localContent || '// Click to start typing...';
        code.className = `language-${language} hljs`;
        try {
          hljs.highlightElement(code);
        } catch {}
      }
    }
  }, [localContent, language, isFocused]);

  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isActive]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [localContent]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(block.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [block.content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    onContentChange(newContent);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '  ';

      if (e.shiftKey) {
        const lineStart = localContent.lastIndexOf('\n', start - 1) + 1;
        const lineText = localContent.substring(lineStart, start);
        if (lineText.startsWith(spaces)) {
          const newContent =
            localContent.substring(0, lineStart) +
            localContent.substring(lineStart + spaces.length);
          setLocalContent(newContent);
          onContentChange(newContent);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - spaces.length;
          }, 0);
        }
      } else {
        const newContent =
          localContent.substring(0, start) + spaces + localContent.substring(end);
        setLocalContent(newContent);
        onContentChange(newContent);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
        }, 0);
      }
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
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-100/80 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900/80">
        <select
          value={language}
          onChange={(e) => onLanguageChange?.(e.target.value)}
          disabled={readOnly}
          className="
            cursor-pointer bg-transparent text-sm text-zinc-600 outline-none
            hover:text-zinc-900 disabled:cursor-not-allowed
            dark:text-zinc-400 dark:hover:text-zinc-100
          "
        >
          {LANGUAGES.map((lang) => (
            <option
              key={lang.value}
              value={lang.value}
              className="bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
            >
              {lang.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleCopy}
          className="
            flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors
            hover:bg-zinc-200/70 hover:text-zinc-900
            dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100
          "
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <div className="relative min-h-[100px]">
        {!isFocused && (
          <pre
            ref={highlightRef}
            className="overflow-x-auto p-4 text-sm"
            onClick={() => textareaRef.current?.focus()}
          >
            <code className={`language-${language} hljs`}>
              {localContent || '// Click to start typing...'}
            </code>
          </pre>
        )}

        <textarea
          ref={textareaRef}
          value={localContent}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={readOnly}
          className={`
            absolute inset-0 h-full w-full resize-none bg-transparent p-4 font-mono text-sm
            text-zinc-900 outline-none caret-zinc-900
            dark:text-zinc-100 dark:caret-zinc-100
            ${isFocused ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            tabSize: 2,
            lineHeight: '1.5',
          }}
          spellCheck={false}
          placeholder="// Enter your code here..."
        />

        {isFocused && (
          <div className="whitespace-pre-wrap p-4 font-mono text-sm text-transparent" style={{ lineHeight: '1.5' }}>
            {localContent || ' '}
          </div>
        )}
      </div>
    </div>
  );
}

export default CodeBlock;