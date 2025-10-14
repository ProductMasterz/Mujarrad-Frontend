# Feature Specification: Backend API Endpoint Synchronization

**Feature Branch**: `005-did-changes-to`
**Created**: 2025-10-13
**Status**: Draft
**Input**: User description: "Did changes to end points so please understand the difference and do the needed changes so that frontend and the backend both work properly together: https://mujarrad.onrender.com/swagger-ui/index.html#/"

## Execution Flow (main)
```
1. Parse user description from Input
   → Feature request to synchronize frontend with backend API changes
2. Extract key concepts from description
   → Actors: Frontend developers, backend API
   → Actions: Update API integration, fix endpoint paths
   → Data: API endpoints, request/response contracts
   → Constraints: Maintain backward compatibility where possible
3. For each unclear aspect:
   → ✅ RESOLVED: Authentication endpoints support both /api/auth/* and /api/users/* (no breaking changes)
   → ✅ RESOLVED: No old space endpoints exist on backend - full migration to spaces required
4. Fill User Scenarios & Testing section
   → User scenarios defined for API migration
5. Generate Functional Requirements
   → Each requirement is testable via API contract tests
6. Identify Key Entities (if data involved)
   → Entities: Space (replacing Space concept), Node, Attribute
7. Run Review Checklist
   → Spec has uncertainties marked for clarification
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## User Scenarios & Testing

### Primary User Story
As a frontend application, I need to successfully communicate with the backend API using the correct endpoint paths and data structures, so that users can authenticate, manage spaces (formerly spaces), create nodes, and establish relationships (attributes) between nodes without encountering API errors.

### Acceptance Scenarios

1. **Given** a user attempts to register, **When** the registration request is sent, **Then** the system must successfully create the user account using the correct endpoint

2. **Given** a user attempts to log in, **When** credentials are provided, **Then** the system must authenticate and return a valid JWT token using the correct endpoint

3. **Given** an authenticated user wants to view their spaces, **When** they request the spaces list, **Then** the system must return all spaces using the space-based endpoint (not space)

4. **Given** a user wants to create a node in a space, **When** they submit node creation data with a space slug, **Then** the system must create the node using the space-scoped endpoint

5. **Given** a user wants to view nodes in a space, **When** they request nodes for a specific space slug, **Then** the system must return all nodes using the space-scoped endpoint

6. **Given** a user wants to manage node attributes, **When** they create/read/delete attributes, **Then** the system must use the correct node-scoped attribute endpoints

### Edge Cases
- What happens when the frontend uses old space-based endpoints that no longer exist?
- How does the system handle requests to space endpoints with invalid slugs?
- What happens if authentication endpoints change their response structure?
- How are existing stored space IDs migrated to space slugs?

## Requirements

### Functional Requirements

**Authentication Endpoints (NO CHANGES REQUIRED):**
- **FR-001**: System MUST continue supporting user registration via `/api/auth/register` endpoint ✅
- **FR-002**: Backend also supports `/api/users/register` (both are valid, frontend uses /api/auth/* - no change needed) ✅
- **FR-003**: System MUST continue supporting user login via `/api/auth/login` endpoint ✅
- **FR-004**: Backend also supports `/api/users/login` (both are valid, frontend uses /api/auth/* - no change needed) ✅
- **FR-005**: System MUST continue supporting current user profile via `/api/auth/me` endpoint ✅
- **FR-006**: Backend also supports `/api/users/me` (both are valid, frontend uses /api/auth/* - no change needed) ✅

**Space Management (BREAKING CHANGE - Space → Space Migration):**
- **FR-007**: System MUST migrate from `/api/spaces/*` to `/api/spaces/*` in all API calls ⚠️ BREAKING
- **FR-008**: System MUST fetch spaces via `GET /api/spaces` endpoint (returns array of SpaceResponse)
- **FR-009**: System MUST create new spaces via `POST /api/spaces` with name (required) and optional slug
- **FR-010**: System MUST support fetching space details via `GET /api/spaces/{id}` using UUID
- **FR-011**: System MUST support fetching space details via `GET /api/spaces/slug/{slug}` using slug
- **FR-012**: System MUST migrate frontend logic to use space slugs for node operations (backend requires slugs, not IDs)

**Node Management (BREAKING CHANGE - Space-scoped, not Space-scoped):**
- **FR-013**: System MUST create nodes via `POST /api/spaces/{spaceSlug}/nodes` ⚠️ BREAKING (was `/api/spaces/{id}/nodes`)
- **FR-014**: System MUST fetch all nodes via `GET /api/spaces/{spaceSlug}/nodes` ⚠️ BREAKING (was `/api/spaces/{id}/nodes`)
- **FR-015**: System MUST fetch individual nodes via `GET /api/spaces/{spaceSlug}/nodes/{nodeId}` ⚠️ BREAKING (was `/api/nodes/{id}`)
- **FR-016**: System MUST update nodes via `PUT /api/spaces/{spaceSlug}/nodes/{nodeId}` ⚠️ BREAKING (was `/api/nodes/{id}`)
- **FR-017**: System MUST delete nodes via `DELETE /api/spaces/{spaceSlug}/nodes/{nodeId}` with optional `force` query param ⚠️ BREAKING (was `/api/nodes/{id}`)

**Attribute Management (NO CHANGES - Already Correct):**
- **FR-019**: System MUST create attributes via `POST /api/nodes/{nodeId}/attributes` ✅
- **FR-020**: System MUST fetch node attributes via `GET /api/nodes/{nodeId}/attributes` ✅
- **FR-021**: System MUST fetch individual attributes via `GET /api/attributes/{attributeId}` ✅
- **FR-022**: System MUST update attributes via `PUT /api/attributes/{attributeId}` ✅
- **FR-023**: System MUST delete attributes via `DELETE /api/attributes/{attributeId}` ✅
- **FR-024**: Frontend attribute service implementation is already aligned with backend ✅

**New Optional Features (Available but Not Required for Initial Sync):**
- **FR-018**: System MAY integrate ancestor/descendant traversal endpoints: `GET /api/spaces/{spaceSlug}/nodes/{nodeId}/ancestors` and `/descendants` 🆕
- **FR-025**: System MAY integrate node versioning endpoints: `GET /api/nodes/{nodeId}/versions`, `GET /api/nodes/{nodeId}/versions/{versionNumber}`, `POST /api/nodes/{nodeId}/versions/{versionNumber}/restore` 🆕
- **FR-026**: System MAY integrate space templates: `GET /api/templates` with filtering by scope and tags 🆕
- **FR-027**: System MAY integrate health check endpoints: `GET /api/health` and `GET /api/health/database` 🆕

**Data Migration and Frontend Updates:**
- **FR-028**: System MUST rename all internal references from "space" to "space" in service files
- **FR-029**: System MUST update space.service.ts to space.service.ts with new endpoint paths
- **FR-030**: System MUST update node.service.ts to use space-scoped endpoints with slugs
- **FR-031**: System MUST update TypeScript types/interfaces from Space to Space where appropriate
- **FR-032**: System MUST handle space slug retrieval/storage for routing and API calls

**Testing and Validation:**
- **FR-033**: System MUST pass all contract tests verifying endpoint paths match backend OpenAPI specification
- **FR-034**: System MUST pass integration tests confirming successful authentication, space operations, node CRUD, and attribute management
- **FR-035**: System MUST verify all existing UI functionality works with the new space-based API endpoints

### Key Entities

- **Space (formerly Space)**: Represents a container for organizing nodes. Has a name, slug (URL-friendly identifier), and ID. Accessed via slug in most API operations.

- **Node**: Represents a concept, entity, or piece of information within a space. Has title, type, content, and belongs to a specific space. Created and managed within space scope.

- **Attribute**: Represents a relationship or connection between nodes. Links a source node to a target node with metadata. Managed at the node level.

- **User**: Represents an authenticated user who can create and manage spaces, nodes, and attributes. Authenticates via JWT tokens.

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities resolved via backend OpenAPI spec analysis
- [x] User scenarios defined
- [x] Requirements generated (35 requirements total)
- [x] Entities identified
- [x] Review checklist passed

---

## Summary of Breaking Changes

### Critical Changes Required:
1. **Space → Space terminology** throughout codebase
2. **Endpoint path changes**: `/api/spaces/*` → `/api/spaces/*`
3. **Identifier change**: Space ID (number) → Space slug (string)
4. **Node endpoints now space-scoped**: All node operations require spaceSlug parameter

### No Changes Required:
- ✅ Authentication endpoints (already correct)
- ✅ Attribute endpoints (already correct)

### New Optional Features Available:
- 🆕 Node versioning and history (FR-025)
- 🆕 Space templates (FR-026)
- 🆕 Ancestor/descendant node traversal (FR-018)
- 🆕 Health check endpoints (FR-027)

---
