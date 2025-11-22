/**
 * Tests for MarkdownRenderer Component
 * Feature: 006-markdown-features-start
 */

import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from '../MarkdownRenderer';

// Mock react-markdown to avoid ESM module issues in Jest
jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children }: { children: string }) {
    // Simple mock that just renders the markdown as HTML-like structure
    const content = children || '';

    // Parse headings
    if (content.match(/^#{1,6}\s/m)) {
      const lines = content.split('\n');
      return (
        <div>
          {lines.map((line, i) => {
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headingMatch) {
              const level = headingMatch[1].length;
              const text = headingMatch[2];
              const Tag = `h${level}` as any;
              return <Tag key={i}>{text}</Tag>;
            }
            if (line.trim()) {
              return <p key={i}>{line}</p>;
            }
            return null;
          })}
        </div>
      );
    }

    // Parse bold text
    const boldParsed = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Parse italic text
    const italicParsed = boldParsed.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Parse strikethrough
    const strikethroughParsed = italicParsed.replace(/~~(.+?)~~/g, '<del>$1</del>');
    // Parse inline code
    const codeParsed = strikethroughParsed.replace(/`(.+?)`/g, '<code>$1</code>');
    // Parse links
    const linkParsed = codeParsed.replace(/\[(.+?)\]\((.+?)(?:\s+"(.+?)")?\)/g, '<a href="$2" title="$3">$1</a>');
    // Parse images
    const imgParsed = linkParsed.replace(/!\[(.+?)\]\((.+?)(?:\s+"(.+?)")?\)/g, '<img src="$2" alt="$1" title="$3" />');

    return <div dangerouslySetInnerHTML={{ __html: imgParsed }} />;
  };
});

jest.mock('remark-gfm', () => () => {});
jest.mock('rehype-highlight', () => () => {});

describe('MarkdownRenderer', () => {
  describe('Basic Rendering', () => {
    it('should render plain text', () => {
      const { container } = render(<MarkdownRenderer content="Hello World" />);
      expect(container.textContent).toContain('Hello World');
    });

    it('should render headings', () => {
      render(<MarkdownRenderer content="# Heading 1\n## Heading 2\n### Heading 3" />);

      expect(screen.getByRole('heading', { level: 1, name: 'Heading 1' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Heading 2' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Heading 3' })).toBeInTheDocument();
    });

    it('should render paragraphs', () => {
      const { container } = render(
        <MarkdownRenderer content="First paragraph\n\nSecond paragraph" />
      );

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs).toHaveLength(2);
      expect(paragraphs[0]).toHaveTextContent('First paragraph');
      expect(paragraphs[1]).toHaveTextContent('Second paragraph');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <MarkdownRenderer content="Test" className="custom-class" />
      );

      const markdown = container.firstChild;
      expect(markdown).toHaveClass('custom-class');
    });
  });

  describe('Text Formatting', () => {
    it('should render bold text', () => {
      const { container } = render(<MarkdownRenderer content="**bold text**" />);

      const strong = container.querySelector('strong');
      expect(strong).toBeInTheDocument();
      expect(strong).toHaveTextContent('bold text');
    });

    it('should render italic text', () => {
      const { container } = render(<MarkdownRenderer content="*italic text*" />);

      const em = container.querySelector('em');
      expect(em).toBeInTheDocument();
      expect(em).toHaveTextContent('italic text');
    });

    it('should render strikethrough text', () => {
      const { container } = render(<MarkdownRenderer content="~~strikethrough~~" />);

      const del = container.querySelector('del');
      expect(del).toBeInTheDocument();
      expect(del).toHaveTextContent('strikethrough');
    });

    it('should render combined formatting', () => {
      const { container } = render(
        <MarkdownRenderer content="**bold** and *italic* and ~~strikethrough~~" />
      );

      expect(container.querySelector('strong')).toHaveTextContent('bold');
      expect(container.querySelector('em')).toHaveTextContent('italic');
      expect(container.querySelector('del')).toHaveTextContent('strikethrough');
    });
  });

  describe('Links', () => {
    it('should render links', () => {
      render(<MarkdownRenderer content="[Link text](https://example.com)" />);

      const link = screen.getByRole('link', { name: 'Link text' });
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('should render links with titles', () => {
      render(<MarkdownRenderer content='[Link](https://example.com "Link title")' />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('title', 'Link title');
    });

    it('should render autolinks', () => {
      render(<MarkdownRenderer content="https://example.com" />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com');
    });
  });

  describe('Lists', () => {
    it('should render unordered lists', () => {
      render(<MarkdownRenderer content="- Item 1\n- Item 2\n- Item 3" />);

      const list = screen.getByRole('list');
      expect(list.tagName).toBe('UL');

      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent('Item 1');
      expect(items[1]).toHaveTextContent('Item 2');
      expect(items[2]).toHaveTextContent('Item 3');
    });

    it('should render ordered lists', () => {
      render(<MarkdownRenderer content="1. First\n2. Second\n3. Third" />);

      const list = screen.getByRole('list');
      expect(list.tagName).toBe('OL');

      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
    });

    it('should render nested lists', () => {
      const nestedList = `
- Parent 1
  - Child 1
  - Child 2
- Parent 2
      `;

      const { container } = render(<MarkdownRenderer content={nestedList} />);

      const lists = container.querySelectorAll('ul');
      expect(lists.length).toBeGreaterThan(1); // At least one nested list
    });
  });

  describe('Code', () => {
    it('should render inline code', () => {
      const { container } = render(<MarkdownRenderer content="`inline code`" />);

      const code = container.querySelector('code');
      expect(code).toBeInTheDocument();
      expect(code).toHaveTextContent('inline code');
    });

    it('should render code blocks', () => {
      const codeBlock = '```\nconst x = 10;\nconsole.log(x);\n```';
      const { container } = render(<MarkdownRenderer content={codeBlock} />);

      const pre = container.querySelector('pre');
      expect(pre).toBeInTheDocument();

      const code = pre?.querySelector('code');
      expect(code).toBeInTheDocument();
      expect(code?.textContent).toContain('const x = 10');
    });

    it('should render code blocks with language', () => {
      const codeBlock = '```javascript\nconst x = 10;\n```';
      const { container } = render(<MarkdownRenderer content={codeBlock} />);

      const code = container.querySelector('code');
      expect(code).toHaveClass('language-javascript');
    });

    it('should render code blocks with syntax highlighting', () => {
      const codeBlock = '```typescript\ninterface User {\n  id: number;\n}\n```';
      const { container } = render(<MarkdownRenderer content={codeBlock} />);

      const code = container.querySelector('code');
      expect(code).toHaveClass('language-typescript');
    });
  });

  describe('Blockquotes', () => {
    it('should render blockquotes', () => {
      const { container } = render(<MarkdownRenderer content="> This is a quote" />);

      const blockquote = container.querySelector('blockquote');
      expect(blockquote).toBeInTheDocument();
      expect(blockquote).toHaveTextContent('This is a quote');
    });

    it('should render nested blockquotes', () => {
      const nestedQuote = '> Level 1\n>> Level 2';
      const { container } = render(<MarkdownRenderer content={nestedQuote} />);

      const blockquotes = container.querySelectorAll('blockquote');
      expect(blockquotes.length).toBeGreaterThan(0);
    });
  });

  describe('Tables (GFM)', () => {
    it('should render tables', () => {
      const table = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
      `;

      render(<MarkdownRenderer content={table} />);

      const tableElement = screen.getByRole('table');
      expect(tableElement).toBeInTheDocument();

      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(2);
      expect(headers[0]).toHaveTextContent('Header 1');
      expect(headers[1]).toHaveTextContent('Header 2');

      const cells = screen.getAllByRole('cell');
      expect(cells.length).toBeGreaterThanOrEqual(4);
    });

    it('should render table alignment', () => {
      const table = `
| Left | Center | Right |
|:-----|:------:|------:|
| L    | C      | R     |
      `;

      const { container } = render(<MarkdownRenderer content={table} />);

      const tableElement = container.querySelector('table');
      expect(tableElement).toBeInTheDocument();
    });
  });

  describe('Horizontal Rules', () => {
    it('should render horizontal rules', () => {
      const { container } = render(<MarkdownRenderer content="---" />);

      const hr = container.querySelector('hr');
      expect(hr).toBeInTheDocument();
    });

    it('should render multiple horizontal rules', () => {
      const { container } = render(<MarkdownRenderer content="---\n\n***\n\n___" />);

      const hrs = container.querySelectorAll('hr');
      expect(hrs).toHaveLength(3);
    });
  });

  describe('Images', () => {
    it('should render images', () => {
      render(<MarkdownRenderer content="![Alt text](https://example.com/image.png)" />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'https://example.com/image.png');
      expect(img).toHaveAttribute('alt', 'Alt text');
    });

    it('should render images with titles', () => {
      render(<MarkdownRenderer content='![Alt](https://example.com/img.png "Title")' />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('title', 'Title');
    });
  });

  describe('Task Lists (GFM)', () => {
    it('should render task lists', () => {
      const tasks = `
- [ ] Unchecked task
- [x] Checked task
      `;

      const { container } = render(<MarkdownRenderer content={tasks} />);

      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes).toHaveLength(2);
      expect(checkboxes[0]).not.toBeChecked();
      expect(checkboxes[1]).toBeChecked();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const { container } = render(<MarkdownRenderer content="" />);
      expect(container.textContent).toBe('');
    });

    it('should handle null content', () => {
      const { container } = render(<MarkdownRenderer content={null as any} />);
      expect(container.textContent).toBe('');
    });

    it('should handle undefined content', () => {
      const { container } = render(<MarkdownRenderer content={undefined as any} />);
      expect(container.textContent).toBe('');
    });

    it('should escape HTML tags', () => {
      const { container } = render(<MarkdownRenderer content="<script>alert('xss')</script>" />);

      // HTML should be escaped, not rendered
      const script = container.querySelector('script');
      expect(script).not.toBeInTheDocument();
      expect(container.textContent).toContain('script');
    });

    it('should handle malformed markdown gracefully', () => {
      const malformed = '**unclosed bold\n##incomplete heading';
      const { container } = render(<MarkdownRenderer content={malformed} />);

      // Should render something without crashing
      expect(container.textContent).toBeTruthy();
    });

    it('should handle very long content', () => {
      const longContent = 'a'.repeat(10000);
      const { container } = render(<MarkdownRenderer content={longContent} />);

      expect(container.textContent).toContain('a');
    });

    it('should handle special characters', () => {
      const special = '& < > " \' @ # $ % ^ * ( ) { } [ ] | \\ / ?';
      const { container } = render(<MarkdownRenderer content={special} />);

      expect(container.textContent).toContain('&');
      expect(container.textContent).toContain('<');
      expect(container.textContent).toContain('>');
    });
  });

  describe('Complex Markdown', () => {
    it('should render mixed content correctly', () => {
      const complexMarkdown = `
# Main Heading

This is a paragraph with **bold** and *italic* text.

## List Section

- Item 1
- Item 2
  - Nested item

\`\`\`javascript
const code = "example";
\`\`\`

> A blockquote with [a link](https://example.com)

| Table | Header |
|-------|--------|
| Cell  | Data   |
      `;

      const { container } = render(<MarkdownRenderer content={complexMarkdown} />);

      // Verify various elements are present
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(container.querySelector('strong')).toBeInTheDocument();
      expect(container.querySelector('em')).toBeInTheDocument();
      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(container.querySelector('pre')).toBeInTheDocument();
      expect(container.querySelector('blockquote')).toBeInTheDocument();
      expect(screen.getByRole('link')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const headings = `
# H1
## H2
### H3
#### H4
##### H5
###### H6
      `;

      render(<MarkdownRenderer content={headings} />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 5 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 6 })).toBeInTheDocument();
    });

    it('should have alt text on images', () => {
      render(<MarkdownRenderer content="![Descriptive alt text](image.png)" />);

      const img = screen.getByRole('img');
      expect(img).toHaveAccessibleName('Descriptive alt text');
    });

    it('should have accessible links', () => {
      render(<MarkdownRenderer content="[Click here](https://example.com)" />);

      const link = screen.getByRole('link', { name: 'Click here' });
      expect(link).toBeInTheDocument();
    });

    it('should have accessible tables', () => {
      const table = '| Header |\n|--------|\n| Data |';
      render(<MarkdownRenderer content={table} />);

      const tableElement = screen.getByRole('table');
      const header = screen.getByRole('columnheader');

      expect(tableElement).toBeInTheDocument();
      expect(header).toBeInTheDocument();
    });
  });
});
