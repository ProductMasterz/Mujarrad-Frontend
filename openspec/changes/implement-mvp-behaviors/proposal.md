# Proposal: Implement MVP Behaviors

**Change ID:** `implement-mvp-behaviors`
**Status:** Draft
**Created:** 2026-01-22
**Author:** Claude

---

## Summary

Implement the core MVP behaviors defined in `requirements/BEHAVIORAL_REQUIREMENTS.md` to achieve a working MVP that can be used:
1. **Internally with AI agents** (via MCP server)
2. **As a Developer Platform** (Mujarrad as CMS/backend replacement)

This proposal focuses on **stabilizing current features** and **filling gaps** to create a functional, shippable MVP.

---

## Motivation

### Current State
- 63 of 69 user stories implemented (91%)
- 6 stories partially implemented
- Critical gaps in node dependency handling, duplicate detection, and application modes
- No MCP server for agent integration
- No TypeScript SDK for developers

### Target State
- All MVP behaviors work end-to-end as specified in PRD
- Agents can interact via MCP
- Developers can build on Mujarrad via SDK

---

## Scope

### In Scope (This Proposal)

#### Phase 1: Stabilization (Sprint 1-2)
1. **Node Delete with Dependencies** - Show warnings, handle cascade/orphan
2. **Duplicate Detection** - Prompt merge/rename on same-context duplicates
3. **Node Rename Consistency** - Works from all entry points
4. **Whiteboard-Hierarchy Sync** - Bidirectional sync between elements and nodes

#### Phase 2: MVP Core Features (Sprint 3-4)
5. **Relationship Type Selector** - Choose contains/depends_on/references/relates_to
6. **Application Mode Selector** - Toggle between Scoped/Full/Edit modes
7. **Super Position UI** - Show "In X contexts" indicator, allow multi-context membership
8. **Templates Basic** - Mark nodes as templates, list templates, apply templates

#### Phase 3: Developer Platform (Sprint 5-6)
9. **TypeScript SDK** - Typed API client for developers
10. **MCP Server** - Model Context Protocol server for AI agents
11. **API Key UI** - Manage API keys in settings

### Out of Scope
- Advanced versioning (phantom/mask versions)
- AI-powered suggestions
- Async communication features
- n8n automation integration
- VizViews advanced rendering
- Node types beyond regular/context

---

## Gap Analysis

| Behavioral Requirement | Current Status | Priority |
|------------------------|----------------|----------|
| Delete with dependency check | ❌ Not implemented | P1 |
| Duplicate detection/merge | ❌ Not implemented | P1 |
| Whiteboard sync | ⚠️ Partial | P1 |
| Relationship types UI | ❌ Not implemented | P2 |
| Application modes | ❌ Not implemented | P2 |
| Super position UI | ❌ Not implemented | P2 |
| Templates | ❌ Not implemented (API exists) | P2 |
| MCP server | ❌ Not implemented | P3 |
| TypeScript SDK | ❌ Not implemented | P3 |

---

## Capabilities

This change introduces/improves the following capabilities:

### Capability 1: Node Dependency Management
- **What**: Handle node deletion with awareness of children and references
- **Why**: PRD requires "Archive/delete operations with dependency checking"
- **Spec delta**: `specs/node-dependencies/spec.md`

### Capability 2: Duplicate Detection
- **What**: Detect and prompt for duplicate node titles in same context
- **Why**: PRD requires "Duplication detection within contexts"
- **Spec delta**: `specs/duplicate-detection/spec.md`

### Capability 3: Whiteboard Sync
- **What**: Bidirectional sync between whiteboard elements and node hierarchy
- **Why**: Users expect visual and text content to stay aligned
- **Spec delta**: `specs/whiteboard-sync/spec.md`

### Capability 4: Relationship Types
- **What**: UI to select relationship type when creating wires
- **Why**: PRD defines 5 relationship types: contains, depends_on, references, parent_of, relates_to
- **Spec delta**: `specs/relationship-types/spec.md`

### Capability 5: Application Modes
- **What**: Client-side mode selector (Scoped View, Full View, Edit Mode)
- **Why**: PRD requires 8 application modes; MVP needs 3 core modes
- **Spec delta**: `specs/application-modes/spec.md`

### Capability 6: Super Position
- **What**: Node in multiple contexts with visual indicator
- **Why**: PRD's "super position" principle - nodes can have multiple parents
- **Spec delta**: `specs/super-position/spec.md`

### Capability 7: Templates
- **What**: Mark nodes as templates, list/filter templates, apply to new contexts
- **Why**: PRD requires template system built on is_template flag
- **Spec delta**: `specs/templates/spec.md`

### Capability 8: MCP Server
- **What**: Model Context Protocol server for AI agent interaction
- **Why**: Enable agents to create/read/search nodes programmatically
- **Spec delta**: `specs/mcp-server/spec.md`

### Capability 9: TypeScript SDK
- **What**: Typed SDK wrapping the REST API
- **Why**: Developer platform needs easy integration
- **Spec delta**: `specs/typescript-sdk/spec.md`

---

## Technical Approach

### Frontend Changes
- Add Zustand store for application mode state
- Add dependency check modal before delete
- Add duplicate detection hook in node creation flow
- Add relationship type dropdown in wiring UI
- Add "In X contexts" badge to node cards
- Add templates section in sidebar

### Backend Dependency
- Most features use existing API endpoints
- MCP server is a new standalone service
- SDK wraps existing endpoints

### Testing Strategy
- Unit tests for hooks and stores
- Integration tests for modal flows
- E2E tests for critical paths (delete, duplicate, template apply)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Backend API gaps | Medium | Swagger shows all needed endpoints exist |
| Scope creep | High | Strict adherence to MVP scope; defer advanced features |
| Breaking existing features | Medium | E2E tests before and after changes |
| MCP complexity | Medium | Start with read-only resources, add tools incrementally |

---

## Success Criteria

1. All 6 partial stories move to "Implemented" status
2. Delete node shows dependency warning when children/references exist
3. Duplicate detection prompts user when same title in same context
4. Whiteboard elements sync with node renames
5. User can select relationship type when creating wires
6. User can toggle between Scoped/Full/Edit modes
7. Nodes show "In X contexts" when in multiple contexts
8. User can mark node as template and apply templates
9. MCP server responds to basic list/read/create operations
10. SDK can perform CRUD operations with types

---

## Open Questions

1. Should application mode persist per-user or per-session?
   - **Recommendation**: Per-session (simpler), with user preference for default mode

2. How should duplicate detection handle near-matches (fuzzy)?
   - **Recommendation**: MVP uses exact match only; fuzzy matching in future phase

3. Should templates be scoped to space or global?
   - **Recommendation**: Space-scoped initially; global marketplace in future phase

---

## Related Changes

- `add-whiteboard-hierarchy-sync` - Existing proposal, may be superseded
- `add-unified-entity-creation` - Related to node creation flow

---

## Approval

- [ ] Product Owner
- [ ] Tech Lead
- [ ] Design Lead
