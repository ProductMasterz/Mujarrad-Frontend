/**
 * Markdown Configuration
 * Feature: 006-markdown-features-start
 *
 * Default configuration for markdown rendering and editing.
 */

import { MarkdownConfig } from '@/types/markdown';

/**
 * Default markdown configuration
 * Based on spec clarifications (100% complete specification)
 */
export const defaultMarkdownConfig: MarkdownConfig = {
  gfm: true, // GitHub Flavored Markdown enabled
  syntaxHighlight: true, // Code syntax highlighting enabled
  codeConfig: {
    theme: 'github-dark',
    languages: ['javascript', 'typescript', 'python', 'java', 'html', 'css', 'json', 'markdown'],
    showLineNumbers: false,
  },
  linkTarget: '_blank', // Default to new tab (smart detection applied per-link)
  safeLinks: true, // Add rel="noopener noreferrer" to external links
  allowHtml: false, // Block raw HTML for security (FR-012a)
};

/**
 * Character limit for markdown content
 * From spec clarification #11
 */
export const MARKDOWN_MAX_LENGTH = 50000;

/**
 * Character count warning threshold (90%)
 * From spec FR-014c
 */
export const MARKDOWN_WARNING_THRESHOLD = 45000;
