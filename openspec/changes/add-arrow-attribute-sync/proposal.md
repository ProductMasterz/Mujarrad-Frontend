# Proposal: add-arrow-attribute-sync

## Why

Drawing an arrow between two shapes on the whiteboard canvas should create a `connects_to` attribute (relationship) between their corresponding backend nodes, making the visual connection queryable and visible in the space graph. Currently, arrows are stored only as Excalidraw elements inside the context node's JSON — they have no backend representation and cannot be traversed as part of the knowledge graph.

## What Changes

- When an arrow is drawn connecting two shapes, both shapes are auto-promoted to backend REGULAR nodes (if not already), and a `connects_to` attribute is created from the source node to the target node
- Directionality is preserved: the arrow's start binding determines the source node, end binding determines the target node
- Deleting an arrow removes the corresponding `connects_to` attribute
- Moving an arrow endpoint (rebinding) updates the attribute accordingly
- Arrow sync happens as part of the debounced save cycle (not immediately), keeping the single-save-cycle simplicity

## Impact

- Affected specs: `whiteboard-persistence`
- Affected code:
  - `src/components/whiteboard/WhiteboardCanvas.tsx` — arrow diff logic
  - `src/hooks/api/useWhiteboardMutations.ts` — attribute sync after content save
  - `src/services/api/whiteboard.service.ts` — connector CRUD methods
  - `src/lib/whiteboard/elementMapper.ts` — already has `mapArrowToAttribute`, `categorizeElements`
  - `src/services/api/attribute.service.ts` — already has CRUD (no changes needed)
- Compatibility: Extends the `rewrite-whiteboard-persistence` change. The single-PUT content save remains unchanged; arrow sync is an additional post-save step.
- Risk: Medium — auto-node creation introduces implicit persistence, but it's triggered only for arrows with both ends bound to shapes.

## Capabilities Affected

- `whiteboard-persistence` (extends existing spec with arrow-to-attribute sync)

## Related Changes

- `rewrite-whiteboard-persistence` — This builds on the simplified single-PUT model
- `add-whiteboard-hierarchy-sync` — The `customData.nodeId` pattern is reused for auto-promoted shapes
