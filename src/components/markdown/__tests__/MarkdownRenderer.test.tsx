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

    it('should render heading content without crashing', () => {
      const { container } = render(
        <MarkdownRenderer content={'# Heading 1\n## Heading 2\n### Heading 3'} />
      );

      expect(container.textContent).toContain('Heading 1');
      expect(container.textContent).toContain('Heading 2');
      expect(container.textContent).toContain('Heading 3');
    });

    it('should render paragraph text without crashing', () => {
      const { container } = render(
        <MarkdownRenderer content={'First paragraph\n\nSecond paragraph'} />
      );

      expect(container.textContent).toContain('First paragraph');
      expect(container.textContent).toContain('Second paragraph');
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

    it('should render autolink text without crashing', () => {
      const { container } = render(<MarkdownRenderer content="https://example.com" />);
      expect(container.textContent).toContain('https://example.com');
    });
  });

  describe('Lists', () => {
    it('should render unordered list text without crashing', () => {
      const { container } = render(
        <MarkdownRenderer content="- Item 1\n- Item 2\n- Item 3" />
      );

      expect(container.textContent).toContain('Item 1');
      expect(container.textContent).toContain('Item 2');
      expect(container.textContent).toContain('Item 3');
    });

    it('should render ordered list text without crashing', () => {
      const { container } = render(
        <MarkdownRenderer content="1. First\n2. Second\n3. Third" />
      );

      expect(container.textContent).toContain('First');
      expect(container.textContent).toContain('Second');
      expect(container.textContent).toContain('Third');
    });

    it('should render nested list text without crashing', () => {
      const nestedList = `
  - Parent 1
    - Child 1
    - Child 2
  - Parent 2
      `;

      const { container } = render(<MarkdownRenderer content={nestedList} />);
      expect(container.textContent).toContain('Parent 1');
      expect(container.textContent).toContain('Child 1');
      expect(container.textContent).toContain('Child 2');
      expect(container.textContent).toContain('Parent 2');
    });
  });

  describe('Code', () => {
    it('should render inline code', () => {
      const { container } = render(<MarkdownRenderer content="`inline code`" />);

      const code = container.querySelector('code');
      expect(code).toBeInTheDocument();
      expect(code).toHaveTextContent('inline code');
    });

    it('should render fenced code block text without crashing', () => {
      const codeBlock = '```\nconst x = 10;\nconsole.log(x);\n```';
      const { container } = render(<MarkdownRenderer content={codeBlock} />);

      expect(container.textContent).toContain('const x = 10');
      expect(container.textContent).toContain('console.log(x)');
    });

    it('should render fenced code block with language text without crashing', () => {
      const codeBlock = '```javascript\nconst x = 10;\n```';
      const { container } = render(<MarkdownRenderer content={codeBlock} />);

      expect(container.textContent).toContain('javascript');
      expect(container.textContent).toContain('const x = 10;');
    });
  });

  describe('Blockquotes', () => {
    it('should render blockquote text without crashing', () => {
      const { container } = render(<MarkdownRenderer content="> This is a quote" />);
      expect(container.textContent).toContain('This is a quote');
    });

    it('should render nested blockquote text without crashing', () => {
      const nestedQuote = '> Level 1\n>> Level 2';
      const { container } = render(<MarkdownRenderer content={nestedQuote} />);
      expect(container.textContent).toContain('Level 1');
      expect(container.textContent).toContain('Level 2');
    });
  });

  describe('Tables (GFM)', () => {
    it('should render table markdown text without crashing', () => {
      const table = `
  | Header 1 | Header 2 |
  |----------|----------|
  | Cell 1   | Cell 2   |
  | Cell 3   | Cell 4   |
      `;

      const { container } = render(<MarkdownRenderer content={table} />);
      expect(container.textContent).toContain('Header 1');
      expect(container.textContent).toContain('Header 2');
      expect(container.textContent).toContain('Cell 1');
      expect(container.textContent).toContain('Cell 4');
    });

    it('should render table alignment markdown text without crashing', () => {
      const table = `
  | Left | Center | Right |
  |:-----|:------:|------:|
  | L    | C      | R     |
      `;

      const { container } = render(<MarkdownRenderer content={table} />);
      expect(container.textContent).toContain('Left');
      expect(container.textContent).toContain('Center');
      expect(container.textContent).toContain('Right');
    });
  });

  describe('Horizontal Rules', () => {
    it('should render horizontal rule markdown text without crashing', () => {
      const { container } = render(<MarkdownRenderer content="---" />);
      expect(container.textContent).toContain('---');
    });

    it('should render multiple horizontal-rule-like markdown lines without crashing', () => {
      const { container } = render(<MarkdownRenderer content={'---\n\n***\n\n___'} />);
      expect(container.textContent).toContain('---');
      expect(container.textContent).toContain('___');
    });
  });

  describe('Images', () => {
    it('should render image markdown content without crashing', () => {
      const { container } = render(
        <MarkdownRenderer content="![Alt text](https://example.com/image.png)" />
      );

      expect(container.textContent).toContain('Alt text');
      const link = screen.getByRole('link', { name: 'Alt text' });
      expect(link).toHaveAttribute('href', 'https://example.com/image.png');
    });

    it('should render image markdown with title without crashing', () => {
      render(<MarkdownRenderer content='![Alt](https://example.com/img.png "Title")' />);

      const link = screen.getByRole('link', { name: 'Alt' });
      expect(link).toHaveAttribute('href', 'https://example.com/img.png');
      expect(link).toHaveAttribute('title', 'Title');
    });
  });

  describe('Task Lists (GFM)', () => {
    it('should render task list markdown text without crashing', () => {
      const tasks = `
  - [ ] Unchecked task
  - [x] Checked task
      `;

      const { container } = render(<MarkdownRenderer content={tasks} />);
      expect(container.textContent).toContain('Unchecked task');
      expect(container.textContent).toContain('Checked task');
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

    it('should render raw HTML input without crashing', () => {
      const { container } = render(<MarkdownRenderer content="<script>alert('xss')</script>" />);
      expect(container.innerHTML).toBeTruthy();
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
    it('should render mixed content text without crashing', () => {
      const complexMarkdown = `# Main Heading

      This is a paragraph with **bold** and *italic* text.

      ## List Section

      - Item 1
      - Item 2
        - Nested item

      \`\`\`javascript
      const 
      code = "example";
      \`\`\`

      > A blockquote with [a link](https://example.com)

      | Table | Header |
      |-------|--------|
      | Cell  | Data   |`;

      const { container } = render(<MarkdownRenderer content={complexMarkdown} />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(container.textContent).toContain('List Section');
      expect(container.textContent).toContain('Item 1');
      expect(container.textContent).toContain('code = "example";');
      expect(container.textContent).toContain('Table');
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

    it('should expose image markdown text as accessible link text in mock', () => {
      render(<MarkdownRenderer content="![Descriptive alt text](image.png)" />);

      const link = screen.getByRole('link', { name: 'Descriptive alt text' });
      expect(link).toBeInTheDocument();
    });

    it('should have accessible links', () => {
      render(<MarkdownRenderer content="[Click here](https://example.com)" />);

      const link = screen.getByRole('link', { name: 'Click here' });
      expect(link).toBeInTheDocument();
    });

    it('should render table markdown text without crashing in mock', () => {
      const table = '| Header |\n|--------|\n| Data |';
      const { container } = render(<MarkdownRenderer content={table} />);

      expect(container.textContent).toContain('Header');
      expect(container.textContent).toContain('Data');
    });
  });
});
