/**
 * MarkdownEditor Component
 * Feature: 006-markdown-features-start
 *
 * Markdown editor with Edit/Preview tabs and character counter
 */

'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { MarkdownEditorProps } from '@/types/markdown';
import { MarkdownRenderer } from './MarkdownRenderer';

// Dynamically import the editor to reduce initial bundle size
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md" />
    ),
  }
);

/**
 * MarkdownEditor component
 * Provides tabbed interface for editing markdown with live preview
 */
export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your content in markdown...',
  maxLength = 50000,
  disabled = false,
  className = '',
  showCharCount = true,
  initialTab = 'edit',
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>(initialTab);
  const charCount = value.length;
  const isNearLimit = charCount >= maxLength * 0.9;
  const isOverLimit = charCount > maxLength;

  const handleChange = useCallback(
    (newValue: string | undefined) => {
      const val = newValue || '';
      // Prevent input if over limit
      if (val.length <= maxLength) {
        onChange(val);
      }
    },
    [onChange, maxLength]
  );

  return (
    <div className="markdown-editor-container" data-color-mode="light">
      <div className="flex border-b border-gray-200 mb-2 bg-white">
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          className={activeTab === 'edit' ? 'px-4 py-2 text-sm font-medium border-b-2 border-blue-500 text-blue-600' : 'px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700'}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={activeTab === 'preview' ? 'px-4 py-2 text-sm font-medium border-b-2 border-blue-500 text-blue-600' : 'px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700'}
        >
          Preview
        </button>
      </div>

      {activeTab === 'edit' ? (
        <div className="relative" data-color-mode="light">
          <MDEditor
            value={value}
            onChange={handleChange}
            preview="edit"
            hideToolbar={false}
            visibleDragbar={false}
            height={400}
            textareaProps={{
              placeholder,
              disabled,
            }}
            data-color-mode="light"
          />
        </div>
      ) : (
        <div className="min-h-[400px] border border-gray-200 rounded-md p-4 bg-white">
          {value ? (
            <MarkdownRenderer content={value} className="prose max-w-none" />
          ) : (
            <p className="text-gray-400 italic">Nothing to preview</p>
          )}
        </div>
      )}

      {showCharCount && (
        <div className={isOverLimit ? 'text-xs mt-2 text-right text-red-600 font-semibold' : isNearLimit ? 'text-xs mt-2 text-right text-yellow-600' : 'text-xs mt-2 text-right text-gray-500'}>
          {charCount.toLocaleString()} / {maxLength.toLocaleString()} characters
          {isNearLimit && !isOverLimit && ' (approaching limit)'}
          {isOverLimit && ' (limit exceeded)'}
        </div>
      )}
    </div>
  );
};
