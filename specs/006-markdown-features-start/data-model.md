# Data Model: Markdown Rendering and Editing

**Feature**: 006-markdown-features-start
**Date**: 2025-10-14
**Status**: Complete

## Overview

This feature does NOT introduce new data entities or modify the backend schema. It enhances the **presentation layer** by adding markdown rendering and editing capabilities to existing text fields.

---

## Existing Entities (No Changes)

### 1. Node Entity

**Backend**: Already exists in Spring Boot backend

```typescript
interface Node {
  id: string;                    // UUID
  title: string;                 // Node title
  content: string;               // ← ENHANCED: Now supports markdown syntax
  node_type: string;             // 'CONTEXT', 'CONCEPT', 'TASK', etc.
  node_details: Record<string, any>;
  space_id: string;
  parent_id: string | null;
  created_at: string;            // ISO timestamp
  updated_at: string;            // ISO timestamp
  created_by: string;            // User ID
  version: number;               // Optimistic locking
}
```

**Changes**:
- ❌ No schema changes
- ✅ `content` field accepts markdown syntax (backward compatible with plain text)
- ✅ Frontend renders `content` as markdown when displaying
- ✅ Frontend provides markdown editor when editing

---

### 2. Space Entity

**Backend**: Already exists

```typescript
interface Space {
  id: string;                    // UUID
  name: string;                  // Space name
  slug: string;                  // URL-friendly identifier
  description: string;           // Brief description
  documentation: string;         // ← ENHANCED: Now supports markdown syntax
  owner_id: string;              // User ID
  created_at: string;
  updated_at: string;
  version: number;
}
```

**Changes**:
- ❌ No schema changes
- ✅ `documentation` field accepts markdown syntax
- ✅ Frontend renders documentation as markdown

---

### 3. Comment Entity (If Exists)

**Backend**: Assumed to exist or will exist

```typescript
interface Comment {
  id: string;                    // UUID
  text: string;                  // ← ENHANCED: Now supports markdown syntax
  node_id: string;               // Reference to node
  author_id: string;             // User ID
  created_at: string;
  updated_at: string;
}
```

**Changes**:
- ❌ No schema changes
- ✅ `text` field accepts markdown syntax

---

### 4. Note Entity (If Exists)

**Backend**: Assumed to exist or will exist

```typescript
interface Note {
  id: string;                    // UUID
  title: string;                 // Note title
  content: string;               // ← ENHANCED: Now supports markdown syntax
  space_id: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  version: number;
}
```

**Changes**:
- ❌ No schema changes
- ✅ `content` field accepts markdown syntax

---

## Frontend-Only Data Models

These interfaces are **frontend-only** for component props and state management.

### 1. MarkdownRendererProps

```typescript
// src/types/markdown.ts

interface MarkdownRendererProps {
  /**
   * Markdown content to render
   */
  content: string;

  /**
   * Optional CSS class for the container
   */
  className?: string;

  /**
   * Optional custom components for markdown elements
   */
  components?: Partial<Components>;
}
```

**Usage**:
```typescript
<MarkdownRenderer
  content={node.content}
  className="prose dark:prose-invert"
/>
```

---

### 2. MarkdownEditorProps

```typescript
// src/types/markdown.ts

interface MarkdownEditorProps {
  /**
   * Current markdown value
   */
  value: string;

  /**
   * Callback when content changes
   */
  onChange: (value: string) => void;

  /**
   * Placeholder text for empty editor
   */
  placeholder?: string;

  /**
   * Maximum character limit (default: 50000)
   */
  maxLength?: number;

  /**
   * Whether editor is disabled
   */
  disabled?: boolean;

  /**
   * Optional CSS class for container
   */
  className?: string;

  /**
   * Show character count (default: true)
   */
  showCharCount?: boolean;

  /**
   * Initial tab ('edit' or 'preview')
   */
  initialTab?: 'edit' | 'preview';
}
```

**Usage**:
```typescript
<MarkdownEditor
  value={content}
  onChange={setContent}
  placeholder="Write your content in markdown..."
  maxLength={50000}
  showCharCount={true}
/>
```

---

### 3. CodeHighlightLanguage

```typescript
// src/types/markdown.ts

/**
 * Supported languages for syntax highlighting
 */
type CodeHighlightLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown';

/**
 * Configuration for code block syntax highlighting
 */
interface CodeHighlightConfig {
  /**
   * Theme to use for highlighting
   */
  theme: 'github-dark' | 'github-light' | 'monokai' | 'solarized-dark';

  /**
   * Languages to enable (subset for smaller bundle)
   */
  languages: CodeHighlightLanguage[];

  /**
   * Show line numbers in code blocks
   */
  showLineNumbers?: boolean;
}
```

---

### 4. MarkdownConfig

```typescript
// src/lib/markdown/config.ts

/**
 * Global markdown rendering configuration
 */
interface MarkdownConfig {
  /**
   * Enable GitHub Flavored Markdown
   */
  gfm: boolean;

  /**
   * Enable syntax highlighting
   */
  syntaxHighlight: boolean;

  /**
   * Code highlight configuration
   */
  codeConfig: CodeHighlightConfig;

  /**
   * Link behavior
   */
  linkTarget: '_blank' | '_self';

  /**
   * Add noopener noreferrer to external links
   */
  safeLinks: boolean;

  /**
   * Allow raw HTML in markdown (default: false for security)
   */
  allowHtml: boolean;
}

/**
 * Default configuration
 */
export const defaultMarkdownConfig: MarkdownConfig = {
  gfm: true,
  syntaxHighlight: true,
  codeConfig: {
    theme: 'github-dark',
    languages: ['javascript', 'typescript', 'python', 'java', 'html', 'css', 'json', 'markdown'],
    showLineNumbers: false,
  },
  linkTarget: '_blank',
  safeLinks: true,
  allowHtml: false,  // Security: block raw HTML
};
```

---

## Validation Rules

### Frontend Validation (Zod)

```typescript
// src/lib/validations/markdown.ts

import { z } from 'zod';

export const markdownContentSchema = z.object({
  content: z
    .string()
    .max(50000, 'Content must be less than 50,000 characters')
    .optional()
    .or(z.literal('')),
});

export const nodeWithMarkdownSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z
    .string()
    .max(50000, 'Content must be less than 50,000 characters')
    .optional(),
  node_type: z.string(),
  // ... other node fields
});

export const spaceWithMarkdownSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  documentation: z
    .string()
    .max(50000, 'Documentation must be less than 50,000 characters')
    .optional(),
  // ... other space fields
});
```

**Usage in Forms**:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { nodeWithMarkdownSchema } from '@/lib/validations/markdown';

const form = useForm({
  resolver: zodResolver(nodeWithMarkdownSchema),
  defaultValues: { title: '', content: '', node_type: 'CONCEPT' },
});
```

---

## State Management

### No New Zustand Stores Required

Markdown content is managed through:
1. **Existing React Query hooks** for server state (nodes, spaces)
2. **React Hook Form** for form state (editing)
3. **Local component state** for editor tab switching

**Example**:
```typescript
// Fetching node with markdown content (existing hook)
const { data: node } = useNode(spaceSlug, nodeId);

// Editing node with markdown (existing mutation)
const updateNode = useUpdateNode(spaceSlug);

// Form state for markdown editor
const [content, setContent] = useState(node?.content || '');
```

---

## API Contracts (No Changes)

### Existing Endpoints Used

1. **Create Node with Markdown**
   ```
   POST /api/spaces/{slug}/nodes
   Content-Type: application/json

   {
     "title": "My Node",
     "content": "# Heading\n\n**Bold** text with `code`",
     "node_type": "CONCEPT"
   }
   ```

2. **Update Node with Markdown**
   ```
   PUT /api/spaces/{slug}/nodes/{id}
   Content-Type: application/json

   {
     "title": "Updated Node",
     "content": "## Updated\n\nWith markdown.",
     "version": 3
   }
   ```

3. **Get Node (Returns Markdown)**
   ```
   GET /api/spaces/{slug}/nodes/{id}

   Response:
   {
     "id": "uuid",
     "title": "My Node",
     "content": "# Heading\n\n**Bold** text",
     "node_type": "CONCEPT",
     "created_at": "2025-10-14T10:00:00Z",
     ...
   }
   ```

4. **Update Space Documentation**
   ```
   PUT /api/spaces/{slug}
   Content-Type: application/json

   {
     "documentation": "# Space Docs\n\nOverview..."
   }
   ```

---

## Data Flow

### Read Flow (Rendering)

```
User opens node detail page
  ↓
Next.js route: /spaces/[slug]/node/[id]/page.tsx
  ↓
useNode(slug, id) → React Query cache/API
  ↓
NodeDetail component receives node.content
  ↓
<MarkdownRenderer content={node.content} />
  ↓
react-markdown parses and renders markdown
  ↓
User sees formatted HTML
```

### Write Flow (Editing)

```
User clicks "Edit Node"
  ↓
EditNodeDialog opens with <MarkdownEditor />
  ↓
User types in Edit tab: "# Hello"
  ↓
User clicks Preview tab → sees rendered "Hello" heading
  ↓
User clicks "Save"
  ↓
React Hook Form validates (Zod schema)
  ↓
useUpdateNode mutation → PUT /api/spaces/{slug}/nodes/{id}
  ↓
Backend saves plain markdown text to node.content
  ↓
React Query invalidates cache
  ↓
NodeDetail re-renders with new markdown content
```

---

## Backward Compatibility

### Existing Plain Text Content

**Scenario**: Nodes created before markdown feature have plain text in `content` field.

**Behavior**:
- ✅ Plain text renders as plain text in markdown (no breaking changes)
- ✅ No migration needed
- ✅ Users can gradually enhance existing content with markdown

**Example**:
```typescript
// Old content (still works)
content: "This is plain text."

// Rendered markdown output:
<p>This is plain text.</p>

// Enhanced content (new)
content: "# Title\n\nThis is **enhanced** text."

// Rendered markdown output:
<h1>Title</h1>
<p>This is <strong>enhanced</strong> text.</p>
```

---

## Security Considerations

### XSS Prevention

1. **react-markdown**: Does NOT parse raw HTML by default
2. **Link Validation**: Custom component blocks `javascript:` and `data:` URLs
3. **No `dangerouslySetInnerHTML`**: All rendering via React JSX

**Example**:
```typescript
// Malicious input
content: '<script>alert("XSS")</script>'

// Rendered output (safe):
<p>&lt;script&gt;alert("XSS")&lt;/script&gt;</p>
```

### Content Length Limits

- **Frontend**: Zod validation (50,000 chars)
- **Backend**: Existing database column limits apply
- **UI**: Character counter warns users at 45,000+ chars

---

## Testing Data

### Sample Markdown Content for Tests

```typescript
// tests/fixtures/markdown.ts

export const sampleMarkdown = {
  basic: '# Heading\n\n**Bold** and *italic* text.',

  codeBlock: '```javascript\nconst x = 1;\nconsole.log(x);\n```',

  table: `
| Column 1 | Column 2 |
|----------|----------|
| Value 1  | Value 2  |
`,

  taskList: `
- [x] Completed task
- [ ] Pending task
`,

  mixed: `
# Project Overview

This is a **project** with:

1. Code examples
2. Task lists
3. Tables

## Code Example

\`\`\`typescript
interface User {
  id: string;
  name: string;
}
\`\`\`

## Tasks

- [x] Setup project
- [ ] Write tests
`,

  xssAttempt: '<script>alert("XSS")</script>',

  longContent: 'A'.repeat(50000),  // Max length test

  empty: '',
};
```

---

## Summary

### Data Changes: NONE

- ❌ No new database tables
- ❌ No schema migrations
- ❌ No new API endpoints
- ❌ No DTO changes

### Frontend Changes: Presentation Only

- ✅ New TypeScript interfaces for component props
- ✅ New Zod schemas for validation
- ✅ Existing entities enhanced with markdown rendering
- ✅ Backward compatible with existing plain text

### Compliance

- ✅ **Constitution I (Node Supremacy)**: No new entities, uses existing nodes
- ✅ **Constitution IV (Backend Alignment)**: No backend changes, uses existing DTOs
- ✅ **Constitution V (Clean Architecture)**: Types in `/types`, validation in `/lib/validations`
- ✅ **Constitution VI (Type Safety)**: All interfaces defined, no `any` types

---

**Status**: ✅ Data Model Complete (Frontend-only enhancements)
**Next**: API Contracts & Tests (Phase 1 continuation)
