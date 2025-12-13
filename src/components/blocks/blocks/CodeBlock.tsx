'use client';

import { useRef, useEffect, useState, KeyboardEvent, useCallback } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import type { BlockProps } from '../types';

// Common programming languages for the dropdown
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

/**
 * CodeBlock - Inline-editable code block with syntax highlighting
 *
 * Like Notion: Click anywhere in the code to edit directly.
 * Syntax highlighting updates on blur for performance.
 */
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

  // Sync local content when block changes externally
  useEffect(() => {
    if (!isFocused) {
      setLocalContent(block.content);
    }
  }, [block.content, isFocused]);

  // Highlight code when not focused or content changes
  useEffect(() => {
    if (highlightRef.current && !isFocused) {
      const code = highlightRef.current.querySelector('code');
      if (code) {
        code.textContent = localContent || '// Click to start typing...';
        code.className = `language-${language} hljs`;
        try {
          hljs.highlightElement(code);
        } catch (e) {
          // Ignore highlighting errors
        }
      }
    }
  }, [localContent, language, isFocused]);

  // Focus management
  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isActive]);

  // Auto-resize textarea
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
    // Tab - insert spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '  '; // 2 spaces

      if (e.shiftKey) {
        // Unindent
        const lineStart = localContent.lastIndexOf('\n', start - 1) + 1;
        const lineText = localContent.substring(lineStart, start);
        if (lineText.startsWith(spaces)) {
          const newContent = localContent.substring(0, lineStart) + localContent.substring(lineStart + spaces.length);
          setLocalContent(newContent);
          onContentChange(newContent);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - spaces.length;
          }, 0);
        }
      } else {
        // Indent
        const newContent = localContent.substring(0, start) + spaces + localContent.substring(end);
        setLocalContent(newContent);
        onContentChange(newContent);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
        }, 0);
      }
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

  const handleFocus = () => {
    setIsFocused(true);
    onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="group relative rounded-lg bg-gray-900 dark:bg-gray-950 overflow-hidden">
      {/* Header with language selector and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
        <select
          value={language}
          onChange={(e) => onLanguageChange?.(e.target.value)}
          disabled={readOnly}
          className="bg-transparent text-gray-400 text-sm focus:outline-none cursor-pointer hover:text-gray-200 disabled:cursor-not-allowed"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value} className="bg-gray-800">
              {lang.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Code content - overlaid textarea and syntax highlight */}
      <div className="relative min-h-[100px]">
        {/* Syntax highlighted background (visible when not focused) */}
        {!isFocused && (
          <pre
            ref={highlightRef}
            className="p-4 overflow-x-auto"
            onClick={() => textareaRef.current?.focus()}
          >
            <code className={`language-${language} hljs text-sm`}>
              {localContent || '// Click to start typing...'}
            </code>
          </pre>
        )}

        {/* Editable textarea (always present, visible when focused) */}
        <textarea
          ref={textareaRef}
          value={localContent}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={readOnly}
          className={`
            absolute inset-0 w-full h-full p-4 font-mono text-sm text-gray-100 bg-transparent
            resize-none focus:outline-none
            ${isFocused ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            tabSize: 2,
            lineHeight: '1.5',
            caretColor: '#fff',
          }}
          spellCheck={false}
          placeholder="// Enter your code here..."
        />

        {/* Show textarea when focused for proper editing */}
        {isFocused && (
          <div className="p-4 font-mono text-sm text-transparent whitespace-pre-wrap" style={{ lineHeight: '1.5' }}>
            {localContent || ' '}
          </div>
        )}
      </div>
    </div>
  );
}

export default CodeBlock;
