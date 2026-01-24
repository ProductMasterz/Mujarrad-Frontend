# Design: Arrow-to-Attribute Sync

## Context

The whiteboard uses Excalidraw, where arrows have `startBinding` and `endBinding` properties that reference the element IDs of the shapes they connect. With the new single-PUT persistence, all elements (shapes + arrows) are stored as flat JSON in the context node. However, arrows have no backend representation — they're invisible to the knowledge graph.

The existing infrastructure provides:
- `attribute.service.ts` — CRUD for node attributes (`POST /nodes/{id}/attributes`)
- `elementMapper.ts` — `mapArrowToAttribute()`, `categorizeElements()`, `getBoundElementIds()`
- `configSchemas.ts` — `isConnectorType()` to detect arrows/lines
- `WhiteboardConnector` and `CreateConnectorDTO` types in `whiteboard.ts`
- `CreateAttributeRequest` type in `backend-dtos.ts`

## Goals

- Arrows between shapes create queryable `connects_to` relationships in the backend
- Directionality is preserved (arrow start = source, arrow end = target)
- Arrow lifecycle (create, delete, rebind) keeps attributes in sync
- Auto-promotion of shapes to nodes is seamless and invisible to the user

## Non-Goals

- Syncing unbound arrows (arrows not connected to any shape on either end)
- Creating attributes for lines (only arrows with arrowheads)
- Real-time collaboration sync (still single-user auto-save model)
- Bidirectional attribute creation (one arrow = one directed attribute)

## Decisions

### Decision 1: Arrow sync happens post-save, not during save
**What**: After the content PUT succeeds, a separate step diffs arrows and syncs attributes.
**Why**: Keeps the atomic content save unchanged. If attribute sync fails, the canvas data is still safe. Attribute operations are best-effort — a retry on next save will reconcile.
**Alternative**: Bundling attribute calls into the save mutation. Rejected because it re-introduces partial failure complexity.

### Decision 2: Auto-promote shapes to nodes when connected by an arrow
**What**: When an arrow binds shape A to shape B, both shapes get REGULAR nodes (if they don't have `customData.nodeId` already). Node IDs are stored in `customData.nodeId` and persisted on the next save.
**Why**: Attributes require two node IDs. The user shouldn't need to manually promote shapes before drawing arrows.
**Alternative**: Only sync arrows where both ends are already promoted. Rejected because it creates a confusing UX gap.

### Decision 3: Track synced arrows in a ref to enable diffing
**What**: Maintain a `syncedArrowsRef` Map (`arrowElementId → attributeId`) that tracks which arrows have been synced to the backend.
**Why**: On each save, we can diff current bound arrows vs synced arrows to determine creates/deletes.
**Alternative**: Fetch all `connects_to` attributes from backend before each save. Rejected because it adds a GET call per save cycle.

### Decision 4: Use `connects_to` as attribute type with connector metadata
**What**: The attribute uses `attributeType: "connects_to"` and stores the arrow's Excalidraw element data in `attributeValue` (using the existing `WhiteboardConnectorValue` type).
**Why**: Reuses existing types. Allows the backend to distinguish whiteboard connections from other relationship types. Preserves arrow visual metadata for potential future rendering.

### Decision 5: Deletion cascades from arrow removal only
**What**: Deleting an arrow deletes the `connects_to` attribute. Deleting a shape does NOT delete its node — that's handled separately by the "Remove from Space List" action.
**Why**: Shapes may be promoted for other reasons (explicit promotion, other arrows). Automatically deleting nodes when shapes are deleted would cause unexpected data loss.

## Risks / Trade-offs

- **Race condition**: If two saves happen in quick succession, the second diff might operate on stale `syncedArrowsRef`. Mitigation: the concurrency guard (`isSavingRef`) already prevents this.
- **Orphaned attributes**: If a save succeeds but attribute sync partially fails (e.g., 2 of 3 creates succeed), some arrows won't have attributes. Mitigation: next save cycle will retry the diff and catch missing attributes.
- **Auto-promoted nodes without titles**: Shapes like rectangles get generic titles ("Rectangle 1"). Mitigation: use `generateTitle()` from elementMapper which handles text content extraction.
- **Backend attribute limits**: If a whiteboard has 100+ arrows, the post-save sync could issue 100+ API calls on first save. Mitigation: batch create if backend supports it, or throttle.

## Open Questions

- Does the backend support batch attribute creation? If not, we may need to parallelize with `Promise.allSettled`.
- Should we debounce the attribute sync separately from the content save (e.g., sync attributes every 10s instead of every 3s)?
