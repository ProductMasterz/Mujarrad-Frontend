# Component Usage Guide

This guide demonstrates how to use the comprehensive UI component library created for the Mujarrad Knowledge Graph Frontend.

## Table of Contents

1. [UI Primitives](#ui-primitives)
2. [Workspace Components](#workspace-components)
3. [Node Components](#node-components)
4. [Graph Visualization Components](#graph-visualization-components)

---

## UI Primitives

### Dialog

Create modal dialogs with proper accessibility.

```typescript
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function MyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description text</DialogDescription>
        </DialogHeader>
        {/* Content */}
        <DialogFooter>
          <Button>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Select

Dropdown select component with keyboard navigation.

```typescript
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export function MySelect() {
  return (
    <Select onValueChange={(value) => console.log(value)}>
      <SelectTrigger>
        <SelectValue placeholder="Select option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

### Textarea

Multi-line text input component.

```typescript
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function MyForm() {
  return (
    <div>
      <Label htmlFor="description">Description</Label>
      <Textarea id="description" placeholder="Enter description..." rows={5} />
    </div>
  );
}
```

### Spinner

Loading spinner component with size variants.

```typescript
import { Spinner } from '@/components/ui/spinner';

export function LoadingExample() {
  return (
    <div>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  );
}
```

### Badge

Display badges with different variants.

```typescript
import { Badge } from '@/components/ui/badge';

export function BadgeExample() {
  return (
    <div className="flex gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  );
}
```

---

## Workspace Components

### WorkspaceList

Display a grid of workspace cards with loading and error states.

```typescript
'use client';

import { WorkspaceList } from '@/components/workspaces';

export default function WorkspacesPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Workspaces</h1>
      <WorkspaceList />
    </div>
  );
}
```

**Features:**
- Automatic loading state with spinner
- Error handling
- Empty state message
- Responsive grid layout (1 column mobile, 2 tablet, 3 desktop)

### WorkspaceCard

Display individual workspace information (used internally by WorkspaceList).

```typescript
import { WorkspaceCard } from '@/components/workspaces';
import { Workspace } from '@/types/backend-dtos';

const workspace: Workspace = {
  id: 1,
  name: 'My Workspace',
  slug: 'my-workspace',
  description: 'A workspace for my notes',
  ownerId: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
};

export function Example() {
  return <WorkspaceCard workspace={workspace} />;
}
```

### CreateWorkspaceDialog

Dialog for creating new workspaces with form validation.

```typescript
import { CreateWorkspaceDialog } from '@/components/workspaces';

export function WorkspacesPageHeader() {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">My Workspaces</h1>
      <CreateWorkspaceDialog />
    </div>
  );
}
```

**Features:**
- Form validation with Zod schema
- Real-time error messages
- Loading state during submission
- Auto-closes on success
- Integrates with React Query for cache invalidation

---

## Node Components

### NodeList

Display a grid of node cards within a workspace.

```typescript
'use client';

import { NodeList } from '@/components/nodes';

export default function NodesPage({ params }: { params: { slug: string } }) {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Nodes</h1>
      <NodeList workspaceSlug={params.slug} />
    </div>
  );
}
```

### NodeCard

Display individual node with type badge and content preview.

```typescript
import { NodeCard } from '@/components/nodes';
import { Node, NodeType } from '@/types/backend-dtos';

const node: Node = {
  id: 1,
  workspaceId: 1,
  title: 'My First Node',
  nodeType: NodeType.REGULAR,
  markdownContent: '# Hello World\n\nThis is my first node.',
  version: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
};

export function Example() {
  return <NodeCard node={node} workspaceSlug="my-workspace" />;
}
```

**Features:**
- Color-coded badges for node types (REGULAR, CONTEXT, ASSUMPTION)
- Content preview with truncation
- Relative time display
- Clickable card navigates to node detail page

### CreateNodeDialog

Dialog for creating new nodes with type selection.

```typescript
import { CreateNodeDialog } from '@/components/nodes';

export function NodesPageHeader({ workspaceSlug }: { workspaceSlug: string }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Nodes</h1>
      <CreateNodeDialog workspaceSlug={workspaceSlug} />
    </div>
  );
}
```

**Features:**
- Node type selector (REGULAR, CONTEXT, ASSUMPTION)
- Markdown content editor
- Form validation
- Loading state
- Cache invalidation for nodes and graph

---

## Graph Visualization Components

### GraphCanvas

Full-featured graph visualization using ReactFlow.

```typescript
'use client';

import { GraphCanvas } from '@/components/graph';

export default function GraphPage({ params }: { params: { slug: string } }) {
  return (
    <div className="h-screen">
      <GraphCanvas workspaceSlug={params.slug} />
    </div>
  );
}
```

**Features:**
- Custom node rendering with type-based colors
- Interactive node positioning
- Zoom and pan controls
- MiniMap for navigation
- Background grid
- Auto-layout with fit view
- Loading state

### CustomNode

Custom node renderer for the graph (used internally by GraphCanvas).

```typescript
import { CustomNode } from '@/components/graph';

// Used as node type in ReactFlow
const nodeTypes = {
  custom: CustomNode,
};
```

**Features:**
- Color-coded by node type
- Connection handles (top and bottom)
- Minimal, clean design
- Responsive sizing

---

## Complete Page Examples

### Workspaces Page

```typescript
'use client';

import { WorkspaceList, CreateWorkspaceDialog } from '@/components/workspaces';

export default function WorkspacesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Workspaces</h1>
        <CreateWorkspaceDialog />
      </div>
      <WorkspaceList />
    </div>
  );
}
```

### Workspace Detail Page with Nodes

```typescript
'use client';

import { NodeList, CreateNodeDialog } from '@/components/nodes';
import { useWorkspace } from '@/hooks/api';
import { Spinner } from '@/components/ui/spinner';

export default function WorkspaceDetailPage({ params }: { params: { slug: string } }) {
  const { data: workspace, isLoading } = useWorkspace(params.slug);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{workspace?.name}</h1>
        <p className="text-muted-foreground">{workspace?.description}</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Nodes</h2>
        <CreateNodeDialog workspaceSlug={params.slug} />
      </div>

      <NodeList workspaceSlug={params.slug} />
    </div>
  );
}
```

### Graph Visualization Page

```typescript
'use client';

import { GraphCanvas } from '@/components/graph';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function GraphPage({ params }: { params: { slug: string } }) {
  return (
    <div className="h-screen flex flex-col">
      <div className="border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Knowledge Graph</h1>
        <Link href={`/workspaces/${params.slug}`}>
          <Button variant="outline">Back to Workspace</Button>
        </Link>
      </div>
      <div className="flex-1">
        <GraphCanvas workspaceSlug={params.slug} />
      </div>
    </div>
  );
}
```

---

## Component Architecture

### File Structure

```
src/
├── components/
│   ├── ui/                    # UI Primitives (Radix UI based)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── spinner.tsx
│   │   └── textarea.tsx
│   ├── workspaces/            # Workspace domain components
│   │   ├── WorkspaceCard.tsx
│   │   ├── WorkspaceList.tsx
│   │   ├── CreateWorkspaceDialog.tsx
│   │   └── index.ts
│   ├── nodes/                 # Node domain components
│   │   ├── NodeCard.tsx
│   │   ├── NodeList.tsx
│   │   ├── CreateNodeDialog.tsx
│   │   └── index.ts
│   ├── graph/                 # Graph visualization components
│   │   ├── CustomNode.tsx
│   │   ├── GraphCanvas.tsx
│   │   └── index.ts
│   └── index.ts               # Barrel export
```

### Key Features

1. **Type Safety**: All components fully typed with TypeScript
2. **Form Validation**: Zod schemas for all forms
3. **State Management**: React Query for server state
4. **Accessibility**: Built on Radix UI primitives
5. **Styling**: Tailwind CSS with design system
6. **Error Handling**: ApiError integration
7. **Loading States**: Spinner component for async operations
8. **Responsive**: Mobile-first design

### Integration Points

- **Hooks**: Uses custom hooks from `/hooks/api`
- **Schemas**: Validates with Zod schemas from `/schemas`
- **Types**: Backend DTOs from `/types/backend-dtos`
- **Utilities**: Helper functions from `/lib/utils`
- **Errors**: ApiError from `/lib/errors`

---

## Next Steps

To use these components in your application:

1. Create the Next.js app directory structure
2. Add the page components shown above
3. Wrap your app with required providers (QueryClientProvider, AuthProvider)
4. Add routing and navigation
5. Customize styling with your design tokens

All components are production-ready and follow best practices for:
- Performance (React.memo where needed)
- Accessibility (ARIA attributes, keyboard navigation)
- User experience (loading states, error messages, empty states)
- Developer experience (TypeScript, clear props, documentation)
