# Design: rewrite-whiteboard-persistence

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ BROWSER                                                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ WhiteboardPage                                              │ │
│  │                                                             │ │
│  │  useWhiteboardData(spaceSlug)                               │ │
│  │    → GET context node                                       │ │
│  │    → parse JSON → { elements, appState, files }             │ │
│  │    → return contextNodeId                                   │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ WhiteboardCanvas                                      │  │ │
│  │  │                                                       │  │ │
│  │  │  Excalidraw                                           │  │ │
│  │  │    │                                                  │  │ │
│  │  │    │ onChange(elements, appState, files)               │  │ │
│  │  │    ▼                                                  │  │ │
│  │  │  debounce(3s)                                         │  │ │
│  │  │    │                                                  │  │ │
│  │  │    ▼                                                  │  │ │
│  │  │  PUT /spaces/{slug}/nodes/{contextId}                 │  │ │
│  │  │    body: { content: JSON(elements, appState, files) } │  │ │
│  │  │                                                       │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTP
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND                                                          │
│                                                                  │
│  Node (type=CONTEXT):                                            │
│    content: JSON string with full Excalidraw state               │
│    nodeDetails: { whiteboard_context: { context_type } }         │
└─────────────────────────────────────────────────────────────────┘
```

## Design Decisions

### Decision 1: Context-Only Storage (Drop Per-Shape Nodes from Auto-Save)

**Problem**: Current system creates/updates/deletes a REGULAR node per shape on every auto-save. These nodes are not used for rendering or loading.

**Decision**: Store all whiteboard data exclusively in the CONTEXT node's `content` field as a JSON blob. Shape nodes are never created by the auto-save loop.

**Rationale**:
- Eliminates N API calls per save (one per shape)
- Eliminates the `existingNodesRef` mapping and all its corruption vectors
- Eliminates dual-storage consistency problems
- The context node already stores the complete element data — shape nodes are redundant

**Trade-off**: The "Show in Space List" feature now requires explicit user action (lazy creation) rather than having pre-created nodes ready to promote. This is acceptable because promoting a shape to the space list is a rare, deliberate action.

### Decision 2: Single Atomic PUT per Save

**Problem**: Current save has 6 steps that can partially fail (create shapes, update shapes, delete shapes, build map, build content, save context).

**Decision**: Each save is a single `PUT /spaces/{slug}/nodes/{contextId}` with the full context content. Success or failure is atomic.

**Rationale**:
- No partial failure states
- No rollback logic needed
- No orphaned nodes possible
- Single network round-trip (~50-200ms vs current 2-10+ seconds)

### Decision 3: Cache Context Node ID After First Load

**Problem**: Current system calls `getWhiteboardContext()` on every save (2 API calls: list CONTEXT nodes + fetch full node) even though the ID never changes.

**Decision**: Fetch the context node ID once during initial load. Store in a ref. Reuse on all subsequent saves. Only create a new context node if none exists on first save.

**Rationale**:
- Saves are now 1 API call instead of 3+
- Context nodes are never deleted during normal usage
- If the context node is externally deleted (rare), the PUT returns 404 and we can re-create

### Decision 4: Preserve Bidirectional Sync Independence

**Problem**: The `add-whiteboard-hierarchy-sync` feature uses `customData.nodeId` on Excalidraw elements to track linked nodes. This must continue to work.

**Decision**: The sync feature operates independently of the save loop:
- Sync handlers (node→frame, frame→node) create/update nodes on explicit user actions
- The `customData.nodeId` field is preserved in the context JSON naturally (it's part of the element data Excalidraw stores)
- "Promote to Space List" becomes the entry point for creating a backend node for a shape

**Rationale**:
- Sync events (rename, delete, create) are user-triggered, not auto-save-triggered
- The sync service already works via event handlers, not via the save loop
- Decoupling sync from persistence eliminates the timing/ordering bugs

### Decision 5: Reduced Debounce Window (5s → 3s)

**Problem**: Current 5s debounce was chosen because saves take 2-10+ seconds (multiple API calls on Render free tier). With saves frequently overlapping the debounce window, the concurrency guard causes missed saves.

**Decision**: Reduce debounce to 3 seconds. Since saves are now a single PUT (~100-300ms), overlap is extremely unlikely.

**Rationale**:
- Single PUT is fast enough that concurrency is rarely an issue
- 3s provides responsive feedback without hammering the server
- The `pendingSaveRef` retry mechanism becomes a simple safety net rather than a critical path

### Decision 6: Simplified State — Only 3 Refs

**Problem**: Current canvas has 7+ mutable refs with complex interdependencies.

**Decision**: Reduce to 3 refs:
- `contextNodeIdRef` — cached from initial load
- `lastElementsRef` — latest Excalidraw state for immediate save
- `isSavingRef` — simple concurrency guard

Remove: `existingNodesRef`, `hasSavedRef`, `pendingSaveRef`, `lastAppStateRef`, `lastFilesRef` (merge app state and files into a single "last state" pattern).

### Decision 7: Lazy Node Creation for "Promote to Space List"

**Problem**: Current system creates a REGULAR node for every shape on every save, just in case the user wants to promote it to the space list.

**Decision**: When user right-clicks a shape and selects "Show in Space List":
1. POST to create a REGULAR node with the shape's title/content
2. Store the node ID in the element's `customData.nodeId`
3. Trigger a save to persist the updated customData

**Rationale**:
- Only creates nodes when actually needed
- Eliminates N unnecessary POST/PUT calls per save
- The node is immediately visible in the space list
- If a shape already has `customData.nodeId` (from previous linking), skip creation

## Data Model (Simplified)

```
Context Node (1 per space):
  nodeType: "CONTEXT"
  nodeDetails: { whiteboard_context: { context_type: "whiteboard" } }
  content: JSON.stringify({
    elements: ExcalidrawElement[],   // Full element data including customData
    app_state: { zoom, scrollX, scrollY, viewBackgroundColor },
    files: Record<string, BinaryFileData>
  })
```

Note: The context content format changes slightly — elements are stored as a flat array (Excalidraw's native format) rather than wrapped in `{ node_id, excalidraw_element }` entries. The `node_id` for linked elements lives in `element.customData.nodeId`.

## Migration Path

The content format change (from `[{ node_id, excalidraw_element }]` to flat `ExcalidrawElement[]`) requires a migration adapter in the load path:

```typescript
// If content has old format (array of { node_id, excalidraw_element })
if (content.elements?.[0]?.excalidraw_element) {
  // Old format: extract elements and preserve nodeId in customData
  elements = content.elements.map(entry => ({
    ...entry.excalidraw_element,
    customData: { ...entry.excalidraw_element.customData, nodeId: entry.node_id || undefined }
  }));
} else {
  // New format: elements are already flat ExcalidrawElement[]
  elements = content.elements;
}
```

This ensures existing whiteboards load correctly without any backend migration.

## API Calls Comparison

| Scenario | Current | New |
|----------|---------|-----|
| First load | 2 (list + fetch) | 2 (list + fetch) |
| First save (1 shape) | 4 | 2 (POST context + PUT content) |
| Subsequent save (any N shapes) | N+3 to 2N+3 | 1 (PUT context) |
| Promote shape to space list | 0 (already created) | 1 (POST node) |

## Files Affected

| File | Action |
|------|--------|
| `src/hooks/api/useWhiteboardMutations.ts` | Rewrite — single PUT mutation |
| `src/services/api/whiteboard.service.ts` | Simplify — remove batch/shape methods |
| `src/components/whiteboard/WhiteboardCanvas.tsx` | Simplify — remove excess refs/guards |
| `src/hooks/api/useWhiteboardState.ts` | Simplify — flatten load logic |
| `src/stores/whiteboardStore.ts` | Minimal changes — keep status indicators |
| `src/types/whiteboard.ts` | Update content type (flat elements) |
| `src/lib/whiteboard/elementMapper.ts` | Keep `categorizeElements` for sync, remove save-related utils |
