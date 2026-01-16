# Phase 0: Research & Technical Decisions

**Feature**: Markdown Rendering and Editing
**Date**: 2025-10-14
**Status**: Complete

## Research Summary

This document consolidates technical research for implementing markdown rendering and editing across all Mujarrad content types. The research was conducted prior to specification and influenced the technical approach.

---

## 1. Markdown Rendering Library

### Decision: react-markdown v9.0.0

**Rationale**:
- **Lightweight**: 60KB bundle size (minified + gzipped)
- **Security**: Built-in XSS protection, no `dangerouslySetInnerHTML`
- **Flexibility**: Plugin-based architecture (remark/rehype ecosystem)
- **Next.js Compatible**: Works seamlessly with SSR and client-side rendering
- **Active Maintenance**: 4M+ downloads/week, actively maintained
- **TypeScript Support**: Full type definitions included
- **Performance**: Virtual DOM diffing, efficient re-renders

**Alternatives Considered**:
1. **marked** (26KB) - Faster but less secure, requires manual XSS sanitization
2. **markdown-it** (35KB) - Good performance but older API, less React-friendly
3. **showdown** (89KB) - Larger bundle, not optimized for React

**Configuration**:
```typescript
// Required plugins for GFM support
import remarkGfm from 'remark-gfm'           // Tables, task lists, strikethrough
import rehypeHighlight from 'rehype-highlight' // Syntax highlighting

<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight]}
  components={{
    // Custom component overrides for styling
  }}
>
  {markdownContent}
</ReactMarkdown>
```

---

## 2. Markdown Editing Library

### Decision: @uiw/react-md-editor v4.0.0

**Rationale**:
- **Tabbed Interface**: Built-in Edit/Preview tab support (matches requirement)
- **Lightweight**: ~90KB (reasonable for full-featured editor)
- **React Integration**: Native React component, hooks-based API
- **Toolbar Included**: Formatting buttons for common markdown syntax
- **Customizable**: Can hide/show toolbar, tabs, or switch to split view
- **Active Development**: Regular updates, good community support
- **TypeScript**: Full type definitions
- **No Dependencies Conflicts**: Works with react-markdown for preview

**Alternatives Considered**:
1. **MDXEditor** (425KB) - Too large, WYSIWYG-focused, overkill for needs
2. **BlockNote** (1.06MB) - Notion-style blocks, excessive for markdown
3. **Milkdown** (350KB) - ProseMirror-based, complex setup
4. **Toast UI Editor** (500KB) - Feature-rich but heavy
5. **Lexical** - Requires building custom UI from scratch (high dev cost)
6. **rich-markdown-editor** - Deprecated, no longer maintained
7. **Simple textarea** - No preview functionality, poor UX

**Configuration**:
```typescript
import MDEditor from '@uiw/react-md-editor'

<MDEditor
  value={content}
  onChange={setValue}
  preview="edit"  // Start in edit mode
  hideToolbar={false}
  enablePreview={true}  // Enable preview tab
  visibleDragbar={false}  // No split view drag bar
/>
```

---

## 3. GitHub Flavored Markdown (GFM) Support

### Decision: remark-gfm v4.0.0

**Features Enabled**:
- ✅ Tables with alignment
- ✅ Task lists (`- [ ]` and `- [x]`)
- ✅ Strikethrough (`~~text~~`)
- ✅ Autolinks (URLs become clickable)
- ✅ Footnotes
- ✅ Custom heading IDs

**Implementation**:
```typescript
import remarkGfm from 'remark-gfm'

<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {markdown}
</ReactMarkdown>
```

**Alternative**: commonmark (strict markdown only) - rejected as GFM is industry standard

---

## 4. Syntax Highlighting for Code Blocks

### Decision: rehype-highlight v7.0.0 + highlight.js

**Languages Supported** (MVP):
- JavaScript
- TypeScript
- Python
- Java
- HTML
- CSS
- JSON
- Markdown

**Bundle Size**: ~40KB for 8 languages (treeshaking reduces size)

**Rationale**:
- **Integration**: Seamless rehype plugin for react-markdown
- **Performance**: Client-side highlighting is fast for typical code blocks
- **Themes**: Multiple built-in themes (can match Mujarrad design)
- **No Server Required**: All processing client-side
- **Language Detection**: Automatic detection if language not specified

**Configuration**:
```typescript
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'  // Theme

<ReactMarkdown rehypePlugins={[rehypeHighlight]}>
  ```javascript
  const code = "highlighted";
  ```
</ReactMarkdown>
```

**Alternatives Considered**:
1. **Prism.js** - Similar features, slightly larger bundle
2. **Shiki** - Server-side only, requires build step
3. **No highlighting** - Rejected, poor developer UX

---

## 5. Markdown Styling

### Decision: @tailwindcss/typography v0.5.0

**Features**:
- **Prose Classes**: `.prose`, `.prose-lg`, `.prose-sm`
- **Dark Mode Support**: `.prose-invert` for dark themes
- **Customizable**: Extend via Tailwind config
- **Responsive**: Automatic responsive typography
- **Semantic HTML**: Styles all markdown elements (h1-h6, lists, blockquotes, etc.)

**Configuration**:
```typescript
// tailwind.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

// Component usage
<div className="prose dark:prose-invert max-w-none">
  <ReactMarkdown>{content}</ReactMarkdown>
</div>
```

**Customization Example**:
```javascript
// Customize link colors, code background, etc.
typography: {
  DEFAULT: {
    css: {
      'code::before': { content: '""' },
      'code::after': { content: '""' },
      code: {
        backgroundColor: '#f3f4f6',
        padding: '0.2em 0.4em',
        borderRadius: '0.25rem',
      },
    },
  },
}
```

**Alternative**: Custom CSS - Rejected as @tailwindcss/typography is maintained and comprehensive

---

## 6. XSS Protection Strategy

### Decision: react-markdown's Built-in Sanitization

**Security Measures**:
1. **No Raw HTML**: react-markdown doesn't parse HTML by default
2. **Safe by Default**: Uses React's JSX rendering (auto-escapes)
3. **Plugin Whitelisting**: Only trusted rehype/remark plugins
4. **URL Validation**: Can add custom link validator for external URLs

**Configuration**:
```typescript
<ReactMarkdown
  components={{
    a: ({node, ...props}) => {
      // Validate external links
      const href = props.href || '';
      if (href.startsWith('javascript:') || href.startsWith('data:')) {
        return <span>{props.children}</span>;  // Block dangerous URLs
      }
      return <a {...props} target="_blank" rel="noopener noreferrer" />;
    }
  }}
>
  {content}
</ReactMarkdown>
```

**Additional Layer**: Zod validation for content length limits
```typescript
const markdownSchema = z.object({
  content: z.string().max(50000, "Content too long"),
});
```

**Alternatives Considered**:
1. **DOMPurify** - Not needed, react-markdown already safe
2. **Server-side Sanitization** - Avoided to keep backend unchanged

---

## 7. Performance Optimization Strategies

### 7.1 Code Splitting

**Decision**: Dynamic import for MarkdownEditor (not needed for render-only views)

```typescript
// In dialogs/forms that need editing
const MarkdownEditor = dynamic(() => import('@/components/markdown/MarkdownEditor'), {
  loading: () => <Skeleton />,
  ssr: false,  // Editor is client-side only
});
```

**Rationale**: Editor is ~90KB, only load when user needs to edit

### 7.2 React Query Caching

**Decision**: Leverage existing React Query setup for content

```typescript
const { data: node } = useNode(nodeId);  // Existing hook
// Markdown rendering uses cached node.content
```

**Rationale**: No additional API calls needed, markdown rendering uses existing data

### 7.3 Memoization

**Decision**: Use React.memo for MarkdownRenderer

```typescript
export const MarkdownRenderer = React.memo(({ content }: Props) => {
  return (
    <div className="prose">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
});
```

**Rationale**: Avoid re-rendering markdown when parent re-renders

### 7.4 Debouncing (Future Enhancement)

**Decision**: Not in MVP, but can add auto-save with debouncing later

```typescript
// Future enhancement
const debouncedSave = useMemo(
  () => debounce((content) => updateNode({ content }), 1000),
  []
);
```

---

## 8. Integration Points

### 8.1 Existing Components to Modify

1. **CreateNodeDialog.tsx** (`src/components/nodes/`)
   - Replace textarea with MarkdownEditor
   - Add character count (max 50,000)
   - Maintain existing validation logic

2. **EditNodeDialog.tsx** (`src/components/nodes/`)
   - Replace textarea with MarkdownEditor
   - Preserve existing update hooks

3. **NodeDetail.tsx** (`src/components/nodes/`)
   - Wrap content in MarkdownRenderer
   - Add prose classes for styling
   - Maintain existing layout

4. **SpaceSettings.tsx** (`src/components/spaces/`)
   - Add markdown editor for space documentation field
   - Similar to node dialogs

5. **Comment Components** (if exists)
   - Add markdown support for comment text
   - Smaller editor variant for compact UI

### 8.2 No Backend Changes Required

**Existing API Endpoints Used**:
- `POST /api/spaces/{slug}/nodes` - Create node with markdown content
- `PUT /api/spaces/{slug}/nodes/{id}` - Update node with markdown content
- `GET /api/spaces/{slug}/nodes/{id}` - Retrieve node (content already includes markdown)
- `PUT /api/spaces/{slug}` - Update space with markdown documentation

**DTOs Unchanged**:
```typescript
interface NodeDTO {
  id: string;
  title: string;
  content: string;  // ← Already supports plain text, now supports markdown
  node_type: string;
  // ... other fields
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests (Jest + React Testing Library)

**MarkdownRenderer.test.tsx**:
```typescript
describe('MarkdownRenderer', () => {
  it('renders markdown headings', () => {
    render(<MarkdownRenderer content="# Hello" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hello');
  });

  it('sanitizes dangerous content', () => {
    render(<MarkdownRenderer content="<script>alert('xss')</script>" />);
    expect(screen.queryByText('script')).toBeInTheDocument();
    // Should render as text, not execute
  });

  it('renders code blocks with syntax highlighting', () => {
    const code = '```js\nconst x = 1;\n```';
    render(<MarkdownRenderer content={code} />);
    expect(screen.getByText('const')).toHaveClass('hljs-keyword');
  });
});
```

**MarkdownEditor.test.tsx**:
```typescript
describe('MarkdownEditor', () => {
  it('renders edit tab by default', () => {
    render(<MarkdownEditor value="" onChange={jest.fn()} />);
    expect(screen.getByRole('tab', { name: /edit/i })).toBeInTheDocument();
  });

  it('switches to preview tab', async () => {
    render(<MarkdownEditor value="# Test" onChange={jest.fn()} />);
    await userEvent.click(screen.getByRole('tab', { name: /preview/i }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test');
  });
});
```

### 9.2 Integration Tests (Playwright)

**markdown-integration.spec.ts**:
```typescript
test('create node with markdown content', async ({ page }) => {
  await page.goto('/spaces/test-space/nodes');
  await page.click('text=Create Node');
  await page.fill('[placeholder="Node title"]', 'Test Node');

  // Write markdown in editor
  await page.fill('.w-md-editor-text', '# Heading\n\n**Bold text**');

  // Preview should render markdown
  await page.click('text=Preview');
  await expect(page.locator('h1')).toContainText('Heading');
  await expect(page.locator('strong')).toContainText('Bold text');

  // Save and verify
  await page.click('text=Create');
  await expect(page.locator('.prose h1')).toContainText('Heading');
});
```

### 9.3 Manual Testing Checklist

- [ ] Create node with markdown (headers, lists, bold, italic)
- [ ] Edit existing node, preview works
- [ ] Code blocks render with syntax highlighting
- [ ] Tables render correctly
- [ ] Task lists display checkboxes
- [ ] External image URLs load
- [ ] XSS attempts are blocked (try `<script>alert(1)</script>`)
- [ ] Long content (40k+ chars) renders without lag
- [ ] Dark mode prose styles work
- [ ] Mobile: editor is usable, preview readable
- [ ] Keyboard navigation works in editor

---

## 10. Migration Plan (Existing Content)

### Backward Compatibility

**Existing plain text content** will work seamlessly:
- Plain text renders as plain text in markdown (no breaking changes)
- Users can gradually add markdown syntax to existing content
- No data migration required

**Example**:
```
Before (plain text):
"This is a note about the project."

Still works:
"This is a note about the project."

Can enhance:
"# Project Note\n\nThis is a **note** about the project."
```

---

## 11. Open Questions Resolved

All critical questions were resolved during `/clarify` workflow:

| Question | Resolution |
|----------|------------|
| Where is markdown used? | ALL contexts (nodes, spaces, comments, notes) |
| Editor UX? | Tabbed interface (Edit/Preview) |
| Feature scope? | Full GFM (basic + code + tables + images + tasks) |
| Image handling? | External URLs only, no upload |
| Storage? | Existing entity fields, no schema changes |

---

## 12. Dependencies to Install

```json
{
  "dependencies": {
    "react-markdown": "^9.0.0",
    "@uiw/react-md-editor": "^4.0.0",
    "remark-gfm": "^4.0.0",
    "rehype-highlight": "^7.0.0",
    "highlight.js": "^11.9.0"
  },
  "devDependencies": {
    "@types/react-markdown": "^8.0.0"
  }
}
```

**Bundle Impact**:
- react-markdown: 60KB
- @uiw/react-md-editor: 90KB (lazy loaded)
- remark-gfm: 15KB
- rehype-highlight: 20KB
- highlight.js (8 languages): 40KB
- **Total**: ~225KB (150KB initially, 90KB lazy loaded)

**Performance Validation**:
- Meets <200KB main bundle requirement
- Meets <500KB total initial load requirement
- Lazy loading keeps initial bundle minimal

---

## 13. Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Bundle size too large** | Medium | Dynamic import for editor, tree-shake highlight.js |
| **XSS vulnerabilities** | High | Use react-markdown's built-in protection, validate links |
| **Poor mobile UX** | Medium | Test on mobile, consider simpler editor for small screens |
| **Syntax highlighting breaks** | Low | Fallback to unstyled code blocks, test common languages |
| **Editor conflicts with forms** | Medium | Wrap in proper form context, test validation |
| **Performance degradation** | Medium | Memoize renderer, monitor bundle size, lazy load editor |

---

## 14. Success Criteria

- ✅ Markdown renders in all content types (nodes, spaces, comments, notes)
- ✅ Editor provides Edit and Preview tabs
- ✅ Syntax highlighting works for 8+ languages
- ✅ Tables and task lists render correctly
- ✅ External images load
- ✅ XSS protection verified
- ✅ Bundle size < 150KB (excluding lazy-loaded editor)
- ✅ No backend changes required
- ✅ 80%+ test coverage for new components
- ✅ WCAG AA compliance for rendered markdown

---

## References

- [react-markdown Documentation](https://github.com/remarkjs/react-markdown)
- [@uiw/react-md-editor Documentation](https://uiwjs.github.io/react-md-editor/)
- [GitHub Flavored Markdown Spec](https://github.github.com/gfm/)
- [remark-gfm Plugin](https://github.com/remarkjs/remark-gfm)
- [rehype-highlight Plugin](https://github.com/rehypejs/rehype-highlight)
- [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin)
- [Previous Research Document](../../docs/markdown-editor-research.md) - Detailed library comparison

---

**Status**: ✅ Research Complete
**Next Phase**: Design & Contracts (Phase 1)
