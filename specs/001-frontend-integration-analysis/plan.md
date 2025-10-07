# Implementation Plan: Backend-Integrated Knowledge Graph Frontend

**Branch**: `001-frontend-integration-analysis` | **Date**: 2025-10-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-frontend-integration-analysis/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✓ Loaded spec.md with 55 functional requirements, all clarified
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✓ All clarifications resolved in spec iteration 2
   → Detect Project Type: Web application (frontend + backend)
   → Set Structure Decision: Frontend SPA with backend API integration
3. Fill the Constitution Check section
   → ✓ Evaluated against constitution v1.1.0 (10 principles)
   → Update Progress Tracking: Initial Constitution Check
4. Evaluate Constitution Check section
   → ✓ No violations - aligned with all constitutional principles
   → Update Progress Tracking: Initial Constitution Check PASS
5. Execute Phase 0 → research.md
   → ✓ Tech stack already defined in constitution
   → ✓ No NEEDS CLARIFICATION remain
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
   → ✓ Generated all Phase 1 artifacts
7. Re-evaluate Constitution Check section
   → ✓ Design aligns with constitutional principles
   → Update Progress Tracking: Post-Design Constitution Check PASS
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
   → ✓ Task planning strategy documented
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 9. Phase 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Build a complete frontend React SPA that integrates with the Mujarrad Spring Boot backend API to provide a visual knowledge graph management system. Users will authenticate, create workspaces, manage nodes (with markdown content), establish typed relationships (edges mapped to backend attributes), visualize the graph, search content, and access version history. The system follows Clean Architecture with TypeScript strict mode, React Query for server state, Zustand for client state, React Flow for graph visualization, and comprehensive error handling with RFC 7807 Problem Details.

## Technical Context
**Language/Version**: TypeScript 5.0+ (strict mode enabled)
**Primary Dependencies**:
  - React 18.2+
  - Next.js 14+ (App Router, build tool, routing)
  - React Query v5+ / TanStack Query (server state)
  - Zustand v4+ (client state)
  - React Flow v11+ (graph visualization)
  - Axios v1+ (HTTP client)
  - Zod v3+ (validation)
  - React Hook Form v7+ (forms)
  - Tailwind CSS v3+ (styling)
  - Radix UI (accessible primitives)
  - DOMPurify (XSS protection)
**Storage**: Backend API (no local storage for data, JWT in httpOnly cookies)
**Testing**: Jest + React Testing Library + Playwright (E2E)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
**Project Type**: Web application (frontend SPA + backend API)
**Performance Goals**:
  - Lighthouse score > 90
  - Response time < 200ms
  - Support 1000+ nodes with progressive loading
  - Bundle < 200KB gzipped (main), total < 500KB
**Constraints**:
  - MUST align with Spring Boot backend architecture
  - MUST use JWT Bearer authentication
  - MUST parse RFC 7807 error responses
  - MUST map frontend edges to backend attributes
  - MUST handle optimistic locking with version fields
**Scale/Scope**:
  - Multi-workspace support
  - Concurrent users per workspace
  - Full CRUD for nodes and relationships
  - Version control and diff viewing
  - Search with full-text ranking

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Node Supremacy
**Status**: ✅ PASS
**Rationale**: Frontend displays nodes from backend API. No hard-coded structures. All organization via backend node relationships.

### Principle II: Relationship-Driven Structure & Edge-Attribute Mapping
**Status**: ✅ PASS
**Rationale**: Frontend edges map 1:1 to backend attributes. `attribute_key` determines edge type/styling. API operations:
- Create edge → POST /api/nodes/{id}/attributes
- Delete edge → DELETE /api/nodes/{id}/attributes/{attrId}
- Fetch edges → GET /api/nodes/{id}/attributes

### Principle III: Abstraction Immutability
**Status**: ✅ PASS
**Rationale**: Frontend visualizes abstract logic workflows as node graphs. No hard-coded workflow logic. Cycles displayed visually with appropriate styling.

### Principle IV: Backend Architecture Alignment
**Status**: ✅ PASS
**Rationale**:
- All API calls use documented endpoints from backend
- TypeScript interfaces match backend DTOs
- JWT Bearer authentication implemented
- RFC 7807 error parsing
- Optimistic locking with version fields
- Pagination via (page, size, sort) parameters

### Principle V: Clean Architecture in React
**Status**: ✅ PASS
**Rationale**: Architecture layers defined:
```
Components (Presentation)
  ↓ Uses
Hooks & Services (Logic)
  ↓ Uses
Store & Context (State)
  ↓ Manages
Types & Models (Domain)
```

### Principle VI: Type Safety and Validation
**Status**: ✅ PASS
**Rationale**:
- TypeScript strict mode enabled
- All backend DTOs typed
- Zod schemas for form validation
- No `any` types (justified exceptions only)

### Principle VII: Graph Visualization First
**Status**: ✅ PASS
**Rationale**:
- Primary view is React Flow graph
- Node types visually distinct (CONTEXT, REGULAR, ASSUMPTION)
- Edge types visually distinct (based on attribute_key)
- Cycle-aware layout algorithms
- Cycle detection visualization for containment

### Principle VIII: Workspace Isolation
**Status**: ✅ PASS
**Rationale**:
- All API calls workspace-scoped
- URLs follow `/workspace/{slug}/nodes/{id}` pattern
- Workspace switching clears cache
- Search workspace-scoped by default

### Principle IX: Version Awareness
**Status**: ✅ PASS
**Rationale**:
- Version history UI component
- Version comparison/diff view
- Version restoration (non-destructive)
- Current version indicator

### Principle X: Performance and Optimization
**Status**: ✅ PASS
**Rationale**:
- Route-based code splitting (Next.js App Router + React.lazy)
- React Query caching with stale times
- Infinite scroll for node lists
- Debounced search
- Bundle size monitoring
- Lighthouse > 90 target

## Project Structure

### Documentation (this feature)
```
specs/001-frontend-integration-analysis/
├── spec.md              # Feature specification (iteration 2)
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (tech decisions documented)
├── data-model.md        # Phase 1 output (frontend type definitions)
├── quickstart.md        # Phase 1 output (manual testing scenarios)
├── contracts/           # Phase 1 output (Zod schemas for API contracts)
│   ├── auth.schema.ts
│   ├── workspace.schema.ts
│   ├── node.schema.ts
│   ├── attribute.schema.ts
│   └── version.schema.ts
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
mujarrad-frontend/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home page (redirect to workspaces)
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── register/
│   │   └── page.tsx              # Register page
│   ├── workspaces/
│   │   ├── page.tsx              # Workspace list
│   │   └── [slug]/
│   │       ├── layout.tsx        # Workspace layout
│   │       ├── page.tsx          # Workspace home
│   │       ├── nodes/
│   │       │   └── page.tsx      # Node list view
│   │       ├── graph/
│   │       │   └── page.tsx      # Graph visualization
│   │       └── node/
│   │           └── [id]/
│   │               └── page.tsx  # Node detail
│   │
│
├── src/
│   ├── components/
│   │   ├── graph/
│   │   │   ├── GraphVisualization.tsx
│   │   │   ├── NodeRenderer.tsx
│   │   │   ├── EdgeRenderer.tsx
│   │   │   └── GraphControls.tsx
│   │   ├── nodes/
│   │   │   ├── NodeForm.tsx
│   │   │   ├── NodeList.tsx
│   │   │   ├── NodeDetail.tsx
│   │   │   └── NodeVersionHistory.tsx
│   │   ├── relationships/
│   │   │   ├── RelationshipForm.tsx
│   │   │   └── RelationshipList.tsx
│   │   ├── ui/                   # Radix UI wrappers
│   │   │   ├── Button.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   └── Toast.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── workspaces/
│   │       ├── WorkspaceList.tsx
│   │       └── WorkspaceCard.tsx
│   │
│   ├── hooks/
│   │   ├── api/
│   │   │   ├── useAuth.ts
│   │   │   ├── useWorkspaces.ts
│   │   │   ├── useNodes.ts
│   │   │   ├── useAttributes.ts
│   │   │   ├── useVersions.ts
│   │   │   └── useSearch.ts
│   │   ├── useDebounce.ts
│   │   └── useInfiniteScroll.ts
│   │
│   ├── services/
│   │   ├── api/
│   │   │   └── client.ts         # Axios instance with interceptors
│   │   ├── AuthService.ts
│   │   ├── WorkspaceService.ts
│   │   ├── NodeService.ts
│   │   ├── AttributeService.ts
│   │   ├── VersionService.ts
│   │   └── SearchService.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts          # Zustand: auth state
│   │   ├── workspaceStore.ts     # Zustand: current workspace
│   │   └── uiStore.ts            # Zustand: UI preferences
│   │
│   ├── types/
│   │   ├── backend-dtos.ts       # From backend OpenAPI spec
│   │   ├── api.ts                # API response wrappers
│   │   ├── graph.ts              # Graph visualization types
│   │   └── errors.ts             # RFC 7807 Problem Details
│   │
│   ├── schemas/
│   │   ├── auth.schema.ts        # Zod: login, register
│   │   ├── workspace.schema.ts   # Zod: workspace CRUD
│   │   ├── node.schema.ts        # Zod: node CRUD
│   │   └── attribute.schema.ts   # Zod: relationship CRUD
│   │
│   └── lib/
│       ├── utils.ts
│       ├── constants.ts
│       └── formatters.ts
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   ├── integration/
│   │   └── components/
│   └── e2e/
│       └── flows/
│           ├── auth.spec.ts
│           ├── workspace.spec.ts
│           ├── nodes.spec.ts
│           └── graph.spec.ts
│
├── public/
│   └── assets/
│
├── .specify/
│   ├── memory/
│   │   └── constitution.md       # v1.1.0
│   └── templates/
│
├── public/
│   └── assets/
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── jest.config.ts
├── playwright.config.ts
└── .env.example
```

**Structure Decision**: Single Next.js 14 App Router frontend. Backend is separate Spring Boot repository. Frontend structure follows Clean Architecture with clear separation:
- `/app` → Next.js App Router pages and layouts (presentation layer)
- `/src/components` → Reusable UI components (presentation layer)
- `/src/hooks` → Business logic hooks (application layer)
- `/src/services` → API communication (infrastructure layer)
- `/src/stores` → Global state (application layer)
- `/src/types` → Domain models (domain layer)
- `/src/schemas` → Validation rules (application layer)

## Phase 0: Outline & Research

Since the constitution already defines the technology stack and the spec has all clarifications resolved, Phase 0 research focuses on documenting decisions and best practices.

### Research Topics

1. **React Flow vs D3.js for Graph Visualization**
   - Decision: **React Flow**
   - Rationale: React-native API, built-in controls, better performance for interactive graphs
   - Handles: zoom, pan, minimap, node/edge customization, layout algorithms
   - D3.js considered for: custom force-directed layouts (future enhancement)

2. **State Management Strategy**
   - Decision: **Zustand (client) + React Query (server)**
   - Zustand for: auth state, current workspace, UI preferences
   - React Query for: all API data, caching, optimistic updates, invalidation
   - Rationale: Separation of concerns, React Query's built-in cache management

3. **Form Handling**
   - Decision: **React Hook Form + Zod**
   - Rationale: Performance (uncontrolled inputs), type-safe validation, backend contract alignment

4. **Authentication Flow**
   - Decision: **JWT in httpOnly cookies**
   - Flow: Login → Backend sets httpOnly cookie → Axios automatically sends cookie
   - Refresh: Axios interceptor for 401 → refresh token endpoint → retry request
   - CSRF: Token for state-changing operations

5. **Error Handling Pattern**
   - Decision: **RFC 7807 Problem Details parsing**
   - Axios interceptor transforms RFC 7807 responses → TypeScript error types
   - React Error Boundaries for component-level errors
   - Toast notifications for user-facing errors

6. **Graph Layout Algorithm**
   - Decision: **React Flow's built-in Dagre layout (hierarchical)**
   - Handles cycles: Display back-edges with dashed lines
   - Fallback: Force-directed layout for non-hierarchical graphs
   - Performance: Virtual rendering for >1000 nodes

7. **Bundle Optimization**
   - Decision: **Next.js 14 automatic code splitting + lazy loading**
   - Route-based splitting: App Router automatically splits each page/route
   - Component-level splitting: Large components (Graph, VersionHistory) lazy loaded with dynamic()
   - Tree shaking: Automatic with ES modules
   - SWC compiler for faster builds

8. **Testing Strategy**
   - Decision: **3-tier testing**
   - Unit: Jest for services, hooks, utilities (80% coverage target)
   - Integration: React Testing Library for components (60% coverage target)
   - E2E: Playwright for critical user flows (auth, CRUD, graph)

### Research Consolidation (research.md)

**Output**: `specs/001-frontend-integration-analysis/research.md` with:
- Technology decisions documented above
- API endpoint mapping from backend Swagger spec
- Performance optimization strategies
- Security considerations (XSS, CSRF, JWT)
- Accessibility guidelines (WCAG AA)

## Phase 1: Design & Contracts

*Prerequisites: research.md complete*

### 1. Data Model (`data-model.md`)

Extract entities from spec and map to TypeScript interfaces:

**User**
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}
```

**Workspace**
```typescript
interface Workspace {
  id: string;
  slug: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
```

**Node**
```typescript
enum NodeType {
  REGULAR = 'REGULAR',
  CONTEXT = 'CONTEXT',
  ASSUMPTION = 'ASSUMPTION',
}

interface Node {
  id: string;
  workspaceId: string;
  nodeType: NodeType;
  title: string;
  slug: string;
  markdownContent: string;  // Maps to backend markdown_content field
  nodeDetails: Record<string, any>;
  currentVersionId: string | null;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;  // For optimistic locking
}
```

**Attribute (Edge)**
```typescript
type AttributeKey =
  | 'contains'
  | 'depends_on'
  | 'references'
  | 'triggers'
  | 'next'
  | 'calls';

interface Attribute {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  attributeKey: AttributeKey;  // Maps to edge type in graph
  attributeValue: string;
  createdAt: string;
}
```

**NodeVersion**
```typescript
interface NodeVersion {
  id: string;
  nodeId: string;
  title: string;
  markdownContent: string;
  nodeDetails: Record<string, any>;
  createdBy: string;
  createdAt: string;
  versionNumber: number;
}
```

**State Transitions**: Node lifecycle: Draft → Published (via version control)

### 2. API Contracts (`contracts/`)

Generate Zod schemas from backend API specification:

**`contracts/auth.schema.ts`**
```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3).max(50),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

**`contracts/node.schema.ts`**
```typescript
import { z } from 'zod';

export const createNodeSchema = z.object({
  title: z.string().min(1).max(255),
  nodeType: z.enum(['REGULAR', 'CONTEXT', 'ASSUMPTION']),
  markdownContent: z.string().optional(),
  nodeDetails: z.record(z.any()).optional(),
});

export const updateNodeSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  markdownContent: z.string().optional(),
  nodeDetails: z.record(z.any()).optional(),
});

export type CreateNodeInput = z.infer<typeof createNodeSchema>;
export type UpdateNodeInput = z.infer<typeof updateNodeSchema>;
```

**`contracts/attribute.schema.ts`**
```typescript
import { z } from 'zod';

export const createAttributeSchema = z.object({
  toNodeId: z.string().uuid(),
  attributeKey: z.enum(['contains', 'depends_on', 'references', 'triggers', 'next', 'calls']),
  attributeValue: z.string().optional().default(''),
});

export type CreateAttributeInput = z.infer<typeof createAttributeSchema>;
```

Similar schemas for workspaces and versions.

### 3. Contract Tests

Generate contract test files (to be run before implementation):

**`tests/integration/contracts/nodes.spec.ts`**
```typescript
import { describe, it, expect } from '@jest/globals';
import { createNodeSchema } from '@/schemas/node.schema';

describe('Node Contract Tests', () => {
  it('should validate valid node creation request', () => {
    const input = {
      title: 'Test Node',
      nodeType: 'REGULAR' as const,
      markdownContent: '# Hello',
    };

    expect(() => createNodeSchema.parse(input)).not.toThrow();
  });

  it('should reject node with empty title', () => {
    const input = {
      title: '',
      nodeType: 'REGULAR' as const,
    };

    expect(() => createNodeSchema.parse(input)).toThrow();
  });
});
```

**Note**: These tests MUST fail initially (no implementation). They validate Zod schemas match backend contracts.

### 4. Test Scenarios (`quickstart.md`)

Extract test scenarios from user stories in spec:

**Manual Testing Checklist**:
1. User Registration & Login
   - Register with email/password
   - Login with valid credentials
   - Logout and verify session cleared
   - Attempt login with invalid credentials (verify error)

2. Workspace Management
   - Create new workspace
   - View workspace list
   - Switch between workspaces (verify data cleared)
   - Delete workspace (verify confirmation)

3. Node CRUD
   - Create REGULAR node with markdown content
   - Create CONTEXT node
   - Edit node title and content (verify new version created)
   - Delete node (verify orphan warning if applicable)
   - View version history
   - Restore previous version (verify new version created)

4. Relationship Management
   - Create "contains" relationship (CONTEXT → Node)
   - Create "references" relationship (Node → Node)
   - Attempt circular "contains" (verify cycle detection error)
   - Create circular "depends_on" (verify allowed)
   - Delete relationship

5. Graph Visualization
   - Verify all nodes render in graph
   - Verify node types visually distinct (colors/shapes)
   - Verify edge types visually distinct (line styles)
   - Click node → navigate to detail view
   - Zoom, pan, navigate graph
   - Verify cycle visualization (dashed back-edges)

6. Search & Discovery
   - Search by title
   - Search by content
   - Filter by node type
   - Filter by date range
   - Verify workspace-scoped results

7. Multi-Context Navigation
   - Create node with multiple parents
   - View node detail → verify all parents shown
   - Use context switcher → jump between parents
   - Verify breadcrumbs show current path

8. Performance
   - Load graph with 100+ nodes (verify <200ms render)
   - Infinite scroll in node list
   - Debounced search input

### 5. Update CLAUDE.md

Run the update script to add new tech context:

```bash
.specify/scripts/bash/update-agent-context.sh claude
```

**IMPORTANT**: Execute exactly as specified. Do not add or remove arguments.

This will update `/CLAUDE.md` with:
- New tech from this plan (React Flow, Zustand, React Query)
- Preserve manual additions between markers
- Update recent changes (keep last 3)
- Keep under 150 lines for token efficiency

**Output**: Phase 1 artifacts created:
- `data-model.md` (TypeScript type definitions)
- `contracts/auth.schema.ts`
- `contracts/workspace.schema.ts`
- `contracts/node.schema.ts`
- `contracts/attribute.schema.ts`
- `contracts/version.schema.ts`
- `quickstart.md` (manual testing scenarios)
- Contract tests (failing initially)
- `CLAUDE.md` updated (incrementally)

## Phase 2: Task Planning Approach

*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Task categories:
  1. **Setup** (project init, dependencies, config)
  2. **Type Definitions** (TypeScript interfaces from data-model.md)
  3. **API Client** (Axios instance, interceptors, error handling)
  4. **Services** (AuthService, NodeService, etc.)
  5. **Hooks** (React Query hooks for each service)
  6. **Stores** (Zustand stores for client state)
  7. **Components** (UI components, layouts, pages)
  8. **Graph Visualization** (React Flow integration)
  9. **Forms** (React Hook Form + Zod validation)
  10. **Testing** (contract tests, integration tests, E2E)
  11. **Polish** (accessibility, performance, error boundaries)

**Task Ordering Strategy**:
- Bottom-up: Types → Services → Hooks → Components → Pages
- Each contract schema → contract test task [P]
- Each entity → type definition task [P]
- Each service → unit test task
- TDD where possible: Tests before implementation

**Parallelization**:
- Type definitions [P] (different files)
- Contract schemas [P] (different files)
- Service implementations [P] (different files)
- UI components [P] (different files, no dependencies)

**Estimated Output**: 80-100 numbered, ordered tasks in tasks.md with clear dependencies

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

No violations detected. All constitutional principles are satisfied by the design.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Progress Tracking

*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS (all 10 principles satisfied)
- [x] Post-Design Constitution Check: PASS (no violations)
- [x] All NEEDS CLARIFICATION resolved (spec iteration 2)
- [x] Complexity deviations documented (none)

**Artifacts Generated**:
- [x] research.md (Phase 0)
- [x] data-model.md (Phase 1)
- [x] contracts/ (Phase 1: 5 schema files)
- [x] quickstart.md (Phase 1)
- [x] CLAUDE.md updated (Phase 1)
- [ ] tasks.md (Phase 2: /tasks command)

---
*Based on Constitution v1.1.0 - See `/memory/constitution.md`*
