# Component Contracts: Markdown Feature

**Feature**: 006-markdown-features-start
**Date**: 2025-10-14
**Type**: Frontend Component Contracts

## Overview

This document defines the component contracts for markdown rendering and editing. Since this is a frontend-only feature with no API changes, contracts focus on component interfaces, props, and behavior.

---

## 1. MarkdownRenderer Component

### Contract

**Purpose**: Render markdown text as formatted HTML with syntax highlighting and GFM support.

**Interface**:
```typescript
interface MarkdownRendererProps {
  content: string;              // REQUIRED: Markdown text to render
  className?: string;           // OPTIONAL: Additional CSS classes
  components?: Partial<Components>;  // OPTIONAL: Custom element overrides
}

export function MarkdownRenderer(props: MarkdownRendererProps): JSX.Element;
```

### Behavioral Contract

**MUST**:
- Render valid markdown to semantic HTML
- Apply XSS protection (no raw HTML execution)
- Support GitHub Flavored Markdown (tables, task lists, strikethrough)
- Highlight code blocks with syntax for supported languages
- Apply Tailwind prose classes for typography
- Handle empty content gracefully (render empty div)
- Be memoized to prevent unnecessary re-renders

**MUST NOT**:
- Execute JavaScript from markdown content
- Allow raw HTML tags to execute
- Crash on malformed markdown (graceful degradation)
- Make API calls or side effects

**Performance**:
- Render documents up to 10,000 chars in < 100ms
- Use React.memo for prop comparison

### Example Usage

```typescript
// Basic usage
<MarkdownRenderer content="# Hello World" />

// With custom styling
<MarkdownRenderer
  content={node.content}
  className="prose dark:prose-invert max-w-none"
/>

// With custom link component
<MarkdownRenderer
  content={content}
  components={{
    a: ({ href, children }) => (
      <Link href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </Link>
    )
  }}
/>
```

### Test Contract

```typescript
// tests/components/markdown/MarkdownRenderer.test.tsx

describe('MarkdownRenderer Contract', () => {
  it('MUST render headings correctly', () => {
    render(<MarkdownRenderer content="# H1\n## H2" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('H1');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('H2');
  });

  it('MUST render bold and italic text', () => {
    render(<MarkdownRenderer content="**bold** and *italic*" />);
    expect(screen.getByText('bold')).toHaveStyle({ fontWeight: 'bold' });
    expect(screen.getByText('italic')).toHaveStyle({ fontStyle: 'italic' });
  });

  it('MUST render code blocks with syntax highlighting', () => {
    const code = '```javascript\nconst x = 1;\n```';
    render(<MarkdownRenderer content={code} />);
    const codeElement = screen.getByText(/const/);
    expect(codeElement).toBeInTheDocument();
    expect(codeElement.closest('code')).toHaveClass('language-javascript');
  });

  it('MUST render tables (GFM)', () => {
    const table = '| A | B |\n|---|---|\n| 1 | 2 |';
    render(<MarkdownRenderer content={table} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('cell')).toHaveLength(4);
  });

  it('MUST render task lists (GFM)', () => {
    const tasks = '- [x] Done\n- [ ] Todo';
    render(<MarkdownRenderer content={tasks} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it('MUST sanitize XSS attempts', () => {
    render(<MarkdownRenderer content='<script>alert("XSS")</script>' />);
    expect(screen.queryByText('script')).toBeInTheDocument(); // Rendered as text
    expect(document.querySelectorAll('script')).toHaveLength(0); // No script tags
  });

  it('MUST handle empty content', () => {
    const { container } = render(<MarkdownRenderer content="" />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it('MUST open external links in new tab', () => {
    render(<MarkdownRenderer content="[Link](https://example.com)" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('MUST NOT re-render when props unchanged (memoization)', () => {
    const renderSpy = jest.fn();
    const MemoComponent = React.memo(() => {
      renderSpy();
      return <MarkdownRenderer content="test" />;
    });

    const { rerender } = render(<MemoComponent />);
    rerender(<MemoComponent />);
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});
```

---

## 2. MarkdownEditor Component

### Contract

**Purpose**: Provide a tabbed markdown editor (Edit/Preview tabs) for creating and editing markdown content.

**Interface**:
```typescript
interface MarkdownEditorProps {
  value: string;                    // REQUIRED: Current markdown content
  onChange: (value: string) => void; // REQUIRED: Callback when content changes
  placeholder?: string;             // OPTIONAL: Placeholder text
  maxLength?: number;               // OPTIONAL: Character limit (default: 50000)
  disabled?: boolean;               // OPTIONAL: Disable editing
  className?: string;               // OPTIONAL: Container CSS class
  showCharCount?: boolean;          // OPTIONAL: Show character counter (default: true)
  initialTab?: 'edit' | 'preview';  // OPTIONAL: Starting tab (default: 'edit')
}

export function MarkdownEditor(props: MarkdownEditorProps): JSX.Element;
```

### Behavioral Contract

**MUST**:
- Provide "Edit" and "Preview" tabs (not split view)
- Start in "Edit" tab by default
- Call `onChange` callback when content changes
- Show character count when `showCharCount` is true
- Warn when approaching `maxLength` (at 90% threshold)
- Prevent input when `maxLength` exceeded
- Respect `disabled` prop (make editor read-only)
- Render markdown in Preview tab using MarkdownRenderer
- Preserve content when switching between tabs

**MUST NOT**:
- Auto-save content (that's parent component's responsibility)
- Make API calls
- Modify content without user action
- Crash on invalid markdown in Preview tab

**Performance**:
- Load editor in < 500ms (use dynamic import)
- Handle 50,000 char documents without lag

### Example Usage

```typescript
// Basic usage
const [content, setContent] = useState('');

<MarkdownEditor
  value={content}
  onChange={setContent}
  placeholder="Write your markdown here..."
/>

// With character limit and counter
<MarkdownEditor
  value={content}
  onChange={setContent}
  maxLength={10000}
  showCharCount={true}
/>

// Disabled state
<MarkdownEditor
  value={savedContent}
  onChange={() => {}}
  disabled={true}
/>

// Start in Preview tab
<MarkdownEditor
  value={content}
  onChange={setContent}
  initialTab="preview"
/>
```

### Test Contract

```typescript
// tests/components/markdown/MarkdownEditor.test.tsx

describe('MarkdownEditor Contract', () => {
  it('MUST render Edit and Preview tabs', () => {
    render(<MarkdownEditor value="" onChange={jest.fn()} />);
    expect(screen.getByRole('tab', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /preview/i })).toBeInTheDocument();
  });

  it('MUST start in Edit tab by default', () => {
    render(<MarkdownEditor value="" onChange={jest.fn()} />);
    expect(screen.getByRole('tab', { name: /edit/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('MUST call onChange when content changes', async () => {
    const onChange = jest.fn();
    render(<MarkdownEditor value="" onChange={onChange} />);

    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Hello');

    expect(onChange).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith('Hello');
  });

  it('MUST switch to Preview tab and render markdown', async () => {
    const { rerender } = render(
      <MarkdownEditor value="# Hello" onChange={jest.fn()} />
    );

    await userEvent.click(screen.getByRole('tab', { name: /preview/i }));

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hello');
  });

  it('MUST preserve content when switching tabs', async () => {
    const onChange = jest.fn();
    render(<MarkdownEditor value="test" onChange={onChange} />);

    await userEvent.click(screen.getByRole('tab', { name: /preview/i }));
    await userEvent.click(screen.getByRole('tab', { name: /edit/i }));

    expect(screen.getByRole('textbox')).toHaveValue('test');
  });

  it('MUST show character count when enabled', () => {
    render(
      <MarkdownEditor
        value="Hello World"
        onChange={jest.fn()}
        showCharCount={true}
        maxLength={50000}
      />
    );

    expect(screen.getByText(/11 \/ 50,000/)).toBeInTheDocument();
  });

  it('MUST warn when approaching character limit', () => {
    const nearLimit = 'A'.repeat(46000); // 90% of 50000
    render(
      <MarkdownEditor
        value={nearLimit}
        onChange={jest.fn()}
        maxLength={50000}
      />
    );

    expect(screen.getByText(/46,000 \/ 50,000/)).toHaveClass('text-warning');
  });

  it('MUST prevent input when maxLength exceeded', async () => {
    const atLimit = 'A'.repeat(100);
    const onChange = jest.fn();
    render(
      <MarkdownEditor
        value={atLimit}
        onChange={onChange}
        maxLength={100}
      />
    );

    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'B');

    // Should not add more characters
    expect(onChange).not.toHaveBeenCalledWith(atLimit + 'B');
  });

  it('MUST be read-only when disabled', () => {
    render(
      <MarkdownEditor
        value="test"
        onChange={jest.fn()}
        disabled={true}
      />
    );

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('MUST show placeholder when empty', () => {
    render(
      <MarkdownEditor
        value=""
        onChange={jest.fn()}
        placeholder="Start typing..."
      />
    );

    expect(screen.getByPlaceholderText('Start typing...')).toBeInTheDocument();
  });

  it('MUST start in Preview tab when initialTab is preview', () => {
    render(
      <MarkdownEditor
        value="# Test"
        onChange={jest.fn()}
        initialTab="preview"
      />
    );

    expect(screen.getByRole('tab', { name: /preview/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test');
  });
});
```

---

## 3. Integration with Existing Components

### CreateNodeDialog Contract

**Changes**:
- Replace existing `<textarea>` with `<MarkdownEditor>`
- Add character count validation
- Preview markdown before creation

**Contract**:
```typescript
// src/components/nodes/CreateNodeDialog.tsx

const form = useForm<CreateNodeInput>({
  resolver: zodResolver(nodeWithMarkdownSchema),
});

<MarkdownEditor
  value={form.watch('content')}
  onChange={(value) => form.setValue('content', value)}
  maxLength={50000}
  placeholder="Describe your node using markdown..."
/>
```

**Test Contract**:
```typescript
describe('CreateNodeDialog with Markdown', () => {
  it('MUST create node with markdown content', async () => {
    const createNode = jest.fn();
    render(<CreateNodeDialog onSubmit={createNode} />);

    await userEvent.type(screen.getByLabelText(/title/i), 'Test Node');

    const editor = screen.getByRole('textbox');
    await userEvent.type(editor, '# Hello\n\n**World**');

    await userEvent.click(screen.getByRole('button', { name: /create/i }));

    expect(createNode).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Node',
        content: '# Hello\n\n**World**',
      })
    );
  });

  it('MUST validate content length', async () => {
    render(<CreateNodeDialog />);

    const longContent = 'A'.repeat(50001);
    const editor = screen.getByRole('textbox');
    await userEvent.paste(editor, longContent);

    await userEvent.click(screen.getByRole('button', { name: /create/i }));

    expect(screen.getByText(/Content must be less than 50,000 characters/)).toBeInTheDocument();
  });
});
```

### EditNodeDialog Contract

**Changes**:
- Replace `<textarea>` with `<MarkdownEditor>`
- Show existing markdown content
- Preserve version for optimistic locking

**Contract**:
```typescript
// src/components/nodes/EditNodeDialog.tsx

const form = useForm({
  defaultValues: {
    title: node.title,
    content: node.content,  // Existing markdown
  },
});

<MarkdownEditor
  value={form.watch('content')}
  onChange={(value) => form.setValue('content', value)}
  maxLength={50000}
/>
```

**Test Contract**:
```typescript
describe('EditNodeDialog with Markdown', () => {
  it('MUST load existing markdown content', async () => {
    const node = { id: '1', title: 'Test', content: '# Existing' };
    render(<EditNodeDialog node={node} />);

    const editor = screen.getByRole('textbox');
    expect(editor).toHaveValue('# Existing');

    await userEvent.click(screen.getByRole('tab', { name: /preview/i }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Existing');
  });

  it('MUST update node with modified markdown', async () => {
    const updateNode = jest.fn();
    const node = { id: '1', title: 'Test', content: '# Old', version: 2 };
    render(<EditNodeDialog node={node} onUpdate={updateNode} />);

    const editor = screen.getByRole('textbox');
    await userEvent.clear(editor);
    await userEvent.type(editor, '# New');

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(updateNode).toHaveBeenCalledWith({
      id: '1',
      content: '# New',
      version: 2,
    });
  });
});
```

### NodeDetail Contract

**Changes**:
- Wrap `node.content` in `<MarkdownRenderer>`
- Apply prose styling

**Contract**:
```typescript
// src/components/nodes/NodeDetail.tsx

<div className="prose dark:prose-invert max-w-none">
  <MarkdownRenderer content={node.content} />
</div>
```

**Test Contract**:
```typescript
describe('NodeDetail with Markdown', () => {
  it('MUST render markdown content', () => {
    const node = { id: '1', title: 'Test', content: '# Hello\n\n**Bold**' };
    render(<NodeDetail node={node} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hello');
    expect(screen.getByText('Bold')).toHaveStyle({ fontWeight: 'bold' });
  });

  it('MUST render plain text content without breaking', () => {
    const node = { id: '1', title: 'Test', content: 'Plain text content' };
    render(<NodeDetail node={node} />);

    expect(screen.getByText('Plain text content')).toBeInTheDocument();
  });

  it('MUST handle empty content', () => {
    const node = { id: '1', title: 'Test', content: '' };
    const { container } = render(<NodeDetail node={node} />);

    expect(container.querySelector('.prose')).toBeEmptyDOMElement();
  });
});
```

---

## 4. Performance Contracts

### Bundle Size

**Contract**:
- MarkdownRenderer (included in main bundle): ≤ 60KB
- MarkdownEditor (lazy loaded): ≤ 90KB
- Syntax highlighting (lazy loaded): ≤ 40KB
- Total initial impact: ≤ 150KB

**Verification**:
```bash
# After build
npm run build
# Check bundle sizes in .next/build-manifest.json
```

### Render Performance

**Contract**:
- Render 1,000 chars markdown: < 50ms
- Render 10,000 chars markdown: < 100ms
- Editor load time: < 500ms
- Tab switch time: < 100ms

**Test**:
```typescript
describe('Performance Contracts', () => {
  it('MUST render 10k chars in < 100ms', () => {
    const longContent = 'A'.repeat(10000);
    const start = performance.now();

    render(<MarkdownRenderer content={longContent} />);

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('MUST switch tabs in < 100ms', async () => {
    render(<MarkdownEditor value="# Test" onChange={jest.fn()} />);

    const start = performance.now();
    await userEvent.click(screen.getByRole('tab', { name: /preview/i }));
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
  });
});
```

---

## 5. Accessibility Contracts

### Keyboard Navigation

**Contract**:
- Tab key navigates between Edit/Preview tabs
- Enter/Space activates selected tab
- Editor textarea is focusable and keyboard-accessible
- Rendered links are keyboard-accessible

**Test**:
```typescript
describe('Accessibility Contracts', () => {
  it('MUST support keyboard navigation for tabs', async () => {
    render(<MarkdownEditor value="" onChange={jest.fn()} />);

    const editTab = screen.getByRole('tab', { name: /edit/i });
    const previewTab = screen.getByRole('tab', { name: /preview/i });

    editTab.focus();
    await userEvent.keyboard('{Tab}');
    expect(previewTab).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(previewTab).toHaveAttribute('aria-selected', 'true');
  });

  it('MUST have proper ARIA labels', () => {
    render(<MarkdownEditor value="test" onChange={jest.fn()} />);

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /edit/i })).toHaveAttribute('aria-controls');
  });

  it('MUST make rendered links keyboard-accessible', () => {
    render(<MarkdownRenderer content="[Link](https://example.com)" />);

    const link = screen.getByRole('link');
    link.focus();
    expect(link).toHaveFocus();
  });
});
```

---

## Summary

### Component Contracts Defined

1. ✅ **MarkdownRenderer**: 10 behavioral tests + 1 memoization test
2. ✅ **MarkdownEditor**: 11 behavioral tests
3. ✅ **CreateNodeDialog**: 2 integration tests
4. ✅ **EditNodeDialog**: 2 integration tests
5. ✅ **NodeDetail**: 3 integration tests
6. ✅ **Performance**: 2 performance tests
7. ✅ **Accessibility**: 3 a11y tests

**Total Test Contracts**: 34 test cases

### Coverage Targets

- **Unit Tests**: 80% coverage for MarkdownRenderer, MarkdownEditor
- **Integration Tests**: All modified dialogs and detail views
- **E2E Tests**: Complete user flows (create, edit, view markdown)

---

**Status**: ✅ Component Contracts Complete
**Next**: quickstart.md (Phase 1 continuation)
