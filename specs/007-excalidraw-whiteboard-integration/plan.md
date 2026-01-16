# Implementation Plan: Excalidraw Whiteboard Integration

**Branch**: `007-excalidraw-whiteboard-integration` | **Date**: 2025-11-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-excalidraw-whiteboard-integration/spec.md`

## Summary
Integrate Excalidraw as an infinite canvas whiteboard within Mujarrad spaces, persisting all canvas elements to the backend as Nodes with JSON configurations. Elements map to Node types, connectors map to Attributes (relationships). Data-driven architecture enables flexible element-to-entity mapping without code changes.

## Technical Context
**Language/Version**: TypeScript 5.3.3, React 18.2.0, Next.js 14.1.0
**Primary Dependencies**: @excalidraw/excalidraw, @tanstack/react-query 5.17.19, axios 1.6.5, zustand 4.4.7
**Storage**: PostgreSQL via REST API (https://mujarrad.onrender.com), JSON configuration fields
**Testing**: Jest + React Testing Library + Playwright (E2E)
**Target Platform**: Web (modern browsers)
**Project Type**: Web (frontend only - backend exists)
**Performance Goals**: Load whiteboard <3s for 100 elements, non-blocking auto-save
**Constraints**: Accept temporary inconsistency on connection loss (MVP), no real-time collaboration yet
**Scale/Scope**: Single user per canvas, ~100 elements typical, ~500 max

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Node Supremacy | ✅ PASS | All Excalidraw elements stored as Nodes |
| II. Relationship-Driven Structure | ✅ PASS | Connectors/arrows → Attributes with relationship types |
| III. Abstraction Immutability | ✅ PASS | Element configs stored as data (JSON), not code |
| IV. Backend Architecture Alignment | ✅ PASS | Uses existing Node/Attribute REST APIs |
| V. Clean Architecture | ✅ PASS | Service layer for API, hooks for state, components for UI |
| VI. Type Safety | ✅ PASS | TypeScript interfaces for Excalidraw elements and Node mappings |
| VII. Graph Visualization First | ✅ PASS | Excalidraw IS the graph visualization for this view |
| VIII. Space Isolation | ✅ PASS | Whiteboard scoped to space, loaded via space slug |
| IX. Version Awareness | ⚠️ PARTIAL | Elements versioned via Node versioning, but no canvas-level undo |
| X. Performance | ✅ PASS | Debounced auto-save, lazy loading planned |

**Technology Stack Compliance**:
- ✅ Next.js 14 (LOCKED)
- ✅ React 18 + TypeScript (LOCKED)
- ✅ TanStack Query (LOCKED)
- ✅ Zustand (LOCKED)
- ⚠️ Adding @excalidraw/excalidraw (new dependency, MIT licensed, justified)

## Project Structure

### Documentation (this feature)
```
specs/007-excalidraw-whiteboard-integration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/tasks command)
```

### Source Code (repository root)
```
src/
├── components/
│   └── whiteboard/
│       ├── WhiteboardCanvas.tsx      # Excalidraw wrapper component
│       ├── WhiteboardPage.tsx        # Page container with loading/error states
│       └── index.ts
├── hooks/
│   └── api/
│       ├── useWhiteboard.ts          # Query hook for loading whiteboard state
│       └── useWhiteboardMutations.ts # Mutation hooks for save/update
├── services/
│   └── api/
│       └── whiteboard.service.ts     # API service for whiteboard operations
├── stores/
│   └── whiteboardStore.ts            # Zustand store for local whiteboard state
├── types/
│   └── whiteboard.ts                 # TypeScript types for Excalidraw/Node mapping
└── lib/
    └── whiteboard/
        ├── elementMapper.ts          # Map Excalidraw elements ↔ Nodes
        └── configSchemas.ts          # JSON schemas for element configurations

app/
└── spaces/
    └── [slug]/
        └── whiteboard/
            └── page.tsx              # Whiteboard route

tests/
├── unit/
│   └── whiteboard/
│       └── elementMapper.test.ts
└── integration/
    └── whiteboard/
        └── save-load.test.tsx
```

**Structure Decision**: Frontend-only changes, backend already supports Node/Attribute storage with JSON fields

## Phase 0: Outline & Research

### Research Tasks Completed

1. **Excalidraw React Integration**
   - Decision: Use `@excalidraw/excalidraw` npm package
   - Rationale: Official React wrapper, well-documented API, active maintenance
   - Key API: `onChange` callback for state changes, `excalidrawAPI` for programmatic control

2. **State Management Pattern**
   - Decision: Use lazy state initialization, avoid infinite loops
   - Rationale: Excalidraw's onChange fires frequently, must avoid re-render loops
   - Pattern: `useMemo` wrapper for Excalidraw component, debounced saves

3. **Element Data Structure**
   - Decision: Store complete Excalidraw element JSON in Node configuration
   - Rationale: Enables perfect reconstruction, no data loss
   - Format: Each element has type, id, x, y, properties - all stored in `node_details` JSON

4. **Element-to-Node Mapping**
   - Decision: Map by Excalidraw element type → Mujarrad Node type
   - Mapping:
     - rectangle, ellipse, diamond → Node type "SHAPE"
     - text → Node type "TEXT"
     - arrow, line → Attribute (relationship) between bound elements
     - freedraw → Node type "DRAWING"

5. **Persistence Strategy**
   - Decision: Debounced auto-save (2 second delay after last change)
   - Rationale: Balance between data safety and API load
   - Implementation: Save full element array, diff on backend if needed later

**Output**: See research.md for detailed findings

## Phase 1: Design & Contracts

### Data Model

See `data-model.md` for complete entity definitions including:
- WhiteboardElement (Excalidraw JSON structure)
- Node extensions for whiteboard elements
- Attribute mapping for connectors

### API Contracts

See `contracts/` directory for:
- `whiteboard-api.yaml` - OpenAPI spec for whiteboard endpoints
- Contract tests in `/tests/contract/`

### Quickstart

See `quickstart.md` for:
- Setup instructions
- Test scenarios from user stories
- Validation steps

### Agent Context

Run update script to add whiteboard context to CLAUDE.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Phase 1: Setup & Dependencies (install Excalidraw, types)
- Phase 2: Core Component (WhiteboardCanvas wrapper)
- Phase 3: Service Layer (API service, hooks)
- Phase 4: State Management (Zustand store, element mapper)
- Phase 5: Page Integration (route, loading states)
- Phase 6: Testing (unit tests, integration tests)

**Ordering Strategy**:
- TDD approach where possible
- Dependencies first: types → services → hooks → components → pages
- Mark [P] for parallel tasks (independent files)

**Estimated Output**: 20-25 tasks covering full MVP implementation

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New dependency (@excalidraw/excalidraw) | Core feature requirement | Building whiteboard from scratch would take weeks |
| JSON storage for element config | Excalidraw elements have 20+ properties | Normalized tables would be over-engineered for MVP |

## Progress Tracking

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning approach documented (/plan command)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v1.2.0 - See `.specify/memory/constitution.md`*
