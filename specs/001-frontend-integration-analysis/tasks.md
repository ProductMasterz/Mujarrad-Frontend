# Tasks: Backend-Integrated Knowledge Graph Frontend

**Input**: Design documents from `/specs/001-frontend-integration-analysis/`
**Prerequisites**: plan.md (required), research.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → ✓ Found: Tech stack, libraries, structure defined
   → Extract: TypeScript, React 18, Vite, React Flow, Zustand, React Query
2. Load optional design documents:
   → research.md: Extract decisions → setup tasks ✓
   → data-model.md: Not present (documented in plan.md)
   → contracts/: Not present (documented in plan.md)
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Types: TypeScript interfaces for backend DTOs
   → Core: API client, services, hooks, stores
   → Components: UI components, graph visualization
   → Integration: routing, forms, error handling
   → Polish: tests, performance, accessibility, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD where applicable)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All services have tests? ✓
   → All components have tests? ✓
   → All API endpoints covered? ✓
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `src/` at repository root
- Paths shown below use repository root structure

---

## Phase 3.1: Setup & Project Initialization

- [ ] T001 Initialize Vite + React + TypeScript project at repository root with strict mode
- [ ] T002 Install core dependencies: react@18, react-dom@18, typescript@5, vite@5
- [ ] T003 Install routing: react-router-dom@6
- [ ] T004 Install state management: zustand@4, @tanstack/react-query@5
- [ ] T005 Install graph visualization: reactflow@11
- [ ] T006 Install HTTP client: axios@1
- [ ] T007 Install form handling: react-hook-form@7, @hookform/resolvers@3, zod@3
- [ ] T008 Install styling: tailwindcss@3, @radix-ui/react-*
- [ ] T009 Install utilities: dompurify@3, @types/dompurify
- [ ] T010 Install dev tools: vitest@1, @testing-library/react@14, @testing-library/jest-dom@6
- [ ] T011 Install E2E testing: @playwright/test@1
- [ ] T012 Install linting: eslint@8, @typescript-eslint/*, prettier@3
- [ ] T013 [P] Configure tsconfig.json with strict mode and path aliases
- [ ] T014 [P] Configure vite.config.ts with plugins and build optimization
- [ ] T015 [P] Configure tailwind.config.ts with custom theme
- [ ] T016 [P] Configure vitest.config.ts for unit/integration tests
- [ ] T017 [P] Configure playwright.config.ts for E2E tests
- [ ] T018 [P] Configure ESLint with TypeScript rules in .eslintrc.js
- [ ] T019 [P] Configure Prettier in .prettierrc
- [ ] T020 [P] Setup Husky + lint-staged for pre-commit hooks
- [ ] T021 [P] Create .env.example with API_BASE_URL and other env vars
- [ ] T022 Create src/styles/globals.css with Tailwind directives

## Phase 3.2: Type Definitions & Data Model

- [ ] T023 [P] Create src/types/backend-dtos.ts with User, Workspace, Node, Attribute, NodeVersion interfaces
- [ ] T024 [P] Create src/types/api.ts with PaginatedResponse, ApiError wrapper types
- [ ] T025 [P] Create src/types/graph.ts with ReactFlow node/edge type extensions
- [ ] T026 [P] Create src/types/errors.ts with RFC 7807 ProblemDetail interface

## Phase 3.3: Zod Schemas & Validation

- [ ] T027 [P] Create src/schemas/auth.schema.ts with registerSchema, loginSchema
- [ ] T028 [P] Create src/schemas/workspace.schema.ts with createWorkspaceSchema, updateWorkspaceSchema
- [ ] T029 [P] Create src/schemas/node.schema.ts with createNodeSchema, updateNodeSchema
- [ ] T030 [P] Create src/schemas/attribute.schema.ts with createAttributeSchema
- [ ] T031 [P] Create src/schemas/version.schema.ts (if needed for restore operations)

## Phase 3.4: API Client & Error Handling

- [ ] T032 Create src/services/api/client.ts with Axios instance, base URL, timeout config
- [ ] T033 Add request interceptor to src/services/api/client.ts for JWT Bearer token injection
- [ ] T034 Add response interceptor to src/services/api/client.ts for RFC 7807 error parsing
- [ ] T035 Add 401 handling to src/services/api/client.ts with redirect to login
- [ ] T036 Create src/lib/errors.ts with ApiError class extending Error
- [ ] T037 Create src/lib/utils.ts with cn() for className merging, common utilities

## Phase 3.5: Services (API Layer)

- [ ] T038 [P] Create src/services/AuthService.ts with register(), login(), logout() methods
- [ ] T039 [P] Create src/services/WorkspaceService.ts with CRUD methods (create, getAll, getBySlug, delete)
- [ ] T040 [P] Create src/services/NodeService.ts with CRUD methods workspace-scoped
- [ ] T041 [P] Create src/services/AttributeService.ts with create(), getAll(), delete() for relationships
- [ ] T042 [P] Create src/services/VersionService.ts with getAll(), restore() methods
- [ ] T043 [P] Create src/services/SearchService.ts with search() method with query params

## Phase 3.6: Zustand Stores (Client State)

- [ ] T044 [P] Create src/stores/authStore.ts with user, isAuthenticated, login, logout actions
- [ ] T045 [P] Create src/stores/workspaceStore.ts with currentWorkspace, setWorkspace actions
- [ ] T046 [P] Create src/stores/uiStore.ts with theme, sidebar, preferences state

## Phase 3.7: React Query Hooks (Server State)

- [ ] T047 [P] Create src/hooks/api/useAuth.ts with useLogin, useRegister mutations
- [ ] T048 [P] Create src/hooks/api/useWorkspaces.ts with useWorkspaces query, useCreateWorkspace, useDeleteWorkspace mutations
- [ ] T049 [P] Create src/hooks/api/useNodes.ts with useNode, useNodes queries, useCreateNode, useUpdateNode, useDeleteNode mutations
- [ ] T050 [P] Create src/hooks/api/useAttributes.ts with useAttributes query, useCreateAttribute, useDeleteAttribute mutations
- [ ] T051 [P] Create src/hooks/api/useVersions.ts with useVersions query, useRestoreVersion mutation
- [ ] T052 [P] Create src/hooks/api/useSearch.ts with useSearch query with debouncing

## Phase 3.8: Utility Hooks

- [ ] T053 [P] Create src/hooks/useDebounce.ts for debouncing search/auto-save
- [ ] T054 [P] Create src/hooks/useInfiniteScroll.ts with Intersection Observer
- [ ] T055 [P] Create src/hooks/useLocalStorage.ts for persisting UI preferences

## Phase 3.9: UI Components (Radix UI Wrappers)

- [ ] T056 [P] Create src/components/ui/Button.tsx wrapping Radix UI button with variants
- [ ] T057 [P] Create src/components/ui/Input.tsx with forwardRef for forms
- [ ] T058 [P] Create src/components/ui/Dialog.tsx wrapping Radix UI dialog
- [ ] T059 [P] Create src/components/ui/Select.tsx wrapping Radix UI select
- [ ] T060 [P] Create src/components/ui/Toast.tsx wrapping Radix UI toast for notifications
- [ ] T061 [P] Create src/components/ui/DropdownMenu.tsx wrapping Radix UI dropdown
- [ ] T062 [P] Create src/components/ui/Tabs.tsx wrapping Radix UI tabs

## Phase 3.10: Layout Components

- [ ] T063 Create src/components/layouts/RootLayout.tsx with navigation, auth check, React Query provider
- [ ] T064 Create src/components/layouts/WorkspaceLayout.tsx with workspace header, sidebar

## Phase 3.11: Authentication Components

- [ ] T065 Create src/components/auth/LoginForm.tsx with React Hook Form + loginSchema validation
- [ ] T066 Create src/components/auth/RegisterForm.tsx with React Hook Form + registerSchema validation
- [ ] T067 Create src/components/auth/ProtectedRoute.tsx wrapper checking auth state

## Phase 3.12: Workspace Components

- [ ] T068 Create src/components/workspaces/WorkspaceList.tsx displaying user's workspaces
- [ ] T069 Create src/components/workspaces/WorkspaceCard.tsx for list item
- [ ] T070 Create src/components/workspaces/CreateWorkspaceDialog.tsx with form

## Phase 3.13: Node Components

- [ ] T071 Create src/components/nodes/NodeList.tsx with infinite scroll
- [ ] T072 Create src/components/nodes/NodeCard.tsx for list item with preview
- [ ] T073 Create src/components/nodes/NodeDetail.tsx displaying full node with markdown rendering (DOMPurify)
- [ ] T074 Create src/components/nodes/NodeForm.tsx with React Hook Form + nodeSchema, markdown textarea
- [ ] T075 Create src/components/nodes/NodeVersionHistory.tsx with version list and comparison
- [ ] T076 Create src/components/nodes/NodeVersionDiff.tsx showing diff between versions

## Phase 3.14: Relationship Components

- [ ] T077 Create src/components/relationships/RelationshipForm.tsx with attribute type selector
- [ ] T078 Create src/components/relationships/RelationshipList.tsx showing node's relationships

## Phase 3.15: Graph Visualization (React Flow)

- [ ] T079 Create src/components/graph/GraphVisualization.tsx with React Flow setup, layout algorithm
- [ ] T080 Add custom node renderers to src/components/graph/GraphVisualization.tsx for CONTEXT, REGULAR, ASSUMPTION types
- [ ] T081 Add custom edge renderers to src/components/graph/GraphVisualization.tsx for different attribute_key types
- [ ] T082 Add cycle detection visualization to src/components/graph/GraphVisualization.tsx with dashed back-edges
- [ ] T083 Create src/components/graph/GraphControls.tsx with zoom, fit view, layout toggle
- [ ] T084 Create src/components/graph/MiniMap.tsx component for overview

## Phase 3.16: Search Components

- [ ] T085 Create src/components/search/SearchBar.tsx with debounced input
- [ ] T086 Create src/components/search/SearchResults.tsx with highlighted matches
- [ ] T087 Create src/components/search/SearchFilters.tsx for node type, date range filtering

## Phase 3.17: Routing & Pages

- [ ] T088 Create src/app/routes/root.tsx with RootLayout and auth check
- [ ] T089 Create src/app/routes/login.tsx page with LoginForm
- [ ] T090 Create src/app/routes/register.tsx page with RegisterForm
- [ ] T091 Create src/app/routes/workspaces.tsx page with WorkspaceList
- [ ] T092 Create src/app/routes/workspace/$slug.tsx with WorkspaceLayout
- [ ] T093 Create src/app/routes/workspace/nodes.tsx with NodeList view
- [ ] T094 Create src/app/routes/workspace/graph.tsx with GraphVisualization
- [ ] T095 Create src/app/routes/workspace/node/$id.tsx with NodeDetail and version history
- [ ] T096 Create src/app/main.tsx with React Router setup, QueryClientProvider, Zustand stores

## Phase 3.18: Error Handling & Boundaries

- [ ] T097 [P] Create src/components/ErrorBoundary.tsx catching React errors
- [ ] T098 [P] Create src/components/NotFound.tsx for 404 page

## Phase 3.19: Testing - Unit Tests

- [ ] T099 [P] Create tests/unit/services/AuthService.spec.ts with MSW mocks
- [ ] T100 [P] Create tests/unit/services/NodeService.spec.ts with MSW mocks
- [ ] T101 [P] Create tests/unit/services/AttributeService.spec.ts with MSW mocks
- [ ] T102 [P] Create tests/unit/hooks/useDebounce.spec.ts
- [ ] T103 [P] Create tests/unit/schemas/node.schema.spec.ts validating Zod schemas

## Phase 3.20: Testing - Integration Tests

- [ ] T104 [P] Create tests/integration/components/LoginForm.spec.tsx with user interactions
- [ ] T105 [P] Create tests/integration/components/NodeForm.spec.tsx with form validation
- [ ] T106 [P] Create tests/integration/components/GraphVisualization.spec.tsx with node/edge rendering

## Phase 3.21: Testing - E2E Tests

- [ ] T107 [P] Create tests/e2e/auth.spec.ts testing registration and login flow
- [ ] T108 [P] Create tests/e2e/workspace.spec.ts testing workspace CRUD
- [ ] T109 [P] Create tests/e2e/nodes.spec.ts testing node CRUD and version history
- [ ] T110 [P] Create tests/e2e/graph.spec.ts testing graph visualization and navigation

## Phase 3.22: Polish - Performance

- [ ] T111 Add React.lazy() code splitting to src/app/main.tsx for routes
- [ ] T112 Add React.lazy() for large components (GraphVisualization, NodeVersionHistory)
- [ ] T113 Configure React Query stale times and cache times in src/app/main.tsx
- [ ] T114 Add bundle size check to package.json scripts with vite-plugin-bundle-analyzer
- [ ] T115 Run Lighthouse audit and fix performance issues to achieve >90 score

## Phase 3.23: Polish - Accessibility

- [ ] T116 [P] Add ARIA labels to all interactive elements in graph components
- [ ] T117 [P] Add keyboard navigation support to GraphVisualization.tsx
- [ ] T118 [P] Verify color contrast ratios meet WCAG AA standards (4.5:1)
- [ ] T119 [P] Add focus management to Dialog components (trap focus, restore on close)
- [ ] T120 Run accessibility audit with axe-core and fix violations

## Phase 3.24: Polish - Documentation

- [ ] T121 [P] Create README.md with setup instructions, tech stack, architecture
- [ ] T122 [P] Create docs/ARCHITECTURE.md documenting Clean Architecture layers
- [ ] T123 [P] Create docs/API.md with endpoint documentation and usage examples
- [ ] T124 [P] Add JSDoc comments to all exported functions and components

## Phase 3.25: Validation & Deployment

- [ ] T125 Run all tests (unit, integration, E2E) and ensure >80% coverage for services
- [ ] T126 Run ESLint and Prettier, fix all errors and warnings
- [ ] T127 Build production bundle and verify size <200KB gzipped for main chunk
- [ ] T128 Test application against backend API (localhost:8080)
- [ ] T129 Create Dockerfile for containerized deployment (optional)
- [ ] T130 Set up CI/CD pipeline with GitHub Actions (build, test, deploy)

---

## Dependencies

### Critical Path
1. T001-T022 (Setup) → All other tasks
2. T023-T026 (Types) → T027-T031 (Schemas) → Services/Hooks/Components
3. T032-T037 (API Client) → T038-T043 (Services) → T047-T052 (Hooks)
4. T044-T046 (Stores) → Components using global state
5. T056-T062 (UI Components) → All feature components
6. T088-T096 (Routing) depends on all components
7. T099-T110 (Tests) can run in parallel once code exists
8. T111-T130 (Polish) after core implementation

### Service Layer Dependencies
- T038-T043 (Services) depend on T032 (API Client)
- T047-T052 (Hooks) depend on T038-T043 (Services)
- All components depend on hooks and stores

### Component Dependencies
- T063-T064 (Layouts) → T088-T096 (Routes)
- T065-T067 (Auth) → T089-T090 (Auth Pages)
- T071-T076 (Node Components) → T093, T095 (Node Pages)
- T079-T084 (Graph) → T094 (Graph Page)

---

## Parallel Execution Examples

### Phase 1: Setup (Sequential - shared files)
```bash
# Run T001-T022 sequentially as they modify shared config files
```

### Phase 2: Type Definitions (All Parallel)
```bash
# Launch T023-T026 together:
Task: "Create src/types/backend-dtos.ts with User, Workspace, Node, Attribute, NodeVersion interfaces"
Task: "Create src/types/api.ts with PaginatedResponse, ApiError wrapper types"
Task: "Create src/types/graph.ts with ReactFlow node/edge type extensions"
Task: "Create src/types/errors.ts with RFC 7807 ProblemDetail interface"
```

### Phase 3: Zod Schemas (All Parallel)
```bash
# Launch T027-T031 together:
Task: "Create src/schemas/auth.schema.ts with registerSchema, loginSchema"
Task: "Create src/schemas/workspace.schema.ts with createWorkspaceSchema, updateWorkspaceSchema"
Task: "Create src/schemas/node.schema.ts with createNodeSchema, updateNodeSchema"
Task: "Create src/schemas/attribute.schema.ts with createAttributeSchema"
Task: "Create src/schemas/version.schema.ts (if needed for restore operations)"
```

### Phase 4: Services (All Parallel after T032-T037)
```bash
# Launch T038-T043 together:
Task: "Create src/services/AuthService.ts with register(), login(), logout() methods"
Task: "Create src/services/WorkspaceService.ts with CRUD methods"
Task: "Create src/services/NodeService.ts with CRUD methods workspace-scoped"
Task: "Create src/services/AttributeService.ts with create(), getAll(), delete()"
Task: "Create src/services/VersionService.ts with getAll(), restore() methods"
Task: "Create src/services/SearchService.ts with search() method"
```

### Phase 5: Stores (All Parallel)
```bash
# Launch T044-T046 together:
Task: "Create src/stores/authStore.ts with user, isAuthenticated, login, logout actions"
Task: "Create src/stores/workspaceStore.ts with currentWorkspace, setWorkspace actions"
Task: "Create src/stores/uiStore.ts with theme, sidebar, preferences state"
```

### Phase 6: Hooks (All Parallel after Services)
```bash
# Launch T047-T055 together:
Task: "Create src/hooks/api/useAuth.ts with useLogin, useRegister mutations"
Task: "Create src/hooks/api/useWorkspaces.ts with queries and mutations"
Task: "Create src/hooks/api/useNodes.ts with queries and mutations"
Task: "Create src/hooks/api/useAttributes.ts with queries and mutations"
Task: "Create src/hooks/api/useVersions.ts with queries and mutations"
Task: "Create src/hooks/api/useSearch.ts with useSearch query"
Task: "Create src/hooks/useDebounce.ts for debouncing"
Task: "Create src/hooks/useInfiniteScroll.ts with Intersection Observer"
Task: "Create src/hooks/useLocalStorage.ts for persisting UI preferences"
```

### Phase 7: UI Components (All Parallel)
```bash
# Launch T056-T062 together (Radix wrappers):
Task: "Create src/components/ui/Button.tsx wrapping Radix UI button"
Task: "Create src/components/ui/Input.tsx with forwardRef"
Task: "Create src/components/ui/Dialog.tsx wrapping Radix UI dialog"
Task: "Create src/components/ui/Select.tsx wrapping Radix UI select"
Task: "Create src/components/ui/Toast.tsx wrapping Radix UI toast"
Task: "Create src/components/ui/DropdownMenu.tsx wrapping Radix UI dropdown"
Task: "Create src/components/ui/Tabs.tsx wrapping Radix UI tabs"
```

### Phase 8: Tests (All Parallel after implementation)
```bash
# Launch all test tasks together:
Task: "Create tests/unit/services/AuthService.spec.ts with MSW mocks"
Task: "Create tests/unit/services/NodeService.spec.ts with MSW mocks"
Task: "Create tests/integration/components/LoginForm.spec.tsx"
Task: "Create tests/e2e/auth.spec.ts testing registration and login"
# ... (T099-T110)
```

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- Commit after completing each phase (not after each task)
- Run tests continuously during development
- Avoid: vague tasks, same file conflicts, missing dependencies

## Task Generation Rules
*Applied during main() execution*

1. **From Plan.md**:
   - Each tech dependency → installation task
   - Each layer (types, services, hooks, components) → separate tasks
   - Each service → corresponding hook task

2. **From Research.md**:
   - Technology decisions → setup tasks (React Flow, Zustand, React Query)
   - Performance strategies → optimization tasks
   - Testing strategy → test tasks

3. **From Data Model (in plan.md)**:
   - Each entity → TypeScript interface task [P]
   - Each entity → Zod schema task [P]
   - Each service → CRUD methods task [P]

4. **Ordering**:
   - Setup → Types → Schemas → API Client → Services → Hooks → Components → Routes → Tests → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All type definitions created
- [x] All services have corresponding hooks
- [x] All components have pages/routes
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Tests cover all critical paths
- [x] Performance and accessibility tasks included

---

**Total Tasks**: 130
**Estimated Parallel Batches**: 15-20 (depending on dependencies)
**Estimated Sequential Tasks**: 40-50 (setup, routing, integration)

**Ready for execution**. Start with T001 (project initialization).
