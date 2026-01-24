# Proposal: rewrite-whiteboard-persistence

## Summary

Rewrite the whiteboard save/load algorithm from scratch, replacing the current multi-layered, patch-heavy implementation with a single-PUT context-only persistence model. The current system creates per-shape backend nodes on every auto-save (4-53+ API calls per cycle), maintains fragile client-side ref state as the sole bridge between two redundant data representations, and has required 3 consecutive bug-fix commits to address stale refs, infinite loops, and data loss.

## Motivation

The current whiteboard persistence has fundamental architectural problems:

1. **Dual storage**: Every shape is stored as both a REGULAR node AND as JSON inside the CONTEXT node, requiring synchronization on every save
2. **Excessive API calls**: Minimum 4, typical 6+, worst case 2N+3 calls per save cycle (every 5 seconds of inactivity)
3. **Fragile client state**: `existingNodesRef` Map is the sole bridge between Excalidraw element IDs and backend node IDs — any corruption causes duplicates, orphans, or data loss
4. **Non-atomic saves**: Steps can partially succeed, leaving orphaned nodes or missing elements
5. **Complexity explosion**: 600+ lines of save logic, 7 mutable refs, ad-hoc concurrency control via debounce + flags + retry

The shape nodes (REGULAR type) are NOT used for rendering or loading — they exist only for the "Show in Space List" feature, which is a rare explicit user action that should not drive the auto-save architecture.

## Proposed Change

Replace the entire save/load flow with:

- **Save**: Single PUT to update the context node's content with full Excalidraw state (elements, appState, files)
- **Load**: Single GET to fetch the context node, parse JSON, pass to Excalidraw
- **Promote to Space List**: Lazy node creation only when user explicitly right-clicks and selects the action

## Impact

- **Risk**: Medium — replaces core persistence but the new code is dramatically simpler
- **Scope**: `useWhiteboardMutations.ts`, `whiteboard.service.ts`, `WhiteboardCanvas.tsx`, `useWhiteboardState` hook, `whiteboardStore.ts`
- **Compatibility**: The `add-whiteboard-hierarchy-sync` change's bidirectional sync features are preserved — linked nodes still store their ID in element `customData.nodeId`, and the sync event handlers remain independent of the save loop
- **Data migration**: Existing context nodes already store the full element data in the correct format — no migration needed. Existing orphaned shape nodes become inert (hidden from space list by default)

## Capabilities Affected

- `whiteboard-persistence` (new spec — no prior formal spec exists; the current persistence behavior is defined only by the implementation code)

## Related Changes

- `add-whiteboard-hierarchy-sync` — Sync features are preserved but decoupled from save loop. The "Promote to Space List" action replaces the automatic shape-node creation.
