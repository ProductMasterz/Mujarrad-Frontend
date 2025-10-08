# Implementation Priority Plan
## Feature: 004-i-need-to (Obsidian-like Page Hierarchy and Graph Navigation)

**Generated**: 2025-10-08
**Last Updated**: 2025-10-08 (Sprint 2 Complete)
**Status**: Sprint 2 Complete - 93/93 tests passing ✅
**Current Phase**: Ready for Sprint 3 - Component Development

---

## Priority Framework

### 🔴 **P0 - Critical Path** (Must complete in order)
Foundation code that unblocks everything else. Cannot parallelize.

### 🟠 **P1 - High Priority** (Can parallelize)
Core features needed for MVP. Multiple developers can work simultaneously.

### 🟡 **P2 - Medium Priority** (Depends on P1)
Integration and polish. Requires P1 complete.

### 🟢 **P3 - Low Priority** (Optional enhancements)
Nice-to-have improvements and optimizations.

---

## Implementation Waves

### 🌊 Wave 1: Foundation (Days 1-2) ✅ COMPLETE
**Goal**: Make utility and service tests pass
**Status**: All 84 tests passing (59 unit + 25 contract)

#### 🟢 P0-A: Utility Functions ✅ COMPLETE
**Owner**: Developer A
**Duration**: 4-6 hours (actual)
**Completed**: All tests passing

- **T024** ✅ Implement parseWikiLinks function with regex extraction in `src/lib/wikilink-parser.ts`
  - **Test Coverage**: T016, T017, T018 (23 test cases) ✅ PASSING
  - **Implementation**: Regex pattern for `[[Target]]` and `[[Display|Target]]`
  - **Status**: COMPLETE

- **T025** ✅ Implement resolveWikiLinkTarget with case-insensitive search in `src/lib/wikilink-parser.ts`
  - **Test Coverage**: T023 (8 test cases) ✅ PASSING
  - **Implementation**: Returns full Node object (not just ID)
  - **Status**: COMPLETE

- **T026** ✅ Implement buildHierarchyTree algorithm in `src/lib/hierarchy-utils.ts`
  - **Test Coverage**: T019, T020 (11 test cases) ✅ PASSING
  - **Implementation**: Recursive tree with orphan node handling
  - **Status**: COMPLETE

#### 🟢 P1-A: Graph Utilities ✅ COMPLETE
**Owner**: Developer B
**Duration**: 3-4 hours (actual)
**Completed**: All tests passing

- **T027** ✅ Implement detectBidirectionalEdges algorithm in `src/lib/graph-utils.ts`
  - **Test Coverage**: T021 (8 test cases) ✅ PASSING
  - **Implementation**: Returns attribute IDs with type matching
  - **Status**: COMPLETE

- **T028** ✅ Implement buildGraphData transformation in `src/lib/graph-utils.ts`
  - **Test Coverage**: T022 (12 test cases) ✅ PASSING
  - **Implementation**: Transforms to React Flow format with filters
  - **Status**: COMPLETE

#### 🟢 P1-B: Service Layer ✅ COMPLETE
**Owner**: Developer C
**Duration**: 4-5 hours (actual)
**Completed**: All contract tests passing (25/25)

- **T029** ✅ Implement NodeService with getNode, getWorkspaceNodes, createNode, updateNode, searchNodes in `src/services/api/node.service.ts`
  - **Test Coverage**: T009, T010, T011, T012 (15 test cases) ✅ PASSING
  - **Implementation**: Aligned with backend API contracts
  - **Status**: COMPLETE

- **T030** ✅ Implement AttributeService with getNodeAttributes, createAttribute, deleteAttribute in `src/services/api/attribute.service.ts`
  - **Test Coverage**: T013, T014 (10 test cases) ✅ PASSING
  - **Implementation**: Query parameter support added
  - **Status**: COMPLETE

- **T031** ✅ Implement WikiLinkService with parseAndResolve, createPlaceholders, createRelationships in `src/services/api/wikilink.service.ts`
  - **Test Coverage**: Integration tests (9 test cases) ✅ PASSING
  - **Implementation**: Full orchestration workflow
  - **Status**: COMPLETE

**Wave 1 Output**: ✅ ACHIEVED
- ✅ All utility tests passing (59/59)
- ✅ All service contract tests passing (25/25)
- ✅ Integration tests passing (9/9)
- ✅ Foundation for UI components ready

---

### 🌊 Wave 2: State Management (Days 2-3) ✅ COMPLETE
**Goal**: Set up global and server state
**Status**: All stores and hooks implemented

#### 🟢 P0-B: Zustand Stores ✅ COMPLETE
**Owner**: Developer A
**Duration**: 2-3 hours (actual)
**Completed**: Both stores fully functional

- **T032** ✅ Create HierarchyStore with expand/collapse state in `src/stores/hierarchyStore.ts`
  - **Implementation**: toggleExpanded, isExpanded, selectNode actions
  - **Features**: Redux DevTools integration
  - **Status**: COMPLETE

- **T033** ✅ Create GraphStore with view mode and filters in `src/stores/graphStore.ts`
  - **Implementation**: View mode toggles, localStorage persistence
  - **Features**: Partial persistence (viewMode only)
  - **Status**: COMPLETE

#### 🟢 P1-C: React Query Hooks ✅ COMPLETE
**Owner**: Developer B
**Duration**: 3-4 hours (actual)
**Completed**: All hooks with optimistic updates

- **T034** ✅ Create React Query hook useNodes(workspaceId) in `src/hooks/api/useNodes.ts`
  - **Implementation**: Pagination support, 5min staleTime
  - **Status**: COMPLETE

- **T035** ✅ Create React Query hook useNode(nodeId) in `src/hooks/api/useNode.ts`
  - **Implementation**: Single node fetch with caching
  - **Status**: COMPLETE

- **T036** ✅ Create React Query mutation useCreateNode in `src/hooks/api/useCreateNode.ts`
  - **Implementation**: Optimistic updates, rollback on error
  - **Status**: COMPLETE

- **T037** ✅ Create React Query mutation useUpdateNode in `src/hooks/api/useUpdateNode.ts`
  - **Implementation**: Version conflict handling, optimistic updates
  - **Status**: COMPLETE

- **T038** ✅ Create React Query hook useAttributes in `src/hooks/api/useAttributes.ts`
  - **Implementation**: useAttributes and useWorkspaceAttributes hooks
  - **Status**: COMPLETE

**Wave 2 Output**: ✅ ACHIEVED
- ✅ Zustand stores ready (hierarchyStore, graphStore)
- ✅ React Query hooks ready (5 hooks total)
- ✅ Optimistic updates implemented
- ✅ State management layer complete

---

### 🌊 Wave 3: UI Components - Hierarchy (Days 3-4)
**Goal**: Implement tree navigation
**Parallel Work**: 2 developers (icons vs tree logic)

#### 🟠 P1-E: Basic Components (Parallel)
**Owner**: Developer C
**Duration**: 2 hours
**Can start**: After T032-T033 complete

- **T049** Create NodeIcon component (CONTEXT folder, REGULAR document icons) in `src/components/hierarchy/NodeIcon.tsx`
  - **Test Coverage**: T039 (integration test)
  - **Critical**: Visual distinction between node types
  - **Complexity**: Low (simple icon component)

#### 🔴 P0-C: Tree Components (Sequential - Same File)
**Owner**: Developer A
**Duration**: 6-8 hours
**Can start**: After T032, T038 complete
**Dependencies**: navigationStore, useHierarchyTree

- **T050** Create TreeNode recursive component with expand/collapse in `src/components/hierarchy/TreeNode.tsx`
  - **Test Coverage**: T040 (8 test cases)
  - **Critical**: Core hierarchy rendering
  - **Features**: Recursive rendering, expand/collapse state, indentation
  - **Complexity**: High (recursive component with state)

- **T051** Add keyboard navigation (arrow keys, Enter) to TreeNode in `src/components/hierarchy/TreeNode.tsx`
  - **Test Coverage**: T042 (10 test cases)
  - **Critical**: Accessibility requirement
  - **Features**: ArrowUp/Down, ArrowLeft/Right, Enter, Space
  - **Complexity**: Medium (keyboard event handling)

- **T052** Create HierarchyNavigator container with tree rendering in `src/components/hierarchy/HierarchyNavigator.tsx`
  - **Test Coverage**: T039 (7 test cases)
  - **Critical**: Main hierarchy component
  - **Complexity**: Medium (container with loading/error states)

- **T053** Integrate navigation store (selected node, expanded state) in HierarchyNavigator in `src/components/hierarchy/HierarchyNavigator.tsx`
  - **Test Coverage**: T041 (4 test cases)
  - **Critical**: State synchronization
  - **Complexity**: Low (Zustand store integration)

**Wave 3 Output**:
- ✅ Fully functional tree navigation
- ✅ Integration tests T039-T042 passing
- ✅ Keyboard accessible

---

### 🌊 Wave 4: UI Components - Markdown (Days 4-5)
**Goal**: Implement markdown rendering with wiki-links
**Parallel Work**: 2 developers (plugin vs component)

#### 🟠 P1-F: Remark Plugin (Parallel)
**Owner**: Developer B
**Duration**: 4-5 hours
**Can start**: After T024-T025 complete
**Dependencies**: parseWikiLinks, resolveWikiLinkTarget

- **T054** Create remark plugin remarkWikiLinks to transform [[...]] syntax in `src/components/markdown/remarkWikiLinks.ts`
  - **Test Coverage**: T043, T045 (markdown rendering tests)
  - **Critical**: Enables wiki-link syntax in markdown
  - **Algorithm**: AST traversal with unist-util-visit
  - **Complexity**: High (remark plugin development)

#### 🟠 P1-G: Markdown Components (Parallel)
**Owner**: Developer C
**Duration**: 3-4 hours
**Can start**: After T032 complete

- **T055** Create WikiLink component with click handler for navigation in `src/components/markdown/WikiLink.tsx`
  - **Test Coverage**: T044, T045 (10 test cases)
  - **Critical**: Clickable wiki-link rendering
  - **Features**: Navigation, distinct styling, placeholder state
  - **Complexity**: Low (simple link component)

#### 🔴 P0-D: Markdown Integration (Sequential - Same File)
**Owner**: Developer B
**Duration**: 2-3 hours
**Can start**: After T054, T055 complete
**Dependencies**: remarkWikiLinks, WikiLink

- **T056** Create MarkdownRenderer component with react-markdown + remark-gfm in `src/components/markdown/MarkdownRenderer.tsx`
  - **Test Coverage**: T043 (15+ test cases for all markdown features)
  - **Critical**: Core markdown rendering
  - **Complexity**: Medium (configure react-markdown)

- **T057** Integrate remarkWikiLinks plugin into MarkdownRenderer in `src/components/markdown/MarkdownRenderer.tsx`
  - **Test Coverage**: T043, T044, T045
  - **Critical**: Complete wiki-link support
  - **Complexity**: Low (plugin integration)

**Wave 4 Output**:
- ✅ Full markdown rendering with GFM
- ✅ Wiki-links functional and styled
- ✅ Integration tests T043-T045 passing

---

### 🌊 Wave 5: UI Components - Graph (Days 5-6)
**Goal**: Implement graph visualization
**Parallel Work**: 3 developers (nodes, edges, controls)

#### 🟠 P1-H: Custom Nodes (Parallel - Different Files)
**Owner**: Developer A
**Duration**: 2-3 hours each
**Can start**: Immediately (independent)

- **T058** Create custom ContextNode component (folder icon, rounded style) in `src/components/graph/nodes/ContextNode.tsx`
  - **Test Coverage**: T046
  - **Critical**: Distinct CONTEXT node styling
  - **Complexity**: Low (React Flow custom node)

- **T059** Create custom RegularNode component (document icon, standard style) in `src/components/graph/nodes/RegularNode.tsx`
  - **Test Coverage**: T046
  - **Critical**: REGULAR node styling
  - **Complexity**: Low

#### 🟠 P1-I: Custom Edges (Parallel)
**Owner**: Developer B
**Duration**: 3-4 hours
**Can start**: Immediately

- **T060** Create BidirectionalEdge component with double-headed arrow in `src/components/graph/edges/BidirectionalEdge.tsx`
  - **Test Coverage**: T048 (8 test cases)
  - **Critical**: Unique feature (merge A↔B into single edge)
  - **Complexity**: Medium (custom SVG markers)

#### 🟠 P1-J: Graph Controls (Parallel)
**Owner**: Developer C
**Duration**: 2-3 hours
**Can start**: After T032 complete

- **T061** Create GraphControls component with view mode toggles in `src/components/graph/GraphControls.tsx`
  - **Test Coverage**: T047 (10 test cases)
  - **Critical**: Filter nodes/edges by type
  - **Complexity**: Low (checkbox toggles with Zustand)

#### 🔴 P0-E: Graph Integration (Sequential - Same File)
**Owner**: Developer A or B
**Duration**: 4-5 hours
**Can start**: After T027-T028, T058-T061 complete
**Dependencies**: buildGraphData, detectBidirectionalEdges, custom nodes/edges

- **T062** Create GraphVisualization component with React Flow integration in `src/components/graph/GraphVisualization.tsx`
  - **Test Coverage**: T046, T047 (15+ test cases)
  - **Critical**: Main graph component
  - **Features**: Pan, zoom, minimap, controls
  - **Complexity**: High (React Flow configuration)

- **T063** Integrate buildGraphData and detectBidirectionalEdges in GraphVisualization in `src/components/graph/GraphVisualization.tsx`
  - **Test Coverage**: T046, T048
  - **Critical**: Transform data for React Flow
  - **Complexity**: Medium (data transformation)

**Wave 5 Output**:
- ✅ Fully functional graph view
- ✅ Bidirectional edges working
- ✅ Filter controls functional
- ✅ Integration tests T046-T048 passing

---

### 🌊 Wave 6: Integration & CRUD (Days 6-7)
**Goal**: Connect components to node editing
**Parallel Work**: Can mostly parallelize

#### 🟠 P1-K: Node Dialogs (Parallel - Different Files)
**Owner**: Developer C
**Duration**: 3-4 hours each
**Can start**: After Wave 3, 4, 5 complete

- **T064** Update CreateNodeDialog to support hierarchy parent selection (contains relationship) in `src/components/nodes/CreateNodeDialog.tsx`
  - **Test Coverage**: E2E tests
  - **Critical**: Create nodes in hierarchy
  - **Complexity**: Medium (dropdown for parent selection)

- **T065** Update EditNodeDialog with markdown editor and preview tabs in `src/components/nodes/EditNodeDialog.tsx`
  - **Test Coverage**: E2E test T081
  - **Critical**: Edit markdown with live preview
  - **Complexity**: Medium (tabs + markdown editor)

- **T066** Implement save handler: parse wiki-links → create placeholders → create attributes in EditNodeDialog in `src/components/nodes/EditNodeDialog.tsx`
  - **Test Coverage**: E2E test T081
  - **Critical**: Core wiki-link processing on save
  - **Dependencies**: T031 (WikiLinkService)
  - **Complexity**: High (orchestrate multiple service calls)

- **T067** Trigger graph and hierarchy refresh after node save (invalidate React Query cache) in EditNodeDialog in `src/components/nodes/EditNodeDialog.tsx`
  - **Test Coverage**: Integration tests
  - **Critical**: Keep UI in sync
  - **Complexity**: Low (React Query invalidation)

#### 🟠 P1-L: Detail View (Parallel)
**Owner**: Developer B
**Duration**: 2-3 hours
**Can start**: After Wave 4 complete

- **T068** Create NodeDetailView component with markdown rendering and metadata in `src/components/nodes/NodeDetailView.tsx`
  - **Test Coverage**: E2E test T079
  - **Critical**: Main page view
  - **Dependencies**: MarkdownRenderer (T056-T057)
  - **Complexity**: Low (composition component)

**Wave 6 Output**:
- ✅ Node creation/editing with hierarchy
- ✅ Wiki-link processing on save
- ✅ Full CRUD integration
- ✅ E2E test T081 passing

---

### 🌊 Wave 7: Page Layouts (Days 7-8)
**Goal**: Create Next.js pages
**Parallel Work**: 2 pages can be built in parallel

#### 🔴 P0-F: Main Pages (Sequential - Different Files but interdependent)
**Owner**: Developer A
**Duration**: 3-4 hours each
**Can start**: After Wave 6 complete

- **T069** Create workspace page layout with hierarchy sidebar + graph tabs in `app/workspace/[slug]/page.tsx`
  - **Test Coverage**: E2E tests T079, T082
  - **Critical**: Main workspace view
  - **Components**: HierarchyNavigator, GraphVisualization
  - **Complexity**: Medium (layout with tabs)

- **T070** Create node detail page with NodeDetailView component in `app/workspace/[slug]/node/[id]/page.tsx`
  - **Test Coverage**: E2E tests T079, T080
  - **Critical**: Individual page view
  - **Components**: NodeDetailView
  - **Complexity**: Low (simple page layout)

- **T071** Add navigation handlers (wiki-link clicks, tree clicks, graph double-clicks) in `app/workspace/[slug]/node/[id]/page.tsx`
  - **Test Coverage**: E2E tests T079, T080
  - **Critical**: User navigation flow
  - **Complexity**: Low (event handlers)

**Wave 7 Output**:
- ✅ Functional workspace page
- ✅ Functional node detail page
- ✅ Navigation flow working
- ✅ E2E tests T079, T080 passing

---

### 🌊 Wave 8: Error Handling & Accessibility (Days 8-9)
**Goal**: Production-ready error states and a11y
**Parallel Work**: 6 tasks can run in parallel

#### 🟡 P2-A: Error Handling (Parallel - Different Files)
**Owner**: Developers A, B, C split 2 tasks each
**Duration**: 2-3 hours each
**Can start**: After Wave 7 complete

- **T072** Implement network retry logic (3 attempts) in API client in `src/services/api/apiClient.ts`
  - **Test Coverage**: E2E test T084
  - **Critical**: Reliability
  - **Complexity**: Low (axios interceptors)

- **T073** Add error boundary component for component crashes in `src/components/ErrorBoundary.tsx`
  - **Test Coverage**: E2E test T084
  - **Critical**: Graceful degradation
  - **Complexity**: Low (React error boundary)

- **T074** Add validation error display with field-level feedback in `src/components/nodes/EditNodeDialog.tsx`
  - **Test Coverage**: E2E test T084
  - **Critical**: UX
  - **Complexity**: Low (form validation)

- **T075** Add circular dependency error handling with cycle path display in `src/components/nodes/CreateNodeDialog.tsx`
  - **Test Coverage**: E2E test T084
  - **Critical**: Prevent invalid hierarchies
  - **Complexity**: Medium (parse backend error)

#### 🟡 P2-B: Accessibility (Parallel - Different Files)
**Owner**: Developers A, B, C
**Duration**: 1-2 hours each
**Can start**: After Wave 3, 5 complete

- **T076** Add ARIA labels (role="tree", aria-expanded) to TreeNode in `src/components/hierarchy/TreeNode.tsx`
  - **Test Coverage**: T042 (keyboard navigation tests)
  - **Critical**: Screen reader support
  - **Complexity**: Low (ARIA attributes)

- **T077** Add ARIA labels to graph nodes (role="button", aria-label) in `src/components/graph/nodes/ContextNode.tsx` and `RegularNode.tsx`
  - **Test Coverage**: Integration tests
  - **Critical**: Screen reader support
  - **Complexity**: Low

- **T078** Add focus indicators (2px outline) for keyboard navigation in global CSS (`globals.css`)
  - **Test Coverage**: T042
  - **Critical**: Keyboard navigation visibility
  - **Complexity**: Low (CSS)

**Wave 8 Output**:
- ✅ Production-ready error handling
- ✅ WCAG AA accessibility
- ✅ E2E test T084 passing

---

### 🌊 Wave 9: E2E Validation (Day 9)
**Goal**: Verify all scenarios pass
**Sequential Work**: Run and fix failing tests

#### 🟡 P2-C: E2E Test Execution
**Owner**: QA + All Developers
**Duration**: 4-8 hours
**Can start**: After Wave 8 complete

- **Action**: Run all E2E tests T079-T084
- **Process**:
  1. Run `npm run test:e2e`
  2. Fix any failing tests
  3. Verify all quickstart scenarios
  4. Manual exploratory testing

**Expected Status**:
- ✅ T079: Hierarchy navigation - PASSING
- ✅ T080: Wiki-link navigation - PASSING
- ✅ T081: Placeholder creation - PASSING
- ⚠️ T082: Graph filters - MAY NEED FIXES
- ⚠️ T083: Relationship preservation - MAY NEED FIXES
- ✅ T084: Error handling - PASSING

**Wave 9 Output**:
- ✅ All E2E tests passing
- ✅ Quickstart scenarios validated
- ✅ Feature complete

---

### 🌊 Wave 10: Performance & Polish (Days 10-11)
**Goal**: Optimize and document
**Parallel Work**: Can parallelize most tasks

#### 🟢 P3-A: Performance Optimization (Parallel)
**Owner**: Developers A, B, C
**Duration**: 2-3 hours each
**Can start**: After Wave 9 complete

- **T085** Add React.memo to TreeNode, WikiLink, ContextNode, RegularNode components
  - **Test Coverage**: Performance benchmarks
  - **Impact**: Reduce re-renders
  - **Complexity**: Low (wrap with React.memo)

- **T086** Add useMemo to buildHierarchyTree and buildGraphData calls in hooks
  - **Test Coverage**: Performance benchmarks
  - **Impact**: Avoid expensive recalculations
  - **Complexity**: Low (add useMemo)

- **T087** Implement lazy loading for MarkdownRenderer component (React.lazy)
  - **Test Coverage**: Performance benchmarks
  - **Impact**: Reduce initial bundle size
  - **Complexity**: Low (code splitting)

- **T088** Measure and optimize tree render time (< 2s for 150 nodes) using React DevTools Profiler
  - **Test Coverage**: Quickstart performance scenario
  - **Critical**: Performance requirement
  - **Complexity**: Medium (profiling + optimization)

- **T089** Measure and optimize graph render time (< 3s for 150 nodes) using React DevTools Profiler
  - **Test Coverage**: Quickstart performance scenario
  - **Critical**: Performance requirement
  - **Complexity**: Medium

#### 🟢 P3-B: Documentation & Cleanup (Parallel)
**Owner**: All Developers
**Duration**: 3-4 hours total
**Can start**: After Wave 9 complete

- **T090** Add JSDoc comments to all utility functions (wikilink-parser, hierarchy-utils, graph-utils)
  - **Impact**: Code maintainability
  - **Complexity**: Low

- **T091** Add component prop type documentation with TypeScript interfaces
  - **Impact**: Developer experience
  - **Complexity**: Low

- **T092** Update CLAUDE.md with new components, hooks, and services
  - **Impact**: Project documentation
  - **Complexity**: Low

- **T093** Remove console.logs and debug code from all files
  - **Impact**: Production cleanliness
  - **Complexity**: Low

- **T094** Execute quickstart.md validation manually and verify all scenarios pass
  - **Critical**: Final validation
  - **Complexity**: Low (manual testing)

**Wave 10 Output**:
- ✅ Performance goals met (<2s tree, <3s graph)
- ✅ Code documented
- ✅ Production-ready

---

## Critical Path Summary

**Absolute Dependencies** (Must complete in order):

1. **T024-T025** (wiki-link parser) → T031 (WikiLinkService) → T037 (useCreateWikiLinks) → T066 (save handler)
2. **T026** (hierarchy tree) → T038 (useHierarchyTree) → T050-T053 (TreeNode/Navigator)
3. **T027-T028** (graph utils) → T062-T063 (GraphVisualization)
4. **T029-T030** (services) → T034-T037 (React Query hooks)
5. **T032-T033** (navigation store) → T050-T053 (hierarchy), T061 (graph controls)
6. **T050-T053** (hierarchy) → T069 (workspace page)
7. **T054-T057** (markdown) → T068 (detail view) → T070 (detail page)
8. **T062-T063** (graph) → T069 (workspace page)
9. **T064-T068** (CRUD) → T069-T071 (pages)
10. **T069-T071** (pages) → T072-T078 (error/a11y) → T079-T084 (E2E) → T085-T094 (polish)

---

## Recommended Team Assignment

### 3-Developer Team (Optimal)

**Developer A - Hierarchy & State Expert**
- Wave 1: T024-T026 (utilities - 6h)
- Wave 2: T032-T033, T038 (state - 4h)
- Wave 3: T050-T053 (TreeNode/Navigator - 8h)
- Wave 7: T069-T071 (pages - 6h)
- Wave 8: T072, T076, T078 (error/a11y - 4h)
- Wave 10: T088, T090 (performance - 4h)
- **Total**: ~32 hours

**Developer B - Markdown & Graph Expert**
- Wave 1: T027-T028 (graph utils - 4h)
- Wave 2: T034-T037 (React Query - 4h)
- Wave 4: T054-T057 (markdown - 8h)
- Wave 5: T060, T062-T063 (graph edges/viz - 8h)
- Wave 6: T068 (detail view - 3h)
- Wave 8: T073, T077 (error/a11y - 3h)
- Wave 10: T089, T091 (performance - 4h)
- **Total**: ~34 hours

**Developer C - Services & Components Expert**
- Wave 1: T029-T031 (services - 6h)
- Wave 3: T049 (icons - 2h)
- Wave 4: T055 (WikiLink - 3h)
- Wave 5: T058-T059, T061 (graph nodes/controls - 6h)
- Wave 6: T064-T067 (CRUD dialogs - 10h)
- Wave 8: T074-T075 (error/a11y - 4h)
- Wave 10: T092-T094 (docs - 3h)
- **Total**: ~34 hours

**Total Estimated Effort**: 100 hours (~2.5 weeks with 3 developers)

---

## Single Developer Timeline

If implementing solo:

- **Week 1**: Waves 1-4 (Foundation → Markdown)
- **Week 2**: Waves 5-7 (Graph → Pages)
- **Week 3**: Waves 8-10 (Polish → Validation)

**Total Solo Effort**: 100 hours (~3 weeks)

---

## Risk Mitigation

### High-Risk Tasks (May Take Longer)

1. **T026 - buildHierarchyTree**: Recursive algorithm, test thoroughly
2. **T050-T051 - TreeNode**: Complex recursive component + keyboard nav
3. **T054 - remarkWikiLinks**: Remark plugin development requires AST knowledge
4. **T062 - GraphVisualization**: React Flow can be tricky to configure
5. **T066 - Save handler**: Orchestrates many services, high complexity

**Mitigation**: Allocate extra time buffer for these tasks

### Blockers to Watch

- **MSW (T002)**: Ensure working before starting services
- **TypeScript strict mode (T003)**: May reveal type issues during implementation
- **React Flow version**: Ensure compatibility with React 18

---

## Success Metrics

**Sprint 2 Status** (Current):
- ✅ All 93 tests passing (59 unit + 25 contract + 9 integration)
- ✅ MSW v2 operational with Node.js polyfills
- ✅ Service layer aligned with backend API contracts
- ✅ State management with optimistic updates
- ✅ Architecture review complete (A+ grade, 98/100)

**Final Implementation Goals** (Remaining):
- ⚪ All 6 E2E scenarios passing
- ⚪ Tree render < 2s with 150 nodes
- ⚪ Graph render < 3s with 150 nodes
- ⚪ Zero console errors/warnings
- ⚪ WCAG AA accessibility compliance
- ⚪ Lighthouse score > 90

---

## Next Steps

### Sprint 2 Retrospective ✅
**What went well:**
- ✅ MSW v2 setup completed with proper polyfills
- ✅ API contracts aligned with backend specification
- ✅ All 93 tests passing (100% of foundation tests)
- ✅ TDD approach prevented rework and caught issues early

**Lessons learned:**
- MSW v2 requires async jest.config.js override for transformIgnorePatterns
- Contract tests should be run separately from global MSW server
- Function signatures must match test expectations exactly

### Sprint 3 Kickoff 🚀
**Ready to start:**
1. ✅ **Foundation complete** - Wave 1 & Wave 2 done (T024-T038)
2. 🟡 **Next: Wave 3** - Hierarchy UI components (T049-T053)
3. 🟡 **Next: Wave 4** - Markdown rendering (T054-T057)
4. ⚪ **Future: Wave 5** - Graph visualization (T058-T063)

**Developer assignments for Sprint 3:**
- Developer A: TreeNode + HierarchyNavigator (T050-T053)
- Developer B: Markdown + WikiLink components (T054-T057)
- Developer C: NodeIcon + support components (T049, T055)

**All blockers removed** - Ready for parallel component development!

---

**Status: Sprint 2 COMPLETE** ✅
**Next: Sprint 3 - Component Development** 🎨
