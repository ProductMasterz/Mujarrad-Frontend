# Data Model: Obsidian-like Page Hierarchy and Graph Navigation

**Feature**: 004-i-need-to
**Date**: 2025-10-07
**Status**: Complete

## Overview

This document defines the data structures, TypeScript interfaces, and state management for the Obsidian-like features. All interfaces align with backend DTOs and constitutional requirements.

---

## 1. Core Entities (Backend DTOs)

### Node (Page)

Represents both CONTEXT (folders) and REGULAR (content pages) nodes.

```typescript
interface Node {
  id: string;
  workspaceId: string;
  title: string;
  slug: string;
  nodeType: 'REGULAR' | 'CONTEXT';
  markdownContent?: string;
  nodeDetails?: Record<string, any>;
  createdBy: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  version: number;
}
```

**Validation Rules:**
- `title`: 1-200 characters, required
- `slug`: URL-safe, unique within workspace
- `nodeType`: Must be 'REGULAR' or 'CONTEXT'
- `markdownContent`: Only for REGULAR nodes, optional for CONTEXT
- `version`: Used for optimistic locking

**State Transitions:**
```
CREATE → [ACTIVE] → UPDATE → [ACTIVE] → DELETE → [ARCHIVED]
                  ↓
                VERSION_INCREMENT
```

---

### Attribute (Relationship/Edge)

Represents all relationships between nodes, including hierarchy and wiki-links.

```typescript
interface Attribute {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  attributeType: AttributeType;
  attributeKey: string;
  attributeValue?: string;
  metadata?: AttributeMetadata;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

type AttributeType =
  | 'contains'      // Hierarchy (CONTEXT → child nodes)
  | 'references'    // Wiki-links and citations
  | 'depends_on'    // Dependencies
  | 'triggers'      // Workflow connections
  | 'next'          // Sequential flow
  | 'calls';        // Function invocations

interface AttributeMetadata {
  // For wiki-links
  displayText?: string;      // Alias from [[Display|Target]]
  targetTitle?: string;      // Original target title
  isPlaceholder?: boolean;   // True if target was auto-created

  // For bidirectional edges (graph rendering)
  isBidirectional?: boolean; // A→B and B→A both exist

  // For all relationships
  description?: string;
  weight?: number;
  [key: string]: any;
}
```

**Validation Rules:**
- `attributeType`: Must be one of the defined types
- `attributeKey`: For references type, use "wiki-link"
- `metadata.displayText`: Store alias if provided in [[Display|Target]]
- `contains` relationships: Must not create cycles (backend validates)

---

### Workspace Context

Current workspace information for scoping all operations.

```typescript
interface Workspace {
  id: string;
  slug: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 2. Frontend-Specific Models

### Tree Node (Hierarchy Display)

Enhanced node for tree navigation with children and UI state.

```typescript
interface TreeNode {
  node: Node;
  children: TreeNode[];
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  parentId: string | null;
}

interface HierarchyTree {
  rootNodes: TreeNode[];  // Top-level nodes (no parents)
  nodeMap: Map<string, TreeNode>;
}
```

**Construction Algorithm:**
```typescript
function buildHierarchyTree(
  nodes: Node[],
  attributes: Attribute[]
): HierarchyTree {
  // 1. Filter contains relationships
  const containsRels = attributes.filter(a => a.attributeType === 'contains');

  // 2. Build parent-child map
  const childrenMap = new Map<string, string[]>();
  containsRels.forEach(rel => {
    const children = childrenMap.get(rel.sourceNodeId) || [];
    children.push(rel.targetNodeId);
    childrenMap.set(rel.sourceNodeId, children);
  });

  // 3. Find root nodes (nodes with no parent)
  const hasParent = new Set(containsRels.map(r => r.targetNodeId));
  const rootNodes = nodes.filter(n => !hasParent.has(n.id));

  // 4. Recursively build tree
  function buildSubtree(node: Node, level: number): TreeNode {
    const childIds = childrenMap.get(node.id) || [];
    const children = childIds
      .map(id => nodes.find(n => n.id === id))
      .filter(Boolean)
      .map(child => buildSubtree(child!, level + 1));

    return {
      node,
      children,
      level,
      isExpanded: false,
      isSelected: false,
      parentId: null, // Will be set by parent
    };
  }

  return {
    rootNodes: rootNodes.map(n => buildSubtree(n, 0)),
    nodeMap: /* populate from recursive traversal */
  };
}
```

---

### Wiki Link

Parsed wiki-link from markdown content.

```typescript
interface WikiLink {
  raw: string;              // Original [[...]] string
  displayText: string;      // Text to show (before pipe or full)
  targetTitle: string;      // Page title to resolve
  startIndex: number;       // Position in markdown
  endIndex: number;         // Position in markdown
}

interface WikiLinkResolution {
  link: WikiLink;
  targetNodeId: string | null; // null if not found
  needsPlaceholder: boolean;    // true if should create
}
```

**Parsing Function:**
```typescript
function parseWikiLinks(markdown: string): WikiLink[] {
  const pattern = /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g;
  const links: WikiLink[] = [];

  let match;
  while ((match = pattern.exec(markdown)) !== null) {
    const hasAlias = Boolean(match[2]);
    links.push({
      raw: match[0],
      displayText: hasAlias ? match[1] : match[1],
      targetTitle: hasAlias ? match[3] : match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return links;
}
```

---

### Graph Data

React Flow compatible data structures.

```typescript
import { Node as FlowNode, Edge as FlowEdge } from 'reactflow';

interface GraphNode extends FlowNode {
  id: string;
  type: 'context' | 'regular';  // Custom node types
  data: {
    node: Node;
    label: string;
    isSelected: boolean;
  };
  position: { x: number; y: number };
}

interface GraphEdge extends FlowEdge {
  id: string;
  source: string;
  target: string;
  type: string;  // 'default' | 'bidirectional' | 'contains'
  data: {
    attribute: Attribute;
    isBidirectional: boolean;
  };
  animated?: boolean;
  style?: React.CSSProperties;
}

interface GraphViewMode {
  showContext: boolean;    // Show CONTEXT nodes
  showRegular: boolean;    // Show REGULAR nodes
  showContains: boolean;   // Show hierarchy edges
  showReferences: boolean; // Show wiki-link edges
}
```

**Graph Construction:**
```typescript
function buildGraphData(
  nodes: Node[],
  attributes: Attribute[],
  viewMode: GraphViewMode
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  // 1. Filter nodes by view mode
  let filteredNodes = nodes;
  if (!viewMode.showContext) {
    filteredNodes = filteredNodes.filter(n => n.nodeType === 'REGULAR');
  }
  if (!viewMode.showRegular) {
    filteredNodes = filteredNodes.filter(n => n.nodeType === 'CONTEXT');
  }

  // 2. Convert to FlowNodes with custom types
  const flowNodes: GraphNode[] = filteredNodes.map(node => ({
    id: node.id,
    type: node.nodeType === 'CONTEXT' ? 'context' : 'regular',
    data: {
      node,
      label: node.title,
      isSelected: false,
    },
    position: { x: 0, y: 0 }, // Will be calculated by layout algorithm
  }));

  // 3. Filter edges by view mode
  let filteredAttributes = attributes;
  if (!viewMode.showContains) {
    filteredAttributes = filteredAttributes.filter(a => a.attributeType !== 'contains');
  }
  if (!viewMode.showReferences) {
    filteredAttributes = filteredAttributes.filter(a => a.attributeType !== 'references');
  }

  // 4. Detect bidirectional edges
  const bidirectional = detectBidirectionalEdges(filteredAttributes);

  // 5. Convert to FlowEdges
  const flowEdges: GraphEdge[] = filteredAttributes.map(attr => ({
    id: attr.id,
    source: attr.sourceNodeId,
    target: attr.targetNodeId,
    type: getBidirectionalType(attr, bidirectional),
    data: {
      attribute: attr,
      isBidirectional: bidirectional.has(attr.id),
    },
    animated: attr.attributeType === 'triggers',
    style: getEdgeStyle(attr, bidirectional.has(attr.id)),
  }));

  return { nodes: flowNodes, edges: flowEdges };
}

function detectBidirectionalEdges(attributes: Attribute[]): Set<string> {
  const bidirectional = new Set<string>();
  const edgeMap = new Map<string, Attribute>();

  attributes.forEach(attr => {
    const key = `${attr.sourceNodeId}-${attr.targetNodeId}`;
    const reverseKey = `${attr.targetNodeId}-${attr.sourceNodeId}`;

    if (edgeMap.has(reverseKey)) {
      const reverse = edgeMap.get(reverseKey)!;
      if (attr.attributeType === reverse.attributeType) {
        bidirectional.add(attr.id);
        bidirectional.add(reverse.id);
      }
    }
    edgeMap.set(key, attr);
  });

  return bidirectional;
}
```

---

## 3. State Management

### Zustand Store (Global UI State)

```typescript
interface NavigationState {
  // Workspace context
  currentWorkspaceId: string | null;
  currentWorkspace: Workspace | null;

  // Navigation
  selectedNodeId: string | null;
  navigationHistory: string[];
  historyIndex: number;

  // Graph view settings
  graphViewMode: GraphViewMode;

  // Hierarchy UI state
  expandedNodeIds: Set<string>;

  // Actions
  setWorkspace: (workspace: Workspace) => void;
  setSelectedNode: (nodeId: string) => void;
  goBack: () => void;
  goForward: () => void;
  toggleGraphViewMode: (key: keyof GraphViewMode) => void;
  toggleNodeExpanded: (nodeId: string) => void;
}

const useNavigationStore = create<NavigationState>((set, get) => ({
  currentWorkspaceId: null,
  currentWorkspace: null,
  selectedNodeId: null,
  navigationHistory: [],
  historyIndex: -1,
  graphViewMode: {
    showContext: true,
    showRegular: true,
    showContains: true,
    showReferences: true,
  },
  expandedNodeIds: new Set(),

  setWorkspace: (workspace) => set({
    currentWorkspace: workspace,
    currentWorkspaceId: workspace.id
  }),

  setSelectedNode: (nodeId) => {
    const { navigationHistory, historyIndex } = get();
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push(nodeId);
    set({
      selectedNodeId: nodeId,
      navigationHistory: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  goBack: () => {
    const { historyIndex, navigationHistory } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        historyIndex: newIndex,
        selectedNodeId: navigationHistory[newIndex],
      });
    }
  },

  goForward: () => {
    const { historyIndex, navigationHistory } = get();
    if (historyIndex < navigationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        historyIndex: newIndex,
        selectedNodeId: navigationHistory[newIndex],
      });
    }
  },

  toggleGraphViewMode: (key) => {
    set((state) => ({
      graphViewMode: {
        ...state.graphViewMode,
        [key]: !state.graphViewMode[key],
      },
    }));
  },

  toggleNodeExpanded: (nodeId) => {
    set((state) => {
      const newExpanded = new Set(state.expandedNodeIds);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return { expandedNodeIds: newExpanded };
    });
  },
}));
```

### React Query Hooks (Server State)

```typescript
// Fetch nodes in workspace
function useWorkspaceNodes(workspaceId: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'nodes'],
    queryFn: () => nodeService.getNodesByWorkspace(workspaceId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: Boolean(workspaceId),
  });
}

// Fetch single node with relationships
function useNode(nodeId: string) {
  return useQuery({
    queryKey: ['nodes', nodeId],
    queryFn: () => nodeService.getNode(nodeId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(nodeId),
  });
}

// Fetch node attributes (relationships)
function useNodeAttributes(nodeId: string) {
  return useQuery({
    queryKey: ['nodes', nodeId, 'attributes'],
    queryFn: () => attributeService.getNodeAttributes(nodeId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(nodeId),
  });
}

// Create wiki-link relationships
function useCreateWikiLinks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nodeId, links }: { nodeId: string; links: WikiLinkResolution[] }) => {
      // 1. Create placeholder nodes if needed
      const placeholders = await Promise.all(
        links
          .filter(l => l.needsPlaceholder)
          .map(l => nodeService.createNode({
            title: l.link.targetTitle,
            nodeType: 'REGULAR',
            markdownContent: '',
            workspaceId: /* from store */,
          }))
      );

      // 2. Create references attributes
      const attributes = await Promise.all(
        links.map(l => attributeService.createAttribute({
          sourceNodeId: nodeId,
          targetNodeId: l.targetNodeId || placeholders.find(p => p.title === l.link.targetTitle)!.id,
          attributeType: 'references',
          attributeKey: 'wiki-link',
          metadata: {
            displayText: l.link.displayText,
            targetTitle: l.link.targetTitle,
            isPlaceholder: l.needsPlaceholder,
          },
        }))
      );

      return { placeholders, attributes };
    },
    onSuccess: (_, { nodeId }) => {
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['nodes', nodeId, 'attributes'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}
```

---

## 4. Form Validation Schemas

### Node Creation/Edit

```typescript
import { z } from 'zod';

const nodeSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),

  nodeType: z.enum(['REGULAR', 'CONTEXT']),

  markdownContent: z.string().optional(),

  slug: z.string()
    .regex(/^[a-z0-9-]+$/, 'Slug must be URL-safe (lowercase letters, numbers, hyphens)')
    .optional(), // Auto-generated if not provided
});

type NodeFormData = z.infer<typeof nodeSchema>;
```

### Wiki-link Resolution

```typescript
const wikiLinkSchema = z.object({
  displayText: z.string(),
  targetTitle: z.string(),
  createPlaceholder: z.boolean(),
});
```

---

## 5. Error States

```typescript
interface NodeError {
  type: 'NOT_FOUND' | 'UNAUTHORIZED' | 'VALIDATION' | 'CONFLICT' | 'SERVER_ERROR';
  message: string;
  field?: string; // For validation errors
  details?: any;
}

interface CircularDependencyError extends NodeError {
  type: 'CONFLICT';
  cyclePath: string[]; // Array of node IDs forming the cycle
}
```

---

## Summary

All data structures defined with:
- ✅ TypeScript interfaces matching backend DTOs
- ✅ Validation rules using Zod schemas
- ✅ State management with Zustand + React Query
- ✅ Transformation functions for UI models
- ✅ Error types for comprehensive error handling

**Ready to proceed to Phase 1: Contracts & API Integration**
