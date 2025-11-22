# Markdown Features - Quick Reference Card

**Feature**: 006-markdown-features-start
**Version**: 1.0.0
**Status**: ✅ Production Ready

---

## 🚀 Quick Start

### For Users

**Create Node with Markdown:**
1. Navigate to any space
2. Click "Create Node" button
3. Write content using markdown syntax
4. Toggle between "Edit" and "Preview" tabs
5. Click "Create Node" button

**Edit Existing Node:**
1. Click any node card (or double-click to open detail page)
2. Click "Edit" mode button on detail page
3. Make changes in MarkdownEditor
4. Click "Save Changes"

**View Node with Markdown:**
1. Click any node card
2. Node opens in "Preview" mode by default
3. Markdown is rendered beautifully with formatting

---

## 📝 Markdown Syntax Supported

### Basic Formatting
```markdown
**bold text**
*italic text*
~~strikethrough~~
`inline code`
```

### Headings
```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
```

### Lists
```markdown
- Unordered item 1
- Unordered item 2
  - Nested item

1. Ordered item 1
2. Ordered item 2
   1. Nested item
```

### Task Lists (GFM)
```markdown
- [ ] Unchecked task
- [x] Completed task
```

### Links & Images
```markdown
[Link text](https://example.com)
![Alt text](https://example.com/image.png)
```

### Code Blocks
````markdown
```javascript
const hello = "world";
console.log(hello);
```

```python
def greet():
    print("Hello, World!")
```
````

### Tables (GFM)
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### Blockquotes
```markdown
> This is a quote
>
> With multiple lines
```

### Horizontal Rules
```markdown
---
***
___
```

---

## ⚙️ Component API

### MarkdownEditor

```typescript
import { MarkdownEditor } from '@/components/markdown/MarkdownEditor';

<MarkdownEditor
  value={content}
  onChange={(newValue) => setContent(newValue)}
  placeholder="Write your content..."
  maxLength={50000}
  disabled={false}
  showCharCount={true}
  initialTab="edit"  // or "preview"
  className="custom-class"
/>
```

**Props:**
- `value` (string): Current markdown content
- `onChange` (function): Callback when content changes
- `placeholder` (string): Placeholder text (default: "Write your content in markdown...")
- `maxLength` (number): Maximum character limit (default: 50000)
- `disabled` (boolean): Disable editing (default: false)
- `showCharCount` (boolean): Show character counter (default: true)
- `initialTab` ('edit' | 'preview'): Initial active tab (default: 'edit')
- `className` (string): Additional CSS classes

---

### MarkdownRenderer

```typescript
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';

<MarkdownRenderer
  content={markdownText}
  className="prose max-w-none"
/>
```

**Props:**
- `content` (string): Markdown content to render
- `className` (string): Additional CSS classes (default: "markdown-content")

---

## 🎨 Styling

### Prose Classes (Tailwind Typography)
```typescript
// Default prose styling
<MarkdownRenderer content={text} className="prose" />

// Dark mode support
<MarkdownRenderer content={text} className="prose dark:prose-invert" />

// Full width (remove max-width)
<MarkdownRenderer content={text} className="prose max-w-none" />

// Different sizes
<MarkdownRenderer content={text} className="prose prose-sm" />  // Small
<MarkdownRenderer content={text} className="prose prose-lg" />  // Large
<MarkdownRenderer content={text} className="prose prose-xl" />  // Extra Large
```

### Custom Styling
```css
/* Override in your component or globals.css */
.markdown-content {
  /* Your custom styles */
}

.markdown-content h1 {
  /* Custom heading styles */
}

.markdown-content code {
  /* Custom code styles */
}
```

---

## 🔒 Security

### XSS Protection
- ✅ **Built-in**: `react-markdown` sanitizes HTML by default
- ✅ **Script tags**: Rendered as text, not executed
- ✅ **Event handlers**: Stripped from rendered output
- ✅ **Links**: Validated to prevent `javascript:` URLs

### Testing XSS Protection
```markdown
<!-- These will be safely escaped/rendered as text -->
<script>alert('XSS')</script>
<img src="x" onerror="alert('XSS')">
<a href="javascript:alert('XSS')">Click me</a>
```

---

## 📏 Character Limits

### Default Limits
- **Maximum**: 50,000 characters
- **Warning**: 45,000 characters (90% threshold)

### Visual Indicators
- **Normal** (< 45,000): Gray text
- **Warning** (45,000-50,000): Yellow text + "(approaching limit)"
- **Error** (> 50,000): Red text + "(limit exceeded)" + input prevented

### Customize Limits
```typescript
<MarkdownEditor
  value={content}
  onChange={setContent}
  maxLength={100000}  // Custom limit
/>
```

---

## 🎯 Mode Management (Node Detail Page)

### Available Modes
1. **Preview** (default): View formatted markdown
2. **Edit**: Edit content with MarkdownEditor
3. **Draft**: UI prepared for draft workflow
4. **Publish**: UI prepared for publish workflow

### Mode Switching
```typescript
const [mode, setMode] = useState<'preview' | 'edit' | 'draft' | 'publish'>('preview');

// Switch mode
<Button onClick={() => setMode('edit')}>Edit</Button>
<Button onClick={() => setMode('preview')}>Preview</Button>
```

---

## 🚀 Performance

### Bundle Sizes
- **Main bundle**: 84.6 KB
- **Initial load**: 89.3 KB
- **MarkdownEditor**: 932 KB (lazy-loaded)

### Optimizations
- ✅ **Dynamic Import**: MarkdownEditor loaded on-demand
- ✅ **React.memo**: MarkdownRenderer memoized
- ✅ **Code Splitting**: Separate chunks for markdown libraries

---

## 🐛 Troubleshooting

### Editor Not Loading
**Problem**: Loading skeleton shows indefinitely

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Markdown Not Rendering
**Problem**: Content shows as plain text

**Solution**:
1. Check content has markdown syntax
2. Verify MarkdownRenderer is imported correctly
3. Check browser console for errors

### Dark Text on Dark Background
**Problem**: Text invisible in editor

**Solution**:
```typescript
// Ensure data-color-mode is set
<div data-color-mode="light">
  <MarkdownEditor {...props} />
</div>
```

### Character Counter Not Updating
**Problem**: Counter stuck at old value

**Solution**:
```typescript
// Ensure onChange is called
<MarkdownEditor
  value={content}
  onChange={(val) => {
    console.log('New length:', val.length);
    setContent(val);
  }}
/>
```

---

## 📦 Dependencies

### Core Dependencies
```json
{
  "react-markdown": "^9.1.0",
  "@uiw/react-md-editor": "^4.0.8",
  "remark-gfm": "^4.0.1",
  "rehype-highlight": "^7.0.2",
  "highlight.js": "^11.11.1",
  "@tailwindcss/typography": "^0.5.19"
}
```

### Installing
```bash
npm install react-markdown@^9.1.0 \
            @uiw/react-md-editor@^4.0.8 \
            remark-gfm@^4.0.1 \
            rehype-highlight@^7.0.2 \
            highlight.js@^11.11.1

npm install -D @tailwindcss/typography@^0.5.19
```

---

## 🔗 Useful Links

### Documentation
- **React Markdown**: https://remarkjs.github.io/react-markdown/
- **GFM Spec**: https://github.github.com/gfm/
- **@uiw/react-md-editor**: https://uiwjs.github.io/react-md-editor/
- **Tailwind Typography**: https://tailwindcss.com/docs/typography-plugin

### Internal Docs
- **Implementation Summary**: `./IMPLEMENTATION_SUMMARY.md`
- **Deployment Checklist**: `./DEPLOYMENT_CHECKLIST.md`
- **Tasks**: `./tasks.md`
- **Contracts**: `./contracts/markdown-components.contract.md`

---

## 💡 Tips & Best Practices

### For Developers

1. **Always use MarkdownRenderer** for displaying markdown content
   ```typescript
   // ✅ Good
   <MarkdownRenderer content={node.content} />

   // ❌ Bad
   <div>{node.content}</div>
   ```

2. **Use dynamic import** for MarkdownEditor in dialogs
   ```typescript
   // Already implemented in components
   const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
     ssr: false,
     loading: () => <LoadingSkeleton />
   });
   ```

3. **Handle empty content gracefully**
   ```typescript
   {node.content ? (
     <MarkdownRenderer content={node.content} />
   ) : (
     <p className="text-gray-500">No content yet.</p>
   )}
   ```

4. **Validate content length before saving**
   ```typescript
   if (content.length > 50000) {
     toast.error('Content exceeds maximum length');
     return;
   }
   ```

### For Users

1. **Preview before saving** - Always check Preview tab before creating/saving
2. **Use headings** - Structure content with # heading syntax
3. **Code blocks** - Use triple backticks with language for syntax highlighting
4. **Watch character counter** - Keep content under 50,000 characters
5. **Test tables** - Preview tables to ensure proper formatting

---

## 📞 Support

### For Technical Issues
- Check `DEPLOYMENT_CHECKLIST.md` → Troubleshooting section
- Check browser console for errors
- Review `IMPLEMENTATION_SUMMARY.md` for known limitations

### For Feature Requests
- Submit issue to development team
- Include use case and expected behavior
- Provide examples if applicable

---

**Last Updated**: October 16, 2025
**Version**: 1.0.0
**Maintained By**: Development Team
