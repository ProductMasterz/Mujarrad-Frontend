# Whiteboard Save Algorithm Issue

## Problem Statement

The whiteboard save feature has a persistence issue: nodes added to the whiteboard appear to save successfully (UI shows "Saved" status) but do not persist on page refresh. Specifically, when multiple nodes are created, only one (or none) survives a reload.

---

## Architecture Overview

### Components Involved

| File | Role |
|------|------|
| `app/spaces/[slug]/whiteboard/page.tsx` | Page component, fetches initial state |
| `src/hooks/api/useWhiteboard.ts` | Query hook to load whiteboard state from server |
| `src/components/whiteboard/WhiteboardCanvas.tsx` | Excalidraw wrapper with save logic |
| `src/hooks/api/useWhiteboardMutations.ts` | Save mutation hook (categorize + API calls) |
| `src/services/api/whiteboard.service.ts` | API service (REST calls to backend) |
| `src/stores/whiteboardStore.ts` | Zustand store for UI state (saving, error) |

### Data Model

- **Shape Nodes**: Each Excalidraw shape (rectangle, ellipse, etc.) maps to a backend "node" entity
- **Context Node**: A special CONTEXT-type node that stores ALL element data as JSON in its `content` field
- **Node Map**: A `Map<excalidrawElementId, backendNodeId>` that tracks which shapes have been saved

---

## The Save Algorithm

### Trigger

1. User draws/modifies in Excalidraw
2. `onChange` fires with ALL current elements
3. Debounced (5 seconds) → `performSave()` executes

### Save Flow (useSaveWhiteboard)

```
Input: elements[], existingNodes Map, contextNodeId

STEP 1: Check/Create Context Node
  - Fetch existing context node for this space
  - If none exists and there are shapes, create one

STEP 2: Categorize Elements
  For each shape element:
    if existingNodes.has(element.id) → toUpdate[]
    else → toCreate[]

  For each entry in existingNodes:
    if element no longer on canvas → toDelete[]

STEP 3: Batch Save (batchSaveShapeNodes)
  - Run all updates (PUT /spaces/{slug}/nodes/{id})
    - If 404 → create new node, track in recreatedMap
  - Run all deletes (DELETE /spaces/{slug}/nodes/{id})
    - If 404 → ignore (already gone)
  - Run all creates (POST /spaces/{slug}/nodes)

STEP 4: Build Updated Node Map
  updatedMap = copy of existingNodes
  + add created nodes (elementId → newNodeId)
  + replace recreated nodes (elementId → replacementNodeId)
  - remove deleted nodes

STEP 5: Build Context Content
  For each shape WHERE updatedMap has a nodeId:
    Add to elementEntries[] with {node_id, excalidraw_element}
  Also include connectors (arrows with bindings)

STEP 6: Save Context Node
  PUT /spaces/{slug}/nodes/{contextNodeId}
  body: { content: JSON.stringify(elementEntries + appState + files) }

STEP 7: Update Client State
  existingNodesRef.current = updatedMap
  (This is the "memory" for the next save cycle)
```

### Load Flow (on page refresh)

```
1. useWhiteboardContext → GET /spaces/{slug}/nodes?node_type=CONTEXT
2. Find context node with whiteboard_context.context_type === 'whiteboard'
3. GET /spaces/{slug}/nodes/{contextNodeId} (full content)
4. Parse content JSON → extract elements[] and build nodeMap
5. Pass to WhiteboardCanvas as initialElements + initialNodeMap
6. Excalidraw renders the elements
7. existingNodesRef initialized with initialNodeMap
```

---

## Issues Found

### Issue 1: Original 404 Infinite Loop (Fixed)

**Symptom**: `PUT /api/spaces/{slug}/nodes/{id} 404 (Not Found)` repeating forever

**Cause**: The `existingNodes` map contained node IDs that no longer existed on the backend server. Every 5-second save cycle tried to update them, got 404, failed, and retried.

**Why stale IDs exist**: Nodes can be deleted server-side (database cleanup, backend restart on free tier, manual deletion) while the frontend still holds their IDs.

**Fix**: When an update returns 404, create a new node instead. Track the mapping `oldNodeId → newNode` so the element gets the correct new ID.

### Issue 2: Broken Index-Based Recreated Node Matching (Fixed)

**Symptom**: Save appears successful but nodes disappear on refresh

**Cause**: The first fix used an array (`recreated: WhiteboardNode[]`) to track recreated nodes, then tried to match them back to elements using an index counter. This failed because:
1. The loop iterated ALL `toUpdate` entries, not just failed ones
2. The `recreatedIndex` incremented for every match, not just recreated ones
3. `Promise.all` doesn't guarantee ordering for which items fail

**Fix**: Changed to `Map<oldNodeId, WhiteboardNode>` (recreatedMap). Now each recreated node is directly keyed by the old ID it replaced, making the lookup O(1) and order-independent.

### Issue 3: Only One Node Persists (Fixed)

**Symptom**: User creates node A, then node B. On refresh, only one node appears.

**Root Causes**: Two bugs working together — Theory C + Theory D confirmed.

#### Root Cause A: useEffect Overwrites existingNodesRef with Stale Query Data

In `WhiteboardCanvas.tsx`, the `useEffect` that syncs `initialNodeMap` to `existingNodesRef` fires on **every parent re-render** because `useWhiteboardState()` creates a new `Map` instance on each render (reference inequality):

```typescript
// In useWhiteboard.ts - new Map on EVERY render
const nodeMap = new Map<string, string>();
content.elements.forEach(entry => { nodeMap.set(...); });

// In WhiteboardCanvas.tsx - fires on every parent re-render
useEffect(() => {
  if (initialNodeMap) {
    existingNodesRef.current = initialNodeMap; // OVERWRITES save result!
  }
}, [initialNodeMap]);
```

After a successful save:
1. `existingNodesRef.current = result.nodeMap` (correct: `{A: id1, B: id2}`)
2. `markSaved()` → Zustand store update → parent re-renders
3. Parent re-renders → `useWhiteboardState` creates new nodeMap from stale query data (only `{A: id1}`)
4. useEffect fires → `existingNodesRef.current = {A: id1}` (B's mapping LOST!)

**Fix**: Guard the useEffect with a `hasSavedRef` flag. After the first save, the ref is authoritatively managed by `performSave` and should never be overwritten by query data.

#### Root Cause B: Concurrent Save Guard Discards Elements Without Retry

When `isSavingRef.current` is true, `performSave` returned immediately with no retry mechanism:

```typescript
if (isSavingRef.current) {
  console.log('[WhiteboardCanvas] Save already in progress, skipping');
  return; // Elements are LOST forever!
}
```

On Render free tier, saves take 3+ API calls (check/create context, batch save, update context). If this takes > 5 seconds (the debounce period), the next debounce fires while the previous save is running, and new elements are permanently skipped.

**Fix**: Added `pendingSaveRef` flag. When a save is skipped, the flag is set. After the current save completes, if the flag is set, it retries with the latest `lastElementsRef` (which always contains ALL current canvas elements).

---

## Diagnostic Steps

To determine which theory is correct, check the browser console for these log messages:

1. **After first save**: `[WhiteboardCanvas] Save successful! {nodeMapSize: X, contextNodeId: Y}`
   - `nodeMapSize` should be 1

2. **After second save**: Same log
   - `nodeMapSize` should be 2

3. **On page refresh**: `[useWhiteboardState] Parsed state: {elementsCount: X, nodeMapSize: X}`
   - `elementsCount` should equal total elements (shapes + bound text)
   - `nodeMapSize` should be 2

4. **Check for skipped saves**: `[WhiteboardCanvas] Save already in progress, skipping`
   - If this appears, the debounce fired while a previous save was running

5. **Check for 404 fallbacks**: `[whiteboardService] Node X not found (404), creating new node`
   - If this appears on every save, the backend is not retaining nodes

---

## Key Code Locations

| What | File | Lines |
|------|------|-------|
| Debounce trigger | `WhiteboardCanvas.tsx` | 181-185 |
| Concurrent save guard | `WhiteboardCanvas.tsx` | 128-130 |
| existingNodesRef update | `WhiteboardCanvas.tsx` | 157-161 |
| initialNodeMap sync effect | `WhiteboardCanvas.tsx` | 68-72 |
| Element categorization | `useWhiteboardMutations.ts` | 80-114 |
| Batch save + recreatedMap | `whiteboard.service.ts` | 290-338 |
| recreatedMap handling | `useWhiteboardMutations.ts` | 155-168 |
| Context content building | `useWhiteboardMutations.ts` | 183-211 |
| Elements excluded without nodeId | `useWhiteboardMutations.ts` | 187-188 |
| Query invalidation on success | `useWhiteboardMutations.ts` | 261 |
| Context node loading | `useWhiteboard.ts` | 29-73 |
| nodeMap reconstruction | `useWhiteboard.ts` | 50-55 |

---

## Commits Related

| Hash | Description |
|------|-------------|
| `298aa87` | feat: add rate limiting middleware for security |
| `e3554ec` | fix: add rate limiting protection to prevent 429 errors |
| `62b6c76` | fix: disable rate limiting in development mode |
| `76d2320` | fix: handle 404 errors in whiteboard save (broken recreated logic) |
| `0e9f337` | fix: correct whiteboard save logic for recreated nodes (Map-based fix) |
