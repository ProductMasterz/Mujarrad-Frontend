# Change: Add Whiteboard-Hierarchy Synchronization

## Why
Currently at 0% implementation. When users add frames/elements to the Excalidraw whiteboard, those elements are not reflected in the node hierarchy. This breaks the core promise of Mujarrad - that whiteboards and hierarchical navigation are synchronized views of the same data. Users expect:
- Creating a frame on whiteboard creates a node in hierarchy
- Renaming a frame updates the corresponding node
- Deleting a frame removes the node
- Creating a node creates a placeholder frame

## What Changes
- Implement bidirectional sync between whiteboard elements and node hierarchy
- Add frame-to-node mapping logic
- Handle conflict resolution for concurrent edits
- Add visual indicators showing which whiteboard elements map to nodes
- **BREAKING**: Changes whiteboard data model to include node references

## Impact
- Affected specs: whiteboard-integration
- Affected code:
  - `src/stores/whiteboardStore.ts`
  - `src/stores/hierarchyStore.ts`
  - `src/components/whiteboard/` (multiple components)
  - `src/hooks/api/useWhiteboard.ts`
  - New sync service needed
