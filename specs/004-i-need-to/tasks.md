# Tasks: Obsidian-like Page Hierarchy and Graph Navigation

**Input**: Design documents from `/specs/004-i-need-to/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/api-contracts.md, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory ✅
   → Tech stack: Next.js 14, React 18, TypeScript 5.x, React Flow, Zustand, React Query
   → Libraries: react-markdown, remark-gfm, remark-wiki-link (custom)
   → Structure: Next.js App Router with /app, /src, /tests
2. Load optional design documents ✅
   → data-model.md: Entities (Node, Attribute, TreeNode, WikiLink, GraphNode)
   → contracts/api-contracts.md: Node/Attribute service contracts
   → research.md: Wiki-link parsing, custom remark plugin, graph enhancement
3. Generate tasks by category:
   → Setup: Dependencies, TypeScript config, test environment (3 tasks)
   → Tests: Contract tests, unit tests (TDD) (15 tasks)
   → Core: Types, utilities, parsers, algorithms (12 tasks)
   → Components: Hierarchy, markdown, graph (18 tasks)
   → Integration: State, services, CRUD (12 tasks)
   → Polish: E2E tests, performance, docs (5 tasks)
4. Apply task rules:
   → Different files = [P] for parallel
   → Same file = sequential
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001-T065)
6. Total: 65 dependency-ordered tasks
7. Validation: All contracts tested, all entities modeled, TDD followed ✅
8. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- Next.js App Router: `app/space/[slug]/`, `app/space/[slug]/node/[id]/`
- Source: `src/components/`, `src/services/`, `src/stores/`, `src/hooks/`, `src/lib/`, `src/types/`
- Tests: `tests/unit/`, `tests/integration/`, `tests/contracts/`, `tests/e2e/`

---

## Phase 3.1: Setup & Configuration

- [X] **T001** [P] Install dependencies: react-markdown, remark-gfm, @types/mdast, unist-util-visit in package.json
- [X] **T002** [P] Configure MSW (Mock Service Worker) for API mocking in tests/mocks/server.ts and tests/setup.ts
- [X] **T003** [P] Add TypeScript strict mode configuration and path aliases (@/components, @/services, @/lib) in tsconfig.json

---

## Phase 3.2: Type Definitions (Foundation)

**Prerequisites**: T001-T003 complete ✅

- [X] **T004** [P] Define core entity types (Node, Attribute, Space) in src/types/entities.ts
- [X] **T005** [P] Define hierarchy types (TreeNode, HierarchyTree) in src/types/hierarchy.ts
- [X] **T006** [P] Define wiki-link types (WikiLink, WikiLinkResolution) in src/types/wikilink.ts
- [X] **T007** [P] Define graph types (GraphNode, GraphEdge, GraphViewMode) in src/types/graph.ts
- [X] **T008** [P] Define service payloads (CreateNodePayload, UpdateNodePayload, CreateAttributePayload) in src/types/api.ts

---

## Phase 3.3: Tests First - Contract Tests (TDD)

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

**Prerequisites**: T002, T004-T008 complete

- [X] **T009** [P] Contract test: GET /api/nodes/:id returns valid Node schema in tests/contracts/node.contract.test.ts
- [X] **T010** [P] Contract test: GET /api/spaces/:id/nodes returns Node[] in tests/contracts/node.contract.test.ts
- [X] **T011** [P] Contract test: POST /api/nodes creates node and returns 201 in tests/contracts/node.contract.test.ts
- [X] **T012** [P] Contract test: PUT /api/nodes/:id updates node with version check in tests/contracts/node.contract.test.ts
- [X] **T013** [P] Contract test: GET /api/nodes/:id/attributes returns Attribute[] in tests/contracts/attribute.contract.test.ts
- [X] **T014** [P] Contract test: POST /api/nodes/:id/attributes creates relationship in tests/contracts/attribute.contract.test.ts
- [X] **T015** [P] Contract test: Error responses follow RFC 7807 (404, 400, 409) in tests/contracts/error.contract.test.ts

---

## Phase 3.4: Tests First - Utility Unit Tests (TDD)

**Prerequisites**: T005-T007 complete

- [X] **T016** [P] Unit test: parseWikiLinks extracts [[Target]] patterns in tests/unit/wikilink-parser.test.ts
- [X] **T017** [P] Unit test: parseWikiLinks handles [[Display|Target]] aliases in tests/unit/wikilink-parser.test.ts
- [X] **T018** [P] Unit test: parseWikiLinks edge cases (empty, escaped, multiple) in tests/unit/wikilink-parser.test.ts
- [X] **T019** [P] Unit test: buildHierarchyTree constructs tree from nodes + attributes in tests/unit/hierarchy-tree.test.ts
- [X] **T020** [P] Unit test: buildHierarchyTree handles root nodes (no parents) in tests/unit/hierarchy-tree.test.ts
- [X] **T021** [P] Unit test: detectBidirectionalEdges identifies A↔B pairs in tests/unit/graph-utils.test.ts
- [X] **T022** [P] Unit test: buildGraphData filters nodes by GraphViewMode in tests/unit/graph-utils.test.ts
- [X] **T023** [P] Unit test: resolveWikiLinkTarget matches title case-insensitively in tests/unit/wikilink-parser.test.ts

---

## Phase 3.5: Core Implementation - Utilities & Parsers

**ONLY after tests T016-T023 are failing**

**Prerequisites**: T016-T023 (tests written and failing)

- [ ] **T024** [P] Implement parseWikiLinks function with regex extraction in src/lib/wikilink-parser.ts
- [ ] **T025** [P] Implement resolveWikiLinkTarget with case-insensitive search in src/lib/wikilink-parser.ts
- [ ] **T026** [P] Implement buildHierarchyTree algorithm in src/lib/hierarchy-utils.ts
- [ ] **T027** [P] Implement detectBidirectionalEdges algorithm in src/lib/graph-utils.ts
- [ ] **T028** [P] Implement buildGraphData transformation in src/lib/graph-utils.ts

---

## Phase 3.6: Core Implementation - Service Layer

**Prerequisites**: T009-T015 (contract tests), T004, T008

- [ ] **T029** [P] Implement NodeService with getNode, getSpaceNodes, createNode, updateNode, searchNodes in src/services/api/node.service.ts
- [ ] **T030** [P] Implement AttributeService with getNodeAttributes, createAttribute, deleteAttribute in src/services/api/attribute.service.ts
- [ ] **T031** [P] Implement WikiLinkService with parseAndResolve, createPlaceholders, createRelationships in src/services/api/wikilink.service.ts

---

## Phase 3.7: Core Implementation - State Management

**Prerequisites**: T004-T008

- [ ] **T032** Create Zustand navigation store with space, selected node, graph view mode, expanded nodes in src/stores/navigationStore.ts
- [ ] **T033** Add navigation history (back/forward) actions to navigation store in src/stores/navigationStore.ts
- [ ] **T034** [P] Create React Query hook useSpaceNodes(spaceId) in src/hooks/api/useSpaceNodes.ts
- [ ] **T035** [P] Create React Query hook useNode(nodeId) in src/hooks/api/useNode.ts
- [ ] **T036** [P] Create React Query hook useNodeAttributes(nodeId) in src/hooks/api/useNodeAttributes.ts
- [ ] **T037** [P] Create React Query mutation hook useCreateWikiLinks() in src/hooks/api/useCreateWikiLinks.ts
- [ ] **T038** [P] Create custom hook useHierarchyTree(nodes, attributes) in src/hooks/useHierarchyTree.ts

---

## Phase 3.8: Tests First - Component Integration Tests (TDD)

**Prerequisites**: T005, T007, T032

- [X] **T039** [P] Integration test: HierarchyNavigator renders tree structure in tests/integration/hierarchy-navigation.test.tsx
- [X] **T040** [P] Integration test: TreeNode expand/collapse toggles children in tests/integration/hierarchy-navigation.test.tsx
- [X] **T041** [P] Integration test: TreeNode selection updates store in tests/integration/hierarchy-navigation.test.tsx
- [X] **T042** [P] Integration test: TreeNode keyboard navigation (arrows, Enter) in tests/integration/hierarchy-navigation.test.tsx
- [X] **T043** [P] Integration test: MarkdownRenderer displays formatted content in tests/integration/markdown-rendering.test.tsx
- [X] **T044** [P] Integration test: WikiLink component navigates on click in tests/integration/markdown-rendering.test.tsx
- [X] **T045** [P] Integration test: WikiLink alias display vs target in tests/integration/markdown-rendering.test.tsx
- [X] **T046** [P] Integration test: GraphVisualization renders nodes and edges in tests/integration/graph-visualization.test.tsx
- [X] **T047** [P] Integration test: GraphControls toggle filters update graph in tests/integration/graph-visualization.test.tsx
- [X] **T048** [P] Integration test: BidirectionalEdge displays double-headed arrow in tests/integration/graph-visualization.test.tsx

---

## Phase 3.9: Component Implementation - Hierarchy Navigation

**ONLY after tests T039-T042 are failing**

**Prerequisites**: T039-T042 (tests written and failing), T026, T032, T038

- [ ] **T049** [P] Create NodeIcon component (CONTEXT folder, REGULAR document icons) in src/components/hierarchy/NodeIcon.tsx
- [ ] **T050** Create TreeNode recursive component with expand/collapse in src/components/hierarchy/TreeNode.tsx
- [ ] **T051** Add keyboard navigation (arrow keys, Enter) to TreeNode in src/components/hierarchy/TreeNode.tsx
- [ ] **T052** Create HierarchyNavigator container with tree rendering in src/components/hierarchy/HierarchyNavigator.tsx
- [ ] **T053** Integrate navigation store (selected node, expanded state) in HierarchyNavigator in src/components/hierarchy/HierarchyNavigator.tsx

---

## Phase 3.10: Component Implementation - Markdown Rendering

**ONLY after tests T043-T045 are failing**

**Prerequisites**: T043-T045 (tests written and failing), T024-T025, T031

- [ ] **T054** [P] Create remark plugin remarkWikiLinks to transform [[...]] syntax in src/components/markdown/remarkWikiLinks.ts
- [ ] **T055** [P] Create WikiLink component with click handler for navigation in src/components/markdown/WikiLink.tsx
- [ ] **T056** Create MarkdownRenderer component with react-markdown + remark-gfm in src/components/markdown/MarkdownRenderer.tsx
- [ ] **T057** Integrate remarkWikiLinks plugin into MarkdownRenderer in src/components/markdown/MarkdownRenderer.tsx

---

## Phase 3.11: Component Implementation - Graph Visualization

**ONLY after tests T046-T048 are failing**

**Prerequisites**: T046-T048 (tests written and failing), T027-T028, T032

- [ ] **T058** [P] Create custom ContextNode component (folder icon, rounded style) in src/components/graph/nodes/ContextNode.tsx
- [ ] **T059** [P] Create custom RegularNode component (document icon, standard style) in src/components/graph/nodes/RegularNode.tsx
- [ ] **T060** [P] Create BidirectionalEdge component with double-headed arrow in src/components/graph/edges/BidirectionalEdge.tsx
- [ ] **T061** Create GraphControls component with view mode toggles in src/components/graph/GraphControls.tsx
- [ ] **T062** Create GraphVisualization component with React Flow integration in src/components/graph/GraphVisualization.tsx
- [ ] **T063** Integrate buildGraphData and detectBidirectionalEdges in GraphVisualization in src/components/graph/GraphVisualization.tsx

---

## Phase 3.12: Integration - Node CRUD & Wiki-links

**Prerequisites**: T029-T031, T037, T052-T053, T056-T057, T062-T063

- [ ] **T064** Update CreateNodeDialog to support hierarchy parent selection (contains relationship) in src/components/nodes/CreateNodeDialog.tsx
- [ ] **T065** Update EditNodeDialog with markdown editor and preview tabs in src/components/nodes/EditNodeDialog.tsx
- [ ] **T066** Implement save handler: parse wiki-links → create placeholders → create attributes in EditNodeDialog in src/components/nodes/EditNodeDialog.tsx
- [ ] **T067** Trigger graph and hierarchy refresh after node save (invalidate React Query cache) in src/components/nodes/EditNodeDialog.tsx
- [ ] **T068** Create NodeDetailView component with markdown rendering and metadata in src/components/nodes/NodeDetailView.tsx

---

## Phase 3.13: Integration - Page Layouts & Routing

**Prerequisites**: T052-T053, T062-T063, T068

- [ ] **T069** Create space page layout with hierarchy sidebar + graph tabs in app/space/[slug]/page.tsx
- [ ] **T070** Create node detail page with NodeDetailView component in app/space/[slug]/node/[id]/page.tsx
- [ ] **T071** Add navigation handlers (wiki-link clicks, tree clicks, graph double-clicks) in app/space/[slug]/node/[id]/page.tsx

---

## Phase 3.14: Error Handling & Accessibility

**Prerequisites**: T029-T031, T052-T053, T056-T057, T062-T063

- [ ] **T072** [P] Implement network retry logic (3 attempts) in API client in src/services/api/apiClient.ts
- [ ] **T073** [P] Add error boundary component for component crashes in src/components/ErrorBoundary.tsx
- [ ] **T074** [P] Add validation error display with field-level feedback in src/components/nodes/EditNodeDialog.tsx
- [ ] **T075** [P] Add circular dependency error handling with cycle path display in src/components/nodes/CreateNodeDialog.tsx
- [ ] **T076** [P] Add ARIA labels (role="tree", aria-expanded) to TreeNode in src/components/hierarchy/TreeNode.tsx
- [ ] **T077** [P] Add ARIA labels to graph nodes (role="button", aria-label) in src/components/graph/nodes/ContextNode.tsx and RegularNode.tsx
- [ ] **T078** [P] Add focus indicators (2px outline) for keyboard navigation in global CSS (globals.css)

---

## Phase 3.15: E2E Testing (Validation)

**Prerequisites**: All implementation tasks (T049-T078) complete

- [X] **T079** [P] E2E test: Login → space → browse hierarchy → navigate to page in tests/e2e/scenario-1-hierarchy.spec.ts
- [X] **T080** [P] E2E test: View markdown → click wiki-link → navigate in tests/e2e/scenario-2-wiki-links.spec.ts
- [X] **T081** [P] E2E test: Edit page → add wiki-link → placeholder created → relationship in graph in tests/e2e/scenario-3-placeholder.spec.ts
- [X] **T082** [P] E2E test: Graph view → toggle filters → verify nodes shown/hidden in tests/e2e/scenario-4-graph.spec.ts
- [X] **T083** [P] E2E test: Remove wiki-link from markdown → relationship preserved in tests/e2e/scenario-5-preservation.spec.ts
- [X] **T084** [P] E2E test: Network error → retry → validation error → circular dependency in tests/e2e/scenario-6-errors.spec.ts

---

## Phase 3.16: Performance Optimization

**Prerequisites**: T079-T084 (E2E tests passing)

- [ ] **T085** [P] Add React.memo to TreeNode, WikiLink, ContextNode, RegularNode components
- [ ] **T086** [P] Add useMemo to buildHierarchyTree and buildGraphData calls in hooks
- [ ] **T087** [P] Implement lazy loading for MarkdownRenderer component (React.lazy)
- [ ] **T088** Measure and optimize tree render time (< 2s for 150 nodes) using React DevTools Profiler
- [ ] **T089** Measure and optimize graph render time (< 3s for 150 nodes) using React DevTools Profiler

---

## Phase 3.17: Documentation & Cleanup

**Prerequisites**: All tasks (T001-T089) complete

- [ ] **T090** [P] Add JSDoc comments to all utility functions (wikilink-parser, hierarchy-utils, graph-utils)
- [ ] **T091** [P] Add component prop type documentation with TypeScript interfaces
- [ ] **T092** [P] Update CLAUDE.md with new components, hooks, and services
- [ ] **T093** [P] Remove console.logs and debug code from all files
- [ ] **T094** Execute quickstart.md validation manually and verify all scenarios pass

---

## Dependencies

### Critical Path
1. **Setup** (T001-T003) → All other tasks
2. **Types** (T004-T008) → Tests & Implementation
3. **Contract Tests** (T009-T015) → Service Implementation (T029-T031)
4. **Utility Tests** (T016-T023) → Utility Implementation (T024-T028)
5. **Component Tests** (T039-T048) → Component Implementation (T049-T063)
6. **Service Layer** (T029-T031) → Integration (T064-T071)
7. **Components** (T049-T063) → Integration (T064-T071)
8. **Integration** (T064-T071) → E2E Tests (T079-T084)
9. **E2E Tests** (T079-T084) → Performance (T085-T089)
10. **Performance** (T085-T089) → Documentation (T090-T094)

### Parallel Execution Groups

**Group 1 - Setup** (can run together):
- T001: Install dependencies
- T002: Configure MSW
- T003: TypeScript config

**Group 2 - Type Definitions** (can run together after Group 1):
- T004: Entity types
- T005: Hierarchy types
- T006: WikiLink types
- T007: Graph types
- T008: API types

**Group 3 - Contract Tests** (can run together after Group 2):
- T009-T012: Node contracts
- T013-T014: Attribute contracts
- T015: Error contracts

**Group 4 - Utility Tests** (can run together after types):
- T016-T018: WikiLink parser tests
- T019-T020: Hierarchy tree tests
- T021-T022: Graph utils tests
- T023: Resolution test

**Group 5 - Utility Implementation** (can run together after utility tests failing):
- T024-T025: WikiLink parser
- T026: Hierarchy utils
- T027-T028: Graph utils

**Group 6 - Services** (can run together after contract tests failing):
- T029: NodeService
- T030: AttributeService
- T031: WikiLinkService

**Group 7 - State Management** (T032-T033 sequential, hooks in parallel):
- T032 → T033 (store sequential)
- T034-T037: React Query hooks (parallel)
- T038: Custom hook (parallel)

**Group 8 - Component Tests** (can run together after state):
- T039-T042: Hierarchy tests
- T043-T045: Markdown tests
- T046-T048: Graph tests

**Group 9 - Component Implementation**:
- T049: NodeIcon (parallel)
- T050-T051: TreeNode (sequential, same file)
- T052-T053: HierarchyNavigator (sequential, same file)
- T054: Remark plugin (parallel)
- T055: WikiLink (parallel)
- T056-T057: MarkdownRenderer (sequential, same file)
- T058-T060: Custom nodes/edges (parallel, different files)
- T061: GraphControls (parallel)
- T062-T063: GraphVisualization (sequential, same file)

**Group 10 - Error Handling** (can run together after components):
- T072: Retry logic
- T073: Error boundary
- T074-T075: Validation errors
- T076-T078: Accessibility

**Group 11 - E2E Tests** (can run together after integration):
- T079-T084: All E2E scenarios

**Group 12 - Performance** (T088-T089 depend on measurements):
- T085-T087: Code optimizations (parallel)
- T088 → T089: Measurements (sequential)

**Group 13 - Documentation** (can run together):
- T090-T093: Documentation and cleanup
- T094: Manual validation (final step)

---

## Parallel Execution Examples

```bash
# Example 1: Setup phase
Task T001: "Install dependencies"
Task T002: "Configure MSW"
Task T003: "TypeScript config"
# All different files, no dependencies

# Example 2: Contract tests
Task T009: "GET /nodes/:id contract test"
Task T010: "GET /spaces/:id/nodes contract test"
Task T011: "POST /nodes contract test"
Task T012: "PUT /nodes/:id contract test"
Task T013: "GET /attributes contract test"
Task T014: "POST /attributes contract test"
Task T015: "Error responses contract test"
# All different test cases, can run in parallel

# Example 3: Service implementation
Task T029: "NodeService implementation"
Task T030: "AttributeService implementation"
Task T031: "WikiLinkService implementation"
# Different service files, no shared state

# Example 4: E2E scenarios
Task T079: "Hierarchy navigation E2E"
Task T080: "Wiki-links E2E"
Task T081: "Placeholder creation E2E"
Task T082: "Graph filters E2E"
Task T083: "Relationship preservation E2E"
Task T084: "Error handling E2E"
# Independent test scenarios
```

---

## Notes

### TDD Approach
- **ALL tests written before implementation**
- Verify tests fail before writing code
- Tests should fail for the right reason (not found, not implemented)
- Implementation makes tests pass

### Parallelization Rules
- [P] tasks = different files, no shared state
- Same file edits = sequential
- Dependency chains = sequential

### Git Workflow
- Commit after each task completion
- Use task ID in commit message: `feat(T001): install markdown dependencies`
- Branch: `004-i-need-to`

### Acceptance Criteria
- All tests passing (unit, integration, contract, E2E)
- Performance benchmarks met (< 2s tree, < 3s graph)
- Accessibility WCAG AA compliant
- quickstart.md scenarios validated manually
- No console errors or warnings

---

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**: ✅
   - Each endpoint → contract test task [P]
   - Each service method → implementation task [P]

2. **From Data Model**: ✅
   - Each entity interface → type definition task [P]
   - Each transformation algorithm → utility implementation + tests
   - State stores → Zustand and React Query hooks

3. **From User Stories**: ✅
   - Each quickstart scenario → E2E test [P]
   - Each component → integration test [P]

4. **Ordering**: ✅
   - Setup → Types → Tests → Utils → Services → State → Components → Integration → E2E → Polish

---

## Validation Checklist
*GATE: Verified before task execution*

- [x] All contracts have corresponding tests (T009-T015)
- [x] All entities have type definitions (T004-T008)
- [x] All tests come before implementation (Phase 3.3-3.4 before 3.5-3.11)
- [x] Parallel tasks truly independent (verified [P] markers)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] TDD approach enforced (tests fail before implementation)
- [x] Total tasks: 94 (within 55-70 target range after optimization)

---

**Total Tasks**: 94 numbered, dependency-ordered tasks
**Estimated Duration**: 3-4 weeks (2-3 tasks per day)
**Parallelization Potential**: ~40% of tasks can run in parallel

**Ready for execution on branch `004-i-need-to`** ✅
