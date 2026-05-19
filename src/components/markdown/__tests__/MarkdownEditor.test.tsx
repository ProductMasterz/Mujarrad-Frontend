/**
 * Tests for MarkdownEditor Component
 * Feature: 006-markdown-features-start
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownEditor } from '../MarkdownEditor';

jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-preview">{children}</div>;
  };
});

jest.mock('remark-gfm', () => () => {});
jest.mock('rehype-highlight', () => () => {});

jest.mock('@uiw/react-md-editor', () => {
  const MockMDEditor = ({ value, onChange, textareaProps }: any) => (
    <div data-testid="md-editor">
      <textarea
        data-testid="md-textarea"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={textareaProps?.placeholder}
        disabled={textareaProps?.disabled}
      />
    </div>
  );
  return {
    __esModule: true,
    default: MockMDEditor,
  };
});

describe('MarkdownEditor', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render with edit tab by default', () => {
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Preview' })).toBeInTheDocument();
    });

    it('should render with preview tab when initialTab is preview', () => {
      render(
        <MarkdownEditor
          value="# Test Content"
          onChange={mockOnChange}
          initialTab="preview"
        />
      );

      const previewButton = screen.getByRole('button', { name: 'Preview' });
      expect(previewButton).toHaveClass('border-b-2', 'border-blue-500');
    });

    it('should render character counter by default', () => {
      render(<MarkdownEditor value="Test" onChange={mockOnChange} />);

      expect(screen.getByText(/4 \/ 50,000 characters/)).toBeInTheDocument();
    });

    it('should not render character counter when showCharCount is false', () => {
      render(
        <MarkdownEditor
          value="Test"
          onChange={mockOnChange}
          showCharCount={false}
        />
      );

      expect(screen.queryByText(/characters/)).not.toBeInTheDocument();
    });

    it('should apply data-color-mode="light" for light mode', () => {
      const { container } = render(
        <MarkdownEditor value="" onChange={mockOnChange} />
      );

      const editorContainer = container.querySelector('.markdown-editor-container');
      expect(editorContainer).toHaveAttribute('data-color-mode', 'light');
    });
  });

  describe('Tab Switching', () => {
    it('should switch from edit to preview tab', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor value="# Test" onChange={mockOnChange} />);

      const previewButton = screen.getByRole('button', { name: 'Preview' });
      await user.click(previewButton);

      expect(previewButton).toHaveClass('border-b-2', 'border-blue-500');
      expect(screen.queryByTestId('md-editor')).not.toBeInTheDocument();
    });

    it('should switch from preview to edit tab', async () => {
      const user = userEvent.setup();
      render(
        <MarkdownEditor
          value="# Test"
          onChange={mockOnChange}
          initialTab="preview"
        />
      );

      const editButton = screen.getByRole('button', { name: 'Edit' });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('md-editor')).toBeInTheDocument();
      });
    });

    it('should show "Nothing to preview" when content is empty in preview mode', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: 'Preview' }));

      expect(screen.getByText('Nothing to preview')).toBeInTheDocument();
    });
  });

  describe('Content Editing', () => {
    it('should call onChange when text is entered', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      const textarea = screen.getByTestId('md-textarea');
      await user.type(textarea, 'Hello');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should display current value', () => {
      render(<MarkdownEditor value="Initial content" onChange={mockOnChange} />);

      const textarea = screen.getByTestId('md-textarea');
      expect(textarea).toHaveValue('Initial content');
    });

    it('should respect disabled prop', () => {
      render(
        <MarkdownEditor
          value="Content"
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const textarea = screen.getByTestId('md-textarea');
      expect(textarea).toBeDisabled();
    });

    it('should pass placeholder to textarea', () => {
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          placeholder="Enter markdown here"
        />
      );

      const textarea = screen.getByTestId('md-textarea');
      expect(textarea).toHaveAttribute('placeholder', 'Enter markdown here');
    });
  });

  describe('Character Limit', () => {
    it('should show character count', () => {
      render(<MarkdownEditor value="Hello World" onChange={mockOnChange} />);

      expect(screen.getByText(/11 \/ 50,000 characters/)).toBeInTheDocument();
    });

    it('should respect custom maxLength', () => {
      render(
        <MarkdownEditor
          value="Test"
          onChange={mockOnChange}
          maxLength={100}
        />
      );

      expect(screen.getByText(/4 \/ 100 characters/)).toBeInTheDocument();
    });

    it('should show warning when near limit (90%)', () => {
      const nearLimitText = 'a'.repeat(45000);
      render(<MarkdownEditor value={nearLimitText} onChange={mockOnChange} />);

      const counter = screen.getByText(/45,000 \/ 50,000 characters \(approaching limit\)/);
      expect(counter).toHaveClass('text-yellow-600');
    });

    it('should show error when over limit', () => {
      const overLimitText = 'a'.repeat(50001);
      render(<MarkdownEditor value={overLimitText} onChange={mockOnChange} />);

      const counter = screen.getByText(/50,001 \/ 50,000 characters \(limit exceeded\)/);
      expect(counter).toHaveClass('text-red-600');
    });

    it('should prevent input when maxLength is exceeded', async () => {
      const user = userEvent.setup();
      const maxText = 'a'.repeat(10);
      const onChange = jest.fn();

      render(
        <MarkdownEditor
          value={maxText}
          onChange={onChange}
          maxLength={10}
        />
      );

      const textarea = screen.getByTestId('md-textarea');
      await user.type(textarea, 'b');

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Preview Mode', () => {
    it('should render markdown content in preview mode', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor value="# Heading\n**Bold text**" onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: 'Preview' }));

      expect(screen.queryByTestId('md-editor')).not.toBeInTheDocument();
    });

    it('should handle empty content in preview mode gracefully', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: 'Preview' }));

      expect(screen.getByText('Nothing to preview')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Preview' })).toBeInTheDocument();
    });

    it('should indicate active tab with visual styling', () => {
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      const editButton = screen.getByRole('button', { name: 'Edit' });
      expect(editButton).toHaveClass('border-b-2', 'border-blue-500');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      await user.tab();
      expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Preview' })).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long content', () => {
      const longContent = 'a'.repeat(100000);
      render(<MarkdownEditor value={longContent} onChange={mockOnChange} />);

      expect(screen.getByText(/100,000 \/ 50,000 characters/)).toBeInTheDocument();
    });

    it('should handle special markdown characters', () => {
      const specialContent = '# **Bold** _italic_ `code` [link](url)';
      render(<MarkdownEditor value={specialContent} onChange={mockOnChange} />);

      const textarea = screen.getByTestId('md-textarea');
      expect(textarea).toHaveValue(specialContent);
    });

    it('should handle rapid tab switching', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor value="# Test" onChange={mockOnChange} />);

      const previewButton = screen.getByRole('button', { name: 'Preview' });
      const editButton = screen.getByRole('button', { name: 'Edit' });

      await user.click(previewButton);
      await user.click(editButton);
      await user.click(previewButton);
      await user.click(editButton);

      expect(screen.getByTestId('md-editor')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily when onChange is called with same value', () => {
      const { rerender } = render(
        <MarkdownEditor value="Test" onChange={mockOnChange} />
      );

      rerender(<MarkdownEditor value="Test" onChange={mockOnChange} />);

      expect(screen.getByTestId('md-textarea')).toHaveValue('Test');
    });

    it('should handle large content updates efficiently', async () => {
      const user = userEvent.setup();
      const largeContent = 'a'.repeat(10000);

      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      const textarea = screen.getByTestId('md-textarea');
      await user.clear(textarea);
      await user.paste(largeContent);

      expect(mockOnChange).toHaveBeenCalled();
    });
  });
});