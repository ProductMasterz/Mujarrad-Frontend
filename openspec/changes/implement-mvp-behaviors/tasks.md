# Tasks: Implement MVP Behaviors

**Change ID:** `implement-mvp-behaviors`
**Created:** 2026-01-22

---

## Overview

Tasks are organized into 3 phases with clear dependencies. Each task is small enough to complete in 1-2 days.

**Legend:**
- `[FE]` = Frontend change
- `[BE]` = Backend change (flag only - not in this repo)
- `[SDK]` = SDK package
- `[MCP]` = MCP server
- `[TEST]` = Test-only task
- `[DOC]` = Documentation

---

## Phase 1: Stabilization (Sprint 1-2)

### 1.1 Node Delete with Dependencies

| # | Task | Type | Depends On | Estimate |
|---|------|------|------------|----------|
| 1.1.1 | Create `useNodeDependencies` hook to fetch children and referencing nodes | [FE] | - | 2h |
| 1.1.2 | Create `DeleteNodeModal` component with dependency warning UI | [FE] | 1.1.1 | 3h |
| 1.1.3 | Add "Delete All" cascade delete logic to hook | [FE] | 1.1.2 | 2h |
| 1.1.4 | Add "Delete Only This" orphan/unlink logic to hook | [FE] | 1.1.2 | 2h |
| 1.1.5 | Integrate modal into `DeleteNodeDialog` component | [FE] | 1.1.3, 1.1.4 | 1h |
| 1.1.6 | Write unit tests for `useNodeDependencies` | [TEST] | 1.1.5 | 2h |
| 1.1.7 | Write E2E test for delete with children flow | [TEST] | 1.1.5 | 2h |

**Acceptance Criteria:**
- [ ] Deleting node with children shows warning modal
- [ ] "Delete All" removes node and all descendants
- [ ] "Delete Only This" moves children to parent context or space root
- [ ] References show broken link indicator after deletion

---

### 1.2 Duplicate Detection

| # | Task | Type | Depends On | Estimate |
|---|------|------|------------|----------|
| 1.2.1 | Create `useDuplicateCheck` hook | [FE] | - | 2h |
| 1.2.2 | Create `DuplicateNodeModal` component | [FE] | 1.2.1 | 2h |
| 1.2.3 | Add merge node logic to hook | [FE] | 1.2.2 | 3h |
| 1.2.4 | Integrate into `NewNodeModal` create flow | [FE] | 1.2.3 | 1h |
| 1.2.5 | Integrate into sidebar quick-create flow | [FE] | 1.2.3 | 1h |
| 1.2.6 | Write unit tests for duplicate detection | [TEST] | 1.2.5 | 2h |

**Acceptance Criteria:**
- [ ] Creating node with existing title in same context shows modal
- [ ] User can choose "Merge", "Create Anyway", or "Rename"
- [ ] Merge appends content and merges attributes
- [ ] Different context allows duplicates without prompt

---

### 1.3 Node Rename Consistency

| # | Task | Type | Depends On | Estimate |
|---|------|------|------------|----------|
| 1.3.1 | Audit all rename entry points (context menu, modal, inline) | [FE] | - | 1h |
| 1.3.2 | Create shared `useRenameNode` hook | [FE] | 1.3.1 | 2h |
| 1.3.3 | Refactor `RenameModal` to use shared hook | [FE] | 1.3.2 | 1h |
| 1.3.4 | Fix context menu rename to use shared hook | [FE] | 1.3.2 | 1h |
| 1.3.5 | Add inline rename in sidebar tree | [FE] | 1.3.2 | 2h |
| 1.3.6 | Write E2E test for all rename paths | [TEST] | 1.3.5 | 2h |

**Acceptance Criteria:**
- [ ] Rename works from context menu
- [ ] Rename works from RenameModal
- [ ] Rename works inline in sidebar (double-click)
- [ ] All paths trigger whiteboard sync

---

### 1.4 Whiteboard-Hierarchy Sync

| # | Task | Type | Depends On | Estimate |
|---|------|------|------------|----------|
| 1.4.1 | Audit existing `whiteboardSyncService.ts` implementation | [FE] | - | 1h |
| 1.4.2 | Implement node rename → element text sync | [FE] | 1.4.1 | 2h |
| 1.4.3 | Implement node delete → element unlink indicator | [FE] | 1.4.1 | 2h |
| 1.4.4 | Implement element create → "Create as node?" prompt | [FE] | 1.4.1 | 3h |
| 1.4.5 | Add visual indicator for linked elements | [FE] | 1.4.4 | 2h |
| 1.4.6 | Add context menu "View in Hierarchy" for linked elements | [FE] | 1.4.4 | 1h |
| 1.4.7 | Write integration tests for sync scenarios | [TEST] | 1.4.6 | 3h |

**Acceptance Criteria:**
- [ ] Renaming node updates linked whiteboard element text
- [ ] Deleting node shows "unlinked" indicator on element
- [ ] Creating text element prompts to create as node
- [ ] Linked elements show small badge/indicator
- [ ] Context menu on element navigates to node in hierarchy

---

## Phase 2: MVP Core Features (Sprint 3-4)

### 2.1 Relationship Type Selector

| # | Task | Type | Depends On | Estimate |
|---|------|------|------------|----------|
| 2.1.1 | Define relationship types enum and labels | [FE] | - | 0.5h |
| 2.1.2 | Create `RelationshipTypeSelect` component | [FE] | 2.1.1 | 2h |
| 2.1.3 | Integrate into `CreateRelationshipDialog` | [FE] | 2.1.2 | 1h |
| 2.1.4 | Add type display to relationship list | [FE] | 2.1.1 | 1h |
| 2.1.5 | Add type colors/icons to graph view edges | [FE] | 2.1.1 | 2h |
| 2.1.6 | Write tests for relationship creation with types | [TEST] | 2.1.5 | 1h |

**Acceptance Criteria:**
- [ ] User can select relationship type when creating wire
- [ ] Types: contains, depends_on, references, parent_of, relates_to
- [ ] Graph view shows different colors per type
- [ ] Relationship list shows type badge

---

### 2.2 Application Mode Selector

| # | Task | Type | Depends On | Estimate |
|---|------|------|------------|----------|
| 2.2.1 | Create `appMode.store.ts` Zustand store | [FE] | - | 2h |
| 2.2.2 | Create `AppModeSelector` component (dropdown) | [FE] | 2.2.1 | 2h |
| 2.2.3 | Add mode selector to header | [FE] | 2.2.2 | 0.5h |
| 2.2.4 | Implement Scoped View mode (filter by context) | [FE] | 2.2.1 | 3h |
| 2.2.5 | Implement Full View mode (show all) | [FE] | 2.2.1 | 1h |
| 2.2.6 | Implement Edit Mode (show/hide edit controls) | [FE] | 2.2.1 | 2h |
| 2.2.7 | Add keyboard shortcuts for mode switching | [FE] | 2.2.6 | 1h |
| 2.2.8 | Write tests for mode switching | [TEST] | 2.2.7 | 2h |

**Acceptance Criteria:**
- [ ] Mode selector appears in header
- [ ] Scoped View filters to current context
- [ ] Full View shows all nodes
- [ ] Edit Mode shows/hides edit controls based on permission
- [ ] Mode persists during session

---

### 2.3 Super Position UI

| # | Task | Type | Depends On | Estimate |
|---|------|------|------------|----------|
| 2.3.1 | Create query to get all contexts containing a node | [FE] | - | 1h |
| 2.3.2 | Create `ContextCountBadge` component | [FE] | 2.3.1 | 1h |
| 2.3.3 | Add badge to `NodeCard` component | [FE] | 2.3.2 | 0.5h |
| 2.3.4 | Create `ContextListPopover` on badge click | [FE] | 2.3.2 | 2h |
| 2.3.5 | Add "Add to Context" action to node context menu | [FE] | 2.3.1 | 2h |
| 2.3.6 | Add "Remove from Context" action | [FE] | 2.3.5 | 1h |
| 2.3.7 | Write tests for multi-context scenarios | [TEST] | 2.3.6 | 2h |

**Acceptance Criteria:**
- [ ] Nodes in multiple contexts show "In X contexts" badge
- [ ] Clicking badge shows list of contexts with links
- [ ] User can add existing node to another context
- [ ] User can remove node from context (keeps in other contexts)

---

### 2.4 Templates Basic

| # | Task | Type | Depends On | Estimate |
|---|------|------|------------|----------|
| 2.4.1 | Create `useTemplates` hook using existing API | [FE] | - | 2h |
| 2.4.2 | Add "Mark as Template" action to context menu | [FE] | 2.4.1 | 1h |
| 2.4.3 | Create `TemplateListPanel` component | [FE] | 2.4.1 | 2h |
| 2.4.4 | Add templates section to sidebar | [FE] | 2.4.3 | 1h |
| 2.4.5 | Create `ApplyTemplateModal` component | [FE] | 2.4.1 | 3h |
| 2.4.6 | Implement template duplication logic | [FE] | 2.4.5 | 3h |
| 2.4.7 | Write E2E test for template workflow | [TEST] | 2.4.6 | 2h |

**Acceptance Criteria:**
- [ ] User can mark a context node as template
- [ ] Templates appear in dedicated sidebar section
- [ ] User can apply template to create new context
- [ ] Applied template copies structure and cleans content

---

## Phase 3: Developer Platform (Sprint 5-6)

### 3.1 TypeScript SDK

| # | Task | Type | Depends On | Estimate |
|---|------|------|------------|----------|
| 3.1.1 | Set up `packages/mujarrad-sdk` with TypeScript | [SDK] | - | 2h |
| 3.1.2 | Implement base HTTP client with auth | [SDK] | 3.1.1 | 2h |
| 3.1.3 | Implement `AuthClient` (login, register, me) | [SDK] | 3.1.2 | 2h |
| 3.1.4 | Implement `SpacesClient` (CRUD) | [SDK] | 3.1.2 | 2h |
| 3.1.5 | Implement `NodesClient` (CRUD, search) | [SDK] | 3.1.2 | 3h |
| 3.1.6 | Implement `AttributesClient` | [SDK] | 3.1.2 | 2h |
| 3.1.7 | Implement `VersionsClient` | [SDK] | 3.1.2 | 1h |
| 3.1.8 | Add TypeScript types from backend DTOs | [SDK] | 3.1.5 | 2h |
| 3.1.9 | Write SDK documentation (README) | [DOC] | 3.1.8 | 2h |
| 3.1.10 | Write SDK unit tests | [TEST] | 3.1.8 | 3h |
| 3.1.11 | Publish to npm (or internal registry) | [SDK] | 3.1.10 | 1h |

**Acceptance Criteria:**
- [ ] SDK has typed methods for all CRUD operations
- [ ] SDK supports both JWT and API key auth
- [ ] README documents installation and usage
- [ ] Published to npm as `@mujarrad/sdk`

---

### 3.2 MCP Server

| # | Task | Type | Depends On | Estimate |
|---|------|------|------------|----------|
| 3.2.1 | Set up `packages/mujarrad-mcp` with Node.js + TypeScript | [MCP] | - | 2h |
| 3.2.2 | Integrate mcp-typescript-sdk | [MCP] | 3.2.1 | 1h |
| 3.2.3 | Implement MCP resource: `mujarrad://spaces` | [MCP] | 3.2.2, 3.1.4 | 2h |
| 3.2.4 | Implement MCP resource: `mujarrad://nodes/{id}` | [MCP] | 3.2.2, 3.1.5 | 2h |
| 3.2.5 | Implement MCP tool: `create_node` | [MCP] | 3.2.4 | 2h |
| 3.2.6 | Implement MCP tool: `update_node` | [MCP] | 3.2.5 | 1h |
| 3.2.7 | Implement MCP tool: `search_nodes` | [MCP] | 3.2.4 | 2h |
| 3.2.8 | Implement MCP tool: `create_relationship` | [MCP] | 3.2.5 | 2h |
| 3.2.9 | Add configuration for API credentials | [MCP] | 3.2.2 | 1h |
| 3.2.10 | Write MCP server documentation | [DOC] | 3.2.9 | 2h |
| 3.2.11 | Test with Claude Code locally | [TEST] | 3.2.9 | 2h |

**Acceptance Criteria:**
- [ ] MCP server starts and connects via stdio
- [ ] Claude Code can list spaces and nodes
- [ ] Claude Code can create and update nodes
- [ ] Claude Code can search nodes
- [ ] Documentation explains setup with Claude Code

---

### 3.3 API Key UI

| # | Task | Type | Depends On | Estimate |
|---|------|------|------------|----------|
| 3.3.1 | Create `useApiKeys` hook for API key CRUD | [FE] | - | 2h |
| 3.3.2 | Create `ApiKeysSettings` page component | [FE] | 3.3.1 | 3h |
| 3.3.3 | Add settings route `/settings/api-keys` | [FE] | 3.3.2 | 0.5h |
| 3.3.4 | Implement create API key with secret display | [FE] | 3.3.2 | 2h |
| 3.3.5 | Implement key list with delete/rotate | [FE] | 3.3.2 | 2h |
| 3.3.6 | Write E2E test for API key management | [TEST] | 3.3.5 | 1h |

**Acceptance Criteria:**
- [ ] User can access API keys from settings
- [ ] User can create new API key
- [ ] Secret shown once after creation with copy button
- [ ] User can delete or rotate existing keys

---

## Task Dependency Graph

```
Phase 1 (Stabilization)
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  1.1    │   │  1.2    │   │  1.3    │   │  1.4    │
│ Delete  │   │Duplicate│   │ Rename  │   │Whiteboard│
│  Deps   │   │Detection│   │Consistent│   │  Sync   │
└─────────┘   └─────────┘   └────┬────┘   └────┬────┘
                                 │             │
                                 └──────┬──────┘
                                        │
                              ┌─────────▼─────────┐
                              │ 1.3 + 1.4 share   │
                              │ rename event hook │
                              └───────────────────┘

Phase 2 (MVP Core) - depends on Phase 1 completion
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  2.1    │   │  2.2    │   │  2.3    │   │  2.4    │
│Relation │   │App Mode │   │ Super   │   │Templates│
│ Types   │   │Selector │   │Position │   │         │
└─────────┘   └─────────┘   └─────────┘   └─────────┘
     │                                          │
     └──────────────────┬───────────────────────┘
                        │
              ┌─────────▼─────────┐
              │ 2.1 types used in │
              │ 2.4 template copy │
              └───────────────────┘

Phase 3 (Developer Platform) - can parallelize with Phase 2
┌─────────────┐
│    3.1      │
│  TS SDK     │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│    3.2      │    │    3.3      │
│ MCP Server  │    │ API Key UI  │
│ (uses SDK)  │    │             │
└─────────────┘    └─────────────┘
```

---

## Summary

| Phase | Tasks | Estimated Effort |
|-------|-------|------------------|
| Phase 1: Stabilization | 25 tasks | ~40 hours |
| Phase 2: MVP Core | 28 tasks | ~45 hours |
| Phase 3: Developer Platform | 23 tasks | ~50 hours |
| **Total** | **76 tasks** | **~135 hours** |

**Parallelization Opportunities:**
- Phase 3.1 (SDK) can start in parallel with Phase 2
- Within each phase, sub-phases (1.1, 1.2, etc.) can run in parallel
- Testing tasks can overlap with next feature's development
