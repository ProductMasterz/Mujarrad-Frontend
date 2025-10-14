/**
 * Markdown Component Types
 * Feature: 006-markdown-features-start
 *
 * Type definitions for markdown rendering and editing components.
 */

import { Components } from 'react-markdown';

/**
 * Props for MarkdownRenderer component
 */
export interface MarkdownRendererProps {
  /**
   * Markdown content to render
   */
  content: string;

  /**
   * Optional CSS class for the container
   */
  className?: string;

  /**
   * Optional custom components for markdown elements
   */
  components?: Partial<Components>;
}

/**
 * Props for MarkdownEditor component
 */
export interface MarkdownEditorProps {
  /**
   * Current markdown value
   */
  value: string;

  /**
   * Callback when content changes
   */
  onChange: (value: string) => void;

  /**
   * Placeholder text for empty editor
   */
  placeholder?: string;

  /**
   * Maximum character limit (default: 50000)
   */
  maxLength?: number;

  /**
   * Whether editor is disabled
   */
  disabled?: boolean;

  /**
   * Optional CSS class for container
   */
  className?: string;

  /**
   * Show character count (default: true)
   */
  showCharCount?: boolean;

  /**
   * Initial tab ('edit' or 'preview')
   */
  initialTab?: 'edit' | 'preview';
}

/**
 * Supported languages for syntax highlighting
 */
export type CodeHighlightLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown';

/**
 * Configuration for code block syntax highlighting
 */
export interface CodeHighlightConfig {
  /**
   * Theme to use for highlighting
   */
  theme: 'github-dark' | 'github-light' | 'monokai' | 'solarized-dark';

  /**
   * Languages to enable (subset for smaller bundle)
   */
  languages: CodeHighlightLanguage[];

  /**
   * Show line numbers in code blocks
   */
  showLineNumbers?: boolean;
}

/**
 * Global markdown rendering configuration
 */
export interface MarkdownConfig {
  /**
   * Enable GitHub Flavored Markdown
   */
  gfm: boolean;

  /**
   * Enable syntax highlighting
   */
  syntaxHighlight: boolean;

  /**
   * Code highlight configuration
   */
  codeConfig: CodeHighlightConfig;

  /**
   * Link behavior
   */
  linkTarget: '_blank' | '_self';

  /**
   * Add noopener noreferrer to external links
   */
  safeLinks: boolean;

  /**
   * Allow raw HTML in markdown (default: false for security)
   */
  allowHtml: boolean;
}
