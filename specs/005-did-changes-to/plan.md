# Implementation Plan: Backend API Endpoint Synchronization

**Branch**: `005-did-changes-to` | **Date**: 2025-10-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-did-changes-to/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✅ Loaded spec.md successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ All clarifications resolved via OpenAPI spec analysis
   → ✅ Detected web application structure (frontend only)
3. Fill the Constitution Check section
   → ✅ Checked against constitution v1.2.0
4. Evaluate Constitution Check section
   → ✅ PASS - No violations
   → ✅ Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → ✅ No unknowns remain (all endpoints documented)
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
   → ✅ Generating design artifacts
7. Re-evaluate Constitution Check section
   → ✅ PASS - Design aligns with principles
   → ✅ Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach
   → ✅ Ready for /tasks command
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 9. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

**Primary Requirement**: Synchronize frontend API services with backend endpoint changes, specifically migrating from workspace-based endpoints to space-based endpoints with slug identifiers.

**Technical Approach**:
1. Rename workspace.service.ts → space.service.ts with updated `/api/spaces/*` endpoints
2. Update node.service.ts to use space-scoped endpoints `/api/spaces/{spaceSlug}/nodes/*`
3. Migrate TypeScript types from Workspace → Space
4. Update all component imports and references
5. Maintain backward compatibility for authentication and attribute endpoints (no changes needed)
6. Update contract tests to verify new endpoint paths

## Technical Context

**Language/Version**: TypeScript 5.3.3, React 18.2.0, Next.js 14.1.0
**Primary Dependencies**: @tanstack/react-query 5.17.19, axios 1.6.5, zustand 4.4.7, react-hook-form 7.49.3, zod 3.22.4
**Storage**: Remote backend API (https://mujarrad.onrender.com), no local persistence
**Testing**: Jest 29.7.0 + React Testing Library, Playwright 1.41.1 (E2E), MSW 2.11.3 (API mocking)
**Target Platform**: Web (browsers), Next.js App Router with SPA mode
**Project Type**: Web (frontend only - this repository)
**Performance Goals**: <200ms API response handling, <100ms UI updates, React Query caching for repeated requests
**Constraints**: Must maintain existing UI functionality, zero downtime migration (gradual rollout possible)
**Scale/Scope**: ~10 service files affected, ~30 API integration points, ~20 component updates for type changes

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Step 4)

✅ **I. Node Supremacy**: N/A - This is an API integration update, not a data model change

✅ **II. Relationship-Driven Structure & Edge-Attribute Mapping**:
- ✅ Frontend edges continue mapping to backend attributes
- ✅ Attribute endpoints remain unchanged (`/api/nodes/{id}/attributes`)

✅ **III. Abstraction Immutability**: N/A - No abstract logic changes

✅ **IV. Backend Architecture Alignment**:
- ✅ CRITICAL - This feature ensures alignment with backend OpenAPI spec
- ✅ API contracts will be updated to match backend endpoints
- ✅ JWT authentication remains consistent
- ✅ Error handling (RFC 7807) unaffected

✅ **V. Clean Architecture in React**:
- ✅ Changes isolated to service layer (`/src/services/api/`)
- ✅ Components remain decoupled from API changes
- ✅ Types updated in `/src/types/backend-dtos.ts`

✅ **VI. Type Safety and Validation**:
- ✅ TypeScript interfaces will be updated (Workspace → Space)
- ✅ Zod schemas for space operations will be updated
- ✅ Strict mode enabled, no `any` types introduced

✅ **VII. Graph Visualization First**: N/A - Graph visualization unaffected by endpoint changes

✅ **VIII. Workspace Isolation** → **Space Isolation** (TERMINOLOGY UPDATE):
- ⚠️ **CRITICAL CHANGE**: Workspace → Space terminology migration
- ✅ Space scoping will be maintained (all operations scoped to space slug)
- ✅ URLs will use pattern: `/space/{slug}/nodes/{nodeId}` (from `/workspace/{slug}/...`)
- ✅ Search remains space-scoped

✅ **IX. Version Awareness**: ✅ New node versioning endpoints available (optional integration)

✅ **X. Performance and Optimization**: ✅ React Query caching strategy unaffected

### Technology Stack Compliance
✅ **LOCKED STACK POLICY**: No framework changes - working within existing Next.js 14 + React 18 stack
✅ All changes use existing dependencies (axios, react-query, zustand)

**Status**: ✅ PASS - Full constitutional compliance

## Project Structure

### Documentation (this feature)
```
specs/005-did-changes-to/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── space-api.yml    # Space endpoint contracts (OpenAPI)
│   └── node-api.yml     # Node endpoint contracts (OpenAPI)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

**Frontend (this repository):**
```
src/
├── services/
│   └── api/
│       ├── space.service.ts        # RENAMED from workspace.service.ts
│       ├── node.service.ts         # UPDATED for space-scoped endpoints
│       ├── auth.service.ts         # NO CHANGE (already correct)
│       ├── attribute.service.ts    # NO CHANGE (already correct)
│       └── client.ts               # NO CHANGE (axios instance)
├── types/
│   └── backend-dtos.ts             # UPDATED: Workspace → Space types
├── hooks/
│   ├── useSpaces.ts                # RENAMED from useWorkspaces.ts
│   └── useNodes.ts                 # UPDATED for space slug parameter
├── components/
│   ├── spaces/                     # RENAMED from workspaces/
│   └── nodes/                      # TYPE UPDATES only
└── app/
    └── (workspace)/                # ROUTING: Consider renaming to (space)/

tests/
├── contracts/
│   ├── space.contract.test.ts      # NEW - verify space endpoints
│   └── node.contract.test.ts       # UPDATED - verify space-scoped paths
├── integration/
│   └── services.integration.test.ts # UPDATED - space service tests
└── e2e/
    └── space-workflows.spec.ts     # UPDATED - E2E tests with spaces
```

**Structure Decision**: This is a frontend-only repository with Next.js 14 App Router structure. The backend is separate (https://mujarrad.onrender.com). Changes are isolated to the service layer, type definitions, and dependent hooks/components. The routing structure may optionally be renamed from `/workspace/` to `/space/` for consistency.

## Phase 0: Outline & Research

Since all technical unknowns were resolved during specification phase via OpenAPI analysis, research focuses on migration strategy and patterns.

### Research Tasks

1. **Workspace-to-Space Migration Pattern**
   - Decision: Rename files and update imports in single atomic PR
   - Rationale: Clean break prevents confusion between old/new concepts
   - Alternatives: Gradual migration with alias → Rejected (complexity, dual paths confusing)

2. **Slug-based Routing vs ID-based Routing**
   - Decision: Use space slugs for all node operations (as required by backend)
   - Rationale: Backend API requires slugs in path parameters
   - Pattern: Fetch space by slug first, then use slug for nested operations
   - Alternatives: Continue using IDs → Rejected (backend doesn't support)

3. **Type Migration Strategy**
   - Decision: Create Space interface, deprecate Workspace with type alias initially
   - Rationale: Allows incremental component updates while maintaining type safety
   - Pattern: `type Workspace = Space // @deprecated Use Space`
   - Alternatives: Hard cutover → Rejected (breaks too many files simultaneously)

4. **Testing Strategy**
   - Decision: Update contract tests first (TDD), then services, then integration tests
   - Rationale: Contract tests define the API contract we must meet
   - Pattern: Mock new endpoints in MSW, verify with contract tests
   - Alternatives: Integration tests first → Rejected (no implementation to test)

5. **Optional Features Decision**
   - Decision: Focus on core sync (auth, spaces, nodes, attributes); defer versioning/templates
   - Rationale: Minimize scope, deliver working sync first
   - Future: Node versioning and templates can be separate features
   - Alternatives: Implement all features → Rejected (scope creep, longer timeline)

**Output**: research.md documenting these decisions

## Phase 1: Design & Contracts

*Prerequisites: research.md complete*

### 1. Data Model (`data-model.md`)

#### Entities

**Space (formerly Workspace)**
```typescript
interface Space {
  id: string;           // UUID
  name: string;         // 1-255 chars
  slug: string;         // URL-friendly, unique
  ownerId: string;      // UUID
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
}
```

**Node** (updated for space scoping)
```typescript
interface Node {
  id: string;                    // UUID
  spaceId: string;               // UUID (space reference)
  nodeType: NodeType;            // REGULAR | CONTEXT | ASSUMPTION | TEMPLATE
  title: string;                 // 1-255 chars
  slug: string;                  // URL-friendly
  content: string;               // Markdown
  nodeDetails: Record<string, unknown>;
  currentVersionId: string;      // UUID
  createdBy: string;             // UUID
  modifiedBy: string;            // UUID
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}
```

**Attribute** (no changes)
```typescript
interface Attribute {
  id: string;                    // UUID
  spaceId: string;               // UUID
  sourceNodeId: string;          // UUID
  targetNodeId: string;          // UUID
  attributeName: string;         // e.g., "contains", "references"
  attributeType: "CUSTOM" | "SYSTEM";
  attributeTypeMode: "TYPED" | "SCHEMALESS";
  attributeDataType?: AttributeDataType;
  attributeValue: Record<string, unknown>;
  properties: Record<string, unknown>;
  createdBy: string;             // UUID
  createdAt: string;             // ISO 8601
}
```

#### Type Transitions
- `Workspace` → `Space` (rename)
- `WorkspaceService` → `SpaceService` (rename)
- `useWorkspace` → `useSpace` (rename)
- All workspace IDs → space slugs in API calls

### 2. API Contracts (`contracts/space-api.yml`, `contracts/node-api.yml`)

**Space Endpoints Contract**:
```yaml
openapi: 3.0.1
paths:
  /api/spaces:
    get:
      operationId: getAllSpaces
      responses:
        '200':
          description: Spaces retrieved successfully
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/SpaceResponse'
    post:
      operationId: createSpace
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SpaceCreateRequest'
      responses:
        '201':
          description: Space created successfully

  /api/spaces/{id}:
    get:
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Space retrieved

  /api/spaces/slug/{slug}:
    get:
      parameters:
        - name: slug
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Space retrieved by slug
```

**Node Endpoints Contract** (space-scoped):
```yaml
/api/spaces/{spaceSlug}/nodes:
  get:
    parameters:
      - name: spaceSlug
        in: path
        required: true
        schema:
          type: string
    responses:
      '200':
        description: Nodes retrieved
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: '#/components/schemas/NodeResponse'

  post:
    parameters:
      - name: spaceSlug
        in: path
        required: true
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/NodeCreateRequest'
    responses:
      '201':
        description: Node created

/api/spaces/{spaceSlug}/nodes/{nodeId}:
  get:
    parameters:
      - name: spaceSlug
        in: path
        required: true
      - name: nodeId
        in: path
        required: true
        schema:
          type: string
          format: uuid
    responses:
      '200':
        description: Node retrieved

  put:
    # Similar structure for update

  delete:
    parameters:
      - name: force
        in: query
        required: false
        schema:
          type: boolean
          default: false
```

### 3. Contract Tests

**`tests/contracts/space.contract.test.ts`**:
```typescript
describe('Space API Contract', () => {
  it('GET /api/spaces returns array of SpaceResponse', async () => {
    // Verify response matches schema
  });

  it('POST /api/spaces creates space with name and optional slug', async () => {
    // Verify request/response schemas
  });

  it('GET /api/spaces/{id} returns single space', async () => {
    // Verify UUID parameter and response
  });

  it('GET /api/spaces/slug/{slug} returns space by slug', async () => {
    // Verify slug lookup works
  });
});
```

**`tests/contracts/node.contract.test.ts`**:
```typescript
describe('Node API Contract (Space-Scoped)', () => {
  it('GET /api/spaces/{spaceSlug}/nodes returns nodes array', async () => {
    // Verify space slug in path, array response
  });

  it('POST /api/spaces/{spaceSlug}/nodes creates node', async () => {
    // Verify space slug required, node creation
  });

  it('GET /api/spaces/{spaceSlug}/nodes/{nodeId} returns single node', async () => {
    // Verify both slug and nodeId required
  });

  it('PUT /api/spaces/{spaceSlug}/nodes/{nodeId} updates node', async () => {
    // Verify update with space context
  });

  it('DELETE /api/spaces/{spaceSlug}/nodes/{nodeId}?force=true deletes node', async () => {
    // Verify force parameter works
  });
});
```

### 4. Quickstart Test (`quickstart.md`)

```markdown
# Quickstart: Backend API Synchronization Verification

## Prerequisites
- Frontend server running (`npm run dev`)
- Backend API accessible (https://mujarrad.onrender.com)
- Valid test user credentials

## Test Scenarios

### 1. Authentication (No Changes Expected)
1. Register new user via `/api/auth/register`
2. Login via `/api/auth/login`
3. Fetch profile via `/api/auth/me`
4. **Expected**: All auth operations succeed unchanged

### 2. Space Management (Core Changes)
1. Fetch spaces via `GET /api/spaces`
2. Create space via `POST /api/spaces` with name "Test Space"
3. Fetch space by ID via `GET /api/spaces/{id}`
4. Fetch space by slug via `GET /api/spaces/slug/test-space`
5. **Expected**: All space operations use new endpoints successfully

### 3. Node Operations (Space-Scoped)
1. Given space slug "test-space"
2. Create node via `POST /api/spaces/test-space/nodes`
3. Fetch all nodes via `GET /api/spaces/test-space/nodes`
4. Fetch single node via `GET /api/spaces/test-space/nodes/{nodeId}`
5. Update node via `PUT /api/spaces/test-space/nodes/{nodeId}`
6. Delete node via `DELETE /api/spaces/test-space/nodes/{nodeId}`
7. **Expected**: All node operations require space slug, succeed

### 4. Attribute Operations (No Changes Expected)
1. Create attribute via `POST /api/nodes/{nodeId}/attributes`
2. Fetch attributes via `GET /api/nodes/{nodeId}/attributes`
3. Delete attribute via `DELETE /api/attributes/{attrId}`
4. **Expected**: Attribute operations unchanged, succeed

### 5. UI Functionality
1. Navigate to spaces list
2. Create new space
3. Enter space, create node
4. Create relationship between nodes
5. **Expected**: All UI flows work with renamed services

## Success Criteria
- ✅ All contract tests pass
- ✅ All integration tests pass
- ✅ All E2E tests pass
- ✅ UI functions without errors
- ✅ No console errors related to API calls
```

### 5. Update CLAUDE.md

Will execute: `.specify/scripts/bash/update-agent-context.sh claude`

This will add to CLAUDE.md:
- Technology: API Endpoint Migration (Workspace → Space)
- Recent Change: 005-did-changes-to - Backend API synchronization

**Output**: data-model.md, contracts/*.yml, contract tests, quickstart.md, CLAUDE.md updated

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
1. Load `.specify/templates/tasks-template.md` as base
2. Generate tasks from Phase 1 contracts and data model
3. Order: Contract tests → Type updates → Services → Hooks → Components → Integration tests → E2E tests
4. Mark [P] for parallel file updates (independent service files)

**Specific Task Categories**:

**A. Contract Test Tasks** (TDD - must be first):
- Write space API contract tests [P]
- Write node API contract tests [P]
- Verify tests fail (no implementation yet)

**B. Type Definition Tasks**:
- Update backend-dtos.ts: Add Space interface, deprecate Workspace [P]
- Create space-related request/response types [P]
- Update node types for space scoping

**C. Service Layer Tasks** (core changes):
- Rename workspace.service.ts → space.service.ts, update all endpoints
- Update node.service.ts for space-scoped endpoints
- Update service tests to use new endpoints

**D. Hook Tasks**:
- Rename useWorkspaces.ts → useSpaces.ts
- Update useNodes hook for space slug parameter
- Update hook tests

**E. Component Tasks**:
- Update components importing renamed services
- Update type references (Workspace → Space)
- Rename workspace components directory → spaces

**F. Routing Tasks (Optional)**:
- Consider renaming /workspace/ routes → /space/
- Update navigation links

**G. Integration Test Tasks**:
- Update integration tests for space services
- Verify end-to-end space → nodes → attributes flow

**H. E2E Test Tasks**:
- Update Playwright tests for renamed routes/concepts
- Verify UI workflows with new backend endpoints

**Ordering Strategy**:
- Tests before implementation (TDD)
- Types before services (TypeScript dependencies)
- Services before hooks (dependency order)
- Hooks before components (dependency order)
- Mark independent files with [P] for parallel execution

**Estimated Output**: 30-35 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run quickstart.md, verify all tests pass)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

**No violations identified** - This feature aligns with all constitutional principles:
- Maintains clean architecture (service layer changes only)
- Preserves type safety (TypeScript updates throughout)
- Enhances backend alignment (core purpose of feature)
- Uses existing locked tech stack (no new dependencies)

### Terminology Note
The project constitution (v1.2.0) uses "workspace" terminology in Principle VIII ("Workspace Isolation"), while the backend API and this implementation use "space" terminology. These terms are **semantically equivalent** - both refer to the same tenant isolation and scoping concept. The backend team chose "space" as the API term for the production endpoints, and the frontend aligns with this choice to maintain API consistency. No constitutional violation exists; this is purely a naming evolution in the backend API surface.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning approach documented (/plan command)
- [x] Phase 3: Tasks generated (/tasks command) - 33 tasks in tasks.md
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (N/A - no violations)

---
*Based on Constitution v1.2.0 - See `.specify/memory/constitution.md`*
