# Quickstart: Markdown Feature Validation

**Feature**: 006-markdown-features-start
**Purpose**: End-to-end validation that markdown rendering and editing works across all contexts
**Estimated Time**: 15-20 minutes

## Prerequisites

- ✅ Backend API running at `https://mujarrad.onrender.com` (or local)
- ✅ Frontend dev server running (`npm run dev`)
- ✅ Test space created with slug: `test-space`
- ✅ User authenticated with valid JWT token

---

## Setup

### 1. Install Dependencies

```bash
cd "/Users/mac/Developer/Software-Projects/PMZ Projects/Mujarrad/Mujarrad-Frontend"

# Install markdown dependencies
npm install react-markdown@^9.0.0 \
            @uiw/react-md-editor@^4.0.0 \
            remark-gfm@^4.0.0 \
            rehype-highlight@^7.0.0 \
            highlight.js@^11.9.0

# Install Tailwind typography plugin
npm install -D @tailwindcss/typography@^0.5.0
```

### 2. Update Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  // ... existing config
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

### 3. Start Dev Server

```bash
npm run dev
```

Open browser: `http://localhost:3000`

---

## Test Scenarios

### Scenario 1: Create Node with Markdown

**Objective**: Verify markdown editor works in CreateNodeDialog and content renders correctly.

#### Steps:

1. Navigate to space:
   ```
   http://localhost:3000/spaces/test-space
   ```

2. Click **"Create Node"** button

3. Fill in node details:
   - **Title**: `Markdown Test Node`
   - **Node Type**: `CONCEPT`
   - **Content** (in markdown editor):
     ```markdown
     # Project Overview

     This is a **test node** with markdown formatting.

     ## Features

     - Supports *italic* and **bold** text
     - Code blocks with syntax highlighting
     - Tables and task lists

     ## Code Example

     ```javascript
     function greet(name) {
       console.log(`Hello, ${name}!`);
     }
     ```

     ## Task List

     - [x] Create node with markdown
     - [ ] Edit existing markdown
     - [ ] Verify rendering

     ## Table

     | Feature | Status |
     |---------|--------|
     | Headers | ✅ |
     | Lists   | ✅ |
     | Code    | ✅ |
     ```

4. **Click "Preview" tab** in editor

5. **Verify Preview Shows**:
   - ✅ "Project Overview" as H1
   - ✅ "Features" and "Code Example" as H2
   - ✅ Bold text ("test node") is bold
   - ✅ Italic text is italic
   - ✅ Code block has syntax highlighting (JavaScript keywords colored)
   - ✅ Task list shows checkboxes (first checked, others unchecked)
   - ✅ Table renders with borders and alignment

6. **Click "Edit" tab** - verify content preserved

7. **Click "Create" button**

8. **Verify Success**:
   - ✅ Success toast/notification appears
   - ✅ Redirected to node detail page
   - ✅ Markdown renders correctly on detail page
   - ✅ All formatting preserved

#### Expected Result:
✅ Node created successfully with markdown content rendering properly

---

### Scenario 2: View Existing Node with Markdown

**Objective**: Verify MarkdownRenderer displays formatted content in NodeDetail view.

#### Steps:

1. Click on the newly created "Markdown Test Node"

2. **Verify Rendering**:
   - ✅ Heading "Project Overview" is large and bold (H1 styling)
   - ✅ Subheadings are appropriately sized (H2 styling)
   - ✅ Bold and italic text formatted correctly
   - ✅ Code block has dark background with syntax highlighting
   - ✅ Keywords like `function`, `console` are colored
   - ✅ Task list checkboxes are visible (checked/unchecked)
   - ✅ Table displays with grid layout
   - ✅ No raw markdown syntax visible (no `#`, `**`, etc.)

3. **Test Link Behavior**:
   - Add a link via edit: `[Google](https://google.com)`
   - ✅ Link should open in new tab when clicked
   - ✅ Link should have `rel="noopener noreferrer"` (check in DevTools)

4. **Test Dark Mode** (if supported):
   - Toggle dark mode
   - ✅ Prose colors invert for readability
   - ✅ Code block theme switches to dark

#### Expected Result:
✅ Markdown renders beautifully with all features working

---

### Scenario 3: Edit Existing Node

**Objective**: Verify MarkdownEditor loads existing content and saves changes.

#### Steps:

1. On node detail page, click **"Edit" button**

2. **Verify Editor Loads**:
   - ✅ Editor opens in "Edit" tab
   - ✅ Existing markdown content is displayed in textarea
   - ✅ Character count shows current length (e.g., "523 / 50,000")

3. **Modify Content**:
   - Add new section:
     ```markdown
     ## New Section

     Testing the **edit functionality** with:

     1. Ordered lists
     2. More formatting
     3. Image references

     ![Example Image](https://via.placeholder.com/150)
     ```

4. **Switch to Preview**:
   - Click "Preview" tab
   - ✅ New section renders correctly
   - ✅ Image loads from external URL
   - ✅ Old content still visible

5. **Save Changes**:
   - Click "Save" or "Update" button
   - ✅ Success notification appears

6. **Verify Persistence**:
   - Refresh page
   - ✅ Changes are persisted
   - ✅ New section visible
   - ✅ Image still loads

#### Expected Result:
✅ Edit works, changes persist, no data loss

---

### Scenario 4: Character Limit Validation

**Objective**: Verify character count and max length enforcement.

#### Steps:

1. Create new node or edit existing

2. **Test Character Counter**:
   - Type some content
   - ✅ Character count updates in real-time
   - ✅ Format: "X / 50,000"

3. **Test Warning at 90% Threshold**:
   - Copy-paste long content (45,000+ chars)
   - ✅ Character counter turns yellow/orange
   - ✅ Warning message appears

4. **Test Max Length Prevention**:
   - Paste content exceeding 50,000 chars
   - ✅ Editor prevents input beyond limit
   - ✅ Error message displays
   - ✅ "Create"/"Save" button may be disabled

5. **Test Validation on Submit**:
   - Try to submit with 50,001+ chars
   - ✅ Form validation error appears
   - ✅ Submission blocked

#### Expected Result:
✅ Character limits enforced, user warned appropriately

---

### Scenario 5: XSS Protection

**Objective**: Verify malicious content is sanitized and doesn't execute.

#### Steps:

1. Create new node with malicious markdown:
   ```markdown
   # XSS Test

   <script>alert("XSS Attack!")</script>

   <img src="x" onerror="alert('XSS')">

   [Click me](javascript:alert('XSS'))
   ```

2. **Switch to Preview tab**

3. **Verify Security**:
   - ✅ NO alert popups appear
   - ✅ `<script>` tag rendered as text (visible on page as literal text)
   - ✅ `<img>` tag rendered as text or safely displayed
   - ✅ `javascript:` link is blocked or rendered as plain text

4. **Save and view node**

5. **Verify on Detail Page**:
   - ✅ NO JavaScript execution
   - ✅ Malicious content displayed safely as text
   - ✅ No security warnings in browser console

#### Expected Result:
✅ All XSS attempts blocked, content sanitized

---

### Scenario 6: Space Documentation

**Objective**: Verify markdown works in Space Settings.

#### Steps:

1. Navigate to space settings:
   ```
   http://localhost:3000/spaces/test-space/settings
   ```

2. Find "Documentation" field

3. **Add markdown documentation**:
   ```markdown
   # Test Space

   This space is for **testing markdown features**.

   ## Purpose

   - Feature validation
   - Integration testing
   - User acceptance testing

   ## Resources

   - [Documentation](https://docs.example.com)
   - [API Reference](https://api.example.com)
   ```

4. **Preview** (if tabbed editor available)

5. **Save changes**

6. **Navigate back to space home**

7. **Verify Documentation Renders**:
   - ✅ Markdown documentation visible on space page
   - ✅ Properly formatted with headings, lists, links

#### Expected Result:
✅ Space documentation supports markdown

---

### Scenario 7: Mobile Responsiveness

**Objective**: Verify markdown editor and renderer work on mobile.

#### Steps:

1. Open Chrome DevTools (F12)

2. **Toggle Device Toolbar** (Ctrl+Shift+M)

3. **Select Mobile Device**: iPhone 12 Pro or similar

4. **Test Editor**:
   - Create/edit node
   - ✅ Editor is usable (not too small)
   - ✅ Tabs are tappable
   - ✅ Textarea scrolls properly
   - ✅ Preview renders correctly

5. **Test Rendered Content**:
   - View node detail
   - ✅ Markdown readable (appropriate font size)
   - ✅ Tables scroll horizontally if too wide
   - ✅ Images scale responsively
   - ✅ Code blocks scroll horizontally

#### Expected Result:
✅ Markdown feature is mobile-friendly

---

### Scenario 8: Plain Text Backward Compatibility

**Objective**: Verify existing plain text content still works.

#### Steps:

1. **Option A - Create plain text node programmatically**:
   ```bash
   curl -X POST https://mujarrad.onrender.com/api/spaces/test-space/nodes \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Plain Text Node",
       "content": "This is plain text without any markdown syntax. It should render as-is.",
       "node_type": "CONCEPT"
     }'
   ```

2. **Option B - Create via UI**:
   - Create node without any markdown syntax
   - Content: `"This is plain text without any markdown."`

3. **View the node**

4. **Verify Rendering**:
   - ✅ Plain text displays normally
   - ✅ No weird formatting or errors
   - ✅ Content wrapped in `<p>` tag
   - ✅ Line breaks preserved

5. **Edit the node**

6. **Verify Editor**:
   - ✅ Plain text loads in editor
   - ✅ Can add markdown syntax now
   - ✅ Preview shows plain text as paragraph

#### Expected Result:
✅ Existing plain text content works without issues

---

### Scenario 9: Performance with Large Documents

**Objective**: Verify performance with large markdown documents.

#### Steps:

1. Create node with large content:
   - Generate ~40,000 characters of markdown (mix of headings, lists, code)
   - Use online generator or script:
     ```javascript
     const sections = Array.from({ length: 100 }, (_, i) => `
     ## Section ${i + 1}

     This is section ${i + 1} with **bold** and *italic* text.

     - Item 1
     - Item 2
     - Item 3

     \`\`\`javascript
     const section = ${i + 1};
     console.log('Section', section);
     \`\`\`
     `).join('\n\n');
     ```

2. **Test Editor Performance**:
   - Paste large content
   - ✅ Editor doesn't freeze
   - ✅ Typing is responsive
   - ✅ Tab switch is smooth

3. **Test Preview Performance**:
   - Switch to Preview tab
   - ✅ Preview renders in < 2 seconds
   - ✅ Scrolling is smooth (60 FPS)

4. **Test Render Performance**:
   - Save and view node
   - ✅ Detail page loads quickly
   - ✅ Markdown renders fully
   - ✅ No lag when scrolling

5. **Check Browser Performance**:
   - Open DevTools → Performance tab
   - Record page load
   - ✅ No long tasks (> 50ms)
   - ✅ Memory usage reasonable

#### Expected Result:
✅ Handles large documents (up to 50k chars) smoothly

---

### Scenario 10: Syntax Highlighting Languages

**Objective**: Verify all supported languages highlight correctly.

#### Steps:

1. Create node with code blocks for each language:
   ````markdown
   # Syntax Highlighting Test

   ## JavaScript
   ```javascript
   const greeting = "Hello World";
   console.log(greeting);
   ```

   ## TypeScript
   ```typescript
   interface User {
     id: number;
     name: string;
   }
   ```

   ## Python
   ```python
   def greet(name: str) -> None:
       print(f"Hello, {name}!")
   ```

   ## Java
   ```java
   public class HelloWorld {
       public static void main(String[] args) {
           System.out.println("Hello World");
       }
   }
   ```

   ## HTML
   ```html
   <div class="container">
     <h1>Hello World</h1>
   </div>
   ```

   ## CSS
   ```css
   .container {
     max-width: 1200px;
     margin: 0 auto;
   }
   ```

   ## JSON
   ```json
   {
     "name": "Test",
     "version": "1.0.0"
   }
   ```

   ## Markdown
   ```markdown
   # Nested Markdown
   **Bold** and *italic*
   ```
   ````

2. **View Preview or Detail Page**

3. **Verify Syntax Highlighting**:
   - ✅ Keywords colored (e.g., `const`, `def`, `public`, `class`)
   - ✅ Strings colored differently
   - ✅ Each language has appropriate highlighting
   - ✅ Background color applied to code blocks
   - ✅ Font is monospace

#### Expected Result:
✅ All 8 languages highlight correctly

---

## Acceptance Criteria

### Must Pass (Critical)

- ✅ Scenario 1: Create node with markdown
- ✅ Scenario 2: View markdown rendering
- ✅ Scenario 3: Edit existing markdown
- ✅ Scenario 4: Character limit validation
- ✅ Scenario 5: XSS protection

### Should Pass (Important)

- ✅ Scenario 6: Space documentation
- ✅ Scenario 7: Mobile responsiveness
- ✅ Scenario 8: Plain text compatibility

### Nice to Have (Performance)

- ✅ Scenario 9: Large document performance
- ✅ Scenario 10: Syntax highlighting

---

## Troubleshooting

### Editor not loading

**Symptom**: Editor component doesn't appear

**Fixes**:
- Check browser console for errors
- Verify dependencies installed: `npm list @uiw/react-md-editor`
- Try dynamic import: `const Editor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })`

### Syntax highlighting not working

**Symptom**: Code blocks show plain text without colors

**Fixes**:
- Check highlight.js CSS imported: `import 'highlight.js/styles/github-dark.css'`
- Verify rehype-highlight plugin added to ReactMarkdown
- Check browser console for theme loading errors

### Character counter not updating

**Symptom**: Count stays at "0 / 50,000"

**Fixes**:
- Verify `showCharCount` prop is `true`
- Check `onChange` callback is firing
- Inspect component state in React DevTools

### Markdown not rendering

**Symptom**: Raw markdown syntax visible (e.g., `# Heading` instead of formatted heading)

**Fixes**:
- Verify MarkdownRenderer wraps content, not plain `<div>`
- Check remark-gfm plugin added
- Verify prose classes applied: `className="prose"`

### Preview tab empty

**Symptom**: Preview tab shows nothing

**Fixes**:
- Check if content value is passed to preview component
- Verify MarkdownRenderer is used in preview tab
- Check tab panel visibility logic

---

## Cleanup

After testing, you may want to:

1. **Delete test nodes**:
   - Select "Markdown Test Node" → Delete
   - Select "XSS Test" → Delete

2. **Reset space documentation**:
   - Go to settings → Clear documentation field

3. **Export test data** (optional):
   - Use browser tools to export created nodes for future regression tests

---

## Success Metrics

**Feature is ready for production when**:

- ✅ All 5 "Must Pass" scenarios pass
- ✅ At least 3 of 3 "Should Pass" scenarios pass
- ✅ No XSS vulnerabilities
- ✅ No console errors during normal usage
- ✅ Bundle size < 150KB (check build output)
- ✅ Lighthouse performance score > 90

---

## Next Steps

After quickstart validation:

1. ✅ **Run automated tests**: `npm test`
2. ✅ **Run E2E tests**: `npm run test:e2e`
3. ✅ **Check bundle size**: `npm run build && npm run analyze`
4. ✅ **Accessibility audit**: Run Lighthouse accessibility scan
5. ✅ **Code review**: Review PR for code quality
6. ✅ **Deploy to staging**: Test on staging environment
7. ✅ **User acceptance testing**: Get feedback from beta users

---

**Status**: ✅ Quickstart Guide Complete
**Estimated Duration**: 15-20 minutes for all scenarios
**Last Updated**: 2025-10-14
