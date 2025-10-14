# Implementation Plan: Obsidian-like Page Hierarchy and Graph Navigation

**Branch**: `004-i-need-to` | **Date**: 2025-10-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-i-need-to/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path ✅
2. Fill Technical Context (scan for NEEDS CLARIFICATION) ✅
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api) ✅
   → Set Structure Decision based on project type ✅
3. Fill the Constitution Check section based on the content of the constitution document. ✅
4. Evaluate Constitution Check section below ✅
   → No violations detected
   → Update Progress Tracking: Initial Constitution Check ✅
5. Execute Phase 0 → research.md ✅
   → No NEEDS CLARIFICATION remain for critical features
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md ✅
7. Re-evaluate Constitution Check section ✅
   → No new violations
   → Update Progress Tracking: Post-Design Constitution Check ✅
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md) ✅
9. STOP - Ready for /tasks command ✅
```

**IMPORTANT**: The /plan command STOPS at step 8. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Implement Obsidian-like features in Mujarrad frontend: hierarchical page navigation with expandable tree, markdown rendering with wiki-link support, automatic placeholder page creation, and enhanced graph visualization with bidirectional edge detection and node-type filtering. All features integrate with existing backend APIs (no API changes needed), use existing authentication and space isolation, and follow constitutional Clean Architecture principles with Next.js 14, Zustand, React Query, and React Flow.

**Technical Approach** (from research.md):
- **Markdown**: react-markdown + custom remark plugin for `[[wiki-links]]`
- **Tree Navigation**: Custom recursive component with collapsible state
- **Graph**: Enhance React Flow with custom node types (CONTEXT/REGULAR) and bidirectional edge detection
- **State**: Zustand for UI state, React Query for server data
- **Parsing**: Client-side regex extraction of wiki-links on save
- **No Backend Changes**: Uses existing `/api/nodes` and `/api/attributes` endpoints

## Technical Context
**Language/Version**: TypeScript 5.x, React 18+, Next.js 14+
**Primary Dependencies**:
  - react-markdown + remark-gfm + remark-wiki-link (custom plugin)
  - React Flow (graph visualization)
  - Zustand (global state)
  - TanStack Query / React Query (server state)
  - Zod (validation)
  - Tailwind CSS (styling)
**Storage**: PostgreSQL (via backend API)
**Testing**: Jest + React Testing Library (unit/integration), Playwright (E2E)
**Target Platform**: Web (Next.js 14 SPA mode), Chrome/Firefox/Safari
**Project Type**: Web (frontend + backend, repo is frontend only)
**Performance Goals**:
  - Tree render < 2s with 150 nodes
  - Graph render < 3s with 150 nodes
  - 60fps pan/zoom
  - Lighthouse score > 90
**Constraints**:
  - No backend API changes
  - Must use existing node/attribute endpoints
  - Constitutional stack (Next.js 14, React Flow, Zustand, React Query)
  - WCAG AA accessibility
  - Bundle size < 500KB initial load
**Scale/Scope**:
  - 100-150 nodes per space
  - 5-10 hierarchy levels deep
  - 10-20 wiki-links per page
  - Support 100+ concurrent users

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Pre-Research)

**I. Node Supremacy** ✅
- PASS: All content represented as nodes (REGULAR and CONTEXT types)
- PASS: No hard-coded organizational structures
- PASS: Structure emerges from relationships (contains, references attributes)

**II. Relationship-Driven Structure & Edge-Attribute Mapping** ✅
- PASS: Frontend edges map to backend attributes
- PASS: Contains relationships for hierarchy (acyclic)
- PASS: References relationships for wiki-links (cycles allowed)
- PASS: Frontend uses `/api/nodes/{id}/attributes` endpoints
- PASS: Edge styling reflects `attribute_key` value

**III. Abstraction Immutability** ✅
- PASS: Not applicable (feature doesn't modify workflow logic)

**IV. Backend Architecture Alignment** ✅
- PASS: Uses documented REST endpoints
- PASS: DTOs match backend contracts (Node, Attribute, Space)
- PASS: JWT Bearer authentication
- PASS: RFC 7807 error handling planned
- PASS: No pagination issues (large size param for full dataset)
- PASS: Optimistic locking with version fields

**V. Clean Architecture in React** ✅
- PASS: Service layer centralized (`/src/services/api`)
- PASS: State management: Zustand (global) + React Query (server)
- PASS: TypeScript interfaces match backend DTOs
- PASS: Components free of business logic

**VI. Type Safety and Validation** ✅
- PASS: TypeScript strict mode
- PASS: Backend response types defined (Node, Attribute, etc.)
- PASS: Zod schemas for forms (node creation/edit)
- PASS: No `any` types in plan

**VII. Graph Visualization First** ✅
- PASS: React Flow as primary visualization
- PASS: Custom node types (CONTEXT/REGULAR) with distinct styling
- PASS: Edge styling based on attribute_key
- PASS: Cycle-aware layout algorithms
- PASS: Edges retrieved from attributes API

**VIII. Space Isolation** ✅
- PASS: All operations scoped to space
- PASS: URLs follow `/space/{slug}/node/{id}` pattern
- PASS: Search space-scoped

**IX. Version Awareness** ✅
- PASS: Node updates create versions (backend handles)
- PASS: Version field used for optimistic locking
- PASS: Version history access (future enhancement)

**X. Performance and Optimization** ✅
- PASS: Route-based code splitting (Next.js built-in)
- PASS: React Query caching with staleTime
- PASS: Lazy loading for markdown editor
- PASS: Debouncing for search (300ms)
- PASS: Performance goals documented (Lighthouse > 90)

**Technology Stack Requirements** ✅
- PASS: Next.js 14+ with App Router (LOCKED)
- PASS: React 18+ with TypeScript (LOCKED)
- PASS: Zustand + React Query (LOCKED)
- PASS: Tailwind CSS (LOCKED)
- PASS: React Hook Form + Zod (LOCKED)
- PASS: Axios with interceptors (LOCKED)
- PASS: React Flow (LOCKED)
- PASS: Radix UI primitives (LOCKED)
- PASS: Jest + React Testing Library + Playwright (LOCKED)

**Data Migration and Sample Data** ✅
- PASS: Wiki-link parsing creates `references` attributes
- PASS: `attribute_key` = "wiki-link" for wiki-link relationships
- PASS: Placeholder page creation follows node creation API
- PASS: Cycle detection for CONTEXT nodes (backend validates)

### Post-Design Check (After Phase 1)

**Re-evaluated after contracts, data-model.md, quickstart.md**

All constitutional requirements remain satisfied. No violations introduced during design phase.

**Additional Validations:**
- ✅ API contracts align with backend Swagger/OpenAPI
- ✅ Data model interfaces match backend DTOs exactly
- ✅ Error handling follows RFC 7807 Problem Details
- ✅ State management follows Zustand patterns
- ✅ React Query hooks properly structured
- ✅ Accessibility requirements (WCAG AA) planned
- ✅ Performance benchmarks defined
- ✅ Quickstart validation covers all user stories

---

## Project Structure

### Documentation (this feature)
```
specs/004-i-need-to/
├── plan.md              # This file (/plan command output) ✅
├── research.md          # Phase 0 output (/plan command) ✅
├── data-model.md        # Phase 1 output (/plan command) ✅
├── quickstart.md        # Phase 1 output (/plan command) ✅
├── contracts/           # Phase 1 output (/plan command) ✅
│   └── api-contracts.md
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Frontend (Next.js 14 App Router)
app/
├── space/
│   └── [slug]/
│       ├── page.tsx                    # Space page with hierarchy + graph
│       ├── node/
│       │   └── [id]/
│       │       └── page.tsx            # Node detail page
│       └── layout.tsx

src/
├── components/
│   ├── hierarchy/
│   │   ├── HierarchyNavigator.tsx      # Main tree component
│   │   ├── TreeNode.tsx                # Recursive tree node
│   │   └── NodeIcon.tsx                # CONTEXT/REGULAR icons
│   ├── markdown/
│   │   ├── MarkdownRenderer.tsx        # react-markdown wrapper
│   │   ├── WikiLink.tsx                # Custom wiki-link component
│   │   └── remarkWikiLinks.ts          # Remark plugin
│   ├── graph/
│   │   ├── GraphVisualization.tsx      # React Flow wrapper
│   │   ├── nodes/
│   │   │   ├── ContextNode.tsx         # Custom CONTEXT node type
│   │   │   └── RegularNode.tsx         # Custom REGULAR node type
│   │   ├── edges/
│   │   │   └── BidirectionalEdge.tsx   # Custom edge for A↔B
│   │   └── GraphControls.tsx           # Toggle filters
│   └── nodes/
│       ├── CreateNodeDialog.tsx        # Existing (updated for hierarchy)
│       ├── EditNodeDialog.tsx          # Existing (updated for wiki-links)
│       └── NodeDetailView.tsx          # NEW - markdown preview
├── services/
│   └── api/
│       ├── node.service.ts             # Enhanced with search
│       ├── attribute.service.ts        # Existing (unchanged)
│       └── wikilink.service.ts         # NEW - wiki-link parsing/resolution
├── stores/
│   └── navigationStore.ts              # NEW - Zustand store for UI state
├── hooks/
│   ├── api/
│   │   ├── useSpaceNodes.ts        # React Query hook
│   │   ├── useNode.ts                  # React Query hook
│   │   └── useCreateWikiLinks.ts       # Mutation hook
│   └── useHierarchyTree.ts             # Transform nodes to tree
├── lib/
│   ├── wikilink-parser.ts              # Regex parsing logic
│   └── graph-utils.ts                  # Bidirectional edge detection
└── types/
    ├── hierarchy.ts                    # TreeNode, HierarchyTree types
    ├── wikilink.ts                     # WikiLink, WikiLinkResolution types
    └── graph.ts                        # GraphNode, GraphEdge, GraphViewMode types

tests/
├── contracts/
│   ├── node.contract.test.ts           # Verify Node schema
│   └── attribute.contract.test.ts      # Verify Attribute schema
├── integration/
│   ├── hierarchy-navigation.test.tsx   # Tree expand/collapse/navigate
│   ├── markdown-rendering.test.tsx     # Wiki-link rendering
│   └── graph-visualization.test.tsx    # Graph filters and interaction
├── unit/
│   ├── wikilink-parser.test.ts         # Regex parsing logic
│   ├── graph-utils.test.ts             # Bidirectional detection
│   └── hierarchy-tree.test.ts          # Tree construction
└── e2e/
    └── obsidian-features.spec.ts       # Playwright end-to-end tests
```

**Structure Decision**: Web application with Next.js 14 App Router. Frontend repo only (backend separate). File-based routing with nested dynamic routes for space and node navigation. Component library follows atomic design (components → services → stores → types). Test organization mirrors source structure (unit → integration → contracts → e2e).

---

## Phase 0: Outline & Research

**Output**: research.md ✅

### Completed Research Areas

1. **Markdown Rendering**: Decided on react-markdown + remark-gfm + custom wiki-link plugin
2. **Hierarchical Tree**: Custom recursive component (no external library needed)
3. **Graph Visualization**: Enhance React Flow with custom nodes and bidirectional edge detection
4. **Wiki-link Parsing**: Client-side regex on save, case-insensitive target resolution
5. **State Management**: Zustand for UI state, React Query for server state
6. **Performance**: Virtual scrolling, lazy loading, debouncing
7. **Testing**: Jest + RTL + Playwright
8. **Accessibility**: WCAG AA, keyboard navigation, ARIA labels
9. **Error Handling**: Network retries, validation feedback, circular dependency warnings
10. **Deployment**: Feature flag for incremental rollout

**All critical unknowns resolved**. Lower-priority clarifications (image handling, syntax highlighting, backlinks, etc.) deferred to implementation phase.

---

## Phase 1: Design & Contracts

**Prerequisites**: research.md complete ✅

### Completed Outputs

1. **data-model.md** ✅
   - Entity interfaces (Node, Attribute, Space)
   - Frontend models (TreeNode, WikiLink, GraphNode, GraphEdge)
   - State management (Zustand store, React Query hooks)
   - Validation schemas (Zod)
   - Transformation algorithms (buildHierarchyTree, detectBidirectionalEdges)

2. **contracts/api-contracts.md** ✅
   - All existing endpoints documented
   - Request/response schemas
   - Error responses (RFC 7807)
   - Service layer structure
   - Contract test strategy

3. **quickstart.md** ✅
   - 7 end-to-end test scenarios
   - Acceptance criteria validation
   - Performance benchmarks
   - Accessibility verification
   - Complete user flow walkthrough

4. **CLAUDE.md** ✅ (updated via update-agent-context.sh)
   - Feature context added
   - Tech stack documented
   - Recent changes logged

### Contract Tests (To Be Generated)

**Contract test files will validate:**
- Node API schema matches `Node` interface
- Attribute API schema matches `Attribute` interface
- Error responses follow RFC 7807 structure
- Authentication headers required
- Validation rules enforced

**Test files to create** (during /tasks phase):
- `tests/contracts/node.contract.test.ts`
- `tests/contracts/attribute.contract.test.ts`
- `tests/contracts/space.contract.test.ts`

**Status**: Tests will fail until implementation (expected behavior for TDD)

---

## Phase 2: Task Planning Approach

*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:

The /tasks command will load `.specify/templates/tasks-template.md` and generate tasks from Phase 1 design documents (contracts, data model, quickstart).

**Task Categories**:

1. **Setup & Configuration** (2-3 tasks)
   - Install dependencies (react-markdown, remark plugins)
   - Configure TypeScript types
   - Set up test environment (MSW for API mocking)

2. **Wiki-link Parsing** (5-7 tasks)
   - Implement regex parser [P]
   - Create remark plugin for wiki-links [P]
   - Build target resolution logic
   - Implement placeholder page creation
   - Write unit tests for parser
   - Write contract tests for placeholder API calls

3. **Data Layer** (6-8 tasks)
   - Define TypeScript interfaces (Node, Attribute, etc.) [P]
   - Create Zustand navigation store [P]
   - Implement React Query hooks (useSpaceNodes, useNode, etc.) [P]
   - Build tree transformation algorithm
   - Build graph transformation algorithm
   - Build bidirectional edge detection
   - Write unit tests for algorithms

4. **Hierarchy Navigation** (8-10 tasks)
   - Create TreeNode component (recursive)
   - Create HierarchyNavigator container
   - Implement expand/collapse state
   - Add node icons (CONTEXT/REGULAR)
   - Integrate with navigation store
   - Add keyboard navigation (arrow keys)
   - Write integration tests
   - Write accessibility tests

5. **Markdown Rendering** (6-8 tasks)
   - Create MarkdownRenderer component
   - Create WikiLink component
   - Integrate remark-wiki-links plugin
   - Implement click handler for navigation
   - Add syntax highlighting (code blocks)
   - Write integration tests
   - Test wiki-link edge cases

6. **Graph Visualization** (10-12 tasks)
   - Create custom ContextNode type [P]
   - Create custom RegularNode type [P]
   - Create BidirectionalEdge component
   - Implement graph view mode filter
   - Add graph controls UI
   - Integrate bidirectional detection
   - Add pan/zoom performance optimization
   - Write integration tests
   - Test with large datasets (150+ nodes)

7. **Node CRUD Integration** (5-7 tasks)
   - Update CreateNodeDialog (hierarchy parent selection)
   - Update EditNodeDialog (markdown editor with preview)
   - Create NodeDetailView component
   - Implement save handler with wiki-link parsing
   - Trigger graph refresh on save
   - Write integration tests
   - Test optimistic locking (version conflicts)

8. **Error Handling** (3-4 tasks)
   - Implement network retry logic [P]
   - Add validation error display
   - Handle circular dependency errors
   - Create error boundary components

9. **E2E Testing** (3-4 tasks)
   - Write Playwright tests for all quickstart scenarios
   - Test full user flow (login → navigate → edit → graph)
   - Performance benchmarks (tree load, graph render)
   - Accessibility audit (keyboard, screen reader)

10. **Documentation & Cleanup** (2-3 tasks)
    - Update component documentation
    - Add inline code comments for complex algorithms
    - Clean up console.logs
    - Final code review

**Ordering Strategy**:
- **TDD Order**: Tests before implementation
- **Dependency Order**:
  - Setup → Data Layer → Utilities (parser, algorithms)
  - Components: Leaf components first (TreeNode, WikiLink) → Containers (HierarchyNavigator, Graph)
  - Integration: After all components built
  - E2E: Final validation
- **Parallelization**: Mark [P] for tasks that can run in parallel (independent files, no shared state)

**Estimated Task Count**: 55-70 numbered, dependency-ordered tasks

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

---

## Phase 3+: Future Implementation

*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md from template + plan artifacts)

**Phase 4**: Implementation (execute tasks.md following TDD approach, constitutional principles, and accessibility guidelines)

**Phase 5**: Validation (run all tests, execute quickstart.md manually, performance validation, Lighthouse audit)

---

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations detected**. All design decisions align with constitutional principles.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       | N/A        | N/A                                 |

---

## Progress Tracking

*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning approach described (/plan command)
- [ ] Phase 3: Tasks generated (/tasks command) ← **NEXT STEP**
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All critical NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)
- [x] All Phase 0-1 artifacts generated
- [x] Ready for /tasks command

---

**Next Command**: `/tasks` - Generate tasks.md from plan artifacts

---

*Based on Constitution v1.2.0 - See `.specify/memory/constitution.md`*
