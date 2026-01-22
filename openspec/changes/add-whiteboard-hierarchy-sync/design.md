## Context

**Current State Analysis (January 2026):**

The whiteboard already has one-way sync (Whiteboard → Nodes):
- `useSaveWhiteboard` creates nodes when shapes are added
- Text content extracted from bound elements becomes node title
- Deletions are tracked via element ID diff
- Node map stored in `existingNodesRef` (lost on unmount)

**What's missing:**
- Reverse sync (Node changes → Whiteboard)
- Persistent bidirectional mapping
- Sync status indication
- Link/unlink management

**Stakeholders**: End users, frontend team
**Constraints**: Must work with existing Excalidraw data format, backend Node model, current `useSaveWhiteboard` implementation

## Goals / Non-Goals

### Goals
- Complete bidirectional sync: whiteboard frames ↔ hierarchy nodes
- Real-time updates when either side changes
- Conflict resolution (hierarchy wins)
- Sync status indicator (saving/saved/error)
- Visual indicators on linked frames
- Context menu actions for link management

### Non-Goals
- Full offline support (future phase)
- Multi-user real-time collaboration (future phase)
- Syncing connectors/arrows (cosmetic, no node equivalent)
- Automatic frame positioning optimization

## Decisions

### Decision 1: Use Excalidraw's `customData` field for node ID mapping
- **Chosen**: Store `nodeId` in `element.customData`
- **Alternatives rejected**:
  - Separate mapping table (adds complexity, sync issues)
  - URL-based links (fragile, requires parsing)
- **Rationale**: Native to Excalidraw, persisted automatically, easy to read/write

### Decision 2: Sync ALL shapes (current behavior) vs Frames only
- **Chosen**: Keep current behavior (all shapes) for backward compatibility
- **Rationale**: Changing would orphan existing node mappings
- **Future consideration**: Add option to filter in settings

### Decision 3: Hierarchy is source of truth for conflicts
- **Chosen**: If both change, hierarchy wins
- **Alternatives rejected**:
  - Whiteboard as source (harder to reason about)
  - User prompt (annoying UX)
- **Rationale**: Hierarchy is the persistent, queryable data model

### Decision 4: Node deletion behavior
- **Chosen**: Deleting a node silently removes the linked frame
- **Rationale**: Node is the source of truth, no confirmation needed

### Decision 5: Frame deletion behavior
- **Chosen**: Deleting a frame shows confirmation dialog about linked node
- **Rationale**: Users may not realize a node exists, prevent accidental data loss

## Architecture

### Sync Service Design

```typescript
// src/services/whiteboardSyncService.ts
class WhiteboardSyncService {
  // Bidirectional maps
  private nodeToFrame: Map<string, string> = new Map();
  private frameToNode: Map<string, string> = new Map();

  // Sync state
  private syncQueue: SyncOperation[] = [];
  private isSyncing: boolean = false;

  // Event handlers
  onFrameCreated(frame: ExcalidrawElement): Promise<void>
  onFrameUpdated(frame: ExcalidrawElement): Promise<void>
  onFrameDeleted(frameId: string): Promise<void>

  onNodeCreated(node: Node): Promise<void>
  onNodeUpdated(node: Node): Promise<void>
  onNodeDeleted(nodeId: string): Promise<void>

  // Utilities
  getLinkedNodeId(frameId: string): string | null
  getLinkedFrameId(nodeId: string): string | null
  isFrameLinked(frameId: string): boolean
}
```

### Store Updates

```typescript
// Addition to whiteboardStore
interface WhiteboardSyncState {
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncError: string | null;
  lastSyncTime: Date | null;
}
```

## Risks / Trade-offs

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Infinite sync loops | Medium | Critical | Add sync origin tracking |
| Race conditions | High | High | Operation queue with locks |
| Performance (50+ frames) | Medium | Medium | Batch operations, debounce |
| Lost updates (network) | Medium | High | Retry queue, offline indicator |
| Stale nodeMap on remount | High | Medium | Persist to store, reload on mount |

## Migration Plan

1. **Phase 1**: Add `customData.nodeId` field to frames (non-breaking)
2. **Phase 2**: Backfill existing frames with nodeId from current nodeMap
3. **Phase 3**: Enable Node→Frame sync (feature flagged)
4. **Phase 4**: Remove feature flag, full bidirectional sync

## Resolved Questions

| Question | Answer | Rationale |
|----------|--------|-----------|
| Should deleting a node delete the frame? | Yes, silently | Node is source of truth |
| Should deleting a frame delete the node? | Prompt user | Prevent accidental data loss |
| Nested frames handling? | Not supported (v1) | Complexity, unclear UX |
