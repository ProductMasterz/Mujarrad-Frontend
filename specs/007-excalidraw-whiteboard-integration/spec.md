# Feature Specification: Excalidraw Whiteboard Integration

**Feature Branch**: `007-excalidraw-whiteboard-integration`
**Created**: 2025-11-22
**Status**: Draft
**Input**: User description: "Build a FigJam-like collaborative whiteboard using Excalidraw (MIT licensed) as the canvas engine. Elements created in the whiteboard persist to the Mujarrad database. Data-driven configuration architecture where element types map to Node configurations stored as JSON."

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a Mujarrad user, I want to create and manipulate visual elements (sticky notes, shapes, connectors) on an infinite canvas whiteboard, so that I can brainstorm, diagram, and organize knowledge visually. All elements I create should persist to my space and be available when I return.

### Acceptance Scenarios

1. **Given** a user navigates to a space's whiteboard view, **When** the page loads, **Then** they see an interactive canvas where they can create shapes, sticky notes, and draw freely.

2. **Given** a user creates elements on the whiteboard (sticky note, shape, connector), **When** they leave and return to the whiteboard, **Then** all elements are restored exactly as they left them.

3. **Given** a user creates a sticky note on the whiteboard, **When** it is saved, **Then** it is stored as a Node in the database with appropriate type configuration.

4. **Given** a user draws a connector between two elements, **When** it is saved, **Then** it is stored as an Attribute (relationship) linking the two corresponding Nodes.

5. **Given** a user modifies an element (move, resize, edit text), **When** the modification is complete, **Then** the change is persisted to the database.

6. **Given** a user deletes an element from the whiteboard, **When** deleted, **Then** the corresponding Node/Attribute is removed from the database.

### Edge Cases
- What happens if the user loses internet connection while editing? (Accept temporary inconsistency for MVP)
- How are concurrent edits handled if user has multiple tabs open? (Out of scope for MVP)
- What happens when canvas has hundreds of elements? (Performance testing needed)

---

## Requirements *(mandatory)*

### Functional Requirements

#### Phase 1: Basic Excalidraw Integration
- **FR-001**: System MUST display an Excalidraw canvas within the space's whiteboard view
- **FR-002**: System MUST allow users to create all standard Excalidraw elements (shapes, sticky notes, text, connectors, freehand drawing)
- **FR-003**: System MUST preserve Excalidraw's native UI and tools (no customization for MVP)
- **FR-004**: System MUST load existing whiteboard state when user navigates to the view

#### Phase 2: Data Persistence
- **FR-005**: System MUST save whiteboard state to the database via API
- **FR-006**: System MUST map Excalidraw elements to Mujarrad Node entities
- **FR-007**: System MUST map Excalidraw connectors/arrows to Mujarrad Attribute (relationship) entities
- **FR-008**: System MUST store element-specific configuration as JSON (position, size, color, text, etc.)
- **FR-009**: System MUST auto-save changes (debounced to avoid excessive API calls)

#### Phase 3: Data-Driven Configuration
- **FR-010**: System MUST store element type configurations in a JSON lookup structure
- **FR-011**: System MUST support different Node types for different Excalidraw element types
- **FR-012**: System MUST reconstruct elements from stored JSON configuration on load
- **FR-013**: System MUST maintain referential integrity between whiteboard elements and database entities

#### Permissions & Validation
- **FR-014**: System MUST validate user has edit permissions before allowing whiteboard modifications
- **FR-015**: System MUST handle save failures gracefully with user feedback

### Non-Functional Requirements
- **NFR-001**: Whiteboard should load within 3 seconds for canvases with up to 100 elements
- **NFR-002**: Auto-save should not block or freeze the UI
- **NFR-003**: Canvas should remain responsive during save operations

### Key Entities

- **Node**: Represents any whiteboard element (sticky note, shape, text box, etc.). Contains type, name, and JSON configuration for visual properties.

- **Attribute (Relationship)**: Represents connections between elements. Maps to Excalidraw arrows/connectors linking two Nodes.

- **Element Configuration**: JSON structure storing all properties needed to reconstruct an Excalidraw element (position, dimensions, color, text, style, etc.).

- **Configuration Lookup Table**: Database table mapping element types to their configuration schemas and rendering rules.

---

## Out of Scope (MVP)

- Real-time collaboration (multiple users editing simultaneously) - will be added later
- Custom Excalidraw UI/theme customization
- Element-to-Node bidirectional sync (editing Node in list updates whiteboard)
- Undo/redo persistence across sessions
- Export/import whiteboard data
- Offline support with sync
- Event durability (OutBox pattern, Restate) - architecture planned but not implemented

---

## Future Considerations (Post-MVP)

- **Real-time collaboration**: Research Excalidraw's collaboration features, may need backend WebSocket support
- **Durable workflows**: Implement Restate for event durability and consistency
- **OutBox pattern**: PostgreSQL OutBox for event preservation during connection issues
- **Bidirectional sync**: Changes in whiteboard reflect in node list and vice versa

---

## Dependencies & Assumptions

### Dependencies
- @excalidraw/excalidraw npm package (MIT licensed)
- Existing Node API endpoints (create, update, delete)
- Existing Attribute API endpoints for relationships
- Database schema support for JSON configuration storage

### Assumptions
- Excalidraw can be embedded as a React component without modification
- Backend can store and retrieve arbitrary JSON configurations
- Element-to-Node mapping can be established via element type → node type
- Users have existing space membership and permissions

---

## Architecture Decisions

1. **No UI Customization**: Ship Excalidraw as-is to minimize complexity and time to market
2. **Data-Driven Configuration**: All element properties stored as JSON, making the system flexible and extensible
3. **Configuration Lookup Tables**: Database tables define how each element type maps to Node configuration
4. **Accept Temporary Inconsistency**: For MVP, accept that connection loss may cause unsaved changes
5. **API-First Persistence**: All saves go through existing REST API endpoints

---

## Reference Materials
- Excalidraw: https://excalidraw.com
- Excalidraw GitHub: https://github.com/excalidraw/excalidraw
- Excalidraw React Component: https://www.npmjs.com/package/@excalidraw/excalidraw
- FigJam (inspiration): https://www.figma.com/figjam/

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
- [x] Ambiguities resolved
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

**Status: Ready for Planning Phase**

---
