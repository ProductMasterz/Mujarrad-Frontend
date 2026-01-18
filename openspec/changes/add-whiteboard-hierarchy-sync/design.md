## Context
The whiteboard and hierarchy are two views of the same data. Currently they operate independently, causing data inconsistency. Users see different structures in the whiteboard vs the sidebar hierarchy.

**Stakeholders**: End users, frontend team
**Constraints**: Must work with existing Excalidraw data format, backend Node model

## Goals / Non-Goals
- Goals:
  - Bidirectional sync: whiteboard frames <-> hierarchy nodes
  - Real-time updates when either side changes
  - Conflict resolution for concurrent edits
- Non-Goals:
  - Full offline support (future phase)
  - Multi-user real-time collaboration (future phase)
  - Syncing all Excalidraw elements (only frames map to nodes)

## Decisions
- **Decision**: Use Excalidraw's `customData` field to store node ID mapping
  - Alternatives: Separate mapping table (rejected - adds complexity), URL-based links (rejected - fragile)
- **Decision**: Frames are the primary sync target (not arbitrary shapes)
  - Alternatives: All text elements (rejected - too noisy), All grouped elements (rejected - confusing UX)
- **Decision**: Hierarchy is source of truth for conflicts
  - Alternatives: Whiteboard as source (rejected - harder to reason about), User prompt (rejected - annoying UX)

## Risks / Trade-offs
- **Performance**: Large whiteboards may have many frames to sync. Mitigation: Debounce sync operations, batch updates
- **Data Loss**: If sync fails, user changes may be lost. Mitigation: Queue failed operations, show sync status indicator
- **UX Complexity**: Users may not understand the mapping. Mitigation: Visual indicators on synced frames

## Migration Plan
1. Add `nodeId` field to frame's customData (non-breaking)
2. Existing frames remain unlinked until explicitly linked
3. New frames created through "Add Node" action auto-link
4. Provide "Link to Node" context menu for existing frames

## Open Questions
- Should deleting a node delete the whiteboard frame?
- Should deleting a frame delete the node?
- How to handle nested frames (frames inside frames)?
