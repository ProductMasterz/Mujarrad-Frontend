# Design: Implement MVP Behaviors

**Change ID:** `implement-mvp-behaviors`
**Created:** 2026-01-22

---

## Architectural Overview

This change touches multiple systems and introduces new patterns. This document captures the architectural reasoning and trade-offs.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MUJARRAD MVP                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐   │
│  │   Frontend  │    │   Backend   │    │    MCP Server       │   │
│  │  (Next.js)  │◄──►│  (Spring)   │◄──►│  (Node.js)          │   │
│  └─────────────┘    └─────────────┘    └─────────────────────┘   │
│         │                  │                      │               │
│         ▼                  ▼                      ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐   │
│  │   Zustand   │    │ PostgreSQL  │    │   Claude/Agents     │   │
│  │   Stores    │    │             │    │                     │   │
│  └─────────────┘    └─────────────┘    └─────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    TypeScript SDK                           │ │
│  │                 (wraps REST API)                            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### 1. Application Mode State Management

**Decision**: Use Zustand store for application mode state

**Alternatives Considered**:
- URL query params (mode=edit)
- React Context
- Redux

**Rationale**:
- Zustand is already used in codebase
- Modes are client-only state (no server persistence needed for MVP)
- Simple API: `useAppModeStore()`
- Easy to add persistence later (localStorage middleware)

**Implementation**:
```typescript
// src/stores/appMode.store.ts
interface AppModeState {
  currentMode: 'scoped' | 'full' | 'edit';
  scopeFilters: {
    contextId?: string;
    dimensionType?: string;
  };
  setMode: (mode: AppModeState['currentMode']) => void;
  setScope: (filters: Partial<AppModeState['scopeFilters']>) => void;
}
```

---

### 2. Node Dependency Check Architecture

**Decision**: Check dependencies before delete via API call, show modal with options

**Flow**:
```
User clicks Delete
      │
      ▼
┌─────────────────┐
│ GET /nodes/{id} │  ← Fetch node with children count
│   /descendants  │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Has children or │
│  references?    │
└─────────────────┘
      │
  ┌───┴───┐
  │       │
 No      Yes
  │       │
  ▼       ▼
Delete  Show Modal:
 Now    "Delete All" / "Delete Only This" / "Cancel"
```

**API Requirements**:
- `GET /api/spaces/{slug}/nodes/{id}/descendants` - exists ✓
- `GET /api/nodes/{id}/attributes` - exists ✓ (for references)

---

### 3. Duplicate Detection Strategy

**Decision**: Client-side check before create, prompt user

**Why Not Server-Side Only**:
- Better UX: user sees prompt before submit
- Allows "Create Anyway" option
- Server can still enforce if needed

**Implementation**:
```typescript
// In useCreateNode hook
async function createNode(data: CreateNodeRequest) {
  // 1. Check for duplicates first
  const existing = await nodeService.getNodes(spaceSlug);
  const duplicate = existing.find(
    n => n.title === data.title &&
         n.parentId === data.parentId
  );

  // 2. If duplicate, show modal
  if (duplicate) {
    const action = await showDuplicateModal(duplicate);
    if (action === 'merge') return duplicate;
    if (action === 'cancel') return null;
    // action === 'create-anyway' falls through
  }

  // 3. Create node
  return nodeService.createNode(spaceSlug, data);
}
```

---

### 4. Whiteboard-Hierarchy Sync Architecture

**Decision**: Event-driven bidirectional sync via service

**Existing Code**: `src/services/whiteboardSyncService.ts`

**Sync Events**:
```
Node Events → Whiteboard Updates
─────────────────────────────────
Node renamed     → Update element text
Node deleted     → Show "unlinked" indicator on element
Node moved       → (optional) Reposition element

Whiteboard Events → Node Updates
─────────────────────────────────
Element with text created → Prompt "Create as node?"
Element deleted           → (no node change, just unlink)
Element text changed      → (optional) Update node title
```

**Linking Mechanism**:
- Store `nodeId` in Excalidraw element's `customData`
- Store `whiteboardElementIds[]` in node's metadata (or attributes)

---

### 5. Relationship Type UI

**Decision**: Dropdown selector when creating/editing relationships

**UI Location**:
- In "Create Relationship" dialog
- In Graph View edge creation flow
- In node detail panel's "Relationships" section

**Types (from PRD)**:
```typescript
type RelationshipType =
  | 'contains'     // Hierarchy/containment
  | 'depends_on'   // Dependency
  | 'references'   // Citation/link
  | 'parent_of'    // Explicit parent (vs contains)
  | 'relates_to';  // General association
```

**Visual Differentiation**:
- Different colors per type in graph view
- Icons next to relationship labels

---

### 6. Super Position Implementation

**Decision**: Visual indicator + context breadcrumbs

**How It Works**:
1. Node can have multiple `contains` attributes (different parents)
2. Each containment = node appears in that context's tree
3. UI shows badge: "In 3 contexts" on node card
4. Click badge → shows context list with links

**Data Model** (already supported):
```sql
-- Node A exists in Context B and Context C
INSERT INTO attributes (source_id, target_id, type) VALUES
  ('context-B-uuid', 'node-A-uuid', 'contains'),
  ('context-C-uuid', 'node-A-uuid', 'contains');
```

---

### 7. Templates Architecture

**Decision**: Templates are nodes with `is_template = true` flag

**PRD Approach**:
1. Duplicate existing context node
2. Clean user-specific content
3. Mark with `is_template = true`
4. List templates via API filter

**API** (exists per Swagger):
- `GET /api/templates` - List templates with filtering

**Apply Template Flow**:
1. GET template node with children
2. Deep clone to target space
3. Replace template IDs with new UUIDs
4. Create cloned nodes via API

---

### 8. MCP Server Design

**Decision**: Standalone Node.js server using mcp-typescript-sdk

**Why Standalone**:
- Separation of concerns
- Can be deployed independently
- Uses official MCP SDK

**Architecture**:
```
┌──────────────────┐     ┌────────────────┐     ┌──────────────┐
│  Claude/Agent    │────►│   MCP Server   │────►│ Mujarrad API │
│                  │◄────│  (Node.js)     │◄────│  (Spring)    │
└──────────────────┘     └────────────────┘     └──────────────┘
       stdio              HTTP (internal)         REST API
```

**MCP Resources**:
- `mujarrad://spaces` - List spaces
- `mujarrad://spaces/{slug}/nodes` - List nodes in space
- `mujarrad://nodes/{id}` - Single node content

**MCP Tools**:
- `create_node` - Create new node
- `update_node` - Update node content
- `search_nodes` - Search across nodes
- `create_relationship` - Wire nodes together

---

### 9. TypeScript SDK Design

**Decision**: Typed wrapper around axios with full API coverage

**Package Structure**:
```
packages/
  mujarrad-sdk/
    src/
      client.ts       # Base HTTP client
      auth.ts         # Authentication
      spaces.ts       # Space operations
      nodes.ts        # Node CRUD
      attributes.ts   # Relationship operations
      versions.ts     # Version history
      index.ts        # Main export
    package.json
    tsconfig.json
```

**Usage Example**:
```typescript
import { MujarradClient } from '@mujarrad/sdk';

const client = new MujarradClient({
  baseUrl: 'https://mujarrad.onrender.com/api',
  apiKey: 'your-api-key'
});

const spaces = await client.spaces.list();
const nodes = await client.nodes.list('my-space-slug');
const node = await client.nodes.create('my-space-slug', {
  title: 'New Node',
  type: 'node'
});
```

---

## Cross-Cutting Concerns

### Error Handling

All new features follow existing patterns:
- Toast notifications for user feedback
- Error boundaries for component crashes
- API errors mapped to user-friendly messages

### Loading States

- Skeleton loaders for list views
- Spinner for modal actions
- Optimistic updates where safe

### Permissions

- All mutations check user permissions
- UI hides controls based on role
- API enforces as last line of defense

---

## Migration Path

No data migrations needed - all changes are additive:
- New Zustand store (client-only)
- New UI components
- New SDK package
- New MCP server (standalone)

---

## Testing Strategy

| Component | Test Type | Coverage Target |
|-----------|-----------|-----------------|
| Zustand stores | Unit | 100% |
| Hooks | Unit | 80% |
| Modals | Integration | 90% |
| API calls | Contract | 100% |
| User flows | E2E | Critical paths |

---

## Performance Considerations

- Dependency check: Use existing `/descendants` endpoint (optimized)
- Duplicate check: Query is small (nodes in one context)
- Whiteboard sync: Debounce updates (300ms)
- MCP server: Cache read responses (5 min TTL)
