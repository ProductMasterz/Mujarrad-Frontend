/**
 * MarkdownRenderer component
 * Renders markdown with wiki-link support
 */

'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseWikiLinks, resolveWikiLinks } from '@/lib/wikilink-parser';
import { WikiLink } from './WikiLink';
import type { Node } from '@/types/backend-dtos';

interface MarkdownRendererProps {
  content: string;
  workspaceSlug: string;
  availableNodes: Node[];
  onWikiLinkClick?: (targetTitle: string) => void;
}

/**
 * MarkdownRenderer component
 * Parses markdown, extracts wiki-links, and renders with custom components
 */
export function MarkdownRenderer({
  content,
  workspaceSlug,
  availableNodes,
  onWikiLinkClick,
}: MarkdownRendererProps) {
  // Parse and resolve wiki-links
  const { processedContent, wikiLinksMap } = useMemo(() => {
    const wikiLinks = parseWikiLinks(content);
    const resolutions = resolveWikiLinks(wikiLinks, availableNodes);

    // Create map for quick lookup
    const map = new Map(
      resolutions.map(r => [r.link.raw, r])
    );

    // Replace wiki-links with custom markers
    let processed = content;
    resolutions.forEach((resolution, index) => {
      const marker = `__WIKILINK_${index}__`;
      processed = processed.replace(resolution.link.raw, marker);
    });

    return { processedContent: processed, wikiLinksMap: map };
  }, [content, availableNodes]);

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom renderer for text nodes to handle wiki-links
          p: ({ children }) => {
            return <p>{processChildren(children)}</p>;
          },
          li: ({ children }) => {
            return <li>{processChildren(children)}</li>;
          },
          h1: ({ children }) => {
            return <h1>{processChildren(children)}</h1>;
          },
          h2: ({ children }) => {
            return <h2>{processChildren(children)}</h2>;
          },
          h3: ({ children }) => {
            return <h3>{processChildren(children)}</h3>;
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );

  function processChildren(children: React.ReactNode): React.ReactNode {
    return React.Children.map(children, child => {
      if (typeof child === 'string') {
        // Check if string contains wiki-link markers
        const parts = child.split(/(__WIKILINK_\d+__)/g);
        return parts.map((part, index) => {
          const match = part.match(/^__WIKILINK_(\d+)__$/);
          if (match) {
            // Find the wiki-link in our map
            const wikiLinkIndex = parseInt(match[1], 10);
            const resolutionArray = Array.from(wikiLinksMap.values());
            const resolution = resolutionArray[wikiLinkIndex];

            if (resolution) {
              return (
                <WikiLink
                  key={`wikilink-${index}`}
                  targetTitle={resolution.link.targetTitle}
                  displayText={resolution.link.displayText}
                  targetNodeId={resolution.targetNodeId}
                  workspaceSlug={workspaceSlug}
                  onClick={onWikiLinkClick}
                />
              );
            }
          }
          return part;
        });
      }
      return child;
    });
  }
}
