# EIAN Navigation and Context-Aware Creation — Architecture Protocol

**Version:** 1.0
**Branch:** `015-api-updates`
**Date:** 2026-06-06
**Status:** Authoritative reference — supersedes all inline comments and ad-hoc documentation

---

## Executive Summary

EIAN stands for the layered entity system at the core of Mujarrad: **E**ntities (nodes of any type), **I**nformation architecture (the context layer hierarchy), **A**ttributes (typed relationships between nodes), and **N**avigation (the URL-driven routing protocol that connects them). It exists because nodes in Mujarrad have two fundamentally different representations — a *layer view* (for CONTEXT nodes) and a *content view* (for REGULAR and CONTEXT nodes) — and the entire frontend must agree on which representation to show at which URL. Every bug in the navigation, creation, and cache invalidation systems traces back to a single violation: a component acting on a hardcoded assumption about node type or origin context instead of delegating to the canonical routing function and the correct creation endpoint.

---

## 1. Node Type Reference Table

| Type | Purpose | Default View on Click | Available Views | Creation API | Shows in Space List |
|---|---|---|---|---|---|
| `REGULAR` (no `parentNodeId`) | Content page — owns text, blocks, relationships | `/spaces/[slug]/node/[id]` (content view) | Block editor, Markdown, Graph | `POST /contexts/{ctx}/nodes` (in context); `POST /nodes` (deprecated, lands in Blank) | Yes — `showInSpaceList` defaults true |
| `REGULAR` (`parentNodeId` set) | Block inside a page — text, heading, list item, todo, code, etc. | Not navigable independently | Block editor only (within parent page) | `POST /nodes/{parentId}/children` | No — `showInSpaceList: false`, filtered at data layer |
| `CONTEXT` (has `slug`) | Organisational layer — groups regular nodes and child contexts | `/spaces/[slug]/context/[contextSlug]` (layer view) | Layer view (primary), Block editor as secondary content view via `?fromContext` | `POST /contexts/{parentCtx}/contexts` (nested); `POST /nodes` with `nodeType: CONTEXT` (deprecated) | Yes — appears in context grid at space root |
| `CONTEXT` (no `slug`) | Degenerate state — must not occur in production; treat as `REGULAR` for routing | `/spaces/[slug]/node/[id]` | Block editor only | Should not be created | Conditional |
| `ATTRIBUTE` | Represents an edge in the graph — not a navigable page | Not navigable | Graph view only | `POST /nodes/{nodeId}/attributes` | No |

**NodeDetails signals that determine block vs. page:**

| Signal | Meaning |
|---|---|
| `nodeDetails.blockType` is set AND `nodeDetails.isPage` is not true | Node is a block — do NOT show in any listing |
| `nodeDetails.showInSpaceList === false` | Node is internal — exclude from all space and context listings |
| `nodeDetails.element_subtype` is set | Node is a whiteboard element — exclude from space/context listings unless `showInSpaceList === true` |
| `nodeDetails.whiteboard_context` is set | Node is a whiteboard CONTEXT — route to whiteboard view, not layer view |

---

## 2. URL Protocol

Every route the application can navigate to, the page component it renders, and the data it fetches.

| URL Pattern | View Label | Page Component | Primary Data Sources | Notes |
|---|---|---|---|---|
| `/spaces` | Space List | `app/spaces/page.tsx` | `GET /api/spaces` | Entry point — list and create spaces |
| `/void` | Void | `app/void/page.tsx` | `GET /api/void/nodes` | Personal scratch area, not space-scoped |
| `/spaces/[slug]` | Space Root (Layer 0) | `app/spaces/[slug]/page.tsx` | `GET /api/spaces/slug/{slug}`, `GET /api/spaces/{slug}/nodes` | Renders context grid + space-level creation; CONTEXT nodes link to their layer view, REGULAR nodes link to `/node/[id]` |
| `/spaces/[slug]/context/[contextSlug]` | Context Layer (Layer N) | `app/spaces/[slug]/context/[contextSlug]/page.tsx` | `GET /api/spaces/{slug}/contexts/{ctx}/nodes`, `GET /api/spaces/{slug}/contexts/{ctx}/children` | Child contexts link to their own layer view; REGULAR nodes link to `/node/[id]?fromContext=[ctx]` |
| `/spaces/[slug]/node/[id]` | Node Content View (no origin) | `app/spaces/[slug]/node/[id]/page.tsx` | `GET /api/spaces/{slug}/nodes/{id}`, `GET /api/nodes/{id}/attributes` | Back button goes to `/spaces/[slug]`; breadcrumb: Spaces > Space > Node Title |
| `/spaces/[slug]/node/[id]?fromContext=[ctx]` | Node Content View (from context) | Same as above | Same + `useSearchParams().get('fromContext')` | Back button goes to `/spaces/[slug]/context/[ctx]`; breadcrumb: Spaces > Space > Context Name > Node Title |
| `/spaces/[slug]/node/[ctxNodeId]?fromContext=[ctx]` | Context Content View | Same node detail page | Same | Block editor for the CONTEXT node's own documentation; back goes to context layer view |
| `/spaces/[slug]/blank` | The Blank | `app/spaces/[slug]/blank/page.tsx` | `GET /api/spaces/{slug}/blank`, `GET /api/spaces/{slug}/blank/count` | Nodes not assigned to any context |
| `/spaces/[slug]/whiteboard` | Whiteboard | `app/spaces/[slug]/whiteboard/page.tsx` | Whiteboard-specific service | Canvas editing |
| `/spaces/[slug]/graph` | Graph | `app/spaces/[slug]/graph/page.tsx` | `GET /api/nodes/{id}/attributes` (per node) | Relationship graph; `GET /spaces/{id}/attributes` does NOT exist as a valid backend endpoint |

### Canonical Routing Function

Every component in the codebase that produces a navigation URL for a node MUST call `getNodeRoute` from `src/lib/routing.ts`. Hardcoded route strings for node navigation outside this file are a maintenance violation.

```typescript
// src/lib/routing.ts
import { NodeType } from '@/types/backend-dtos';
import type { Node } from '@/types/backend-dtos';

export function getNodeRoute(
  spaceSlug: string,
  node: Pick<Node, 'id' | 'nodeType' | 'slug'>,
  options?: { fromContext?: string }
): string {
  if (node.nodeType === NodeType.CONTEXT && node.slug) {
    return `/spaces/${spaceSlug}/context/${node.slug}`;
  }
  const base = `/spaces/${spaceSlug}/node/${node.id}`;
  return options?.fromContext
    ? `${base}?fromContext=${encodeURIComponent(options.fromContext)}`
    : base;
}
```

**Decision table for `getNodeRoute`:**

| `node.nodeType` | `node.slug` present | `options.fromContext` present | Result |
|---|---|---|---|
| `CONTEXT` | Yes | (irrelevant) | `/spaces/[slug]/context/[node.slug]` |
| `CONTEXT` | No | (irrelevant) | `/spaces/[slug]/node/[node.id]` (degenerate) |
| `REGULAR` | (irrelevant) | No | `/spaces/[slug]/node/[node.id]` |
| `REGULAR` | (irrelevant) | Yes | `/spaces/[slug]/node/[node.id]?fromContext=[ctx]` |
| `ATTRIBUTE` | (irrelevant) | (irrelevant) | Not navigable — do not call this function for ATTRIBUTE nodes |

### The `?fromContext` Parameter

- **Carrier:** URL query parameter `?fromContext=[contextSlug]`
- **Set by:** Any component navigating from a context layer view to a node content view
- **Read by:** `app/spaces/[slug]/node/[id]/page.tsx` via `useSearchParams().get('fromContext')`
- **Lifetime:** Survives browser refresh and direct URL entry (Next.js App Router `useSearchParams`)
- **Not stored in:** Zustand (`navigationStore`), `localStorage`, router state object
- **Used for:** Back button destination, breadcrumb context crumb insertion

---

## 3. Creation Protocol

Rules for which API endpoint to call based on where the user is when they trigger creation.

### Decision Tree

```
User triggers creation
│
├── entityType === 'space'
│   └── POST /api/spaces
│       Service: spaceService.createSpace
│       Cache invalidate: spaceKeys.list()
│
├── entityType === 'node' AND contextSlug present
│   └── POST /api/spaces/{spaceSlug}/contexts/{contextSlug}/nodes
│       Service: nodeService.createNodeInContext(spaceSlug, contextSlug, data)
│       Cache invalidate: contextNodeKeys.nodes(spaceSlug, contextSlug), blankKeys.count(spaceSlug)
│
├── entityType === 'context' AND contextSlug present (nested context)
│   └── POST /api/spaces/{spaceSlug}/contexts/{contextSlug}/contexts
│       Service: nodeService.createNestedContext(spaceSlug, contextSlug, data)
│       Cache invalidate: contextNodeKeys.children(spaceSlug, contextSlug), nodeKeys.all
│
├── entityType === 'node' AND contextSlug absent (space root)
│   └── POST /api/spaces/{spaceSlug}/nodes  [DEPRECATED — lands in The Blank]
│       Service: nodeService.createNode(spaceSlug, data)
│       Cache invalidate: nodeKeys.lists(), blankKeys.count(spaceSlug)
│
├── entityType === 'context' AND contextSlug absent (space root)
│   └── POST /api/spaces/{spaceSlug}/nodes with { nodeType: 'CONTEXT' } [DEPRECATED]
│       Service: nodeService.createNode(spaceSlug, { ...data, nodeType: NodeType.CONTEXT })
│
└── Source is Void (no spaceSlug)
    └── POST /api/void/nodes
        Service: voidService.createVoidNode(data)
        Cache invalidate: voidKeys.all
```

### NewNodeModal Prop Contract

`NewNodeModal` is the single creation entry point for all non-void node creation.

| Prop | Type | Required | Effect |
|---|---|---|---|
| `isOpen` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Called on cancel or successful creation |
| `spaceSlug` | `string` | Yes (when creating nodes) | Scopes all API calls |
| `contextSlug` | `string` | No | When present, routes creation through context endpoints |
| `defaultType` | `EntityType` | No | Pre-selects the entity type tab |
| `availableTypes` | `EntityType[]` | No | Restricts which tabs are shown; if absent, derived from `navigationStore.scope` |

### Scope-to-Available-Types Mapping

| `navigationStore.scope` | `availableTypes` resolved to |
|---|---|
| `'spaces'` | `['space', 'node', 'context']` |
| `'context'` | `['node', 'context']` (space creation is not valid inside a context) |
| `'node'` | `['node', 'context']` |
| anything else | `['node', 'context']` |

### "Create and Open" Routing After Creation

After successful creation, if the user clicked "Create and Open", the navigation target is determined by `getNodeRoute(spaceSlug, createdNode, { fromContext: contextSlug })`. This ensures CONTEXT nodes open in their layer view and REGULAR nodes open in content view with the correct back path.

---

## 4. View Switching Protocol

### CONTEXT Node — Two-View State Machine

A CONTEXT node with a non-null `slug` has exactly two views:

**Layer View** (primary)
- URL: `/spaces/[slug]/context/[contextSlug]`
- Page: `app/spaces/[slug]/context/[contextSlug]/page.tsx`
- Shows: child contexts as cards, regular nodes assigned to this context, search bar, "+" creation button
- Entry points: clicking the context card at space root; clicking context card from parent context layer; Back button from content view when `?fromContext` is set

**Content View** (secondary)
- URL: `/spaces/[slug]/node/[contextNodeId]?fromContext=[contextSlug]`
- Page: `app/spaces/[slug]/node/[id]/page.tsx`
- Shows: block editor for the CONTEXT node's own documentation text and blocks
- Entry points: "View Context Content" button on the layer view page only
- Back navigation: always returns to layer view via `?fromContext` param

**Switching rules:**
1. Default click on a CONTEXT node card → layer view (via `getNodeRoute`)
2. "View Context Content" button on layer view → content view with `?fromContext` appended
3. Back button on content view (when `fromContext` present) → layer view
4. Back button on content view (when `fromContext` absent) → space root

**Locating the context node's UUID from the layer view page:**
The context layer page knows `contextSlug` but not the context node's `id`. To provide the "View Context Content" button, query all space nodes and find the one where `node.slug === contextSlug && node.nodeType === NodeType.CONTEXT`. The `id` from that node is used to construct the `/node/[id]` URL.

### REGULAR Node — Single View

REGULAR nodes have one primary view: the block editor at `/spaces/[slug]/node/[id]`. They do not have a "layer view". Navigation to a REGULAR node always produces a content view URL, optionally with `?fromContext` when navigated to from a context layer.

---

## 5. Block Protocol

Blocks are REGULAR nodes with `parentNodeId` set and `nodeDetails.blockType` set and `nodeDetails.showInSpaceList === false`.

### Rules

**Creation:**
- Blocks are created via `POST /api/spaces/{spaceSlug}/nodes/{parentNodeId}/children`
- Service: `nodeService.createChildNode(spaceSlug, parentNodeId, data)`
- Request body must include `nodeDetails: { blockType: '...', showInSpaceList: false }`

**Reordering:**
- Service: `nodeService.reorderChildren(spaceSlug, parentNodeId, orderedIds)`
- Correct endpoint: `PATCH /api/spaces/{spaceSlug}/nodes/{parentNodeId}/children/reorder`
- Correct request body: `{ orderedChildIds: string[] }` — NOT `{ nodeIds }` (this is a known bug at `node.service.ts:247`)

**Retrieval:**
- Service: `nodeService.getChildNodes(spaceSlug, parentNodeId)`
- Endpoint: `GET /api/spaces/{spaceSlug}/nodes/{parentNodeId}/children`

**Visibility filter — applied at the data transformation layer (NOT per-component):**
```typescript
// Applied in the hook selector or mapping function, before any listing component receives data
const isBlock = (node: Node): boolean =>
  node.parentNodeId != null && node.nodeType === NodeType.REGULAR;

const visibleNodes = allNodes.filter(node => !isBlock(node));
```

**Blocks NEVER appear in:**
- Space root context grid (`/spaces/[slug]`)
- Context layer node list (`/spaces/[slug]/context/[ctx]`)
- The Blank (`/spaces/[slug]/blank`)
- Sidebar navigation tree
- Search results (frontend-side filtering; backend may or may not exclude them)

**Blocks ONLY appear in:**
- The block editor of their parent node's content view

### Block Types

The `nodeDetails.blockType` field accepts: `text`, `heading1`, `heading2`, `heading3`, `bulletList`, `numberedList`, `todo`, `quote`, `code`, `divider`.

---

## 6. Breadcrumb Protocol

Breadcrumbs are constructed at each page level using the following rules. The breadcrumb component receives a `path` array of `{ id, title }` objects.

| Route | Breadcrumb path array |
|---|---|
| `/spaces` | `[{ id: 'home', title: 'Home' }, { id: 'spaces', title: 'Spaces' }]` |
| `/spaces/[slug]` | `[Home, Spaces, { id: space.id, title: space.name }]` |
| `/spaces/[slug]/context/[ctx]` | `[Home, Spaces, Space Name, { id: contextSlug, title: context node title }]` |
| `/spaces/[slug]/node/[id]` (no `fromContext`) | `[Home, Spaces, Space Name, { id: node.id, title: node.title }]` |
| `/spaces/[slug]/node/[id]?fromContext=[ctx]` | `[Home, Spaces, Space Name, { id: ctx, title: ctx title (clickable → layer view) }, { id: node.id, title: node.title }]` |

**Context crumb title resolution:** When `fromContext` is present, the context name is derived from the slug by replacing hyphens with spaces and title-casing each word. A more accurate title requires a separate lookup query; the slug-based derivation is the minimum viable implementation.

**Clickability:** The context crumb (when present) must be a navigable link to `/spaces/[slug]/context/[fromContext]`. The current page's crumb (last item) is never a link.

**Deep ancestor breadcrumbs** (more than one level of nested contexts) require a `GET /ancestors` traversal endpoint. This is out of scope for the current change set; implement breadcrumbs for one level of nesting only until the endpoint is available.

---

## 7. Cache Protocol

### Query Key Factories

All `invalidateQueries` and `setQueryData` calls MUST use the factory functions. Inline string array literals are prohibited for keys that have a factory.

**`nodeKeys`** — space-scoped node lists and detail
```typescript
// Source: src/hooks/api/useNodes.ts
nodeKeys.all                              // ['nodes']
nodeKeys.lists()                          // ['nodes', 'list']
nodeKeys.list(spaceSlug, params?)         // ['nodes', 'list', spaceSlug, params]
nodeKeys.details()                        // ['nodes', 'detail']
nodeKeys.detail(spaceSlug, nodeId)        // ['nodes', 'detail', spaceSlug, nodeId]
```

**`contextNodeKeys`** — context-scoped node and child-context lists
```typescript
// Source: src/hooks/api/useContextNodes.ts
contextNodeKeys.nodes(spaceSlug, contextSlug)     // ['context-nodes', spaceSlug, contextSlug]
contextNodeKeys.children(spaceSlug, contextSlug)  // ['context-children', spaceSlug, contextSlug]
```

**`blankKeys`** — The Blank node list and count
```typescript
// Source: src/hooks/api/useBlankNodes.ts
blankKeys.nodes(spaceSlug)   // ['blank-nodes', spaceSlug]
blankKeys.count(spaceSlug)   // ['blank-count', spaceSlug]
```

**`spaceKeys`** — space list and detail
```typescript
// Source: src/hooks/api/useSpaces.ts
spaceKeys.all                  // ['spaces']
spaceKeys.lists()              // ['spaces', 'list']
spaceKeys.list()               // ['spaces', 'list']
spaceKeys.details()            // ['spaces', 'detail']
spaceKeys.detail(slug)         // ['spaces', 'detail', slug]
```

**`voidKeys`** — void node list and detail
```typescript
// Source: src/hooks/api/useVoidNodes.ts
voidKeys.all             // ['void-nodes']
voidKeys.detail(id)      // ['void-nodes', id]
```

**Ad-hoc keys (no factory — use as-is):**
```typescript
['nodeAttributes', nodeId, params?]      // useAttributes
['incomingAttributes', nodeId, params?]  // useIncomingAttributes
['spaceAttributes', spaceId]             // useSpaceAttributes
```

### Invalidation Matrix

| Mutation | Keys to invalidate |
|---|---|
| Create node at space root (flat) | `nodeKeys.lists()`, `blankKeys.count(spaceSlug)` |
| Create node in context | `contextNodeKeys.nodes(spaceSlug, contextSlug)`, `nodeKeys.all`, `blankKeys.count(spaceSlug)` |
| Create nested context | `contextNodeKeys.children(spaceSlug, parentContextSlug)`, `nodeKeys.all` |
| Update node | `nodeKeys.detail(spaceSlug, nodeId)`, `nodeKeys.lists()` |
| Delete node | `nodeKeys.lists()`, `contextNodeKeys.nodes(spaceSlug, contextSlug)` (if known), `blankKeys.nodes(spaceSlug)`, `blankKeys.count(spaceSlug)` |
| Remove node from context | `contextNodeKeys.nodes(spaceSlug, contextSlug)`, `nodeKeys.all` |
| Assign from Blank | `blankKeys.nodes(spaceSlug)`, `blankKeys.count(spaceSlug)`, `nodeKeys.all` |
| Bulk assign from Blank | `blankKeys.nodes(spaceSlug)`, `blankKeys.count(spaceSlug)`, `nodeKeys.all` |
| Create attribute | `['nodeAttributes', sourceNodeId]`, `['nodeAttributes', targetNodeId]`, `['spaceAttributes']` |
| Delete attribute | `['nodeAttributes', sourceNodeId]`, `['nodeAttributes', targetNodeId]`, `['spaceAttributes']` |
| Create/update space | `spaceKeys.all` |
| Delete space | `spaceKeys.all` |
| Create void node | `voidKeys.all` |
| Update void node | `voidKeys.all`, `voidKeys.detail(nodeId)` |
| Delete void node | `voidKeys.all` |
| Assign void to space | `voidKeys.all` |

### `staleTime` Defaults

| Data | `staleTime` | Rationale |
|---|---|---|
| Node lists | `0` (default) | Must reflect creation/deletion immediately |
| Node detail | `0` (default) | Content changes must be visible on re-entry |
| Node attributes | `3 * 60 * 1000` (3 min) | Relationship graph changes are infrequent |
| Space attributes | `5 * 60 * 1000` (5 min) | Graph-level data, rarely changes during a session |
| Void nodes | `0` (default) | Assignment to spaces must reflect immediately |

---

## 8. Service Layer Protocol

### Correct Endpoint Reference

| Operation | Service Method | HTTP | Endpoint | Request Body |
|---|---|---|---|---|
| List space nodes | `nodeService.getNodes(slug, params?)` | GET | `/api/spaces/{slug}/nodes` | — |
| Get single node | `nodeService.getNode(slug, nodeId)` | GET | `/api/spaces/{slug}/nodes/{nodeId}` | — |
| Create node (flat) | `nodeService.createNode(slug, data)` | POST | `/api/spaces/{slug}/nodes` | `CreateNodeRequest` |
| Update node | `nodeService.updateNode(slug, nodeId, data)` | PUT | `/api/spaces/{slug}/nodes/{nodeId}` | `UpdateNodeRequest` |
| Delete node | `nodeService.deleteNode(slug, nodeId, force?)` | DELETE | `/api/spaces/{slug}/nodes/{nodeId}` | — |
| Create node in context | `nodeService.createNodeInContext(slug, ctx, data)` | POST | `/api/spaces/{slug}/contexts/{ctx}/nodes` | `CreateNodeRequest` |
| Get nodes in context | `nodeService.getNodesInContext(slug, ctx)` | GET | `/api/spaces/{slug}/contexts/{ctx}/nodes` | — |
| Create nested context | `nodeService.createNestedContext(slug, parentCtx, data)` | POST | `/api/spaces/{slug}/contexts/{parentCtx}/contexts` | `CreateNodeRequest` |
| Get child contexts | `nodeService.getChildContexts(slug, ctx)` | GET | `/api/spaces/{slug}/contexts/{ctx}/children` | — |
| Remove node from context | `nodeService.removeFromContext(slug, ctx, nodeId)` | DELETE | `/api/spaces/{slug}/contexts/{ctx}/nodes/{nodeId}` | — |
| Create block child | `nodeService.createChildNode(slug, parentId, data)` | POST | `/api/spaces/{slug}/nodes/{parentId}/children` | `CreateNodeRequest` + `nodeDetails: { blockType, showInSpaceList: false }` |
| Get child blocks | `nodeService.getChildNodes(slug, parentId)` | GET | `/api/spaces/{slug}/nodes/{parentId}/children` | — |
| Reorder child blocks | `nodeService.reorderChildren(slug, parentId, ids)` | PATCH | `/api/spaces/{slug}/nodes/{parentId}/children/reorder` | `{ orderedChildIds: string[] }` |
| Migrate node | `nodeService.migrateNode(slug, nodeId, data)` | POST | `/api/spaces/{slug}/nodes/{nodeId}/migrate` | `MigrateNodeRequest` |
| Get blank nodes | `nodeService.getBlankNodes(slug)` | GET | `/api/spaces/{slug}/blank` | — |
| Get blank count | `nodeService.getBlankCount(slug)` | GET | `/api/spaces/{slug}/blank/count` | — |
| Assign from Blank | `nodeService.assignFromBlank(slug, nodeId, ctx)` | POST | `/api/spaces/{slug}/blank/{nodeId}/assign` | `{ contextSlug }` |
| Bulk assign from Blank | `nodeService.bulkAssignFromBlank(slug, ids, ctx)` | POST | `/api/spaces/{slug}/blank/assign-bulk` | `{ nodeIds, contextSlug }` |
| Delete attribute | `attributeService.deleteAttribute(attrId)` | DELETE | `/api/attributes/{attributeId}` | — |
| Create attribute | `attributeService.createAttribute(nodeId, data)` | POST | `/api/nodes/{nodeId}/attributes` | `CreateAttributeRequest` |
| Get outgoing attributes | `attributeService.getNodeAttributes(nodeId)` | GET | `/api/nodes/{nodeId}/attributes` | — |
| Get incoming attributes | `attributeService.getIncomingAttributes(nodeId)` | GET | `/api/nodes/{nodeId}/incoming-attributes` | — |
| Lock node | `lockingService.lockNode(slug, nodeId, req)` | PATCH | `/api/spaces/{slug}/nodes/{nodeId}/lock` | `LockRequest` |
| Unlock node | `lockingService.unlockNode(slug, nodeId, req)` | PATCH | `/api/spaces/{slug}/nodes/{nodeId}/unlock` | `LockRequest` |
| Create void node | `voidService.createVoidNode(data)` | POST | `/api/void/nodes` | `VoidNodeCreateRequest` |
| List void nodes | `voidService.listVoidNodes()` | GET | `/api/void/nodes` | — |
| Assign void to space | `voidService.assignToSpace(nodeId, req)` | POST | `/api/void/nodes/{nodeId}/assign` | `{ spaceId, contextId? }` |

### Known Service Bugs (must be fixed before use)

| Bug ID | File | Line | Symptom | Fix |
|---|---|---|---|---|
| BUG-A | `src/services/api/node.service.ts` | 247 | `reorderChildren` sends `{ nodeIds }` — backend returns 400 | Change to `{ orderedChildIds: nodeIds }` |
| BUG-B | `src/services/api/attribute.service.ts` | 62 | `deleteAttribute` calls `/nodes/${nodeId}/attributes/${attributeId}` — backend returns 404 | Change to `/attributes/${attributeId}`; remove `nodeId` from signature |
| BUG-C | `src/hooks/api/useSpaces.ts` | 72–75 | `useRenameSpace` sends `projectType: 'BACKEND'` and `mode: 'CONFIGURATION'` alongside `name` — corrupts space type | Send only `{ name }` |

---

## 9. DTO Type Reference

### Node

```typescript
interface Node {
  id: string;                    // UUID v4
  spaceId: string;               // UUID v4
  nodeType: NodeType;            // 'REGULAR' | 'CONTEXT' | 'ATTRIBUTE'
  title: string;
  slug: string;
  content: string | null;        // NOTE: nullable — backend returns null on new nodes
  nodeDetails: NodeDetails;
  currentVersionId: string | null; // NOTE: nullable — backend returns null before first save
  createdBy: string;
  modifiedBy: string;
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
  lockLevel: 'UNLOCKED' | 'CONTENT_LOCKED' | 'FULLY_LOCKED';
  isBuiltin: boolean;
  effectiveLockLevel?: 'UNLOCKED' | 'CONTENT_LOCKED' | 'FULLY_LOCKED';
  lockInherited?: boolean;
  lockSource?: 'space' | 'schema' | 'parent' | 'self' | null;
  parentNodeId?: string | null;  // Set for block nodes
}
```

### NodeVersion (corrected)

```typescript
interface NodeVersion {
  id: string;                        // UUID string — NOT number
  nodeId: string;                    // UUID string — NOT number
  versionNumber: number;             // NOT 'version'
  title: string;
  nodeType: NodeType;
  content: string;
  nodeDetailsSnapshot?: Record<string, unknown>;  // NOT 'nodeDetails'
  createdAt: string;
  createdBy?: string;                // UUID string — NOT number
}
```

### AttributeKey (valid backend values only)

```typescript
enum AttributeKey {
  CONTAINS = 'contains',
  DEPENDS_ON = 'depends_on',
  REFERENCES = 'references',
  PARENT_OF = 'parent_of',
  RELATES_TO = 'relates_to',
  // REMOVED: TRIGGERS, NEXT, CALLS — these do not exist in the backend
}
```

### NodeCapabilities (corrected)

```typescript
// src/types/node-system.ts — inferNodeCapabilities
// canRenderAsPage must be true for both REGULAR and CONTEXT nodes
canRenderAsPage: nodeType === 'REGULAR' || nodeType === 'CONTEXT'
// Current code incorrectly: nodeType === 'REGULAR' only
```

---

## 10. Anti-Patterns

The following patterns are explicitly prohibited. Each has caused a production bug.

### AP-01: Using `createNode` (flat) when inside a context

```typescript
// WRONG — lands node in The Blank, not the current context
nodeService.createNode(spaceSlug, data);

// CORRECT — when contextSlug is available
nodeService.createNodeInContext(spaceSlug, contextSlug, data);
```

**Why it matters:** `createNode` is marked `@deprecated`. It creates a space-scoped node with no context membership. The node appears in The Blank, not in the context where the user expects it. This is BUG-01 in the EIAN ADR.

---

### AP-02: Routing CONTEXT nodes to `/node/:id` as the primary click target

```typescript
// WRONG — sends user to block editor, skips the layer view entirely
router.push(`/spaces/${spaceSlug}/node/${node.id}`);

// CORRECT — use the canonical routing function
router.push(getNodeRoute(spaceSlug, node));
```

**Why it matters:** CONTEXT nodes have a layer view that is their primary navigation destination. Routing directly to `/node/:id` bypasses the context grid and breaks the two-view contract. This is BUG-03 through BUG-05 in the EIAN ADR.

---

### AP-03: Showing block nodes in context or space listings

```typescript
// WRONG — renders block nodes as cards in the context layer view
const displayNodes = contextNodes;

// CORRECT — filter blocks at the data layer before any component receives the data
const displayNodes = contextNodes.filter(
  node => !(node.parentNodeId != null && node.nodeType === NodeType.REGULAR)
);
```

**Why it matters:** Block nodes with `parentNodeId` set are internal to their parent page. They must never appear in context grids, space listings, or The Blank. This is ADR-05 in the EIAN ADR.

---

### AP-04: Hardcoding query key arrays in `invalidateQueries`

```typescript
// WRONG — hardcoded key does not match the factory shape; invalidation silently fails
queryClient.invalidateQueries({ queryKey: ['context-nodes', spaceSlug, contextSlug] });

// CORRECT — always use the factory
import { contextNodeKeys } from '@/hooks/api/useContextNodes';
queryClient.invalidateQueries({ queryKey: contextNodeKeys.nodes(spaceSlug, contextSlug) });
```

**Why it matters:** If the factory key shape ever changes, hardcoded keys will silently stop matching. This is BUG-08 in the EIAN ADR.

---

### AP-05: Reading navigation origin from Zustand store instead of URL

```typescript
// WRONG — lost on browser refresh
const backTarget = useNavigationStore(state => state.backTarget);

// CORRECT — survives refresh, shareable URL
const fromContext = useSearchParams().get('fromContext');
const backTarget = fromContext
  ? `/spaces/${slug}/context/${fromContext}`
  : `/spaces/${slug}`;
```

**Why it matters:** Zustand store state is memory-only. A user who refreshes the node content page would lose the back navigation context. ADR-01 mandates URL as the sole source of truth for navigation origin.

---

### AP-06: Not wrapping `useSearchParams` in a Suspense boundary

```typescript
// WRONG — Next.js App Router throws during SSR prerender without Suspense
export default function NodePage() {
  const searchParams = useSearchParams();
  ...
}

// CORRECT
export default function NodePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NodePageContent />
    </Suspense>
  );
}

function NodePageContent() {
  const searchParams = useSearchParams();
  ...
}
```

**Why it matters:** Next.js 14 App Router requires any component calling `useSearchParams()` to be wrapped in a `<Suspense>` boundary. Without it, the build fails or the page renders incorrectly during static prerendering.

---

### AP-07: Calling `useRenameSpace` and sending `projectType` / `mode`

```typescript
// WRONG (current implementation in useSpaces.ts:72–75) — corrupts space type
spaceService.updateSpace(id, { name, projectType: 'BACKEND', mode: 'CONFIGURATION' });

// CORRECT — send only the fields that changed
spaceService.updateSpace(id, { name });
```

**Why it matters:** The backend `PATCH /api/spaces/{id}` endpoint applies all non-null fields in the request body. Sending `projectType` and `mode` in every rename converts all spaces to BACKEND/CONFIGURATION type. This is a silent data corruption bug.

---

### AP-08: Using `nodeService.searchNodes` (non-existent backend endpoint)

```typescript
// WRONG — endpoint does not exist on the backend; returns 404
nodeService.searchNodes(spaceSlug, params);
```

**Why it matters:** `GET /api/spaces/{spaceSlug}/search` is not implemented on the backend as of this writing. Any feature using this service method silently fails for all users. Do not ship UI that depends on this method until the backend endpoint exists.

---

### AP-09: Treating `node.content` and `node.currentVersionId` as non-nullable

```typescript
// WRONG — throws TypeError on newly created nodes
const wordCount = node.content.split(' ').length;

// CORRECT — handle nullable fields
const wordCount = node.content ? node.content.split(' ').length : 0;
```

**Why it matters:** The backend returns `null` for `content` on newly created nodes and for `currentVersionId` before the first save. The TypeScript types currently declare these as non-nullable strings, which is incorrect.

---

## 11. NavigationStore Contract

The `navigationStore` (Zustand) is responsible for UI state that does NOT need to survive page refresh.

| Field | Type | Owned by store | Derived from URL |
|---|---|---|---|
| `scope` | `'spaces' \| 'node' \| 'context' \| string` | Yes | No |
| `currentSpaceSlug` | `string \| null` | Yes | Redundant with URL; use URL `slug` param directly in pages |
| `currentContextSlug` | `string \| null` | Yes | Redundant with URL; use URL `contextSlug` param directly |
| Back navigation target | (not stored) | No | Yes — derived from `?fromContext` at read time |

The `scope` value is set on page mount by the page component:
- Space root page sets `scope = 'spaces'` or specific space scope
- Context layer page sets `scope = 'context'`
- Node content page sets `scope = 'node'`

The `scope` value drives `resolvedAvailableTypes` in `NewNodeModal` when `availableTypes` is not explicitly passed. The `'context'` scope must be a valid value in the `NavigationScope` type definition.

---

## 12. OpenSpec Change Index

The following OpenSpec change proposals cover the fixes described in this document. They must be applied in dependency order.

| Change ID | Scope | Priority | Prerequisite |
|---|---|---|---|
| `fix-backend-dto-types` | `NodeVersion` types, `Node` nullable fields, `AttributeKey` enum, `canRenderAsPage` | P2 | None |
| `fix-attribute-service-endpoints` | `deleteAttribute` path, `reorderChildren` body | P2 | None |
| `fix-nodetype-aware-routing` | `getNodeRoute` utility, all call sites | P0 | None |
| `fix-context-aware-node-creation` | `NewNodeModal` prop, `SpaceShell` forwarding, creation branch, cache invalidation | P0 | None |
| `fix-context-navigation-backpath` | Node detail page `?fromContext`, breadcrumb, Back button | P1 | `fix-nodetype-aware-routing` |
| `fix-query-key-discipline` | All `invalidateQueries` with inline key arrays | P2 | None |
| `add-context-content-view-affordance` | "View Context Content" button on context layer page | P1 | `fix-context-navigation-backpath` |
| `enable-nested-context-creation` | Context page `availableTypes` to include `'context'` | P1 | `fix-context-aware-node-creation` |

---

## Appendix A: Correct Reference Implementations (Do Not Modify)

The following code locations implement the correct pattern and serve as the reference for all equivalent fixes:

- **Type-aware routing at space root context menu:** `app/spaces/[slug]/page.tsx` lines 295–311 — correctly branches on `node.nodeType === NodeType.CONTEXT` for both `openNewTab` and `openAsNode`.
- **Child context card routing in context layer:** `app/spaces/[slug]/context/[contextSlug]/page.tsx` line 211 — correctly routes child context cards to `/spaces/${spaceSlug}/context/${ctx.slug}`.
- **`contextNodeKeys` factory and all context hooks:** `src/hooks/api/useContextNodes.ts` — `useContextNodes`, `useChildContexts`, `useCreateNodeInContext`, `useRemoveFromContext`, `useCreateNestedContext` are all correctly implemented. The issue is that they are not called from `NewNodeModal`.
- **`useCreateNode` context branch:** `src/hooks/api/useCreateNode.ts` lines 25–28 — already correctly branches on `contextSlug`. Not used by `NewNodeModal` but the pattern is correct.

## Appendix B: Out of Scope

The following are explicitly excluded from this document's change set. Each has a separate tracking item.

- Backend API changes — all fixes described here are frontend-only
- Optimistic updates — separate OpenSpec change
- Space creation dialog redesign — separate OpenSpec change
- Assign-to-context flow from The Blank UI — separate OpenSpec change
- Graph view routing corrections — deeper endpoint issues (`GET /spaces/{id}/attributes` does not exist)
- Deep ancestor breadcrumbs — requires `GET /ancestors` traversal endpoint
- `useRestoreVersion` wrong invalidation key — version restore is a separate feature surface
- Pagination infrastructure (`extractPage` discards metadata, `size: 1000` silently capped to 100)
- `searchNodes` non-existent endpoint — requires backend work before frontend can use it
- `getSpaceAttributes` wrong endpoint — graph page currently loads zero attributes; tracked with graph work
- Collaborator API — not yet migrated to space-based endpoints; all hooks throw intentionally
