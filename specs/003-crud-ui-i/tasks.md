# Tasks: Complete CRUD UI for All Schema Entities

**Input**: Design documents from `/specs/003-crud-ui-i/`
**Prerequisites**: plan.md ✓, spec.md ✓
**Branch**: `003-crud-ui-i`

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Tech stack: Next.js 14, React 18, TypeScript, TanStack Query, Zustand, Zod
   → Structure: Frontend-only modifications (src/components/, src/services/, src/hooks/)
2. Load optional design documents ✓
   → Entities: Space, Node, Attribute, NodeVersion
   → Components: 12 new + 15 to enhance
   → API services: 6 methods to add
3. Generate tasks by category ✓
   → Foundation: Types, schemas, service methods
   → Spaces: CRUD dialogs + collaborator management
   → Nodes: CRUD dialogs + markdown preview
   → Relationships: Create/delete dialogs
   → Versions: Comparison, restore, delete UI
   → Graph: Edge styling enhancements
   → Testing: Unit, integration, E2E
4. Apply task rules ✓
   → Different files = [P] parallel
   → Same file = sequential
   → TDD: Tests before implementation
5. Number tasks sequentially (T001-T048) ✓
6. Generate dependency graph ✓
7. Create parallel execution examples ✓
8. Validate task completeness ✓
9. Return: SUCCESS (48 tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- File paths relative to repository root

## Path Conventions
**Frontend-only** (Next.js 14 App Router):
- Components: `src/components/`
- Services: `src/services/api/`
- Hooks: `src/hooks/api/`
- Types: `src/types/`
- Schemas: `src/schemas/`
- Pages: `app/`
- Tests: `tests/`

---

## Phase 3.1: Foundation - Types & Schemas

### T001: [P] Add Collaborator types to backend DTOs
**File**: `src/types/backend-dtos.ts`
**Description**: Add TypeScript interfaces for space collaborators
```typescript
export interface SpaceCollaborator {
  id: string; // UUID
  spaceId: number;
  userId: string; // UUID
  role: 'owner' | 'editor';
  invitedBy: string; // UUID
  createdAt: string;
}

export interface InviteCollaboratorRequest {
  email?: string;
  username?: string;
}
```
**Acceptance**: Types compile, match backend DTOs, no TypeScript errors

---

### T001b: [P] Audit User ID type references (number → UUID string)
**Files**: `src/services/api/*.ts`, `src/hooks/api/*.ts`, `src/types/*.ts`
**Description**: Search codebase for User ID references that may still use `number` type and update to `string` (UUID)
```bash
# Search for patterns: userId: number, user_id: number, User.id references
# Update to: userId: string, user_id: string
```
**Acceptance**: All User ID references use string type, no type mismatches in collaborator-related code
**Priority**: High (data type consistency)

---

### T002: [P] Enhance space schema with collaborator validation
**File**: `src/schemas/space.schema.ts`
**Description**: Add Zod schema for inviting collaborators
```typescript
export const inviteCollaboratorSchema = z.object({
  email: z.string().email('Valid email required').optional(),
  username: z.string().min(3).max(50).optional()
}).refine(data => data.email || data.username, {
  message: 'Either email or username required'
});
```
**Acceptance**: Schema validates correctly, error messages clear

---

### T003: [P] Add markdown library dependency
**File**: `package.json`
**Description**: Install `react-markdown` for markdown preview
```bash
npm install react-markdown remark-gfm
npm install --save-dev @types/react-markdown
```
**Acceptance**: Dependencies installed, TypeScript types available

---

### T003a: [P] Add input length validation constraints to schemas
**File**: `src/schemas/space.schema.ts`, `src/schemas/node.schema.ts`
**Description**: Document and enforce maximum length constraints for text inputs
```typescript
// space.schema.ts: name (100 chars), slug (50 chars), description (500 chars)
// node.schema.ts: title (200 chars), content (50000 chars for markdown)
```
**Acceptance**: Schemas updated with max length constraints, validation error messages clear
**Priority**: Medium (data quality)

---

### T003b: [P] Add empty state handling for list components
**File**: `src/components/EmptyState.tsx` (new)
**Description**: Create reusable EmptyState component for displaying when lists are empty
```typescript
// Props: title, description, actionLabel?, onAction?
// Used in: SpacesList, NodesList, CollaboratorsList, VersionHistoryList
```
**Acceptance**: Component displays helpful messaging, optional call-to-action button
**Priority**: Medium (UX improvement)

---

## Phase 3.2: Services Layer - API Methods

### T004: [P] Add collaborator service methods
**File**: `src/services/api/space.service.ts`
**Description**: Add API methods for collaborator management
```typescript
async getCollaborators(spaceId: number): Promise<SpaceCollaborator[]>
async inviteCollaborator(spaceId: number, data: InviteCollaboratorRequest): Promise<SpaceCollaborator>
async removeCollaborator(spaceId: number, userId: string): Promise<void>
```
**Acceptance**: Methods use Axios client, return typed responses, handle errors

---

### T005: [P] Add version restore/delete service methods
**File**: `src/services/api/version.service.ts`
**Description**: Add version restoration and deletion methods
```typescript
async restoreVersion(nodeId: number, versionNum: number): Promise<NodeVersion>
async deleteVersion(nodeId: number, versionNum: number): Promise<void>
```
**Acceptance**: Methods call backend endpoints, handle errors properly

---

## Phase 3.3: Hooks Layer - TanStack Query Custom Hooks

### T006: [P] Add collaborator management hooks
**File**: `src/hooks/api/useSpaces.ts`
**Description**: Add TanStack Query hooks for collaborators
```typescript
export function useCollaborators(spaceId: number)
export function useInviteCollaborator()
export function useRemoveCollaborator()
```
**Acceptance**: Hooks use service methods, cache data, invalidate queries on mutations

---

### T007: [P] Add version restore/delete hooks
**File**: `src/hooks/api/useVersions.ts`
**Description**: Add hooks for version restoration and deletion
```typescript
export function useRestoreVersion()
export function useDeleteVersion()
```
**Acceptance**: Hooks invalidate node and version queries after mutations

---

## Phase 3.4: Space Components - CRUD & Collaborators

### T008: Complete CreateSpaceDialog component (CRITICAL)
**File**: `src/components/spaces/CreateSpaceDialog.tsx`
**Description**: Finish space creation dialog - currently blocking primary workflow
- Use React Hook Form with `spaceSchema` validation
- Handle slug uniqueness errors from backend
- Show loading state during creation
- Close dialog and invalidate query on success
**Acceptance**: Dialog creates space, validates inputs, shows errors, closes on success

---

### T009: Complete EditSpaceDialog component
**File**: `src/components/spaces/EditSpaceDialog.tsx`
**Description**: Finish space editing dialog
- Pre-fill form with existing space data
- Handle optimistic updates
- Validate name/description changes
**Acceptance**: Dialog updates space, pre-fills data, validates inputs

---

### T010: Complete DeleteSpaceDialog component
**File**: `src/components/spaces/DeleteSpaceDialog.tsx`
**Description**: Add cascade delete warning and confirmation
- Show warning: "This will delete X nodes, Y relationships, and Z versions"
- Require explicit confirmation (type space name to confirm)
- Show loading state during deletion
**Acceptance**: Dialog warns about cascade, requires confirmation, deletes space

---

### T011: [P] Create SpaceSettings component (NEW)
**File**: `src/components/spaces/SpaceSettings.tsx`
**Description**: Create space settings page container
- Display space metadata (name, slug, owner, created date)
- Show edit button (opens EditSpaceDialog)
- Show delete button (opens DeleteSpaceDialog)
- Embed CollaboratorList component
- Restrict actions to owner/collaborators per FR-034
**Acceptance**: Settings page shows space info, integrates dialogs, checks permissions

---

### T012: [P] Create CollaboratorList component (NEW)
**File**: `src/components/spaces/CollaboratorList.tsx`
**Description**: Display list of space collaborators
- Fetch collaborators via `useCollaborators(spaceId)` hook
- Show user avatar, name, role, invited date
- Show "Remove" button per collaborator (owner only)
- Show "Invite" button (opens InviteCollaboratorDialog)
**Acceptance**: List displays collaborators, shows remove buttons for owner

---

### T013: [P] Create InviteCollaboratorDialog component (NEW)
**File**: `src/components/spaces/InviteCollaboratorDialog.tsx`
**Description**: Dialog to invite users as collaborators
- Form with email OR username input (Zod validation)
- Use `inviteCollaboratorSchema` from T002
- Call `useInviteCollaborator()` hook
- Show success toast on invitation sent
**Acceptance**: Dialog invites users, validates input, handles errors

---

## Phase 3.5: Node Components - CRUD & Markdown Preview

### T014: Enhance CreateNodeDialog with markdown preview
**File**: `src/components/nodes/CreateNodeDialog.tsx`
**Description**: Add live markdown preview to node creation
- Split view: Editor (left) | Preview (right) using grid layout
- Use `react-markdown` with `remark-gfm` plugins
- Sanitize output with DOMPurify
- Support node type selection (Regular, Context, Assumption)
**Acceptance**: Dialog shows markdown preview, supports all node types

---

### T015: Enhance EditNodeDialog with markdown preview
**File**: `src/components/nodes/EditNodeDialog.tsx`
**Description**: Add live markdown preview to node editing
- Same split view as CreateNodeDialog
- Pre-fill form with existing node data
- Handle optimistic locking via version field (FR-014)
**Acceptance**: Dialog shows preview, pre-fills data, handles version conflicts

---

### T016: Enhance DeleteNodeDialog with cascade warning
**File**: `src/components/nodes/DeleteNodeDialog.tsx`
**Description**: Add cascade delete warning for relationships
- Query and display count of relationships to be deleted
- Show warning: "This will delete X incoming and Y outgoing relationships"
- Require confirmation
**Acceptance**: Dialog warns about relationship cascade, requires confirmation

---

### T017: [P] Create MarkdownPreview component (NEW)
**File**: `src/components/nodes/MarkdownPreview.tsx`
**Description**: Reusable markdown preview component
- Accept `content: string` prop
- Render markdown using `react-markdown` with `remark-gfm`
- Sanitize HTML with DOMPurify
- Apply Tailwind prose styles for readable formatting
**Acceptance**: Component renders markdown safely, styled properly

---

### T018: Enhance NodeList with pagination/infinite scroll
**File**: `src/components/nodes/NodeList.tsx`
**Description**: Add infinite scroll to node list
- Use `useNodesInfinite(spaceId)` hook with TanStack Query
- Show "Load More" button when `hasNextPage === true`
- Display loading spinner while fetching
**Acceptance**: List loads nodes in pages, shows load more button

---

## Phase 3.6: Relationship Components - Create & Delete

### T019: Enhance CreateRelationshipDialog for all 6 types
**File**: `src/components/relationships/CreateRelationshipDialog.tsx`
**Description**: Support all relationship types with visual indicators
- Dropdown with 6 types: contains, depends_on, references, triggers, next, calls
- Target node selector (searchable dropdown)
- Optional `attributeValue` field (text input)
- Optional `metadata` field (JSON textarea)
- Validate target node exists (FR-020)
**Acceptance**: Dialog creates relationships of all types, validates target node

---

### T020: [P] Create DeleteRelationshipDialog component (NEW)
**File**: `src/components/relationships/DeleteRelationshipDialog.tsx`
**Description**: Confirmation dialog for relationship deletion
- Show relationship details (source → type → target)
- Require confirmation
- Call `useDeleteAttribute()` hook
**Acceptance**: Dialog confirms deletion, removes relationship

---

### T021: Enhance RelationshipList to show incoming/outgoing
**File**: `src/components/relationships/RelationshipList.tsx`
**Description**: Split relationship display by direction
- Section for outgoing relationships (this node as source)
- Section for incoming relationships (this node as target)
- Show relationship type badge with color coding
- Show delete button per relationship
**Acceptance**: List shows relationships in two sections, color-coded by type

---

## Phase 3.7: Version Components - Compare, Restore, Delete

### T022: [P] Create VersionCompareDialog component (NEW)
**File**: `src/components/versions/VersionCompareDialog.tsx`
**Description**: Diff viewer for version comparison
- Side-by-side comparison: Old version (left) | Current (right)
- Highlight differences in markdown content
- Show metadata changes (title, type, nodeDetails)
- Use simple text diff or library like `react-diff-viewer`
**Acceptance**: Dialog shows diff between versions, highlights changes

---

### T023: [P] Create VersionRestoreDialog component (NEW)
**File**: `src/components/versions/VersionRestoreDialog.tsx`
**Description**: Confirmation dialog for version restoration
- Show warning: "This will create version N+1 with content from version M"
- Preview the version content to be restored
- Call `useRestoreVersion()` hook
- Redirect to node edit page after restoration
**Acceptance**: Dialog confirms restore, creates new version, redirects

---

### T024: [P] Create VersionDeleteDialog component (NEW)
**File**: `src/components/versions/VersionDeleteDialog.tsx`
**Description**: Confirmation dialog for version deletion
- Show warning: "This will permanently delete version X"
- Require confirmation
- Call `useDeleteVersion()` hook
**Acceptance**: Dialog confirms deletion, removes version entry

---

### T025: Enhance VersionHistory component
**File**: `src/components/versions/VersionHistory.tsx`
**Description**: Add comparison, restore, and delete actions
- "Compare" button per version (opens VersionCompareDialog)
- "Restore" button per version (opens VersionRestoreDialog)
- "Delete" button per version (opens VersionDeleteDialog)
- Highlight current version
**Acceptance**: Component shows action buttons, opens respective dialogs

---

## Phase 3.8: Graph Enhancements - Edge Styling & Cycles

### T026: Add edge styling by attribute_key
**File**: `src/components/graph/GraphCanvas.tsx`
**Description**: Style graph edges based on relationship type (FR from constitution)
```typescript
const edgeStyles = {
  contains: { stroke: '#3b82f6', strokeWidth: 2, markerEnd: 'arrowclosed' },
  depends_on: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' },
  references: { stroke: '#10b981', strokeWidth: 1 },
  triggers: { stroke: '#f59e0b', strokeWidth: 2 },
  next: { stroke: '#8b5cf6', strokeWidth: 2 },
  calls: { stroke: '#ec4899', strokeWidth: 2, strokeDasharray: '3,3' }
};
```
- Apply styles dynamically based on edge data `attribute_key`
- Add legend showing relationship types with colors
**Acceptance**: Edges styled by type, legend displayed, colors match design

---

### T027: Add cycle detection visualization for containment
**File**: `src/components/graph/GraphCanvas.tsx`
**Description**: Detect and highlight cycles in containment relationships
- Run cycle detection algorithm on edges with `attribute_key='contains'`
- Mark back-edges (cycle-causing edges) with dashed red style
- Show warning badge: "X cycles detected in containment hierarchy"
**Acceptance**: Cycles detected, back-edges highlighted, warning shown

---

## Phase 3.9: Pages & Integration

### T028: Create space settings page
**File**: `app/spaces/[slug]/settings/page.tsx`
**Description**: Page for space settings and collaborators
- Render SpaceSettings component
- Check user permissions (owner or collaborator)
- Redirect if unauthorized (403)
**Acceptance**: Page renders settings, checks permissions, handles auth

---

### T029: Enhance spaces list page with create button
**File**: `app/spaces/page.tsx`
**Description**: Add prominent "Create Space" button (CRITICAL - FR-001)
- Button opens CreateSpaceDialog
- Show dialog state management
- Refresh list on successful creation
**Acceptance**: Button visible, opens dialog, creates space

---

### T030: Create node versions page
**File**: `app/spaces/[slug]/nodes/[id]/versions/page.tsx`
**Description**: Page displaying version history for a node
- Render VersionHistory component
- Show node title and current version
- Breadcrumb navigation back to node
**Acceptance**: Page renders version history, shows navigation

---

## Phase 3.10: Testing - Unit Tests

### T031: [P] Unit test space service methods
**File**: `tests/unit/services/space.service.test.ts`
**Description**: Test space CRUD and collaborator methods
- Mock Axios responses
- Test getCollaborators, inviteCollaborator, removeCollaborator
- Assert correct API calls and error handling
**Acceptance**: Tests cover all methods, mock API calls, assertions pass

---

### T032: [P] Unit test version service methods
**File**: `tests/unit/services/version.service.test.ts`
**Description**: Test version restore and delete methods
- Mock Axios responses
- Test restoreVersion, deleteVersion
- Assert correct endpoints called
**Acceptance**: Tests cover restore/delete, assertions pass

---

### T033: [P] Unit test space hooks
**File**: `tests/unit/hooks/useSpaces.test.ts`
**Description**: Test collaborator management hooks
- Mock TanStack Query
- Test useCollaborators, useInviteCollaborator, useRemoveCollaborator
- Assert cache invalidation on mutations
**Acceptance**: Tests cover hooks, cache behavior validated

---

### T034: [P] Unit test version hooks
**File**: `tests/unit/hooks/useVersions.test.ts`
**Description**: Test version restore/delete hooks
- Mock TanStack Query
- Test useRestoreVersion, useDeleteVersion
- Assert query invalidation
**Acceptance**: Tests cover hooks, invalidation logic verified

---

### T035: [P] Unit test CreateSpaceDialog component
**File**: `tests/unit/components/CreateSpaceDialog.test.tsx`
**Description**: Test space creation dialog
- Mock useCreateSpace hook
- Test form validation (Zod schema)
- Test success/error handling
- Test dialog open/close state
**Acceptance**: Tests cover form behavior, validation, error states

---

### T036: [P] Unit test CollaboratorList component
**File**: `tests/unit/components/CollaboratorList.test.tsx`
**Description**: Test collaborator list rendering and actions
- Mock useCollaborators hook
- Test collaborator display
- Test remove button (owner only)
- Test invite button
**Acceptance**: Tests cover list rendering, permission checks

---

### T037: [P] Unit test MarkdownPreview component
**File**: `tests/unit/components/MarkdownPreview.test.tsx`
**Description**: Test markdown rendering and sanitization
- Test various markdown syntax (headings, lists, links, code)
- Test XSS prevention (DOMPurify)
- Test empty content handling
**Acceptance**: Tests cover markdown rendering, security, edge cases

---

### T038: [P] Unit test VersionCompareDialog component
**File**: `tests/unit/components/VersionCompareDialog.test.tsx`
**Description**: Test version comparison dialog
- Mock version data
- Test diff display
- Test close button
**Acceptance**: Tests cover diff rendering, dialog behavior

---

## Phase 3.11: Testing - Integration Tests

### T039: [P] Integration test space CRUD flow
**File**: `tests/integration/space-crud.test.ts`
**Description**: Test complete space lifecycle
- Create space → Edit → Invite collaborator → Remove collaborator → Delete
- Use MSW to mock backend APIs
- Assert UI updates correctly after each operation
**Acceptance**: Test covers full flow, mocks API, assertions pass

---

### T040: [P] Integration test node CRUD with markdown
**File**: `tests/integration/node-crud.test.ts`
**Description**: Test node creation/editing with markdown preview
- Create node with markdown content
- Verify preview renders correctly
- Edit node and check updates
- Delete node and verify cascade
**Acceptance**: Test covers node lifecycle, markdown rendering, cascade delete

---

### T041: [P] Integration test version restore flow
**File**: `tests/integration/version-restore.test.ts`
**Description**: Test version history and restoration
- Edit node multiple times (create versions)
- View version history
- Compare versions
- Restore old version
- Verify new version created
**Acceptance**: Test covers version operations, restoration creates new version

---

## Phase 3.12: Testing - E2E Tests (Playwright)

### T042: [P] E2E test space creation and collaborator management
**File**: `tests/e2e/spaces-collab.spec.ts`
**Description**: End-to-end test for space and collaborators
1. Login as user1
2. Create space "Test Space"
3. Navigate to space settings
4. Invite user2 as collaborator
5. Logout, login as user2
6. Verify user2 can edit space
7. Login as user1
8. Remove user2 as collaborator
9. Delete space
**Acceptance**: E2E test completes, all assertions pass, real backend API calls

---

### T043: [P] E2E test node creation with markdown preview
**File**: `tests/e2e/nodes-markdown.spec.ts`
**Description**: End-to-end test for node CRUD with markdown
1. Login
2. Create/select space
3. Click "Create Node"
4. Enter markdown content with headings, lists, links
5. Verify preview renders correctly
6. Save node
7. Edit node, change content
8. Verify markdown preview updates
9. Delete node, confirm cascade warning
**Acceptance**: E2E test verifies markdown preview, CRUD operations work

---

### T044: [P] E2E test version comparison and restoration
**File**: `tests/e2e/versions.spec.ts`
**Description**: End-to-end test for version history
1. Login, create/select space
2. Create node with content "Version 1"
3. Edit node to "Version 2"
4. Edit again to "Version 3"
5. Navigate to version history page
6. Compare version 1 and version 3
7. Restore version 1
8. Verify version 4 created with version 1 content
9. Delete version 2
10. Verify version 2 removed from history
**Acceptance**: E2E test covers comparison, restoration, deletion

---

### T045: [P] E2E test graph edge styling and cycles
**File**: `tests/e2e/graph-edges.spec.ts`
**Description**: End-to-end test for graph visualization
1. Login, create/select space
2. Create 3 nodes (A, B, C)
3. Create relationships:
   - A --contains--> B (blue solid)
   - B --depends_on--> C (red dashed)
   - C --references--> A (green)
4. Navigate to graph view
5. Verify edge colors match relationship types
6. Verify legend shows relationship types
7. Create circular containment: A --contains--> B --contains--> A
8. Verify cycle warning displayed
9. Verify back-edge highlighted in red
**Acceptance**: E2E test verifies edge styling, legend, cycle detection

---

## Dependencies

### Critical Path (Sequential)
1. **T001-T003** (Foundation) → Blocks all component tasks
2. **T004-T007** (Services/Hooks) → Blocks component tasks that use them
3. **T008** (CreateSpaceDialog) → **HIGHEST PRIORITY** - Blocks primary workflow
4. **T014-T015** (Markdown preview) → Blocks node CRUD completion
5. **T022-T025** (Version UI) → Blocks version history feature

### Parallel Groups
- **Foundation** [T001, T002, T003] → Can run in parallel
- **Services** [T004, T005] → Can run in parallel
- **Hooks** [T006, T007] → Can run in parallel (after services)
- **Space Components** [T011, T012, T013] → Can run in parallel (after T008-T010)
- **Node Components** [T017] → Can run in parallel with other new components
- **Relationship Components** [T020] → Can run in parallel with version components
- **Version Components** [T022, T023, T024] → Can run in parallel
- **Unit Tests** [T031-T038] → Can run in parallel (after implementation)
- **Integration Tests** [T039-T041] → Can run in parallel (after unit tests)
- **E2E Tests** [T042-T048] → Can run in parallel (after integration tests)

### Dependency Graph
```
T001,T001b,T002,T003,T003a,T003b (Foundation)
    ↓
T004,T005 (Services)
    ↓
T006,T007 (Hooks)
    ↓
T008 (CreateSpaceDialog - CRITICAL) → T009,T010 (Edit/Delete)
    ↓
T011,T012,T013 (Collaborator UI)
    ↓
T014,T015,T017 (Node CRUD + Markdown)
    ↓
T016,T018 (Node enhancements)
    ↓
T019,T020,T021 (Relationships)
    ↓
T022,T023,T024,T025 (Versions)
    ↓
T026,T027 (Graph enhancements)
    ↓
T028,T029,T030 (Pages)
    ↓
T031-T038 (Unit tests)
    ↓
T039-T041 (Integration tests)
    ↓
T042-T048 (E2E tests)
```

---

## Parallel Execution Examples

### Example 1: Foundation Tasks (Start of Project)
```bash
# Run T001, T001b, T002, T003, T003a, T003b in parallel (different files):
Task: "Add Collaborator types to src/types/backend-dtos.ts"
Task: "Audit User ID type references across codebase"
Task: "Enhance space schema in src/schemas/space.schema.ts"
Task: "Add markdown library to package.json"
Task: "Add input length validation constraints to schemas"
Task: "Create EmptyState component"
```

### Example 2: Service Layer
```bash
# Run T004-T005 in parallel (different files):
Task: "Add collaborator service methods to src/services/api/space.service.ts"
Task: "Add version restore/delete methods to src/services/api/version.service.ts"
```

### Example 3: New Components (After Prerequisites)
```bash
# Run T011-T013 in parallel (all new files):
Task: "Create SpaceSettings component in src/components/spaces/SpaceSettings.tsx"
Task: "Create CollaboratorList component in src/components/spaces/CollaboratorList.tsx"
Task: "Create InviteCollaboratorDialog component in src/components/spaces/InviteCollaboratorDialog.tsx"
```

### Example 4: Version Components
```bash
# Run T022-T024 in parallel (all new files):
Task: "Create VersionCompareDialog in src/components/versions/VersionCompareDialog.tsx"
Task: "Create VersionRestoreDialog in src/components/versions/VersionRestoreDialog.tsx"
Task: "Create VersionDeleteDialog in src/components/versions/VersionDeleteDialog.tsx"
```

### Example 5: Unit Tests
```bash
# Run T031-T038 in parallel (all independent test files):
Task: "Unit test space service in tests/unit/services/space.service.test.ts"
Task: "Unit test version service in tests/unit/services/version.service.test.ts"
Task: "Unit test space hooks in tests/unit/hooks/useSpaces.test.ts"
Task: "Unit test version hooks in tests/unit/hooks/useVersions.test.ts"
Task: "Unit test CreateSpaceDialog in tests/unit/components/CreateSpaceDialog.test.tsx"
Task: "Unit test CollaboratorList in tests/unit/components/CollaboratorList.test.tsx"
Task: "Unit test MarkdownPreview in tests/unit/components/MarkdownPreview.test.tsx"
Task: "Unit test VersionCompareDialog in tests/unit/components/VersionCompareDialog.test.tsx"
```

---

## Notes

### Execution Guidelines
- **[P] tasks**: Different files, no dependencies → Run in parallel for speed
- **Non-[P] tasks**: Same file or sequential dependencies → Run one at a time
- **Critical Path**: T008 (CreateSpaceDialog) is highest priority - blocks primary workflow
- **TDD Approach**: Write tests as you implement (unit tests alongside components)
- **Commit Frequency**: Commit after each task or logical group of parallel tasks
- **Constitution Compliance**: All tasks respect Next.js 14 locked stack, Clean Architecture, and constitutional principles

### Anti-Patterns to Avoid
- ❌ Modifying same file in parallel [P] tasks
- ❌ Skipping type definitions before implementation
- ❌ Implementing without corresponding tests
- ❌ Creating components without proper error handling
- ❌ Forgetting to invalidate TanStack Query cache after mutations

### Success Criteria
- ✅ All 35 functional requirements implemented
- ✅ Space creation dialog completed (unblocks workflow)
- ✅ Full CRUD for all 4 entities (Space, Node, Attribute, NodeVersion)
- ✅ Collaborator management functional
- ✅ Markdown preview working
- ✅ Version comparison, restore, delete operational
- ✅ Graph edges styled by relationship type
- ✅ All tests passing (unit, integration, E2E)
- ✅ Constitution compliance maintained

---

## Validation Checklist
*GATE: Verify before marking feature complete*

- [x] All entities have CRUD components (Space, Node, Attribute, NodeVersion)
- [x] All services have corresponding hooks
- [x] All components have unit tests
- [x] Integration tests cover full user flows
- [x] E2E tests validate real backend integration
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Critical path identified (T008 highest priority)
- [x] All constitutional principles respected

---

**Generated**: 2025-10-07 | **Branch**: `003-crud-ui-i` | **Total Tasks**: 45
**Estimated Effort**: 38-45 tasks × 0.5-2 hours each = 19-90 hours (depends on complexity and parallel execution)
**Next Step**: Begin with T001-T003 (Foundation) in parallel, then proceed through dependency graph
