# Tasks: Add Whiteboard-Hierarchy Synchronization

## 1. Data Model Updates
- [ ] 1.1 Define frame-to-node mapping interface in types
- [ ] 1.2 Add `nodeId` to Excalidraw frame customData schema
- [ ] 1.3 Create mapping utilities to read/write nodeId from frame

## 2. Sync Service
- [ ] 2.1 Create `whiteboardSyncService.ts` for sync logic
- [ ] 2.2 Implement `onFrameCreated` -> create node handler
- [ ] 2.3 Implement `onFrameUpdated` -> update node handler
- [ ] 2.4 Implement `onFrameDeleted` -> prompt/delete node handler
- [ ] 2.5 Implement `onNodeCreated` -> create frame handler
- [ ] 2.6 Implement `onNodeDeleted` -> delete frame handler
- [ ] 2.7 Add debouncing to prevent sync storms

## 3. Store Integration
- [ ] 3.1 Update `whiteboardStore` to emit frame change events
- [ ] 3.2 Update `hierarchyStore` to emit node change events
- [ ] 3.3 Wire sync service to both stores
- [ ] 3.4 Add sync status state (syncing, synced, error)

## 4. UI Updates
- [ ] 4.1 Add sync status indicator to whiteboard toolbar
- [ ] 4.2 Add "linked" indicator on synced frames
- [ ] 4.3 Add "Link to Node" context menu item for unlinked frames
- [ ] 4.4 Add "View in Hierarchy" context menu item for linked frames

## 5. Testing
- [ ] 5.1 Write unit tests for sync service
- [ ] 5.2 Write integration tests for bidirectional sync
- [ ] 5.3 Test conflict scenarios
- [ ] 5.4 Test performance with large whiteboards (50+ frames)
