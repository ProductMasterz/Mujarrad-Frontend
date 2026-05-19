# Mujarrad MVP Requirements Tracking

**Last Updated:** 2026-01-22
**Target:** Working MVP for internal use + Developer Platform
**Vision:** Mujarrad as CMS/Backend replacement for app developers

---

## Product Positioning

### Two Primary Use Cases

1. **Internal Use with AI Agents**
   - Use Mujarrad internally to manage projects, knowledge, and workflows
   - AI agents can create, read, update nodes programmatically
   - MCP (Model Context Protocol) integration for seamless agent access

2. **Developer Platform (Mujarrad-as-a-Backend)**
   - Developers build apps on top of Mujarrad
   - Mujarrad acts as content management system
   - Replaces traditional backend for content-heavy applications
   - Node-based data model = flexible schema

---

## Implementation Status Summary

| Category | Implemented | Partial | Not Started | Total |
|----------|------------|---------|-------------|-------|
| Authentication | 6 | 0 | 0 | 6 |
| Space Management | 6 | 1 | 0 | 7 |
| Node Management | 7 | 1 | 0 | 8 |
| Content Editing | 14 | 0 | 0 | 14 |
| Navigation | 7 | 0 | 0 | 7 |
| Search | 4 | 0 | 0 | 4 |
| Collaboration | 6 | 0 | 0 | 6 |
| Whiteboard | 6 | 1 | 0 | 7 |
| Context Menus | 4 | 1 | 0 | 5 |
| Help & Support | 2 | 1 | 0 | 3 |
| User Profile | 1 | 1 | 0 | 2 |
| **TOTALS** | **63** | **6** | **0** | **69** |

---

## Core Features - Implementation Status

### Authentication ✅ COMPLETE

| Feature | Status | Notes |
|---------|--------|-------|
| Email/Password Register | ✅ Implemented | |
| Google OAuth Register | ✅ Implemented | |
| Email/Password Login | ✅ Implemented | |
| Google OAuth Login | ✅ Implemented | |
| Logout | ✅ Implemented | |
| Session Persistence | ✅ Implemented | JWT-based |

### Space Management ✅ MOSTLY COMPLETE

| Feature | Status | Notes |
|---------|--------|-------|
| View Spaces Dashboard | ✅ Implemented | `/spaces` |
| Create Space (Modal) | ✅ Implemented | NewNodeModal |
| Quick Create (Sidebar) | ✅ Implemented | |
| Rename Space | ✅ Implemented | RenameModal |
| Delete Space | ⚠️ Partial | Needs dependency checking |
| Share Space | ✅ Implemented | ShareModal |
| Navigate into Space | ✅ Implemented | `/spaces/[slug]` |

### Node Management ✅ MOSTLY COMPLETE

| Feature | Status | Notes |
|---------|--------|-------|
| View Nodes in Space | ✅ Implemented | |
| Create Node (Modal) | ✅ Implemented | |
| Create Context | ✅ Implemented | node_type='context' |
| Edit Node Title | ✅ Implemented | |
| Edit Node Content | ✅ Implemented | Block Editor |
| Delete Node | ✅ Implemented | |
| Rename Node | ⚠️ Partial | Via context menu |
| Navigate to Node Editor | ✅ Implemented | `/spaces/[slug]/node/[id]` |

### Content Editing ✅ COMPLETE

| Feature | Status | Notes |
|---------|--------|-------|
| Slash Commands | ✅ Implemented | |
| Edit Block Inline | ✅ Implemented | |
| Delete Block | ✅ Implemented | |
| Drag & Drop Reorder | ✅ Implemented | |
| Auto-save | ✅ Implemented | |
| Heading Blocks (H1-H3) | ✅ Implemented | |
| Bullet/Numbered Lists | ✅ Implemented | |
| Code Blocks | ✅ Implemented | Syntax highlighting |
| Images | ✅ Implemented | |
| Quote Blocks | ✅ Implemented | |
| Dividers | ✅ Implemented | |
| Callout Blocks | ✅ Implemented | |
| Math Equations | ✅ Implemented | LaTeX |
| Mermaid Diagrams | ✅ Implemented | |

### Navigation ✅ COMPLETE

| Feature | Status | Notes |
|---------|--------|-------|
| Breadcrumb | ✅ Implemented | |
| Back Button | ✅ Implemented | |
| Home Button | ✅ Implemented | |
| Sidebar Tree | ✅ Implemented | HierarchyNavigator |
| Sidebar Toggle | ✅ Implemented | |
| Tabs | ✅ Implemented | |
| Open in New Tab | ✅ Implemented | |

### Search ✅ COMPLETE

| Feature | Status | Notes |
|---------|--------|-------|
| Global Search Modal | ✅ Implemented | CommandPalette |
| Filter by Type | ✅ Implemented | |
| Search Results with Paths | ✅ Implemented | |
| Navigate to Result | ✅ Implemented | |

### Whiteboard ✅ MOSTLY COMPLETE

| Feature | Status | Notes |
|---------|--------|-------|
| View Canvas | ✅ Implemented | Excalidraw |
| Draw on Canvas | ✅ Implemented | |
| Add Shapes | ✅ Implemented | |
| Add Text | ✅ Implemented | |
| Link to Node | ✅ Implemented | |
| Sync with Hierarchy | ⚠️ Partial | WhiteboardSyncService |
| Auto-save | ✅ Implemented | |

---

## API Services - Current State

### Implemented Services

| Service | File | Endpoints |
|---------|------|-----------|
| Auth | `auth.service.ts` | register, login, logout, refresh |
| Spaces | `space.service.ts` | CRUD, share, collaborators |
| Nodes | `node.service.ts` | CRUD, search |
| Attributes | `attribute.service.ts` | Relationships |
| Versions | `version.service.ts` | History, restore |
| Whiteboard | `whiteboard.service.ts` | Save/load canvas |
| WikiLinks | `wikilink.service.ts` | Link parsing |

### Backend API Base
- **Production:** `https://mujarrad.onrender.com/api`
- **Swagger:** https://mujarrad.onrender.com/swagger-ui/index.html
- **Local:** `http://localhost:8080/api`

> **See also:** `requirements/BEHAVIORAL_REQUIREMENTS.md` for exact feature behaviors

---

## MVP Gaps - Must Fix Before Launch

### Priority 1: Critical Fixes

| Item | Current State | Required State | Effort |
|------|---------------|----------------|--------|
| Delete Space with dependencies | Partial | Full dependency check + cascade/block | Medium |
| Node rename consistency | Partial | Works from all entry points | Small |
| Duplicate node | Partial | Full node + children duplication | Medium |
| Help Center | Partial | Basic docs/FAQ accessible | Small |
| User Profile view | Partial | Show user info, settings | Small |

### Priority 2: Stability & Polish

| Item | Notes | Effort |
|------|-------|--------|
| Error handling consistency | Unified error messages | Medium |
| Loading states | Consistent spinners/skeletons | Small |
| Empty states | All views need empty state UI | Small |
| Offline handling | Graceful degradation | Medium |

---

## Developer Platform Requirements

### Phase 1: API-First Access (MVP Target)

| Requirement | Status | Priority |
|-------------|--------|----------|
| RESTful API for all operations | ✅ Exists | - |
| API Documentation (OpenAPI/Swagger) | ✅ Exists | - |
| API Key authentication (service accounts) | ✅ Exists | - |
| Rate limiting | ❌ Missing | Medium |
| Webhook support for events | ❌ Missing | Medium |
| SDK (JavaScript/TypeScript) | ❌ Missing | High |

### Phase 2: Developer Experience

| Requirement | Status | Priority |
|-------------|--------|----------|
| Developer portal/dashboard | ❌ Missing | High |
| API playground/explorer | ❌ Missing | Medium |
| Sample applications | ❌ Missing | Medium |
| CLI tool | ❌ Missing | Low |

### Phase 3: Advanced Features

| Requirement | Status | Priority |
|-------------|--------|----------|
| Custom node types via API | ❌ Missing | High |
| Custom attributes/relationships | ✅ Exists (basic) | - |
| Computed fields | ❌ Missing | Medium |
| Triggers/automation | ❌ Missing | Low |

---

## Agent Integration Requirements

### Phase 1: MCP Integration (MVP Target)

| Requirement | Status | Priority |
|-------------|--------|----------|
| MCP server implementation | ❌ Missing | **Critical** |
| Read nodes via MCP | ❌ Missing | Critical |
| Create/Update nodes via MCP | ❌ Missing | Critical |
| Search nodes via MCP | ❌ Missing | Critical |
| Navigate hierarchy via MCP | ❌ Missing | High |

### Phase 2: Agent-Friendly Features

| Requirement | Status | Priority |
|-------------|--------|----------|
| Structured data extraction | ❌ Missing | High |
| Bulk operations API | ❌ Missing | Medium |
| Change notifications (SSE/WebSocket) | ❌ Missing | Medium |
| Context-aware suggestions | ❌ Missing | Low |

### Phase 3: Autonomous Operations

| Requirement | Status | Priority |
|-------------|--------|----------|
| Agent-specific auth tokens | ❌ Missing | High |
| Action audit trail | ❌ Missing | High |
| Rollback capabilities | ⚠️ Partial (versions exist) | Medium |
| Permission scoping for agents | ❌ Missing | High |

---

## Data Model Alignment

### Current Implementation vs PRD

| PRD Requirement | Implementation | Gap |
|-----------------|----------------|-----|
| Node types: regular, context, attribute, mapping, conditional | Only regular + context | Need attribute, mapping, conditional |
| Existence types: Essential, Purposed, Functional, Temporary | Not implemented | Need field + UI |
| Relationship types: contains, depends_on, references, parent_of, relates_to | Basic implementation | Need strength weights |
| Templates (is_template flag) | Not implemented | Need flag + template UI |
| Super Position (node in multiple contexts) | Not implemented | Architectural work needed |
| Versioning (content, phantom, mask) | Basic version history | Need phantom/mask versions |

---

## Recommended MVP Roadmap

### Sprint 1: Stabilization (Now)
- [ ] Fix Delete Space with dependency checking
- [ ] Complete Node rename from all entry points
- [ ] Add basic User Profile view
- [ ] Fix Duplicate node functionality
- [ ] Add Help Center placeholder/docs link

### Sprint 2: Developer Platform Foundation
- [ ] Generate OpenAPI documentation
- [ ] Implement API key authentication
- [ ] Create JavaScript/TypeScript SDK
- [ ] Add rate limiting
- [ ] Create basic developer documentation

### Sprint 3: Agent Integration
- [ ] Build MCP server
- [ ] Implement node CRUD via MCP
- [ ] Add search via MCP
- [ ] Test with Claude Code locally
- [ ] Document MCP usage

### Sprint 4: Polish & Launch Prep
- [ ] Error handling audit
- [ ] Loading/empty states review
- [ ] Performance optimization
- [ ] Security audit
- [ ] Launch checklist completion

---

## Files to Watch

Key files that impact MVP functionality:

```
src/services/api/           # All API interactions
src/hooks/api/              # React Query hooks
src/components/nodes/       # Node CRUD UI
src/shell/components/       # Shell (sidebar, modals)
app/spaces/                 # Space pages
```

---

## Notes

- **Architecture Principle:** Everything is a Node - maintain this consistency
- **Backend:** https://mujarrad.onrender.com - any API changes need backend coordination
- **Testing:** Focus on critical paths before adding new features
- **Agents:** MCP integration is the key enabler for AI agent usage

---

## Open Source Resources & Inspiration

> See detailed breakdown: `requirements/OPEN_SOURCE_RESOURCES.md`

### Core Technology Stack (Already Using)

| Library | Purpose | License |
|---------|---------|---------|
| Next.js 14 | React framework | MIT |
| Excalidraw | Whiteboard | MIT |
| TanStack Query | Data fetching | MIT |
| Zustand | State management | MIT |
| React Hook Form | Forms | MIT |
| Zod | Validation | MIT |

### High-Value Open Source to Leverage

| Project | Can Use For | Type |
|---------|-------------|------|
| **Notion-like Editors** | | |
| BlockNote | Block editor components | Component |
| Plate.js | Rich text editor | Component |
| Novel | Notion-style WYSIWYG | Component |
| **Knowledge/CMS** | | |
| Outline | Knowledge base patterns | Reference |
| Strapi | Headless CMS patterns | Reference |
| Payload CMS | Content management | Reference |
| **Graph/Node Tools** | | |
| ReactFlow | Node-based diagrams | Component |
| Cytoscape.js | Graph visualization | Component |
| **MCP/Agent Tools** | | |
| mcp-typescript-sdk | MCP server building | SDK |
| Claude Code hooks | Agent integration patterns | Reference |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-22 | Initial document creation | Claude |
| 2026-01-22 | Added Open Source Resources section | Claude |
