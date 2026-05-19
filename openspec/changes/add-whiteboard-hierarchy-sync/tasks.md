# Tasks: Add Whiteboard-Hierarchy Synchronization

**Status**: Implementation Complete
**Updated**: January 22, 2026

## Phase 1: Foundation (Data Model & Infrastructure)

### 1.1 Type Definitions
- [x] 1.1.1 Add `nodeId?: string` to ExcalidrawElement customData type (`src/types/whiteboard.ts`)
- [x] 1.1.2 Create `SyncOperation` interface for operation queue
- [x] 1.1.3 Add `WhiteboardSyncState` interface to store types

### 1.2 Store Updates
- [x] 1.2.1 Add `syncStatus: 'idle' | 'syncing' | 'error'` to whiteboardStore
- [x] 1.2.2 Add `lastSyncError: string | null` to whiteboardStore
- [x] 1.2.3 Add `nodeFrameMap: Map<string, string>` to whiteboardStore
- [x] 1.2.4 Add actions: `setSyncStatus`, `setSyncError`, `updateNodeFrameMap`
- [x] 1.2.5 Persist nodeFrameMap to localStorage for remount recovery

### 1.3 Sync Service Scaffold
- [x] 1.3.1 Create `src/services/whiteboardSyncService.ts` skeleton
- [x] 1.3.2 Implement bidirectional Map management (nodeToFrame, frameToNode)
- [x] 1.3.3 Add sync origin tracking to prevent infinite loops
- [x] 1.3.4 Export singleton instance

## Phase 2: Enhance Existing Frame→Node Sync

### 2.1 Improve Current Implementation
- [x] 2.1.1 Refactor `useSaveWhiteboard` to use sync service for map management
- [x] 2.1.2 Store `nodeId` in frame's `customData` when creating nodes
- [ ] 2.1.3 Remove setTimeout hack for cache invalidation (line 242) - Deferred
- [ ] 2.1.4 Add proper operation queuing instead of debounce - Deferred

### 2.2 Sync Status UI
- [x] 2.2.1 Create `SyncStatusIndicator.tsx` component
- [x] 2.2.2 Show "Saving..." during sync operations
- [x] 2.2.3 Show "Saved" with checkmark on success (auto-hide after 2s)
- [x] 2.2.4 Show error state with "Retry" button on failure
- [x] 2.2.5 Add indicator to whiteboard toolbar area

### 2.3 Visual Link Indicators
- [ ] 2.3.1 Add subtle badge/icon overlay on linked frames - Deferred
- [ ] 2.3.2 Use Excalidraw's custom rendering or CSS overlay - Deferred

## Phase 3: Implement Node→Frame Sync

### 3.1 Node Event Subscription
- [x] 3.1.1 Create `useWhiteboardSync` hook for node mutation events
- [x] 3.1.2 Subscribe to node creation events (via React Query mutation cache)
- [x] 3.1.3 Subscribe to node update events
- [x] 3.1.4 Subscribe to node deletion events

### 3.2 Node Created → Create Frame
- [x] 3.2.1 Implement `onNodeCreated` handler in sync service
- [x] 3.2.2 Only create frame if whiteboard is currently active
- [x] 3.2.3 Calculate available position (avoid overlapping existing frames)
- [x] 3.2.4 Create frame with node title as bound text
- [x] 3.2.5 Store bidirectional mapping (nodeId ↔ frameId)
- [x] 3.2.6 Update Excalidraw scene via API

### 3.3 Node Updated → Update Frame
- [x] 3.3.1 Implement `onNodeUpdated` handler in sync service
- [x] 3.3.2 Check if node has linked frame
- [x] 3.3.3 Update frame's bound text element with new title
- [x] 3.3.4 Skip update if change originated from frame (prevent loop)

### 3.4 Node Deleted → Delete Frame
- [x] 3.4.1 Implement `onNodeDeleted` handler in sync service
- [x] 3.4.2 Find linked frame via nodeFrameMap
- [x] 3.4.3 Mark frame element as deleted
- [x] 3.4.4 Clean up bidirectional maps
- [x] 3.4.5 Update Excalidraw scene

## Phase 4: UI Polish & Edge Cases

### 4.1 Context Menu (Whiteboard)
- [x] 4.1.1 Add "View in Hierarchy" item (for linked frames)
- [ ] 4.1.2 Add "Link to Node..." item (for unlinked frames) - Deferred
- [x] 4.1.3 Add "Unlink from Node" item (for linked frames)
- [x] 4.1.4 Implement node selection/scroll in hierarchy (via custom event)

### 4.2 Context Menu (Hierarchy)
- [x] 4.2.1 Add "View on Whiteboard" item (for nodes with linked frames)
- [x] 4.2.2 Add "Create Frame on Whiteboard" item
- [ ] 4.2.3 Implement frame selection/zoom in whiteboard - Deferred

### 4.3 Deletion Confirmation
- [x] 4.3.1 Create `DeleteLinkedFrameDialog` component
- [ ] 4.3.2 Show when deleting a frame that has a linked node - Deferred (requires Excalidraw event hook)
- [x] 4.3.3 Options: "Delete Both", "Delete Frame Only", "Cancel"

### 4.4 Edge Case Handling
- [ ] 4.4.1 Handle orphaned frames (node deleted externally) - Deferred
- [ ] 4.4.2 Handle orphaned nodes (frame deleted externally) - Deferred
- [x] 4.4.3 Handle rapid sequential operations (queue coalescence)
- [x] 4.4.4 Handle network errors with retry logic

## Phase 5: Testing

### 5.1 Unit Tests
- [ ] 5.1.1 Test sync service bidirectional map management
- [ ] 5.1.2 Test sync origin tracking (loop prevention)
- [ ] 5.1.3 Test operation queue ordering
- [ ] 5.1.4 Test frame position calculation

### 5.2 Integration Tests
- [ ] 5.2.1 Test frame creation → node creation flow
- [ ] 5.2.2 Test node creation → frame creation flow
- [ ] 5.2.3 Test bidirectional rename sync
- [ ] 5.2.4 Test bidirectional deletion sync
- [ ] 5.2.5 Test conflict resolution (hierarchy wins)

### 5.3 E2E Tests
- [ ] 5.3.1 Test full sync workflow via Playwright
- [ ] 5.3.2 Test UI indicators (sync status, linked badges)
- [ ] 5.3.3 Test context menu actions

### 5.4 Performance Tests
- [ ] 5.4.1 Test with 50 frames (target: <500ms sync)
- [ ] 5.4.2 Test with 100 frames (target: <1s sync)
- [ ] 5.4.3 Test rapid editing (debounce effectiveness)

---

## Dependencies

```
Phase 1 ──┬──► Phase 2 ──┬──► Phase 4
          │              │
          └──► Phase 3 ──┘
                         │
                         └──► Phase 5
```

- Phases 2 and 3 can be worked in parallel after Phase 1
- Phase 4 depends on both Phase 2 and 3
- Phase 5 can begin unit tests in parallel with Phase 2-3

## Acceptance Criteria

1. Creating a shape on whiteboard creates a node in hierarchy
2. Renaming a shape updates the linked node title
3. Deleting a shape prompts about deleting linked node
4. Creating a node (when whiteboard active) creates a frame
5. Renaming a node updates the linked frame text
6. Deleting a node removes the linked frame
7. Sync status indicator shows current state
8. Linked frames have visual indicator
9. Context menus allow link management
10. 80% test coverage on sync service
