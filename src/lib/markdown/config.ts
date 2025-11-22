/**
 * Markdown Configuration
 * Feature: 006-markdown-features-start
 *
 * Configuration for react-markdown with GFM and syntax highlighting
 */

import type { MarkdownConfig, CodeHighlightConfig } from '@/types/markdown';

/**
 * Default code highlight configuration
 */
export const defaultCodeConfig: CodeHighlightConfig = {
  theme: 'github-dark',
  languages: ['javascript', 'typescript', 'python', 'java', 'html', 'css', 'json', 'markdown'],
  showLineNumbers: false,
};

/**
 * Default markdown rendering configuration
 */
export const defaultMarkdownConfig: MarkdownConfig = {
  gfm: true,
  syntaxHighlight: true,
  codeConfig: defaultCodeConfig,
  linkTarget: '_blank',
  safeLinks: true,
  allowHtml: false, // Security: block raw HTML
};
