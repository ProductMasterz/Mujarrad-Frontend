import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { WikiLink } from '@/components/markdown/WikiLink';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-markdown', () => {
  return function MockReactMarkdown({
    children,
    components = {},
  }: {
    children: string;
    components?: Record<string, React.ComponentType<any>>;
  }) {
    const content = children || '';

    const renderInline = (text: string) => {
      const nodes: React.ReactNode[] = [];
      let remaining = text;
      let key = 0;

      while (remaining.length > 0) {
        const imageMatch = remaining.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
        const inlineCodeMatch = remaining.match(/`([^`]+)`/);
        const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
        const italicMatch = remaining.match(/\*([^*]+)\*/);
        const strikeMatch = remaining.match(/~~([^~]+)~~/);

        const matches = [
          imageMatch && { type: 'img', match: imageMatch },
          linkMatch && { type: 'a', match: linkMatch },
          inlineCodeMatch && { type: 'code', match: inlineCodeMatch },
          boldMatch && { type: 'strong', match: boldMatch },
          italicMatch && { type: 'em', match: italicMatch },
          strikeMatch && { type: 'del', match: strikeMatch },
        ]
          .filter(Boolean)
          .map((m: any) => ({
            type: m.type,
            match: m.match,
            index: m.match.index ?? 0,
          }))
          .sort((a, b) => a.index - b.index);

        const first = matches[0];
        if (!first) {
          nodes.push(remaining);
          break;
        }

        if (first.index > 0) {
          nodes.push(remaining.slice(0, first.index));
        }

        const full = first.match[0];

        if (first.type === 'img') {
          const Img = components.img || 'img';
          nodes.push(
            <Img key={key++} src={first.match[2]} alt={first.match[1]}>
              {null}
            </Img>
          );
        } else if (first.type === 'a') {
          const A = components.a || 'a';
          nodes.push(
            <A key={key++} href={first.match[2]}>
              {first.match[1]}
            </A>
          );
        } else if (first.type === 'code') {
          nodes.push(<code key={key++}>{first.match[1]}</code>);
        } else if (first.type === 'strong') {
          nodes.push(<strong key={key++}>{first.match[1]}</strong>);
        } else if (first.type === 'em') {
          nodes.push(<em key={key++}>{first.match[1]}</em>);
        } else if (first.type === 'del') {
          nodes.push(<del key={key++}>{first.match[1]}</del>);
        }

        remaining = remaining.slice(first.index + full.length);
      }

      return nodes;
    };

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (!line.trim()) {
        i++;
        continue;
      }

      if (/^### /.test(line)) {
        elements.push(<h3 key={i}>{line.replace(/^### /, '')}</h3>);
        i++;
        continue;
      }

      if (/^## /.test(line)) {
        elements.push(<h2 key={i}>{line.replace(/^## /, '')}</h2>);
        i++;
        continue;
      }

      if (/^# /.test(line)) {
        elements.push(<h1 key={i}>{line.replace(/^# /, '')}</h1>);
        i++;
        continue;
      }

      if (/^> /.test(line)) {
        elements.push(<blockquote key={i}>{line.replace(/^> /, '')}</blockquote>);
        i++;
        continue;
      }

      if (/^---$/.test(line.trim())) {
        elements.push(<hr key={i} />);
        i++;
        continue;
      }

      if (/^```/.test(line)) {
        const lang = line.replace(/^```/, '').trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) {
          codeLines.push(lines[i]);
          i++;
        }
        i++;
        elements.push(
          <pre key={i}>
            <code className={lang ? `language-${lang}` : undefined}>
              {codeLines.join('\n')}
            </code>
          </pre>
        );
        continue;
      }

      if (/^\|/.test(line) && i + 2 < lines.length && /^\|[-| ]+\|?$/.test(lines[i + 1])) {
        const headers = line.split('|').map(s => s.trim()).filter(Boolean);
        const row = lines[i + 2].split('|').map(s => s.trim()).filter(Boolean);

        elements.push(
          <table key={i}>
            <thead>
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {row.map((c, idx) => (
                  <td key={idx}>{c}</td>
                ))}
              </tr>
            </tbody>
          </table>
        );
        i += 3;
        continue;
      }

      if (/^\d+\. /.test(line)) {
        const items: string[] = [];
        while (i < lines.length && /^\d+\. /.test(lines[i])) {
          items.push(lines[i].replace(/^\d+\. /, ''));
          i++;
        }

        elements.push(
          <ol key={i}>
            {items.map((item, idx) => (
              <li key={idx}>{renderInline(item)}</li>
            ))}
          </ol>
        );
        continue;
      }

      if (/^- \[[x ]\] /.test(line)) {
        const items: { text: string; checked: boolean }[] = [];
        while (i < lines.length && /^- \[[x ]\] /.test(lines[i])) {
          const checked = /^- \[x\] /.test(lines[i]);
          const text = lines[i].replace(/^- \[[x ]\] /, '');
          items.push({ text, checked });
          i++;
        }

        elements.push(
          <ul key={i}>
            {items.map((item, idx) => (
              <li key={idx}>
                <input type="checkbox" checked={item.checked} readOnly />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      if (/^- /.test(line)) {
        const items: string[] = [];
        while (i < lines.length && /^- /.test(lines[i])) {
          items.push(lines[i].replace(/^- /, ''));
          i++;
        }

        elements.push(
          <ul key={i}>
            {items.map((item, idx) => (
              <li key={idx}>{renderInline(item)}</li>
            ))}
          </ul>
        );
        continue;
      }

      elements.push(<p key={i}>{renderInline(line)}</p>);
      i++;
    }

    return <div>{elements}</div>;
  };
});

jest.mock('remark-gfm', () => () => {});
jest.mock('rehype-highlight', () => () => {});

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('Markdown Rendering Integration Tests', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    } as any);
  });

  describe('T043: MarkdownRenderer displays formatted content', () => {
    it('should render headings correctly', () => {
      const markdown = '# Heading 1\n## Heading 2\n### Heading 3';
      render(<MarkdownRenderer content={markdown} />);

      expect(screen.getByRole('heading', { level: 1, name: 'Heading 1' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Heading 2' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Heading 3' })).toBeInTheDocument();
    });

    it('should render bold text', () => {
      const markdown = 'This is **bold text** here.';
      render(<MarkdownRenderer content={markdown} />);

      const boldElement = screen.getByText('bold text');
      expect(boldElement.tagName).toBe('STRONG');
    });

    it('should render italic text', () => {
      const markdown = 'This is *italic text* here.';
      render(<MarkdownRenderer content={markdown} />);

      const italicElement = screen.getByText('italic text');
      expect(italicElement.tagName).toBe('EM');
    });

    it('should render unordered lists', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      render(<MarkdownRenderer content={markdown} />);

      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should render ordered lists', () => {
      const markdown = '1. First\n2. Second\n3. Third';
      render(<MarkdownRenderer content={markdown} />);

      const list = screen.getByRole('list');
      expect(list.tagName).toBe('OL');
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });

    it('should render code blocks', () => {
      const markdown = '```javascript\nconst x = 42;\n```';
      render(<MarkdownRenderer content={markdown} />);

      const codeBlock = screen.getByText(/const x = 42/);
      expect(codeBlock.closest('pre')).toBeInTheDocument();
      expect(codeBlock.closest('code')).toHaveClass('language-javascript');
    });

    it('should render inline code', () => {
      const markdown = 'Use the `console.log()` function.';
      render(<MarkdownRenderer content={markdown} />);

      const inlineCode = screen.getByText('console.log()');
      expect(inlineCode.tagName).toBe('CODE');
    });

    it('should render blockquotes', () => {
      const markdown = '> This is a quote';
      render(<MarkdownRenderer content={markdown} />);

      const quote = screen.getByText('This is a quote');
      expect(quote.closest('blockquote')).toBeInTheDocument();
    });

    it('should render tables (GFM)', () => {
      const markdown = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`;
      render(<MarkdownRenderer content={markdown} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Cell 1')).toBeInTheDocument();
      expect(screen.getByText('Cell 2')).toBeInTheDocument();
    });

    it('should render strikethrough (GFM)', () => {
      const markdown = 'This is ~~deleted~~ text.';
      render(<MarkdownRenderer content={markdown} />);

      const strikethrough = screen.getByText('deleted');
      expect(strikethrough.tagName).toBe('DEL');
    });

    it('should render task lists (GFM)', () => {
      const markdown = '- [x] Completed task\n- [ ] Pending task';
      render(<MarkdownRenderer content={markdown} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(2);
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
    });

    it('should render standard links', () => {
      const markdown = 'Visit [Google](https://google.com)';
      render(<MarkdownRenderer content={markdown} />);

      const link = screen.getByRole('link', { name: 'Google' });
      expect(link).toHaveAttribute('href', 'https://google.com');
    });

    it('should render images', () => {
      const markdown = '![Alt text](https://example.com/image.png)';
      render(<MarkdownRenderer content={markdown} />);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'Alt text');
      expect(image).toHaveAttribute('src', 'https://example.com/image.png');
    });

    it('should render horizontal rules', () => {
      const markdown = 'Above\n\n---\n\nBelow';
      render(<MarkdownRenderer content={markdown} />);

      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('should handle empty content', () => {
      render(<MarkdownRenderer content="" />);

      expect(document.body).toBeInTheDocument();
    });

    it('should handle complex nested markdown', () => {
      const markdown = `# Main Title

## Section 1

This is **bold** and *italic* text.

- List item 1
- List item 2

\`\`\`javascript
const code = "example";
\`\`\`

> A quote here

| Col1 | Col2 |
|------|------|
| Data | More |`;

      render(<MarkdownRenderer content={markdown} />);

      expect(screen.getByRole('heading', { level: 1, name: 'Main Title' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Section 1' })).toBeInTheDocument();
      expect(screen.getByText(/const code/)).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('T044/T045: WikiLink component', () => {
    it('should render wiki-link as clickable element', () => {
      render(
        <WikiLink
          displayText="My Page"
          targetNodeId="node-123"
          spaceSlug="test-ws"
        />
      );

      const link = screen.getByText('My Page');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', '/space/test-ws/node/node-123');
    });

    it('should render target node href correctly', () => {
      const pushMock = jest.fn();
      mockUseRouter.mockReturnValue({
        push: pushMock,
      } as any);

      render(
        <WikiLink
          displayText="Target Page"
          targetNodeId="node-456"
          spaceSlug="my-space"
        />
      );

      const link = screen.getByText('Target Page').closest('a');
      expect(link).toHaveAttribute('href', '/space/my-space/node/node-456');
      expect(pushMock).not.toHaveBeenCalled();
    });

    it('should display alias text but link to target', () => {
      render(
        <WikiLink
          displayText="click here"
          targetNodeId="target-node-id"
          spaceSlug="test-ws"
        />
      );

      const link = screen.getByText('click here');
      expect(link.closest('a')).toHaveAttribute('href', '/space/test-ws/node/target-node-id');
    });

    it('should display same text for non-aliased wiki-links', () => {
      render(
        <WikiLink
          displayText="Page Title"
          targetNodeId="node-same"
          spaceSlug="test-ws"
        />
      );

      expect(screen.getByText('Page Title')).toBeInTheDocument();
    });

    it('should preserve special characters in display text', () => {
      render(
        <WikiLink
          displayText="Page: Notes & Ideas"
          targetNodeId="node-special"
          spaceSlug="test-ws"
        />
      );

      expect(screen.getByText('Page: Notes & Ideas')).toBeInTheDocument();
    });
  });
});