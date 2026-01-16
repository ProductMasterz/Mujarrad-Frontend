/**
 * MarkdownRenderer Component
 * Feature: 006-markdown-features-start
 *
 * Renders markdown content with GFM support and syntax highlighting
 */

'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { MarkdownRendererProps } from '@/types/markdown';
import { sanitizeUrl, isExternalUrl } from '@/lib/markdown/sanitize';

/**
 * MarkdownRenderer component
 * Displays formatted markdown content with XSS protection
 */
export const MarkdownRenderer = React.memo(({ content, className, components }: MarkdownRendererProps) => {
  return (
    <div className={className || 'markdown-content'}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom link component for XSS protection
          a: ({ node, href, children, ...props }) => {
            const safeHref = sanitizeUrl(href || '');
            const isExternal = isExternalUrl(safeHref);
            
            return (
              <a
                href={safeHref}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          // Custom image component
          img: ({ node, src, alt, ...props }) => {
            const safeSrc = sanitizeUrl(src || '');
            return (
              <img
                src={safeSrc}
                alt={alt || 'Image'}
                loading="lazy"
                {...props}
              />
            );
          },
          ...components,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';
