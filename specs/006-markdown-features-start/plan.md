
# Implementation Plan: Markdown Rendering and Editing

**Branch**: `006-markdown-features-start` | **Date**: 2025-10-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-markdown-features-start/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code, or `AGENTS.md` for all other agents).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
This feature enables markdown rendering and editing across all content types in Mujarrad (node descriptions, space documentation, comments/annotations, and standalone notes). Users can write content using markdown syntax with a tabbed editor (Edit/Preview tabs) and view formatted output without seeing raw markdown. The implementation uses react-markdown (60KB) for rendering and @uiw/react-md-editor for editing, supporting full GitHub Flavored Markdown including code blocks with syntax highlighting, tables, images (external URLs only), and task lists. All content is stored as plain markdown text in existing entity fields without schema changes, with client-side rendering on demand.

## Technical Context
**Language/Version**: TypeScript 5.3.3, React 18.2.0, Next.js 14.1.0
**Primary Dependencies**:
- react-markdown (^9.0.0) - Markdown renderer (60KB)
- @uiw/react-md-editor (^4.0.0) - Markdown editor with tabbed interface
- remark-gfm (^4.0.0) - GitHub Flavored Markdown support
- rehype-highlight (^7.0.0) - Syntax highlighting for code blocks
- @tanstack/react-query 5.17.19 - Server state management
- zustand 4.4.7 - Client state management
- react-hook-form 7.49.3 + zod 3.22.4 - Form handling and validation
- @tailwindcss/typography - Prose styling for rendered markdown

**Storage**: Existing entity fields (Node.description, Space.documentation, Comment.text, Note.content) - no schema changes, plain markdown text stored in backend PostgreSQL via REST API
**Testing**: Jest + React Testing Library (component tests), Playwright (E2E tests), MSW (API mocking)
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: Web application (Next.js 14 frontend + Spring Boot backend API)
**Performance Goals**:
- Markdown rendering < 100ms for documents up to 10,000 characters
- Editor load time < 500ms
- Bundle size impact < 150KB total (60KB react-markdown + 90KB editor)
- Lighthouse performance score > 90

**Constraints**:
- No backend schema changes allowed (use existing text fields)
- Client-side rendering only (no server-side markdown processing)
- No image upload support in MVP (external URLs only)
- Must work within existing Next.js App Router architecture
- Must align with constitution's Clean Architecture principles

**Scale/Scope**:
- Support markdown in 4 content types (nodes, spaces, comments, notes)
- Handle documents up to 50,000 characters
- Support 8 programming languages for syntax highlighting (JS, TS, Python, Java, HTML, CSS, JSON, Markdown)
- Integrate with existing 5+ UI contexts (CreateNodeDialog, EditNodeDialog, SpaceSettings, CommentForm, NoteEditor)

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Node Supremacy** | ✅ PASS | Markdown content stored in existing Node/Space/Comment fields. No new entities or schemas. |
| **II. Relationship-Driven Structure** | ✅ PASS | No changes to relationship/edge system. Markdown is purely content formatting. |
| **III. Abstraction Immutability** | ✅ PASS | No workflow logic changes. Purely UI/content formatting feature. |
| **IV. Backend Architecture Alignment** | ✅ PASS | Uses existing API endpoints, no backend changes. DTOs unchanged. |
| **V. Clean Architecture in React** | ✅ PASS | Components separated from logic. Services in /services, UI in /components. |
| **VI. Type Safety and Validation** | ✅ PASS | TypeScript interfaces for markdown props, Zod validation for content length. |
| **VII. Graph Visualization First** | ✅ PASS | Markdown rendering in node detail view, doesn't affect graph visualization. |
| **VIII. Space Isolation** | ✅ PASS | Markdown content scoped to space via existing entity scoping. |
| **IX. Version Awareness** | ✅ PASS | Version control handled by backend for all content including markdown. |
| **X. Performance and Optimization** | ✅ PASS | Lazy load editor component, bundle < 150KB, React Query caching. |

### Technology Stack Compliance

| Requirement | Status | Notes |
|-------------|--------|-------|
| **Next.js 14+ App Router** | ✅ PASS | Working within existing Next.js 14.1.0 architecture |
| **React 18+ TypeScript** | ✅ PASS | Using React 18.2.0 with TypeScript 5.3.3 |
| **Zustand + React Query** | ✅ PASS | Using existing state management, no new stores needed |
| **Tailwind CSS** | ✅ PASS | Using @tailwindcss/typography for markdown prose styling |
| **React Hook Form + Zod** | ✅ PASS | Existing form handling, may add content length validation |
| **Axios** | ✅ PASS | Using existing API client, no changes |
| **Jest + Playwright** | ✅ PASS | Tests using existing test infrastructure |
| **Radix UI Primitives** | ✅ PASS | Editor tabs may use Radix Tabs component |

### Quality Standards Compliance

| Standard | Target | Approach |
|----------|--------|----------|
| **Test Coverage** | 80% logic, 60% overall | Component tests for MarkdownRenderer, MarkdownEditor. Integration tests for dialogs. |
| **Type Coverage** | 100% | TypeScript interfaces for all props, no `any` types |
| **Bundle Size** | < 200KB main bundle | Dynamic import for editor (~90KB), renderer included in main (~60KB) |
| **Security** | XSS prevention | Use react-markdown's built-in XSS protection, no raw HTML rendering |
| **Accessibility** | WCAG AA | Semantic HTML in rendered markdown, keyboard navigation in editor |
| **CSRF Protection** | Existing | Uses existing form submission with auth tokens |

### Initial Gate Status: ✅ **PASS**

**Justification**: This feature is purely additive UI enhancement with no architectural changes. It:
- Uses existing entity fields (no schema changes)
- Integrates with existing component structure
- Follows Clean Architecture (components → services → API)
- Respects LOCKED STACK POLICY (no framework changes)
- Maintains all constitutional principles

**No Complexity Deviations**: All constitutional requirements met without exceptions.

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (Frontend Repository)
```
src/
├── components/
│   ├── markdown/
│   │   ├── MarkdownRenderer.tsx       # NEW: Displays formatted markdown
│   │   ├── MarkdownEditor.tsx         # NEW: Tabbed editor (Edit/Preview)
│   │   └── MarkdownEditor.module.css  # NEW: Editor-specific styles
│   ├── nodes/
│   │   ├── CreateNodeDialog.tsx       # MODIFIED: Add markdown editor
│   │   ├── EditNodeDialog.tsx         # MODIFIED: Add markdown editor
│   │   └── NodeDetail.tsx             # MODIFIED: Render markdown content
│   ├── spaces/
│   │   └── SpaceSettings.tsx      # MODIFIED: Add markdown editor for docs
│   └── ui/
│       └── tabs.tsx                   # EXISTING: Radix UI Tabs (may use)
├── lib/
│   ├── markdown/
│   │   ├── config.ts                  # NEW: react-markdown configuration
│   │   └── sanitize.ts                # NEW: XSS protection utilities
│   └── utils.ts                       # EXISTING: General utilities
├── types/
│   └── markdown.ts                    # NEW: Markdown component prop types
└── styles/
    └── markdown.css                   # NEW: Global markdown prose styles

tests/
├── components/
│   └── markdown/
│       ├── MarkdownRenderer.test.tsx  # NEW: Renderer unit tests
│       └── MarkdownEditor.test.tsx    # NEW: Editor unit tests
└── e2e/
    └── markdown-integration.spec.ts   # NEW: End-to-end markdown tests
```

**Structure Decision**: Web application structure (Next.js frontend + Spring Boot backend). This is a **frontend-only** feature. Backend remains unchanged as we're using existing entity fields. All new code goes in the `src/` directory following the existing Next.js 14 App Router structure. New markdown components in `src/components/markdown/`, configuration in `src/lib/markdown/`, with corresponding test files in `tests/`.

## Phase 0: Outline & Research

**Status**: ✅ Complete

### Research Conducted

All technical unknowns were researched and resolved:

1. **Markdown Rendering Library**: react-markdown v9.0.0
   - Rationale: Lightweight (60KB), secure, plugin-based
   - Alternatives: marked, markdown-it, showdown

2. **Markdown Editor**: @uiw/react-md-editor v4.0.0
   - Rationale: Built-in tabbed interface, ~90KB, React-native
   - Alternatives: MDXEditor, BlockNote, Milkdown, Toast UI, Lexical

3. **GFM Support**: remark-gfm v4.0.0
   - Enables tables, task lists, strikethrough, autolinks

4. **Syntax Highlighting**: rehype-highlight v7.0.0 + highlight.js
   - Supports 8 languages (JS, TS, Python, Java, HTML, CSS, JSON, MD)
   - ~40KB for 8 languages

5. **Styling**: @tailwindcss/typography v0.5.0
   - Prose classes with dark mode support

6. **XSS Protection**: react-markdown's built-in sanitization
   - No raw HTML parsing, safe by default

7. **Performance**: Dynamic import for editor, React.memo for renderer
   - Total bundle: 225KB (150KB initial + 75KB lazy)

**Output**: [research.md](./research.md) ✅ Created

### Dependencies Identified

```json
{
  "dependencies": {
    "react-markdown": "^9.0.0",
    "@uiw/react-md-editor": "^4.0.0",
    "remark-gfm": "^4.0.0",
    "rehype-highlight": "^7.0.0",
    "highlight.js": "^11.9.0"
  }
}
```

### No NEEDS CLARIFICATION Remaining

All unknowns from Technical Context resolved through research.

## Phase 1: Design & Contracts

**Status**: ✅ Complete

### Deliverables Created

1. **data-model.md** ✅
   - Documented existing entities (Node, Space, Comment, Note)
   - Defined frontend-only interfaces (MarkdownRendererProps, MarkdownEditorProps)
   - Validation schemas (Zod)
   - No backend changes confirmed

2. **contracts/markdown-components.contract.md** ✅
   - Component contracts (MarkdownRenderer, MarkdownEditor)
   - Integration contracts (CreateNodeDialog, EditNodeDialog, NodeDetail)
   - Performance contracts (bundle size, render time)
   - Accessibility contracts (keyboard nav, ARIA)
   - **34 test cases defined**

3. **quickstart.md** ✅
   - 10 end-to-end validation scenarios
   - Acceptance criteria (must pass, should pass, nice to have)
   - Troubleshooting guide
   - Success metrics defined

4. **CLAUDE.md Updated** ✅
   - Ran `.specify/scripts/bash/update-agent-context.sh claude`
   - Added TypeScript 5.3.3, React 18.2.0, Next.js 14.1.0
   - Added database context (existing fields, no schema changes)
   - Added recent changes for 006-markdown-features-start

### Phase 1 Outputs Summary

- ✅ **Data Model**: 4 existing entities + 4 frontend interfaces
- ✅ **Contracts**: 34 test cases across 7 categories
- ✅ **Quickstart**: 10 scenarios, ~20 minutes validation time
- ✅ **Agent Context**: CLAUDE.md updated with new tech stack

### Constitution Re-Check

All principles still compliant:
- ✅ No new entities or schema changes
- ✅ Clean Architecture maintained
- ✅ Type safety enforced
- ✅ Performance targets defined
- ✅ Accessibility standards included

**No new violations** - design approved for implementation.

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

### Task Generation Strategy

The `/tasks` command will generate tasks from Phase 1 design artifacts:

#### 1. Setup Tasks (Dependencies & Configuration)
- Install npm packages (react-markdown, @uiw/react-md-editor, etc.)
- Configure Tailwind with @tailwindcss/typography plugin
- Setup highlight.js theme imports

#### 2. Type Definition Tasks [P]
- Create `src/types/markdown.ts` with component interfaces
- Create validation schemas in `src/lib/validations/markdown.ts`

#### 3. Core Component Tasks (TDD Order)
Each component follows: Test → Component → Integration

**MarkdownRenderer**:
- Write MarkdownRenderer tests (11 test cases from contract)
- Implement MarkdownRenderer component
- Create markdown configuration in `src/lib/markdown/config.ts`
- Create sanitization utilities in `src/lib/markdown/sanitize.ts`

**MarkdownEditor**:
- Write MarkdownEditor tests (11 test cases from contract)
- Implement MarkdownEditor component (dynamic import wrapper)
- Add character counter logic
- Add tab switching logic

#### 4. Integration Tasks (Modify Existing Components)
Each modification: Test → Implementation

- **CreateNodeDialog**:
  - Write integration tests (2 test cases)
  - Replace textarea with MarkdownEditor
  - Add content length validation

- **EditNodeDialog**:
  - Write integration tests (2 test cases)
  - Replace textarea with MarkdownEditor
  - Test with existing content

- **NodeDetail**:
  - Write integration tests (3 test cases)
  - Wrap content in MarkdownRenderer
  - Apply prose styling

- **SpaceSettings** (if applicable):
  - Add markdown editor for documentation field
  - Test rendering

#### 5. Styling Tasks [P]
- Create global markdown styles (`src/styles/markdown.css`)
- Add prose customizations for Mujarrad theme
- Configure dark mode support

#### 6. End-to-End Testing Tasks
- Write Playwright tests for quickstart scenarios
- Create test fixtures with sample markdown
- Test XSS protection

#### 7. Performance Optimization Tasks [P]
- Implement dynamic import for MarkdownEditor
- Add React.memo to MarkdownRenderer
- Verify bundle size targets

#### 8. Documentation & Finalization
- Update component documentation
- Create usage examples
- Run all tests and fix any failures

### Ordering Strategy

**Dependencies**:
1. Setup (1-3) → Must run first
2. Types (4-5) → Required by components [P]
3. Core Components (6-13) → Can work in parallel after types
4. Integration (14-20) → Depends on core components
5. Styling (21-22) → Can run in parallel with components [P]
6. E2E Tests (23-24) → After integration complete
7. Performance (25-27) → After components work [P]
8. Finalization (28-30) → After all tests pass

**Parallel Execution** [P]:
- Type definitions can be written in parallel
- MarkdownRenderer and MarkdownEditor can be built in parallel
- Styling tasks don't block component work
- Performance optimizations can happen in parallel

### Estimated Task Breakdown

| Category | Tasks | Parallel? |
|----------|-------|-----------|
| Setup | 3 | No |
| Types | 2 | Yes [P] |
| MarkdownRenderer | 4 | Partial |
| MarkdownEditor | 4 | Partial |
| Integration | 7 | Partial |
| Styling | 2 | Yes [P] |
| E2E Tests | 2 | Partial |
| Performance | 3 | Yes [P] |
| Finalization | 3 | No |
| **Total** | **30 tasks** | ~40% parallelizable |

### Expected Tasks.md Format

```markdown
# Tasks: Markdown Feature Implementation

## Phase 0: Setup (Tasks 1-3)
1. [P] Install markdown dependencies
2. [P] Configure Tailwind typography plugin
3. [P] Setup highlight.js themes

## Phase 1: Foundation (Tasks 4-5)
4. [P] Create TypeScript interfaces
5. [P] Create Zod validation schemas

## Phase 2: Core Components (Tasks 6-13)
6. Write MarkdownRenderer tests
7. Implement MarkdownRenderer
8. [P] Create markdown config utilities
9. [P] Create sanitization utilities
10. Write MarkdownEditor tests
11. Implement MarkdownEditor wrapper
12. [P] Add character counter logic
13. [P] Add tab switching logic

## Phase 3: Integration (Tasks 14-20)
14. Write CreateNodeDialog tests
15. Modify CreateNodeDialog (add editor)
16. Write EditNodeDialog tests
17. Modify EditNodeDialog (add editor)
18. Write NodeDetail tests
19. Modify NodeDetail (add renderer)
20. [P] Modify SpaceSettings (if needed)

## Phase 4: Polish (Tasks 21-27)
21. [P] Create global markdown styles
22. [P] Configure dark mode prose
23. Write E2E tests (Playwright)
24. Create test fixtures
25. [P] Dynamic import optimization
26. [P] Memoization optimization
27. [P] Verify bundle size

## Phase 5: Validation (Tasks 28-30)
28. Run all tests and fix failures
29. Update component documentation
30. Verify quickstart scenarios

**Total**: 30 tasks | **Estimated Time**: 16-20 hours
```

### Success Criteria for Tasks Phase

- ✅ All 34 test cases from contracts passing
- ✅ 10 quickstart scenarios validated
- ✅ Bundle size < 150KB
- ✅ TypeScript compiles with no errors
- ✅ Lighthouse score > 90
- ✅ Zero XSS vulnerabilities

**IMPORTANT**: This phase is executed by the `/tasks` command, NOT by `/plan`

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) ✅
- [x] Phase 1: Design complete (/plan command) ✅
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅
- [x] Phase 3: Tasks generated (/tasks command) ✅
- [ ] Phase 4: Implementation complete - NEXT STEP
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
- [x] All NEEDS CLARIFICATION resolved ✅
- [x] Complexity deviations documented: NONE ✅

**Artifacts Generated**:
- [x] plan.md (this file) ✅
- [x] research.md ✅
- [x] data-model.md ✅
- [x] contracts/markdown-components.contract.md ✅
- [x] quickstart.md ✅
- [x] CLAUDE.md updated ✅
- [x] tasks.md ✅

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
