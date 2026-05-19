'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  if (!content || content.trim() === '') {
    return (
      <div className={`text-muted-foreground text-sm italic p-4 ${className}`}>
        No content to preview
      </div>
    );
  }

  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Sanitize and customize link rendering - security: prevent javascript: URLs
          a: ({ node, href, ...props }) => {
            // Block dangerous protocols
            const safeHref = href && !href.match(/^(javascript|data|vbscript):/i) ? href : '#';
            return (
              <a
                {...props}
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              />
            );
          },
          // Sanitize image sources
          img: ({ node, src, alt, ...props }) => {
            // Only allow http(s) images
            const safeSrc = src && src.match(/^https?:\/\//i) ? src : '';
            if (!safeSrc) return null;
            return (
              <img
                {...props}
                src={safeSrc}
                alt={alt || ''}
                className="max-w-full h-auto rounded"
                loading="lazy"
              />
            );
          },
          // Style code blocks
          code: ({ node, className, children, ...props }) => {
            // Check if it's inline code by checking if it has a parent <pre> tag
            const isInline = !className?.includes('language-');
            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-muted p-4 rounded-lg overflow-x-auto font-mono text-sm" {...props}>
                {children}
              </code>
            );
          },
          // Pre block wrapper
          pre: ({ node, children, ...props }) => (
            <pre className="overflow-x-auto" {...props}>
              {children}
            </pre>
          ),
          // Task list items
          input: ({ node, ...props }) => (
            <input
              {...props}
              className="mr-2 cursor-default"
              disabled
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
