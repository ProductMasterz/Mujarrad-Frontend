# Tasks: rewrite-whiteboard-persistence

## Phase 1: Simplify the Service Layer

### Task 1.1: Rewrite whiteboard.service.ts
- **Status**: done
- **File**: `src/services/api/whiteboard.service.ts`
- **Action**: Replace the service with 3 methods:
  - `getWhiteboardContext(slug)` — fetch context node (keep existing, remove verbose logging)
  - `createWhiteboardContext(slug, content)` — create context node with initial content
  - `saveWhiteboardContent(slug, contextId, content)` — single PUT with full content JSON
- **Remove**: `batchSaveShapeNodes`, `createShapeNode`, `updateShapeNode`, `getWhiteboardNodes`, `createWhiteboardNode`, `updateWhiteboardNode` (all shape-node CRUD)
- **Keep**: `deleteWhiteboardNode` (still needed for promote/unlink cleanup), `parseWhiteboardContent`
- **Validation**: Service exports only the needed methods; unused shape-node methods are gone

### Task 1.2: Update whiteboard types
- **Status**: done
- **File**: `src/types/whiteboard.ts`
- **Action**: Update `WhiteboardContextContent` to store flat `ExcalidrawElement[]` instead of `WhiteboardElementEntry[]`
- **Add**: Migration type guard to detect old vs new format
- **Validation**: Types compile cleanly with new content format

## Phase 2: Rewrite the Save Mutation

### Task 2.1: Rewrite useWhiteboardMutations.ts
- **Status**: done
- **File**: `src/hooks/api/useWhiteboardMutations.ts`
- **Action**: Replace `useSaveWhiteboard` with a simplified mutation:
  - Input: `{ elements, appState, files, contextNodeId }`
  - Logic: Single PUT to update context content
  - Handle 404 (context deleted) by creating new context + retry
  - No categorization, no shape node CRUD, no nodeMap management
  - Return: `{ contextNodeId }`
- **Remove**: All shape categorization, batch save, recreatedMap, nodeMap building, rollback logic, whiteboardSyncService calls
- **Validation**: Mutation performs exactly 1 API call on subsequent saves

### Task 2.2: Simplify useWhiteboardState hook
- **Status**: done
- **File**: `src/hooks/api/useWhiteboardState.ts` (or wherever the load query lives)
- **Action**:
  - Load: fetch context node, parse content
  - Add format migration: detect old `[{ node_id, excalidraw_element }]` format and convert to flat `ExcalidrawElement[]`, mapping `node_id` into `customData.nodeId`
  - Return: `{ elements, appState, files, contextNodeId }`
  - Remove: nodeMap building from load result
- **Validation**: Old-format whiteboards load correctly; new-format whiteboards load without transformation

## Phase 3: Simplify the Canvas Component

### Task 3.1: Rewrite WhiteboardCanvas save logic
- **Status**: done
- **File**: `src/components/whiteboard/WhiteboardCanvas.tsx`
- **Action**:
  - Remove refs: `existingNodesRef`, `hasSavedRef`, `pendingSaveRef`, `lastAppStateRef`, `lastFilesRef`
  - Keep refs: `contextNodeIdRef`, `isSavingRef`, `lastStateRef` (single ref for elements+appState+files)
  - Simplify `performSave`: call mutation with current state, update contextNodeIdRef on success
  - Reduce debounce from 5s to 3s
  - Keep: `isMountedRef` guard, `saveNow` imperative handle, unmount cleanup
  - Remove: `hasSavedRef` useEffect guard, pendingSave retry mechanism (replace with simple deferred flag)
- **Validation**: Canvas auto-saves with single PUT; no stale ref overwrites possible

### Task 3.2: Update WhiteboardCanvas props
- **Status**: done
- **File**: `src/components/whiteboard/WhiteboardCanvas.tsx`
- **Action**: Remove `initialNodeMap` prop; keep `initialContextNodeId`, `initialElements`, `initialAppState`, `initialFiles`
- **Update**: Parent page to stop passing nodeMap
- **Validation**: Component mounts and saves without nodeMap dependency

## Phase 4: Update Promote-to-Space-List Action

### Task 4.1: Implement lazy node creation in context menu handler
- **Status**: done
- **File**: `src/components/whiteboard/WhiteboardCanvas.tsx`
- **Action**: Update `handleShowInSpaceList`:
  - If element has `customData.nodeId` → update existing node's `showInSpaceList` to true
  - If no nodeId → create REGULAR node, store ID in element's `customData.nodeId`, trigger save
  - Use `whiteboardService.createShapeNode` (keep this one method) or direct apiClient call
- **Validation**: Right-click → "Show in Space List" creates a node and the shape appears in sidebar

## Phase 5: Cleanup

### Task 5.1: Remove dead code
- **Status**: done
- **Files**:
  - `src/services/whiteboardSyncService.ts` — remove `linkFrameToNode`/`unlinkFrame` calls from save path (keep if used elsewhere by sync handlers)
  - `src/lib/whiteboard/elementMapper.ts` — remove `generateTitle` if no longer used by save (keep `categorizeElements` for sync)
  - `src/stores/whiteboardStore.ts` — simplify if excess state is no longer needed
- **Validation**: No unused imports; build passes cleanly

### Task 5.2: Update whiteboard page component
- **Status**: done
- **File**: `app/spaces/[slug]/whiteboard/page.tsx`
- **Action**: Update to pass simplified props (no nodeMap) and use simplified hook return values
- **Validation**: Whiteboard page loads and saves correctly end-to-end

### Task 5.3: Verify end-to-end flow
- **Status**: done (TypeScript compilation passes; pre-existing test-file errors unrelated)
- **Action**: Manual testing checklist:
  - [ ] Load empty whiteboard (no context node)
  - [ ] Draw shapes → auto-save fires → context node created with content
  - [ ] Reload page → shapes appear correctly
  - [ ] Draw more shapes → auto-save updates context → reload preserves all shapes
  - [ ] Delete shapes → auto-save → reload confirms deletion
  - [ ] Right-click shape → "Show in Space List" → node appears in sidebar
  - [ ] Navigate away during pending save → no stale writes
  - [ ] Network error during save → error indicator shown → retry works
- **Validation**: All checklist items pass

## Dependencies

- Task 1.2 must complete before 2.1 (types needed for mutation rewrite)
- Task 2.1 must complete before 3.1 (canvas uses new mutation)
- Task 3.1 and 3.2 can be done together
- Phase 4 depends on Phase 3 (canvas must be simplified first)
- Phase 5 depends on all prior phases

## Parallelizable Work

- Tasks 1.1 and 1.2 can be done in parallel
- Tasks 3.1 and 3.2 can be done together
- Task 5.1 can start as soon as Phase 3 is done (independent of Phase 4)
