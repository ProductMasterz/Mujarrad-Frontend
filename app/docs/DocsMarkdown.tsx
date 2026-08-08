'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Mermaid } from './Mermaid';
import { slugify } from './markdown-utils';

/** Recursively collect raw text from a hast node (used for mermaid source). */
function hastToText(node: any): string {
  if (!node) return '';
  if (node.type === 'text') return node.value ?? '';
  if (Array.isArray(node.children)) return node.children.map(hastToText).join('');
  return '';
}

/** Recursively collect visible text from React children (used for heading ids). */
function childrenToText(children: React.ReactNode): string {
  if (children == null) return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(childrenToText).join('');
  if (React.isValidElement(children)) return childrenToText((children.props as any).children);
  return '';
}

function makeHeading(tag: 'h2' | 'h3' | 'h4') {
  const Heading = ({ node, children, ...props }: any) => {
    const id = slugify(childrenToText(children));
    return React.createElement(tag, { id, 'data-heading': '', ...props }, children);
  };
  Heading.displayName = `DocsHeading_${tag}`;
  return Heading;
}

const components: Components = {
  h2: makeHeading('h2'),
  h3: makeHeading('h3'),
  h4: makeHeading('h4'),
  // Intercept ```mermaid fenced blocks at the <pre> level and render a diagram.
  pre: ({ node, children, ...props }: any) => {
    const child = Array.isArray(children) ? children[0] : children;
    const className: string = (child && child.props && child.props.className) || '';
    if (typeof className === 'string' && className.includes('language-mermaid')) {
      const source = hastToText(child.props.node);
      return <Mermaid chart={source} />;
    }
    return <pre {...props}>{children}</pre>;
  },
  a: ({ node, href, children, ...props }: any) => {
    const external = typeof href === 'string' && /^https?:\/\//i.test(href);
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} {...props}>
        {children}
      </a>
    );
  },
};

export function DocsMarkdown({ content }: { content: string }) {
  return (
    <div className="docs-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
