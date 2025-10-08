import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { WikiLink } from '@/components/markdown/WikiLink';
import { useRouter } from 'next/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

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
      render(<MarkdownRenderer content={markdown} workspaceSlug="test-ws" />);

      expect(screen.getByRole('heading', { level: 1, name: 'Heading 1' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Heading 2' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Heading 3' })).toBeInTheDocument();
    });

    it('should render bold text', () => {
      const markdown = 'This is **bold text** here.';
      render(<MarkdownRenderer content={markdown} workspaceSlug="test-ws" />);

      const boldElement = screen.getByText('bold text');
      expect(boldElement.tagName).toBe('STRONG');
    });

    it('should render italic text', () => {
      const markdown = 'This is *italic text* here.';
      render(<MarkdownRenderer content={markdown} workspaceSlug="test-ws" />);

      const italicElement = screen.getByText('italic text');
      expect(italicElement.tagName).toBe('EM');
    });

    it('should render unordered lists', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      render(<MarkdownRenderer content={markdown} workspaceSlug="test-ws" />);

      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should render ordered lists', () => {
      const markdown = '1. First\n2. Second\n3. Third';
      render(<MarkdownRenderer content={markdown} workspaceSlug="test-ws" />);

      const list = screen.getByRole('list');
      expect(list.tagName).toBe('OL');
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });

    it('should render code blocks', () => {
      const markdown = '```javascript\nconst x = 42;\n```';
      render(<MarkdownRenderer content={markdown} workspaceSlug="test-ws" />);

      const codeBlock = screen.getByText(/const x = 42/);
      expect(codeBlock.closest('pre')).toBeInTheDocument();
      expect(codeBlock.closest('code')).toHaveClass('language-javascript');
    });

    it('should render inline code', () => {
      const markdown = 'Use the `console.log()` function.';
      render(<MarkdownRenderer content={markdown} workspaceSlug="test-ws" />);

      const inlineCode = screen.getByText('console.log()');
      expect(inlineCode.tagName).toBe('CODE');
    });

    it('should render blockquotes', () => {
      const markdown = '> This is a quote';
      render(<MarkdownRenderer content={markdown} workspaceSlug="test-ws" />);

      const quote = screen.getByText('This is a quote');
      expect(quote.closest('blockquote')).toBeInTheDocument();
    });

    it('should render tables (GFM)', () => {
      const markdown = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`;
      render(<MarkdownRenderer content={markdown} workspaceSlug="test-ws" />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByRole('row', { name: /Header 1 Header 2/ })).toBeInTheDocument();
      expect(screen.getByText('Cell 1')).toBeInTheDocument();
    });

    it('should render strikethrough (GFM)', () => {
      const markdown = 'This is ~~deleted~~ text.';
      render(<MarkdownRenderer content={markdown} workspaceSlug="test-ws" />);

      const strikethrough = screen.getByText('deleted');
      expect(strikethrough.tagName).toBe('DEL');
    });

    it('should render task lists (GFM)', () => {
      const markdown = '- [x] Completed task\n- [ ] Pending task';
      render(<MarkdownRenderer content={markdown} workspaceSlug="test-ws" />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(2);
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
    });

    it('should render standard links', () => {
      const markdown = 'Visit [Google](https://google.com)';
      render(<MarkdownRenderer content={markdown} workspaceSlug="test-ws" />);

      const link = screen.getByRole('link', { name: 'Google' });
      expect(link).toHaveAttribute('href', 'https://google.com');
    });

    it('should render images', () => {
      const markdown = '![Alt text](https://example.com/image.png)';
      render(<MarkdownRenderer content={markdown} workspaceSlug="test-ws" />);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'Alt text');
      expect(image).toHaveAttribute('src', 'https://example.com/image.png');
    });

    it('should render horizontal rules', () => {
      const markdown = 'Above\n\n---\n\nBelow';
      render(<MarkdownRenderer content={markdown} workspaceSlug="test-ws" />);

      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('should handle empty content', () => {
      render(<MarkdownRenderer content="" workspaceSlug="test-ws" />);

      expect(screen.getByTestId('markdown-renderer')).toBeEmptyDOMElement();
    });

    it('should handle complex nested markdown', () => {
      const markdown = `# Main Title

## Section 1

This is **bold** and *italic* text.

- List item 1
- List item 2
  - Nested item

\`\`\`javascript
const code = "example";
\`\`\`

> A quote here

| Col1 | Col2 |
|------|------|
| Data | More |`;

      render(<MarkdownRenderer content={markdown} workspaceSlug="test-ws" />);

      expect(screen.getByRole('heading', { level: 1, name: 'Main Title' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Section 1' })).toBeInTheDocument();
      expect(screen.getByText(/const code/)).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('T044: WikiLink component navigates on click', () => {
    it('should render wiki-link as clickable element', () => {
      render(
        <WikiLink
          displayText="My Page"
          targetNodeId="node-123"
          workspaceSlug="test-ws"
        />
      );

      const link = screen.getByText('My Page');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', '/workspace/test-ws/node/node-123');
    });

    it('should navigate to target node on click', () => {
      const pushMock = jest.fn();
      mockUseRouter.mockReturnValue({
        push: pushMock,
      } as any);

      render(
        <WikiLink
          displayText="Target Page"
          targetNodeId="node-456"
          workspaceSlug="my-workspace"
        />
      );

      const link = screen.getByText('Target Page');
      fireEvent.click(link);

      expect(pushMock).toHaveBeenCalledWith('/workspace/my-workspace/node/node-456');
    });

    it('should have distinct styling for wiki-links', () => {
      render(
        <WikiLink
          displayText="Wiki Link"
          targetNodeId="node-789"
          workspaceSlug="test-ws"
        />
      );

      const link = screen.getByText('Wiki Link');
      expect(link).toHaveClass('wiki-link');
    });

    it('should render placeholder wiki-link with different style', () => {
      render(
        <WikiLink
          displayText="Placeholder"
          targetNodeId="placeholder-123"
          workspaceSlug="test-ws"
          isPlaceholder={true}
        />
      );

      const link = screen.getByText('Placeholder');
      expect(link).toHaveClass('wiki-link-placeholder');
    });

    it('should prevent default link behavior and use router', () => {
      const pushMock = jest.fn();
      mockUseRouter.mockReturnValue({
        push: pushMock,
      } as any);

      render(
        <WikiLink
          displayText="Page"
          targetNodeId="node-999"
          workspaceSlug="test-ws"
        />
      );

      const link = screen.getByText('Page');
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

      link.dispatchEvent(clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalled();
    });

    it('should support keyboard navigation (Enter key)', () => {
      const pushMock = jest.fn();
      mockUseRouter.mockReturnValue({
        push: pushMock,
      } as any);

      render(
        <WikiLink
          displayText="Keyboard Nav"
          targetNodeId="node-kb"
          workspaceSlug="test-ws"
        />
      );

      const link = screen.getByText('Keyboard Nav');
      fireEvent.keyDown(link, { key: 'Enter', code: 'Enter' });

      expect(pushMock).toHaveBeenCalledWith('/workspace/test-ws/node/node-kb');
    });
  });

  describe('T045: WikiLink alias display vs target', () => {
    it('should display alias text but link to target', () => {
      render(
        <WikiLink
          displayText="click here"
          targetNodeId="target-node-id"
          workspaceSlug="test-ws"
        />
      );

      const link = screen.getByText('click here');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', '/workspace/test-ws/node/target-node-id');
    });

    it('should handle wiki-link in markdown context', () => {
      const markdown = 'Read [[see this|Target Page]] for more info.';

      // Mock the remark plugin to transform wiki-links
      render(<MarkdownRenderer content={markdown} workspaceSlug="test-ws" />);

      // Wiki-link should be rendered as custom component
      expect(screen.getByText('see this')).toBeInTheDocument();
    });

    it('should display same text for non-aliased wiki-links', () => {
      render(
        <WikiLink
          displayText="Page Title"
          targetNodeId="node-same"
          workspaceSlug="test-ws"
        />
      );

      const link = screen.getByText('Page Title');
      expect(link).toBeInTheDocument();
    });

    it('should preserve special characters in display text', () => {
      render(
        <WikiLink
          displayText="Page: Notes & Ideas"
          targetNodeId="node-special"
          workspaceSlug="test-ws"
        />
      );

      expect(screen.getByText('Page: Notes & Ideas')).toBeInTheDocument();
    });

    it('should render multiple wiki-links with different aliases', () => {
      const markdown = 'See [[intro|Introduction]] and [[conclusion|Summary]].';

      render(<MarkdownRenderer content={markdown} workspaceSlug="test-ws" />);

      expect(screen.getByText(/intro/)).toBeInTheDocument();
      expect(screen.getByText(/conclusion/)).toBeInTheDocument();
    });

    it('should handle long alias text without breaking layout', () => {
      render(
        <WikiLink
          displayText="This is a very long alias text that should not break the layout or cause overflow issues"
          targetNodeId="node-long"
          workspaceSlug="test-ws"
        />
      );

      const link = screen.getByText(/This is a very long alias/);
      expect(link).toBeInTheDocument();
      expect(link).toHaveStyle({ wordBreak: 'break-word' });
    });

    it('should show tooltip with target title on hover', async () => {
      render(
        <WikiLink
          displayText="alias"
          targetNodeId="node-tooltip"
          targetTitle="Actual Target Page"
          workspaceSlug="test-ws"
        />
      );

      const link = screen.getByText('alias');
      fireEvent.mouseEnter(link);

      await screen.findByRole('tooltip', { name: /Actual Target Page/ });
    });

    it('should maintain aria-label with target title for accessibility', () => {
      render(
        <WikiLink
          displayText="alias"
          targetNodeId="node-aria"
          targetTitle="Real Page Title"
          workspaceSlug="test-ws"
        />
      );

      const link = screen.getByText('alias');
      expect(link).toHaveAttribute('aria-label', 'Link to Real Page Title');
    });
  });
});
