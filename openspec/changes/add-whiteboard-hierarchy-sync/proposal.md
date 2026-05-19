# Change: Add Whiteboard-Hierarchy Synchronization

## Why

**Correction: Implementation is at ~35-40%, not 0%**

The current whiteboard already syncs elements TO nodes (one-way):
- Shape creation → Node creation (working)
- Shape text update → Node title update (working)
- Shape deletion → Node deletion (working)

**What's actually missing (60-65%):**
- Node creation → Frame creation (not implemented)
- Node rename → Frame title update (not implemented)
- Node deletion → Frame deletion (not implemented)
- Sync status UI indicator (not implemented)
- Link/unlink management UI (not implemented)

This breaks the core promise of Mujarrad - that whiteboards and hierarchical navigation are synchronized views of the same data. Users expect:
- Creating a frame on whiteboard creates a node in hierarchy ✅ (working)
- Renaming a frame updates the corresponding node ✅ (working)
- Deleting a frame removes the node ✅ (working)
- **Creating a node creates a placeholder frame** ❌ (missing)
- **Renaming a node updates the frame** ❌ (missing)
- **Deleting a node removes the frame** ❌ (missing)

## What Changes

### New Files
- `src/services/whiteboardSyncService.ts` - Bidirectional sync orchestration
- `src/components/whiteboard/SyncStatusIndicator.tsx` - UI status display
- `src/hooks/useWhiteboardSync.ts` - React hook for sync subscription
- Test files for sync service and integration

### Modified Files
- `src/stores/whiteboardStore.ts` - Add syncStatus, bidirectional maps
- `src/hooks/api/useWhiteboardMutations.ts` - Integrate sync service
- `src/components/whiteboard/WhiteboardCanvas.tsx` - Add sync indicator, customData
- `src/components/whiteboard/ExcalidrawWrapper.tsx` - Frame customData handling
- `src/components/hierarchy/HierarchyNavigator.tsx` - Add whiteboard actions
- `src/components/hierarchy/TreeNode.tsx` - Add context menu items

### Non-Breaking Changes
- All changes are additive to existing data model
- `customData.nodeId` field in frames is optional
- Existing unlinked frames continue to work

## Impact

- **Affected specs**: whiteboard-integration
- **Risk Level**: Medium (touches core sync logic)
- **Estimated Effort**: 8-12 days across 4 phases
- **Test Coverage Target**: 80% for sync service

### Phase Breakdown
1. **Foundation** (2-3 days): Bidirectional mapping infrastructure
2. **Frame→Node Enhancement** (2-3 days): Robust existing sync + status UI
3. **Node→Frame Sync** (2-3 days): Complete bidirectional sync
4. **UI Polish** (2-3 days): Context menus, edge cases, tests
