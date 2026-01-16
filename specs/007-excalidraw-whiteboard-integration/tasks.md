# Tasks: Excalidraw Whiteboard Integration

**Input**: Design documents from `/specs/007-excalidraw-whiteboard-integration/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md
**Branch**: `007-excalidraw-whiteboard-integration`

## Path Conventions
- Source: `src/` at repository root (Next.js frontend)
- Tests: `tests/` at repository root
- App routes: `app/` at repository root

---

## Phase 3.1: Setup

- [x] T001 Install @excalidraw/excalidraw package and verify in package.json
  ```bash
  npm install @excalidraw/excalidraw
  ```

- [x] T002 [P] Create whiteboard directory structure
  ```
  src/components/whiteboard/
  src/hooks/api/ (add whiteboard hooks)
  src/services/api/ (add whiteboard service)
  src/stores/ (add whiteboard store)
  src/types/ (add whiteboard types)
  src/lib/whiteboard/
  app/spaces/[slug]/whiteboard/
  tests/unit/whiteboard/
  tests/integration/whiteboard/
  ```

- [x] T003 [P] Create TypeScript types in `src/types/whiteboard.ts`
  - ExcalidrawElement interface
  - WhiteboardNode interface
  - WhiteboardConnector interface
  - WhiteboardNodeDetails interface
  - ElementTypeConfig interface
  - CreateWhiteboardNodeDTO, UpdateWhiteboardNodeDTO
  - WhiteboardStateDTO

---

## Phase 3.2: Tests First (TDD) - MUST COMPLETE BEFORE 3.3

**Contract Tests** (based on contracts/whiteboard-api.yaml)

- [x] T004 [P] Contract test GET /api/spaces/{slug}/nodes (whiteboard filter) in `tests/contract/whiteboard-get-nodes.test.ts`
  - Test fetching nodes with element_subtype filter
  - Verify response matches WhiteboardNode schema
  - Test empty response for new space

- [x] T005 [P] Contract test POST /api/spaces/{slug}/nodes (create element) in `tests/contract/whiteboard-create-node.test.ts`
  - Test creating rectangle element
  - Test creating text element
  - Verify node_details structure returned
  - Test validation errors (missing title, invalid type)

- [x] T006 [P] Contract test PUT /api/spaces/{slug}/nodes/{id} (update element) in `tests/contract/whiteboard-update-node.test.ts`
  - Test updating element position (x, y)
  - Test updating element style (color)
  - Verify version increment

- [x] T007 [P] Contract test DELETE /api/spaces/{slug}/nodes/{id} in `tests/contract/whiteboard-delete-node.test.ts`
  - Test deleting element
  - Verify 204 response
  - Verify element not returned on subsequent GET

- [x] T008 [P] Contract test POST /api/nodes/{id}/attributes (create connector) in `tests/contract/whiteboard-create-connector.test.ts`
  - Test creating connects_to attribute
  - Verify connector_meta structure
  - Test invalid source/target IDs

**Integration Tests** (based on quickstart.md scenarios)

- [x] T009 [P] Integration test basic canvas load in `tests/integration/whiteboard/canvas-load.test.tsx`
  - Render WhiteboardCanvas component
  - Verify Excalidraw mounts
  - Verify no console errors

- [x] T010 [P] Integration test create shape element in `tests/integration/whiteboard/create-shape.test.tsx`
  - Create rectangle via Excalidraw API
  - Trigger onChange
  - Verify API call made after debounce
  - Verify element in response

- [x] T011 [P] Integration test create connector in `tests/integration/whiteboard/create-connector.test.tsx`
  - Create two shapes
  - Create arrow with bindings
  - Verify attribute created with connects_to key

- [x] T012 [P] Integration test persistence in `tests/integration/whiteboard/persistence.test.tsx`
  - Create elements
  - Save to backend
  - Remount component
  - Verify elements restored from API

---

## Phase 3.3: Core Implementation (ONLY after tests are failing)

**Utilities**

- [x] T013 [P] Element mapper utility in `src/lib/whiteboard/elementMapper.ts`
  - `mapExcalidrawToNode(element: ExcalidrawElement): CreateWhiteboardNodeDTO`
  - `mapNodeToExcalidraw(node: WhiteboardNode): ExcalidrawElement`
  - `mapArrowToAttribute(arrow: ExcalidrawElement): CreateConnectorDTO`
  - `generateTitle(element: ExcalidrawElement): string`
  - Element type config lookup

- [x] T014 [P] Config schemas in `src/lib/whiteboard/configSchemas.ts`
  - DEFAULT_ELEMENT_CONFIGS array
  - `getConfigForElementType(type: string): ElementTypeConfig`
  - Validation helpers

**Service Layer**

- [x] T015 Whiteboard service in `src/services/api/whiteboard.service.ts`
  - `getWhiteboardNodes(spaceSlug: string): Promise<WhiteboardNode[]>`
  - `createWhiteboardNode(spaceSlug: string, dto: CreateWhiteboardNodeDTO): Promise<WhiteboardNode>`
  - `updateWhiteboardNode(spaceSlug: string, id: string, dto: UpdateWhiteboardNodeDTO): Promise<WhiteboardNode>`
  - `deleteWhiteboardNode(spaceSlug: string, id: string): Promise<void>`
  - `createConnector(nodeId: string, dto: CreateConnectorDTO): Promise<Attribute>`

**React Query Hooks**

- [x] T016 Query hook in `src/hooks/api/useWhiteboard.ts`
  - `useWhiteboardNodes(spaceSlug: string)` - fetch all whiteboard elements
  - `useWhiteboardState(spaceSlug: string)` - fetch and convert to Excalidraw format
  - Query key: `['spaces', spaceSlug, 'whiteboard']`

- [x] T017 Mutation hooks in `src/hooks/api/useWhiteboardMutations.ts`
  - `useCreateWhiteboardNode(spaceSlug: string)`
  - `useUpdateWhiteboardNode(spaceSlug: string)`
  - `useDeleteWhiteboardNode(spaceSlug: string)`
  - `useSaveWhiteboard(spaceSlug: string)` - batch save all changes
  - Cache invalidation on mutation success

**State Management**

- [x] T018 Zustand store in `src/stores/whiteboardStore.ts`
  - `elements: ExcalidrawElement[]`
  - `appState: Partial<AppState>`
  - `isDirty: boolean`
  - `isSaving: boolean`
  - `lastSaved: Date | null`
  - Actions: setElements, setAppState, markDirty, markSaved

**Components**

- [x] T019 WhiteboardCanvas component in `src/components/whiteboard/WhiteboardCanvas.tsx`
  - Import and render Excalidraw
  - Accept initialData prop
  - Handle onChange with debounced save
  - Wrap in useMemo to prevent infinite loops
  - Store excalidrawAPI ref

- [x] T020 Whiteboard page in `app/spaces/[slug]/whiteboard/page.tsx`
  - Fetch space data
  - Load whiteboard state
  - Render WhiteboardCanvas with loading/error states
  - Handle permissions check

- [x] T021 Export index in `src/components/whiteboard/index.ts`
  - Export WhiteboardCanvas

---

## Phase 3.4: Integration

- [x] T022 Connect WhiteboardCanvas to backend save
  - Implement debounced save (2 second delay)
  - Call useSaveWhiteboard on onChange
  - Diff elements to determine create/update/delete operations
  - Handle arrow bindings → attribute creation

- [x] T023 Implement element-to-node sync
  - On save: convert Excalidraw elements → Node DTOs
  - Match by excalidraw element ID
  - Create new nodes for new elements
  - Update existing nodes for modified elements
  - Delete nodes for removed elements

- [x] T024 Load state from backend
  - On mount: fetch whiteboard nodes
  - Convert nodes → Excalidraw elements
  - Fetch connectors → add arrows with bindings
  - Pass to Excalidraw initialData

- [x] T025 Error handling and user feedback
  - Show toast on save failure
  - Show toast on load failure
  - Retry logic for transient errors
  - Don't lose local changes on error

---

## Phase 3.5: Polish

- [x] T026 [P] Unit tests for element mapper in `tests/unit/whiteboard/elementMapper.test.ts`
  - Test each element type mapping
  - Test title generation
  - Test arrow → attribute conversion
  - Test round-trip conversion

- [x] T027 [P] Unit tests for config schemas in `tests/unit/whiteboard/configSchemas.test.ts`
  - Test getConfigForElementType
  - Test all element types have config

- [x] T028 Performance validation
  - Load test with 100 elements
  - Verify load time < 3 seconds
  - Verify UI doesn't freeze during save
  - Profile React re-renders

- [x] T029 Add whiteboard link to space navigation
  - Add "Whiteboard" tab to space page
  - Style consistently with other tabs

- [x] T030 Run quickstart.md validation
  - Execute all 8 test scenarios manually
  - Document any issues
  - Fix failures

---

## Dependencies

```
T001 → T002, T003 (setup before structure/types)
T003 → T004-T012 (types before tests)
T004-T012 → T013-T025 (tests before implementation - TDD)
T013, T014 → T015 (utilities before service)
T015 → T016, T017 (service before hooks)
T016, T017 → T018, T019 (hooks before components)
T019 → T020 (canvas before page)
T020 → T022-T025 (page before integration)
T013-T025 → T026-T30 (implementation before polish)
```

---

## Parallel Execution Examples

### Launch Setup Tasks (T002-T003)
```
Run in parallel - different directories:
- T002: Create directory structure
- T003: Create TypeScript types
```

### Launch All Contract Tests (T004-T008)
```
Run in parallel - different test files:
- T004: Contract test GET whiteboard nodes
- T005: Contract test POST whiteboard node
- T006: Contract test PUT whiteboard node
- T007: Contract test DELETE whiteboard node
- T008: Contract test POST connector
```

### Launch All Integration Tests (T009-T012)
```
Run in parallel - different test files:
- T009: Integration test canvas load
- T010: Integration test create shape
- T011: Integration test create connector
- T012: Integration test persistence
```

### Launch Utility Tasks (T013-T014)
```
Run in parallel - different files:
- T013: Element mapper utility
- T014: Config schemas
```

### Launch Polish Tests (T026-T027)
```
Run in parallel - different test files:
- T026: Unit tests for element mapper
- T027: Unit tests for config schemas
```

---

## Validation Checklist

- [x] All contracts have corresponding tests (T004-T008)
- [x] All entities have model/utility tasks (T013-T014)
- [x] All tests come before implementation (T004-T012 before T013-T025)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task

---

## Notes

- Verify each test fails before implementing corresponding feature
- Commit after each task completion
- Run `npm test` after each phase to ensure no regressions
- Use quickstart.md scenarios for manual validation
- Total estimated tasks: 30
- Estimated parallel efficiency: ~40% reduction in wall-clock time

---

## Execution Summary

| Phase | Tasks | Parallel | Sequential |
|-------|-------|----------|------------|
| Setup | 3 | 2 | 1 |
| Tests | 9 | 9 | 0 |
| Core | 9 | 4 | 5 |
| Integration | 4 | 0 | 4 |
| Polish | 5 | 3 | 2 |
| **Total** | **30** | **18** | **12** |
