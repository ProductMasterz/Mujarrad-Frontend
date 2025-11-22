# Feature Specification: Interactive Graph Node Creation

**Feature Branch**: `007-we-are-going`
**Created**: 2025-11-22
**Status**: Draft
**Input**: User description: "we are going to create our active flow solid features with solid connections. Once I create a node inside the graph, it's supposed to be created in the database and appear inside the workspace. So basically, I need you to start understanding what I'm doing or what I am trying to do and develop the needed specs accordingly. I'm going to provide you a URL that has a lot of examples from React Flow itself so that you don't recreate or reinvent the wheel. https://reactflow.dev/examples"

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a knowledge worker using Mujarrad, I want to create nodes directly within the graph visualization by clicking or dragging, so that I can quickly build out my knowledge structure without switching contexts to dialogs or forms. When I create a node in the graph, it should immediately persist to the database and appear in the workspace's node list and hierarchy.

### Acceptance Scenarios

1. **Given** a user is viewing a space's graph, **When** they perform a node creation action (e.g., click empty canvas, drag from palette, or drop connection on empty space), **Then** a new node is created at that position, saved to the database, and visible in both the graph and workspace node list.

2. **Given** a user creates a node in the graph, **When** the creation is successful, **Then** the user can immediately edit the node's properties (name, type, content) without leaving the graph view.

3. **Given** a user drags a connection from an existing node and drops it on empty canvas space, **When** the drop occurs, **Then** a new node is created and automatically connected to the source node via a relationship.

4. **Given** a user creates a node in the graph, **When** the node is saved, **Then** it appears in the hierarchy navigator and can be accessed from the workspace's node list immediately.

5. **Given** a user is creating a node in the graph, **When** the creation fails (network error, validation error), **Then** the user receives clear feedback and the graph state is not corrupted.

6. **Given** a user creates multiple nodes rapidly in the graph, **When** each creation completes, **Then** all nodes are persisted correctly without data loss or conflicts.

### Edge Cases
- What happens when a user tries to create a node but loses network connectivity?
- How does the system handle creating a node when the user doesn't have edit permissions for the space?
- What happens if a user tries to create a node with a duplicate name within the same space?
- How does the graph handle undo/redo for node creation? [NEEDS CLARIFICATION: Is undo/redo required for this feature?]
- What is the default node type when creating from the graph? [NEEDS CLARIFICATION: Should user be prompted for type, or use a default?]

---

## Requirements *(mandatory)*

### Functional Requirements

#### Node Creation in Graph
- **FR-001**: System MUST allow users to create new nodes directly within the graph visualization interface
- **FR-002**: System MUST provide at least one intuitive method for initiating node creation in the graph [NEEDS CLARIFICATION: Which methods? Options include: click on empty space, drag from sidebar palette, context menu, keyboard shortcut, drop connection on empty space]
- **FR-003**: System MUST create the node at the visual position where the user initiated the creation action
- **FR-004**: System MUST persist newly created nodes to the database immediately upon creation
- **FR-005**: System MUST display the new node in the graph immediately after creation (optimistic update)

#### Node Properties
- **FR-006**: System MUST allow users to set a name for the new node [NEEDS CLARIFICATION: Should this be inline editing in the graph or a minimal dialog?]
- **FR-007**: System MUST allow users to select the node type (Context, Regular, Template, Assumption) during or immediately after creation
- **FR-008**: System SHOULD allow users to add initial content/description to the node from the graph view [NEEDS CLARIFICATION: Is this required, or can content be added later in detail view?]

#### Connection Creation (Edge on Drop)
- **FR-009**: System MUST create a new node when a user drags a connection handle and drops it on empty canvas space
- **FR-010**: System MUST automatically create a relationship (edge) between the source node and the newly created node
- **FR-011**: System MUST allow users to specify the relationship type when creating via edge drop [NEEDS CLARIFICATION: Should this default to a specific type like "contains" or "references"?]

#### Workspace Synchronization
- **FR-012**: System MUST update the workspace's node list to include newly created nodes immediately
- **FR-013**: System MUST update the hierarchy navigator to reflect newly created nodes and their relationships
- **FR-014**: System MUST ensure the graph view stays synchronized with other views (list, hierarchy) in real-time

#### Visual Feedback & UX
- **FR-015**: System MUST provide visual feedback during node creation (e.g., placeholder node, loading indicator)
- **FR-016**: System MUST display error messages clearly when node creation fails
- **FR-017**: System MUST allow users to cancel a node creation in progress
- **FR-018**: System SHOULD position new nodes to avoid overlap with existing nodes [NEEDS CLARIFICATION: Should the system auto-layout, or preserve exact drop position?]

#### Permissions & Validation
- **FR-019**: System MUST validate user has edit permissions before allowing node creation in the graph
- **FR-020**: System MUST validate node name is not empty before persisting
- **FR-021**: System MUST enforce any space-specific constraints on node creation

### Non-Functional Requirements
- **NFR-001**: Node creation should complete within 2 seconds under normal network conditions
- **NFR-002**: Graph should remain responsive during node creation (no UI blocking)
- **NFR-003**: System should handle concurrent node creations from the same user without conflicts

### Key Entities

- **Node**: A knowledge unit in the workspace. Has name, type (Context/Regular/Template/Assumption), content, and position within the graph. Can have relationships with other nodes.

- **Relationship (Edge/Attribute)**: A connection between two nodes representing a semantic relationship. Types include "contains" (hierarchical) and "references" (associative).

- **Graph Position**: The visual x/y coordinates where a node appears in the graph view. May be stored for persistence or calculated dynamically.

---

## Out of Scope
- Advanced graph layouts (force-directed, hierarchical) - use existing circular layout
- Multi-select and bulk node creation
- Copy/paste nodes
- Import/export graph data
- Collaborative real-time editing (multiple users editing same graph simultaneously)

---

## Dependencies & Assumptions

### Dependencies
- Existing React Flow graph implementation
- Existing node creation API endpoints
- Existing relationship/attribute creation API endpoints
- Current workspace node list and hierarchy navigator components

### Assumptions
- The backend already supports all necessary API operations for node and relationship creation
- Users are already authenticated and have space membership
- The graph component already handles basic node rendering and edge connections

---

## Reference Materials
- React Flow Examples: https://reactflow.dev/examples
  - Relevant examples: Add Node on Edge Drop, Drag and Drop, Save and Restore, Custom Nodes

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous (where not marked)
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Clarifications Needed

1. **Node creation method**: Which interaction methods should be supported? (click empty space, drag from palette, context menu, edge drop, etc.)

2. **Default node type**: What type should be assigned when creating from graph? Should user be prompted?

3. **Property editing UX**: Should name/type be set via inline editing in graph or a minimal dialog?

4. **Content entry**: Is adding node content from graph view required, or can users add it later in detail view?

5. **Relationship type on edge drop**: What default relationship type when creating node via edge drop?

6. **Undo/redo**: Is undo/redo functionality required for graph node creation?

7. **Auto-layout**: Should new nodes auto-position to avoid overlap, or preserve exact drop position?

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed (clarifications pending)

---
