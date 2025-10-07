# Feature Specification: Complete CRUD UI for All Schema Entities

**Feature Branch**: `003-crud-ui-i`
**Created**: 2025-10-07
**Status**: Draft
**Input**: User description: "CRUD UI -- I need to develop the CRUD operations UI for all schema entities integrated with in the frontend. Especially the space because I didn't find a button to create 1"

## Execution Flow (main)
```
1. Parse user description from Input
   → Feature: Complete CRUD UI for Workspaces, Nodes, Attributes, and Version History
2. Extract key concepts from description
   → Actors: Authenticated users
   → Actions: Create, Read, Update, Delete for all entities
   → Data: Workspaces (spaces), Nodes, Attributes (relationships), Node Versions
   → Priority: Workspace creation is critical (currently missing)
3. For each unclear aspect:
   → [NEEDS CLARIFICATION: Should users be able to delete workspaces? What happens to nodes?]
   → [NEEDS CLARIFICATION: Can users edit/delete node versions or are they immutable?]
   → [NEEDS CLARIFICATION: What permissions do users have? Can any user modify any workspace?]
   → [NEEDS CLARIFICATION: Should there be bulk operations (multi-select delete)?]
   → [NEEDS CLARIFICATION: What validation rules apply to workspace slugs?]
4. Fill User Scenarios & Testing section
   → Primary flow: Create workspace → Add nodes → Manage relationships
5. Generate Functional Requirements
   → CRUD operations for each entity type
6. Identify Key Entities
   → Workspace, Node, Attribute, NodeVersion
7. Run Review Checklist
   → WARN "Spec has uncertainties regarding permissions and deletion behavior"
8. Return: SUCCESS (spec ready for clarification then planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## Clarifications

### Session 2025-10-07
- Q: When a user deletes a workspace, what should happen to its contained nodes and relationships? → A: Cascade delete - All nodes and relationships are automatically deleted
- Q: What are the permission rules for workspace and node access? → A: Shared workspaces - Owners can invite specific users with edit permissions
- Q: When a user deletes a node, what should happen to its relationships (attributes)? → A: Cascade delete - All relationships (incoming and outgoing) are automatically deleted
- Q: Are node versions immutable (read-only history) or can users restore/modify them? → A: Restorable + Deletable - Users can both restore and delete version entries
- Q: Should the system allow circular relationships (e.g., Node A → Node B → Node A)? → A: Allow all - No restrictions on circular relationships

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As an authenticated user, I need to manage my knowledge graph workspaces and their contents. I should be able to create new workspaces (spaces), add and organize nodes within them, establish relationships between nodes, and maintain the integrity of my knowledge structure through full CRUD capabilities.

**Critical Gap**: Currently, users cannot create workspaces, blocking the primary workflow.

### Acceptance Scenarios

#### Workspace Management
1. **Given** a logged-in user on the workspaces page, **When** they click a "Create Workspace" button, **Then** they see a form to enter workspace name, slug, and optional description
2. **Given** a user viewing their workspaces list, **When** they select a workspace, **Then** they can view its details and access edit/delete options (if owner or invited collaborator)
3. **Given** a workspace owner, **When** they access workspace settings, **Then** they can invite users by email or username to become collaborators
4. **Given** a user editing a workspace, **When** they update the name or description and save, **Then** the changes are reflected immediately
5. **Given** a user attempting to delete a workspace, **When** they confirm deletion, **Then** all contained nodes and their relationships are permanently deleted (cascade delete)
6. **Given** a user without permissions, **When** they attempt to access another user's private workspace, **Then** they receive an access denied message

#### Node Management
5. **Given** a user inside a workspace, **When** they click "Create Node", **Then** they see a form with fields for title, type (Regular/Context/Assumption), and markdown content
6. **Given** a user viewing a node, **When** they click edit, **Then** they can modify the title, type, and content
7. **Given** a user viewing a node, **When** they request to delete it, **Then** the node and all its relationships (both incoming and outgoing) are permanently deleted (cascade delete)
8. **Given** a user creating/editing a node, **When** they provide markdown content, **Then** they should see a preview of the rendered content

#### Relationship (Attribute) Management
9. **Given** a user viewing a node, **When** they click "Add Relationship", **Then** they can select a target node and relationship type (contains, depends_on, references, triggers, next, calls)
10. **Given** a user viewing node relationships, **When** they see the list of connections, **Then** they can delete individual relationships
11. **Given** a user creating a relationship, **When** they select a type and target node, **Then** the relationship is created without restriction (circular relationships are allowed)

#### Version History
12. **Given** a user viewing a node, **When** they access version history, **Then** they see a chronological list of all previous versions
13. **Given** a user viewing a specific version, **When** they compare it to current, **Then** they can see what changed
14. **Given** a user viewing an old version, **When** they choose to restore it, **Then** a new version is created with the restored content (preserving history)
15. **Given** a user viewing version history, **When** they select a version to delete, **Then** that version entry is permanently removed from history

### Edge Cases
- What happens when a user tries to create a workspace with a duplicate slug?
- How does the system handle attempting to create a relationship to a non-existent node?
- What happens when a user tries to delete a node that has dependent relationships? (Answer: Cascade delete all relationships)
- How does the system handle concurrent edits to the same node (optimistic locking)?
- What is the maximum length for workspace names, node titles, and markdown content?
- Can a workspace have zero nodes?
- Can a node have zero relationships?
- Are circular relationships displayed differently in the UI to help users identify cycles?

## Requirements *(mandatory)*

### Functional Requirements

#### Workspace (Space) CRUD
- **FR-001**: System MUST provide a clearly visible button/action to create a new workspace from the workspaces list page
- **FR-002**: Users MUST be able to view a list of all their workspaces with name, slug, description, and creation date
- **FR-003**: Users MUST be able to edit workspace name and description
- **FR-004**: System MUST validate workspace slugs to ensure uniqueness and valid format [NEEDS CLARIFICATION: What is valid format? alphanumeric-with-dashes?]
- **FR-005**: Users MUST be able to delete workspaces with cascade deletion of all contained nodes, relationships, and version history
- **FR-006**: System MUST prevent creation of duplicate workspace slugs with clear error messaging
- **FR-007**: Users MUST be able to search/filter their workspaces by name [NEEDS CLARIFICATION: Required or optional?]

#### Node CRUD
- **FR-008**: System MUST allow users to create nodes within a workspace with title, type, and markdown content
- **FR-009**: System MUST support three node types: Regular, Context, and Assumption with visual distinction
- **FR-010**: Users MUST be able to view a list of all nodes in a workspace
- **FR-011**: Users MUST be able to edit node title, type, and content
- **FR-012**: System MUST provide markdown preview during node creation/editing
- **FR-013**: Users MUST be able to delete nodes with cascade deletion of all associated relationships (both incoming and outgoing)
- **FR-014**: System MUST handle optimistic locking for concurrent node edits using version numbers
- **FR-015**: System MUST persist optional node details (JSON metadata)

#### Attribute (Relationship) CRUD
- **FR-016**: Users MUST be able to create relationships between nodes with types: contains, depends_on, references, triggers, next, calls
- **FR-017**: System MUST display all relationships for a given node (both outgoing and incoming)
- **FR-018**: Users MUST be able to delete individual relationships
- **FR-019**: System MUST allow optional metadata on relationships
- **FR-020**: System MUST validate that target nodes exist before creating relationships
- **FR-021**: System MUST allow circular relationships without validation restrictions
- **FR-022**: System MUST [NEEDS CLARIFICATION: Can a relationship have an optional attributeValue? What is its purpose?]

#### Version History
- **FR-023**: System MUST automatically create a version history entry whenever a node is updated
- **FR-024**: Users MUST be able to view complete version history for any node
- **FR-025**: Users MUST be able to view the content of any historical version
- **FR-026**: System MUST display version metadata: version number, creation timestamp, creator
- **FR-027**: Users MUST be able to restore old versions by creating a new version with the historical content
- **FR-028**: Users MUST be able to delete individual version history entries
- **FR-038**: System MUST preserve version history chain when restoring (restoration creates new version, does not overwrite)

#### Cross-Entity Requirements
- **FR-029**: System MUST display loading states during all CRUD operations
- **FR-030**: System MUST display success confirmations for create/update/delete operations
- **FR-031**: System MUST display clear error messages when operations fail with actionable guidance
- **FR-032**: System MUST require confirmation before destructive actions (delete operations)
- **FR-033**: System MUST [NEEDS CLARIFICATION: Should there be undo/redo functionality?]
- **FR-034**: System MUST enforce workspace ownership permissions where only the owner and invited collaborators can view/edit/delete workspace content
- **FR-036**: System MUST allow workspace owners to invite specific users as collaborators with edit permissions
- **FR-037**: System MUST allow workspace owners to revoke collaborator access
- **FR-035**: System MUST validate all user inputs with appropriate constraints and provide immediate feedback

### Key Entities

- **Workspace**: Represents a container for organizing related nodes. Has a unique slug (URL-friendly identifier), name, optional description, owner, and timestamps. Priority entity as creation is currently missing.

- **Node**: The fundamental unit of knowledge in a workspace. Contains a title, type classification (Regular/Context/Assumption), markdown content, optional JSON metadata, version number for conflict resolution, and audit timestamps.

- **Attribute**: Represents directed relationships between nodes. Has a source node, target node, relationship type (contains/depends_on/references/triggers/next/calls), optional value, optional metadata, and timestamps. Enables graph structure.

- **NodeVersion**: Historical record of node state. Contains snapshot of node content at a specific version number with timestamp and creator information. Supports restoration (creates new version) and deletion of individual version entries.

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain - **5 of 10 clarified, 5 minor items deferred to planning**
- [x] Requirements are testable and unambiguous - **Major ambiguities resolved**
- [x] Success criteria are measurable - **Clarifications enable concrete testing**
- [x] Scope is clearly bounded - **CRUD operations for 4 entities**
- [x] Dependencies and assumptions identified - **Requires backend API integration**

**Status**: Ready for planning phase. Core behavioral ambiguities resolved (deletion cascades, permissions, version management, circular relationships).

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted - Workspaces (priority), Nodes, Attributes, Versions
- [x] Ambiguities marked - 8 clarifications identified
- [x] User scenarios defined - 14 acceptance scenarios across 4 entity types
- [x] Requirements generated - 35 functional requirements
- [x] Entities identified - 4 key entities with relationships
- [ ] Review checklist passed - **BLOCKED: Clarifications needed**

---

## Summary for Next Phase

**Branch**: `003-crud-ui-i`
**Spec File**: `/Users/mac/Developer/Software-Projects/PMZ Projects/Mujarrad/Mujarrad-Frontend/specs/003-crud-ui-i/spec.md`

**Critical Items**:
1. Workspace creation UI (currently missing - blocking primary workflow)
2. Complete CRUD for all 4 entities
3. 8 clarifications needed before implementation planning

**Next Steps**: Run `/clarify` to resolve ambiguities, then proceed to `/plan` for implementation design.
