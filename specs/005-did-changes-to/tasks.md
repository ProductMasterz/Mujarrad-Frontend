# Tasks: Backend API Endpoint Synchronization

**Input**: Design documents from `/specs/005-did-changes-to/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅
**Branch**: `005-did-changes-to`
**Tech Stack**: TypeScript 5.3.3, React 18.2.0, Next.js 14.1.0, TanStack Query, Axios, Zustand

## Execution Summary

This document contains 33 ordered tasks to synchronize the frontend with backend API changes (space → space migration). Tasks follow TDD approach: tests first, then implementation, then validation.

**Key Changes**:
- Rename space.service.ts → space.service.ts
- Update node.service.ts for space-scoped endpoints
- Migrate TypeScript types (Space → Space)
- Update hooks, components, and tests
- ✅ Auth endpoints unchanged (verify only)
- ✅ Attribute endpoints unchanged (verify only)

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Paths are relative to repository root

---

## Phase 3.1: Setup & Preparation

- [x] **T001** Update MSW handlers for new space endpoints in `tests/mocks/handlers.ts`
  - Add `GET /api/spaces` handler returning array of SpaceResponse
  - Add `POST /api/spaces` handler
  - Add `GET /api/spaces/{id}` handler
  - Add `GET /api/spaces/slug/{slug}` handler
  - Update `GET /api/spaces/{spaceSlug}/nodes` (change from spaces path)
  - Update `POST /api/spaces/{spaceSlug}/nodes`
  - Update `GET /api/spaces/{spaceSlug}/nodes/{nodeId}`
  - Update `PUT /api/spaces/{spaceSlug}/nodes/{nodeId}`
  - Update `DELETE /api/spaces/{spaceSlug}/nodes/{nodeId}`
  - Keep auth and attribute handlers unchanged

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests [P] (Parallel - Different Files)

- [x] **T002** [P] Space API contract test - GET /api/spaces in `tests/contracts/space.contract.test.ts`
  - Test: GET /api/spaces returns 200 with SpaceResponse[] schema
  - Test: Response has id, name, slug, ownerId, createdAt, updatedAt
  - Verify MSW mock returns correct structure
  - **MUST FAIL initially** (service not updated yet)

- [x] **T003** [P] Space API contract test - POST /api/spaces in `tests/contracts/space.contract.test.ts`
  - Test: POST /api/spaces with {name, slug?} returns 201
  - Test: Response matches SpaceResponse schema
  - Test: Created space appears in subsequent GET
  - **MUST FAIL initially** (service not updated yet)

- [x] **T004** [P] Space API contract test - GET by ID and slug in `tests/contracts/space.contract.test.ts`
  - Test: GET /api/spaces/{id} returns 200 with single Space
  - Test: GET /api/spaces/slug/{slug} returns 200 with single Space
  - Test: Both return same data for matching space
  - **MUST FAIL initially** (service not updated yet)

- [x] **T005** [P] Node API contract test - space-scoped nodes in `tests/contracts/node.contract.test.ts`
  - Test: GET /api/spaces/{spaceSlug}/nodes returns 200 with Node[]
  - Test: POST /api/spaces/{spaceSlug}/nodes with NodeCreateRequest returns 201
  - Test: spaceSlug parameter is required in path
  - Test: Response matches NodeResponse schema
  - **MUST FAIL initially** (service not updated yet)

- [x] **T006** [P] Node API contract test - individual node operations in `tests/contracts/node.contract.test.ts`
  - Test: GET /api/spaces/{spaceSlug}/nodes/{nodeId} returns 200
  - Test: PUT /api/spaces/{spaceSlug}/nodes/{nodeId} returns 200
  - TEST: DELETE /api/spaces/{spaceSlug}/nodes/{nodeId}?force=true returns 200
  - Test: All operations require both spaceSlug and nodeId
  - **MUST FAIL initially** (service not updated yet)

### Verification Checkpoint
- [x] **T007** Run contract tests and verify they ALL FAIL with expected errors
  - `npm test -- tests/contracts/space.contract.test.ts`
  - `npm test -- tests/contracts/node.contract.test.ts`
  - Expected: 404 errors or incorrect endpoint errors
  - If tests pass: ERROR - implementation already exists or tests incorrect

---

## Phase 3.3: Type Definitions (ONLY after tests are failing)

- [x] **T008** [P] Add Space types and deprecate Space in `src/types/backend-dtos.ts`
  - Add `Space` interface with id, name, slug, ownerId, createdAt, updatedAt
  - Add `CreateSpaceRequest` interface with name, slug?
  - Add `UpdateSpaceRequest` interface with name?, slug?
  - Add deprecated alias: `type Space = Space // @deprecated Use Space`
  - Add deprecated aliases for request types
  - Export all new types

- [x] **T009** [P] Update Node types for space scoping in `src/types/backend-dtos.ts`
  - Verify `Node` interface has `spaceId: string` (should already exist)
  - Update JSDoc comments to reference space instead of space
  - Ensure NodeType enum exported correctly
  - No breaking changes (Node structure unchanged)

- [x] **T010** [P] Add Zod validation schemas in `src/lib/validations/space.ts` (create file)
  - `spaceNameSchema`: z.string().min(1).max(255)
  - `spaceSlugSchema`: z.string().regex(/^[a-z0-9-]+$/)
  - `createSpaceSchema`: z.object({ name, slug? })
  - `updateSpaceSchema`: z.object({ name?, slug? })
  - Export all schemas

- [x] **T011** [P] Update Zod validation for nodes in `src/lib/validations/node.ts` (if exists, otherwise skip)
  - Update JSDoc comments to reference space
  - Ensure schemas align with NodeCreateRequest/UpdateNodeRequest
  - No structural changes needed

---

## Phase 3.4: Service Layer (Core Implementation)

### Space Service

- [x] **T012** Create space.service.ts in `src/services/api/space.service.ts`
  - Implement `getSpaces()`: GET /api/spaces → Space[]
  - Implement `getSpace(id)`: GET /api/spaces/{id} → Space
  - Implement `getSpaceBySlug(slug)`: GET /api/spaces/slug/{slug} → Space
  - Implement `createSpace(data)`: POST /api/spaces → Space
  - Implement `updateSpace(id, data)`: PUT /api/spaces/{id} → Space
  - Implement `deleteSpace(id)`: DELETE /api/spaces/{id} → void
  - Use apiClient from `./client.ts`
  - Add proper TypeScript types for all methods
  - Add JSDoc comments

- [x] **T013** Run space contract tests and verify they PASS
  - `npm test -- tests/contracts/space.contract.test.ts`
  - Expected: All space API tests green
  - If fail: Debug service implementation before proceeding

### Node Service

- [x] **T014** Update node.service.ts methods for space-scoped endpoints in `src/services/api/node.service.ts`
  - Update `getNodes(spaceId, params)` → `getNodes(spaceSlug, params)`
    - Change endpoint: `/spaces/${spaceId}/nodes` → `/spaces/${spaceSlug}/nodes`
    - Change parameter type: `spaceId: string` → `spaceSlug: string`
  - Remove `getSpaceNodes(spaceId)` method (no longer needed)
  - Update `getNode(nodeId)` → `getNode(spaceSlug, nodeId)`
    - Change endpoint: `/nodes/${nodeId}` → `/spaces/${spaceSlug}/nodes/${nodeId}`
    - Add spaceSlug parameter first
  - Update `createNode(data)` → `createNode(spaceSlug, data)`
    - Change endpoint: `/nodes` → `/spaces/${spaceSlug}/nodes`
    - Add spaceSlug parameter
  - Update `updateNode(nodeId, data)` → `updateNode(spaceSlug, nodeId, data)`
    - Change endpoint: `/nodes/${nodeId}` → `/spaces/${spaceSlug}/nodes/${nodeId}`
  - Update `deleteNode(nodeId)` → `deleteNode(spaceSlug, nodeId, force?)`
    - Change endpoint: `/nodes/${nodeId}` → `/spaces/${spaceSlug}/nodes/${nodeId}`
    - Add optional `force` query parameter
  - Update `searchNodes(spaceId, params)` → `searchNodes(spaceSlug, params)`
    - Change endpoint: `/spaces/${spaceId}/search` → `/spaces/${spaceSlug}/search`
  - Update JSDoc comments for all methods

- [x] **T015** Run node contract tests and verify they PASS
  - `npm test -- tests/contracts/node.contract.test.ts`
  - Expected: All node API tests green
  - If fail: Debug node service before proceeding

---

## Phase 3.5: React Query Hooks

### Space Hooks

- [ ] **T016** Create useSpaces hook in `src/hooks/useSpaces.ts` (new file)
  - Implement `useSpaces()` using useQuery with spaceService.getSpaces()
  - Query key: `['spaces', 'list']`
  - Return { data: Space[], isLoading, error, refetch }
  - Add staleTime and cacheTime config

- [ ] **T017** Create useSpace hook in `src/hooks/useSpace.ts` (new file)
  - Implement `useSpace(slug: string)` using useQuery
  - Query key: `['spaces', 'detail', slug]`
  - Use spaceService.getSpaceBySlug(slug)
  - Return { data: Space, isLoading, error }
  - Enable query only if slug provided

- [ ] **T018** Create useCreateSpace mutation hook in `src/hooks/useCreateSpace.ts` (new file)
  - Implement useMutation with spaceService.createSpace()
  - On success: invalidate `['spaces']` queries
  - Return { mutate, mutateAsync, isLoading, error }

### Node Hooks

- [ ] **T019** Update useNodes hook in `src/hooks/useNodes.ts`
  - Change signature: `useNodes(spaceId)` → `useNodes(spaceSlug)`
  - Update query key: `['nodes', 'list', spaceId]` → `['nodes', 'list', spaceSlug]`
  - Call nodeService.getNodes(spaceSlug) instead of getNodes(spaceId)
  - Update TypeScript types

- [ ] **T020** Update useNode hook in `src/hooks/useNode.ts` (if exists)
  - Change signature: `useNode(nodeId)` → `useNode(spaceSlug, nodeId)`
  - Update query key: `['nodes', 'detail', nodeId]` → `['nodes', 'detail', spaceSlug, nodeId]`
  - Call nodeService.getNode(spaceSlug, nodeId)

- [ ] **T021** Update useCreateNode mutation hook in `src/hooks/useCreateNode.ts` (if exists)
  - Add spaceSlug parameter to mutation function
  - Call nodeService.createNode(spaceSlug, data)
  - Update cache invalidation to use spaceSlug: invalidate `['nodes', 'list', spaceSlug]`

- [ ] **T022** Update useUpdateNode and useDeleteNode hooks (if exist)
  - Add spaceSlug parameter to both
  - Update service calls: nodeService.updateNode(spaceSlug, nodeId, data)
  - Update service calls: nodeService.deleteNode(spaceSlug, nodeId, force)

---

## Phase 3.6: Component Updates

### Component Imports and Type Updates [P] (Parallel - Different Components)

- [ ] **T023** [P] Update space list components in `src/components/spaces/` (if directory exists, rename from spaces/)
  - Find and replace import: `useSpaces` → `useSpaces`
  - Find and replace type: `Space` → `Space`
  - Update component props that accept space → accept space
  - Verify TypeScript compilation passes
  - Test rendering with new hooks

- [ ] **T024** [P] Update space detail/view components
  - Find components using `useSpace(id)` → update to `useSpace(slug)`
  - Change parameter from ID to slug in component props
  - Update URL parsing to extract slug instead of ID
  - Update navigation links to use slugs

- [ ] **T025** [P] Update node list/grid components
  - Find components calling `useNodes(spaceId)` → update to `useNodes(spaceSlug)`
  - Update component props to accept spaceSlug instead of spaceId
  - Verify node rendering still works

- [ ] **T026** [P] Update node detail/edit components
  - Update `useNode(nodeId)` → `useNode(spaceSlug, nodeId)`
  - Update create/update mutations to pass spaceSlug
  - Verify CRUD operations work

- [ ] **T027** [P] Update navigation/breadcrumb components
  - Update breadcrumb labels: "Space" → "Space"
  - Update navigation links to use `/space/{slug}/` instead of `/space/{id}/`
  - Update active link detection

---

## Phase 3.7: Integration Tests

- [ ] **T028** [P] Update space service integration tests in `tests/integration/services.integration.test.ts`
  - Test full space lifecycle: create → fetch → update → delete
  - Test getSpaceBySlug vs getSpace(id) both work
  - Test error handling (404, 400, etc.)
  - Mock backend responses with MSW
  - Verify React Query caching works

- [ ] **T029** [P] Update node service integration tests in `tests/integration/services.integration.test.ts`
  - Test node CRUD with spaceSlug parameter
  - Test that old space-based calls fail (404)
  - Test force delete parameter
  - Verify space scoping (nodes isolated by space)

- [ ] **T030** Run all integration tests and verify PASS
  - `npm test -- tests/integration/`
  - Expected: All integration tests green
  - If fail: Debug hooks/services before proceeding

---

## Phase 3.8: E2E Tests

- [ ] **T031** Update E2E test scenarios in `tests/e2e/space-workflows.spec.ts`
  - Scenario: User creates space → sees it in list
  - Scenario: User navigates to space via slug
  - Scenario: User creates node in space → node appears
  - Scenario: User edits node → changes saved
  - Scenario: Full workflow from space creation to node relationships
  - Update selectors if component names changed
  - Verify URLs use `/space/{slug}/` pattern

---

## Phase 3.9: Polish & Cleanup

- [ ] **T032** Remove old space service file
  - Delete `src/services/api/space.service.ts` (if exists)
  - Ensure no imports still reference it (TypeScript should catch)
  - Remove space-related hooks if they exist

- [ ] **T033** Run full test suite and manual quickstart verification
  - `npm test` - All unit, contract, integration tests
  - `npm run test:e2e` - All Playwright tests
  - `npm run build` - Verify TypeScript compilation
  - Execute `specs/005-did-changes-to/quickstart.md` manually
  - Verify no console errors in browser
  - Check Network tab for correct endpoint paths

---

## Dependencies

**Test Dependencies**:
- T007 blocks all Phase 3.3-3.9 (tests must fail first)
- T013 blocks T016-T018 (space service before hooks)
- T015 blocks T019-T022 (node service before hooks)

**Implementation Dependencies**:
- T008-T011 (types) block T012, T014 (services need types)
- T012 (space service) blocks T016-T018 (space hooks)
- T014 (node service) blocks T019-T022 (node hooks)
- T016-T022 (hooks) block T023-T027 (components use hooks)
- T028-T029 can run after T013, T015 (integration tests after services)
- T031 can run after T023-T027 (E2E tests after components)

**Parallel Execution Blocks**:
```
Block 1 (Setup): T001
Block 2 (Contract Tests): T002, T003, T004, T005, T006 [all parallel]
Block 3 (Verify Fail): T007
Block 4 (Types): T008, T009, T010, T011 [all parallel]
Block 5 (Services): T012, T014 [sequential]
Block 6 (Verify Pass): T013, T015 [sequential]
Block 7 (Hooks): T016-T022 [some parallel, some sequential]
Block 8 (Components): T023, T024, T025, T026, T027 [all parallel]
Block 9 (Integration): T028, T029, T030 [parallel]
Block 10 (E2E): T031
Block 11 (Polish): T032, T033
```

---

## Parallel Example

### Launch Contract Tests Together (After T001):
```bash
# All contract tests can run in parallel - different test files
npm test -- tests/contracts/space.contract.test.ts &
npm test -- tests/contracts/node.contract.test.ts &
wait
```

### Launch Type Updates Together (After T007):
```bash
# All type files can be updated in parallel - independent
# Edit src/types/backend-dtos.ts (T008, T009)
# Create src/lib/validations/space.ts (T010)
# Update src/lib/validations/node.ts (T011)
```

### Launch Component Updates Together (After T022):
```bash
# All component files can be updated in parallel - independent
# Update src/components/spaces/* (T023)
# Update space detail components (T024)
# Update node components (T025, T026)
# Update navigation components (T027)
```

---

## Notes

- **[P] tasks** = different files, no dependencies, can run simultaneously
- **Verify tests fail** before implementing (TDD principle)
- **Commit after each major phase** (not after every task)
- **Auth endpoints unchanged** - verify they still work, no updates needed
- **Attribute endpoints unchanged** - verify they still work, no updates needed
- **MSW mocks** are critical - update them first (T001)
- **Type safety** - TypeScript will catch most migration errors
- **React Query cache** - keys must be updated to use spaceSlug

## Validation Checklist

*GATE: Checked before marking feature complete*

- [ ] All contract tests pass (T002-T006 green)
- [ ] All integration tests pass (T028-T030 green)
- [ ] All E2E tests pass (T031 green)
- [ ] TypeScript builds without errors (`npm run build`)
- [ ] Manual quickstart.md verification completed
- [ ] No console errors in browser during testing
- [ ] Network tab shows correct endpoint paths (/api/spaces/*)
- [ ] Old space endpoints removed from codebase
- [ ] Space CRUD operations work end-to-end
- [ ] Node CRUD operations work with space slugs
- [ ] Authentication still works (unchanged)
- [ ] Attribute operations still work (unchanged)

---

**Status**: Ready for Implementation
**Next**: Execute tasks T001-T033 in dependency order
**Estimated**: 30-35 tasks (varies based on existing component structure)
