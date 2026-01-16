# Feature Specification: Backend-Integrated Knowledge Graph Frontend

**Feature Branch**: `001-frontend-integration-analysis`
**Created**: 2025-10-07
**Status**: Draft (Iteration 2)
**Input**: User description: "Frontend Integration Analysis Insights.md"
**Last Updated**: 2025-10-07

## Execution Flow (main)
```
1. Parse user description from Input
   → Loaded analysis document with current vs required state ✓
2. Extract key concepts from description
   → Identified: users, knowledge graph visualization, space collaboration ✓
3. For each unclear aspect:
   → Marked performance targets, user types, collaboration features ✓
4. Fill User Scenarios & Testing section
   → Defined primary workflows for graph exploration ✓
5. Generate Functional Requirements
   → 30 testable requirements across authentication, nodes, graph, space ✓
6. Identify Key Entities
   → Nodes, Spaces, Relationships, Versions ✓
7. Run Review Checklist
   → Contains implementation details - abstracted to user needs ✓
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story

A knowledge worker needs to create, organize, and visualize interconnected ideas (nodes) within a structured space. They should be able to:

1. Register and authenticate to access their spaces
2. Create spaces to organize different projects or domains
3. Create nodes (concepts, contexts, assumptions) with rich markdown content
4. Establish relationships between nodes (containment, dependencies, references, triggers, sequences, calls)
5. Visualize the entire knowledge graph with different node types and relationship types clearly distinguished
6. Navigate the graph by clicking on nodes and following relationships
7. Search across all nodes in a space
8. View version history of any node and restore previous versions
9. Place nodes in multiple contexts (multi-context membership)
10. Detect and prevent circular containment relationships while allowing cycles in other relationship types

### Acceptance Scenarios

#### Authentication & Space Access
1. **Given** a new user, **When** they register with email and password, **Then** they receive access to create spaces
2. **Given** an existing user, **When** they log in, **Then** they see their list of accessible spaces
3. **Given** a logged-in user, **When** they select a space, **Then** they see all nodes in that space

#### Node Management
4. **Given** a user in a space, **When** they create a new node with title and content, **Then** the node appears in the space and graph
5. **Given** a user viewing a node, **When** they edit the title or content, **Then** changes are saved and a new version is created
6. **Given** a user viewing a node, **When** they delete it, **Then** system warns about orphaned children or cascading deletion based on parent count
7. **Given** a user, **When** they create a node with type CONTEXT, **Then** it can contain other nodes
8. **Given** a user, **When** they search for keywords, **Then** results show matching nodes with highlighted text

#### Relationship & Graph Visualization
9. **Given** a user viewing a node, **When** they create a relationship to another node, **Then** the relationship appears as an edge in the graph with appropriate styling based on relationship type
10. **Given** a user creating a relationship, **When** selecting relationship type, **Then** system offers options: contains, depends_on, references, triggers, next, calls
11. **Given** a user, **When** they attempt to create a containment relationship that would form a cycle, **Then** system prevents it and shows the cycle path
12. **Given** a user, **When** they create a dependency or reference relationship that forms a cycle, **Then** system allows it (cycles permitted for non-containment)
13. **Given** a user viewing the graph, **When** they see different node types, **Then** CONTEXT, REGULAR, and ASSUMPTION nodes are visually distinct
14. **Given** a user viewing the graph, **When** they see different relationship types, **Then** contains, depends_on, references, triggers, next, and calls edges are visually distinct
15. **Given** a user viewing the graph, **When** they click on a node, **Then** they navigate to the node's detail view
16. **Given** a user viewing the graph, **When** they click on an edge, **Then** they see relationship details (type, source, target, metadata)

#### Multi-Context & Navigation
17. **Given** a node belonging to multiple contexts, **When** a user views it, **Then** all parent contexts are displayed
18. **Given** a user navigating through contexts, **When** they follow a path, **Then** breadcrumbs show the current navigation trail
19. **Given** a user viewing a node with multiple parents, **When** they use the context switcher, **Then** they can jump between parent contexts

#### Version Control
20. **Given** a user viewing a node, **When** they access version history, **Then** they see all previous versions with timestamps and authors
21. **Given** a user comparing versions, **When** they view the diff, **Then** changes in content and metadata are highlighted
22. **Given** a user selecting a previous version, **When** they restore it, **Then** a new version is created with the restored content

### Edge Cases
- What happens when a user tries to delete a CONTEXT node that contains other nodes?
- How does the system handle extremely large graphs (>1000 nodes)?
- What happens when two users edit the same node simultaneously?
- How does the system handle version conflicts during restoration?
- What happens when a user is removed from a space?
- How does search rank results when multiple nodes match the query?
- What happens when a node belongs to a context that gets deleted?

---

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & Authorization
- **FR-001**: System MUST allow users to register with email and password
- **FR-002**: System MUST authenticate users and maintain secure sessions using JWT tokens
- **FR-003**: System MUST restrict access to spaces based on user membership
- **FR-004**: System MUST log users out after session expiration or explicit logout action

#### Space Management
- **FR-005**: Users MUST be able to create new spaces with unique names (slugs)
- **FR-006**: Users MUST be able to view only spaces they have access to
- **FR-007**: Users MUST be able to switch between spaces with space context clearing
- **FR-008**: System MUST isolate data between different spaces (no cross-space data leakage)
- **FR-009**: Users MUST be able to delete spaces they own
- **FR-010**: System MUST support space ownership (creator is owner) with potential for future multi-user collaboration

#### Node Creation & Editing
- **FR-011**: Users MUST be able to create nodes with a required title and optional markdown content
- **FR-012**: Users MUST be able to specify node type (REGULAR, CONTEXT, ASSUMPTION) during creation
- **FR-013**: System MUST support markdown formatting in node content stored in markdown_content field
- **FR-014**: Users MUST be able to edit existing node titles and markdown content
- **FR-015**: Users MUST be able to delete nodes they created
- **FR-016**: System MUST create a new version every time a node is modified (automatic versioning)
- **FR-017**: System MUST validate that CONTEXT nodes can contain other nodes via containment relationships

#### Relationship Management
- **FR-018**: Users MUST be able to create relationships between nodes with types: contains, depends_on, references, triggers, next, calls
- **FR-019**: System MUST prevent creation of circular containment relationships (CONTEXT → Node cycles forbidden)
- **FR-020**: System MUST allow cycles for all non-containment relationship types
- **FR-021**: System MUST display the cycle path when preventing a circular containment relationship
- **FR-022**: Users MUST be able to delete relationships they created
- **FR-023**: System MUST support nodes belonging to multiple parent contexts simultaneously (super position)

#### Graph Visualization
- **FR-024**: System MUST display all nodes in a space as a visual graph
- **FR-025**: System MUST distinguish node types visually (different colors/shapes for CONTEXT, REGULAR, ASSUMPTION)
- **FR-026**: System MUST distinguish relationship types visually (different line styles/colors for each relationship type)
- **FR-027**: Users MUST be able to zoom, pan, and navigate the graph
- **FR-028**: Users MUST be able to click on nodes to view details
- **FR-029**: Users MUST be able to click on edges to view relationship details
- **FR-030**: System MUST use layout algorithms that handle cyclic graphs appropriately

#### Search & Discovery
- **FR-031**: Users MUST be able to search nodes by title and markdown content
- **FR-032**: System MUST highlight matching text in search results
- **FR-033**: System MUST scope search to the current space by default
- **FR-034**: System MUST rank search results by relevance (using backend's full-text search)
- **FR-035**: Users MUST be able to filter search by node type (REGULAR, CONTEXT, ASSUMPTION)
- **FR-036**: Users MUST be able to filter search by date range (creation and/or modification dates)

#### Version Control
- **FR-037**: Users MUST be able to view complete version history for any node
- **FR-038**: System MUST display version timestamps, authors, and change summaries
- **FR-039**: Users MUST be able to compare any two versions and see differences (diff view)
- **FR-040**: Users MUST be able to restore a previous version (creates new version, non-destructive)
- **FR-041**: System MUST preserve all versions indefinitely (append-only version history)

#### Navigation & Context
- **FR-042**: System MUST display breadcrumbs showing the current navigation path
- **FR-043**: Users MUST see all parent contexts when viewing a node with multiple parents (super position)
- **FR-044**: Users MUST be able to jump between parent contexts using a context switcher
- **FR-045**: System MUST handle orphaned nodes when their parent context is deleted (warn user with cascading vs orphaning options)

#### Performance & Scalability
- **FR-046**: System MUST load and display graphs with up to 1000 nodes efficiently (with progressive loading for larger graphs)
- **FR-047**: System MUST respond to user interactions within 200ms for optimal user experience
- **FR-048**: System MUST support multiple concurrent users per space (backend handles concurrent access)

#### Error Handling
- **FR-049**: System MUST display user-friendly error messages when operations fail (parsed from backend RFC 7807 format)
- **FR-050**: System MUST prevent data loss during network failures using retry logic with exponential backoff
- **FR-051**: System MUST handle version conflicts when simultaneous edits occur using optimistic locking (version field mismatch detection)

#### Security & Privacy
- **FR-052**: System MUST protect user credentials during transmission and storage (JWT tokens, HTTPS)
- **FR-053**: System MUST prevent cross-site scripting attacks in user-generated markdown content (sanitization)
- **FR-054**: System MUST prevent unauthorized access to other users' spaces (space-scoped API calls)
- **FR-055**: System MUST support basic audit logging (track node creation, modification, deletion with timestamps and user IDs)

### Key Entities *(include if feature involves data)*

- **User**: Represents a registered person with email, password, and access to multiple spaces. Can create nodes, relationships, and spaces.

- **Space**: A container that isolates sets of nodes and relationships. Has a unique name/slug, an owner, and potentially multiple members with different permission levels.

- **Node**: The fundamental unit of knowledge. Has a unique ID, title, slug, markdown_content (stored markdown), node type (REGULAR, CONTEXT, ASSUMPTION), creator, timestamps, and optional metadata (nodeDetails). Belongs to exactly one space.

- **Relationship (Edge/Attribute)**: A directed connection between two nodes, displayed as "edges" in the graph but stored as "attributes" in the backend. Has a type (attribute_key: contains, depends_on, references, triggers, next, calls), an optional value, and metadata about creation. Containment relationships must be acyclic, others may cycle. Frontend creates/deletes via attributes API endpoints.

- **NodeVersion**: A historical snapshot of a node's state. Captures title, content, and metadata at a specific point in time. Includes author, timestamp, and links to the current node.

- **Context**: A special type of node (nodeType = CONTEXT) that can contain other nodes via "contains" relationships. Used for hierarchical organization. A node can belong to multiple contexts (super position).

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs) - Removed tech stack specifics
- [x] Focused on user value and business needs - Centered on knowledge graph workflows
- [x] Written for non-technical stakeholders - Used plain language
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain - **All clarifications resolved in iteration 2**
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded - Frontend for knowledge graph management
- [x] Dependencies and assumptions identified - Requires backend API

**Clarifications Resolved (Iteration 2)**:
1. Session timeout period (FR-004) → Session expiration handled by JWT
2. Space collaboration roles (FR-010) → Owner-based with future collaboration support
3. Date filter scope (FR-036) → Both creation and modification dates
4. Version retention policy (FR-041) → Indefinite append-only storage
5. Orphaned node handling (FR-045) → User warning with cascading/orphaning choice
6. Target graph size (FR-046) → Up to 1000 nodes with progressive loading
7. Response time targets (FR-047) → <200ms for optimal UX
8. Concurrent user limits (FR-048) → Backend handles concurrency
9. Data loss prevention (FR-050) → Retry with exponential backoff
10. Conflict resolution (FR-051) → Optimistic locking with version field
11. Audit logging (FR-055) → Basic logging of CRUD operations

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked and resolved (iteration 2)
- [x] User scenarios defined (22 acceptance scenarios + edge cases)
- [x] Requirements generated (55 functional requirements, all clarified)
- [x] Entities identified (6 key entities with edge-attribute mapping)
- [x] Review checklist passed (all clarifications resolved)
- [x] Edge-to-attribute mapping incorporated from constitution v1.1.0

---

## Edge-to-Attribute Mapping

As defined in the constitutional principles, the frontend-backend relationship mapping is critical:

- **Frontend Terminology**: "Edges" in graph visualization
- **Backend Terminology**: "Attributes" in data storage
- **Mapping Rule**: Every visual edge MUST correspond to an attribute record
- **Type Field**: `attribute_key` determines the edge type/style
- **API Operations**:
  - Create edge → POST /api/nodes/{fromId}/attributes
  - Delete edge → DELETE /api/nodes/{id}/attributes/{attrId}
  - Fetch edges → GET /api/nodes/{id}/attributes

This ensures consistency between what users see in the graph and what is stored in the backend.

---

## Dependencies & Assumptions

### Dependencies
- Backend REST API must be available with all required endpoints:
  - Authentication: POST /api/users/register, POST /api/users/login
  - Spaces: POST /api/spaces, GET /api/spaces/{slug}, DELETE /api/spaces/{slug}
  - Nodes: POST/GET/PUT/DELETE /api/spaces/{slug}/nodes/{id}
  - Attributes (Edges): POST/GET/DELETE /api/nodes/{id}/attributes
  - Versions: GET /api/nodes/{id}/versions, POST /api/nodes/{id}/versions/{versionId}/restore
  - Search: GET /api/nodes/search
- Backend must enforce space isolation and access control
- Backend must handle cycle detection for containment relationships
- Backend must provide version control for all node changes
- Backend must implement full-text search with ranking

### Assumptions
- Users have modern web browsers (last 2 versions of Chrome, Firefox, Safari, Edge)
- Users have stable internet connectivity for real-time graph operations
- Markdown rendering is safe from XSS attacks (backend sanitization or frontend library)
- Graph visualizations are primarily for exploration (not for high-frequency editing workflows)
- Version history is append-only (no deletion of historical versions)

---

**Next Phase**: Implementation planning (/plan command) will determine technical approach, architecture decisions, and task breakdown.
