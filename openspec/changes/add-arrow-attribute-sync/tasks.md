# Tasks: add-arrow-attribute-sync

## Phase 1: Arrow Diffing Infrastructure

### Task 1.1: Add arrow diff utility
- **Status**: done
- **File**: `src/lib/whiteboard/arrowDiff.ts` (new)
- **Action**: Create a utility that compares two element arrays and returns arrow changes:
  - `added`: arrows present in current but not in previous (bound on both ends)
  - `removed`: arrows present in previous but not in current
  - `changed`: arrows whose `startBinding` or `endBinding` elementId changed
- **Input**: `prevElements: ExcalidrawElement[]`, `currentElements: ExcalidrawElement[]`
- **Output**: `{ added: ExcalidrawElement[], removed: ExcalidrawElement[], changed: { arrow: ExcalidrawElement, prevStart?: string, prevEnd?: string }[] }`
- **Filter**: Only include arrows where BOTH `startBinding.elementId` and `endBinding.elementId` are set
- **Validation**: Unit-testable pure function; no side effects

### Task 1.2: Add synced arrows tracking ref
- **Status**: done
- **File**: `src/components/whiteboard/WhiteboardCanvas.tsx`
- **Action**: Add `syncedArrowsRef = useRef<Map<string, string>>()` — maps `arrowElementId → attributeId`
- **Purpose**: Enables diffing between what's on canvas vs what's synced to backend
- **Validation**: Ref initializes empty; populated after successful attribute syncs

## Phase 2: Auto-Promotion Logic

### Task 2.1: Add batch auto-promote function
- **Status**: done
- **File**: `src/services/api/whiteboard.service.ts`
- **Action**: Add method `autoPromoteShapes(spaceSlug, elements)`:
  - Takes array of elements that need backend nodes
  - For each element without `customData.nodeId`: create REGULAR node using `generateTitle()`
  - Returns map of `elementId → nodeId`
  - Uses `Promise.allSettled` for parallel creation
- **Validation**: Returns correct mapping; failed creates are excluded (not thrown)

### Task 2.2: Integrate auto-promotion with element update
- **Status**: done
- **File**: `src/components/whiteboard/WhiteboardCanvas.tsx`
- **Action**: After auto-promote returns, update `lastStateRef.current.elements` to set `customData.nodeId` on promoted shapes
- **Trigger**: Only when arrow diff shows new arrows with unlinked endpoints
- **Validation**: Elements are updated in-place; next content save persists the node IDs

## Phase 3: Attribute Sync

### Task 3.1: Add arrow attribute sync function
- **Status**: done
- **File**: `src/hooks/api/useWhiteboardMutations.ts` or `src/lib/whiteboard/arrowSync.ts` (new)
- **Action**: Create `syncArrowAttributes(spaceSlug, diff, elementNodeMap, syncedArrowsRef)`:
  - For `added` arrows: call `attributeService.createAttribute()` with `connects_to` type
  - For `removed` arrows: call `attributeService.deleteAttribute()` using ID from `syncedArrowsRef`
  - For `changed` arrows: delete old attribute, create new one
  - Update `syncedArrowsRef` on success
  - Use `Promise.allSettled` — don't throw on partial failures
- **Dependencies**: Task 1.1 (diff), Task 2.1 (node IDs)
- **Validation**: Creates correct attributes; partial failures don't block

### Task 3.2: Wire sync into save flow
- **Status**: done
- **File**: `src/components/whiteboard/WhiteboardCanvas.tsx`
- **Action**: In `performSave`, after content PUT succeeds:
  1. Compute arrow diff between `previousElementsRef` and current elements
  2. Identify shapes needing auto-promotion
  3. Run auto-promote, update elements with node IDs
  4. Run `syncArrowAttributes` with the diff
  5. Store current elements as `previousElementsRef` for next diff
- **Add**: `previousElementsRef = useRef<ExcalidrawElement[]>([])` to track last-synced state
- **Validation**: Arrow sync runs after every successful save; failures logged but don't break save

## Phase 4: Load & Hydration

### Task 4.1: Hydrate syncedArrowsRef on load
- **Status**: done
- **File**: `src/components/whiteboard/WhiteboardCanvas.tsx`
- **Action**: On initial load, fetch `connects_to` attributes for the space and populate `syncedArrowsRef` by matching arrow element IDs in `attributeValue.connector_meta.source_element_id`
- **Endpoint**: `GET /spaces/{spaceId}/attributes` filtered by `attributeType=connects_to`
- **Purpose**: Prevents re-creating attributes that already exist on reload
- **Validation**: After load, existing arrows are in `syncedArrowsRef`; no duplicate creates on first save

## Phase 5: Cleanup & Edge Cases

### Task 5.1: Handle shape deletion with arrows
- **Status**: done
- **File**: `src/lib/whiteboard/arrowDiff.ts`
- **Action**: When a shape is deleted, any arrows that had bindings to it lose their binding (Excalidraw sets binding to null). The diff should detect these as "removed" arrows since they no longer have both bindings.
- **Validation**: Deleting a shape that had arrows results in attribute deletion

### Task 5.2: TypeScript compilation check
- **Status**: done
- **Action**: Run `npx tsc --noEmit` and fix any type errors from new code
- **Validation**: Clean compilation

## Dependencies

- Task 1.1 must complete before 3.1 (diff utility needed for sync)
- Task 2.1 must complete before 3.2 (auto-promote needed before attribute creation)
- Task 3.1 must complete before 3.2 (sync function needed for wiring)
- Task 4.1 depends on 3.2 (sync ref structure must exist)
- Phase 5 can run after Phase 3

## Parallelizable Work

- Tasks 1.1 and 1.2 can be done in parallel
- Tasks 2.1 and 2.2 can be done together
- Task 4.1 is independent of Phase 5
