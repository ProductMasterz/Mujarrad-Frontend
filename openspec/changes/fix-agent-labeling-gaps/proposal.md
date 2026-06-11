# Fix Agent Labeling Gaps & Frontend Data Integrity

**Status**: PROPOSED
**Date**: 2026-06-08

## Summary

Comprehensive fix for all gaps discovered during two rounds of deep codebase analysis across the agent labeling flow, data layers, routing, cache invalidation, multi-parent nodes, graph visualization, chat/agent pipeline, and type safety. This change touches types, utilities, hooks, services, components, and stores.

## Why

Maged's commit `c52bc72` ("Adapt frontend to new Mujarrad agents labeling flow") surfaced a broader set of issues during integration audit. The frontend has:

1. **Type safety holes** — `NodeDetails` interface missing 10+ fields that are actively used across 15+ files (`createdFrom`, `generatedBy`, `chatNodeType`, `role`, `source`, etc.), causing silent `any` typing.
2. **Code duplication** — `parseNodeDetails()` is implemented 4 separate times with inconsistent return types (some return `{}`, others `undefined`).
3. **Hardcoded routing** — 4 files bypass `getNodeRoute()` with raw string templates, breaking context-aware navigation.
4. **Cache invalidation bugs** — 9 mutation hooks fail to invalidate related caches (context nodes, blank counts, parent counts, target space after migration, etc.), causing stale UI after creates/deletes/moves.
5. **Multi-parent overwrite bug** — `hierarchy-utils.ts` line 59 uses `parentMap.set(childId, parentId)` which overwrites when a child has 2+ parents, breaking hierarchy display.
6. **Agent pipeline incomplete** — Agent returns `nodes[]` and `relationships[]` in `AgentProcessResponse` but zero code creates these as database entities. `semanticTypeSource` is never set to `'agent'`.
7. **Graph missing agent indicators** — `CustomNode.tsx` (graph) shows no AI-created badge, unlike `NodeCard.tsx` (grid). No AI filter in `GraphControls`. Fragile block detection via `title.startsWith("Block ")`.
8. **Dead code & unused infrastructure** — `useParentCounts` hook is exported but never imported. `appPreferences.showChatNodesInGraph` exists but is never referenced. Two parallel graph renderers with different filtering.

## What Changes

### In scope
- NodeDetails interface completion (backend-dtos.ts)
- Centralize parseNodeDetails, isAiCreatedNode, getSemanticTypeFromNode utilities
- Fix all hardcoded routing to use getNodeRoute()
- Expand getNodeRoute() for nested context paths
- Fix 9 cache invalidation gaps across mutation hooks
- Fix multi-parent overwrite bug in hierarchy-utils
- Wire useParentCounts into NodeGrid badges
- Agent pipeline: create nodes/relationships from AgentProcessResponse
- Move agent types from ChatPanel to backend-dtos.ts
- Add AI indicator to graph CustomNode
- Add AI filter to GraphControls
- Fix fragile block detection in graph-utils
- Context menu semantic type actions
- Clean up dead preferences and unused code

### Out of scope
- Client-side schema validation for context types (server enforces)
- Graph layout algorithm improvements (existing TODO)
- Collaborator API migration (separate backend dependency)
- Error reporting / Sentry integration
- Performance optimization of useNodeDependencies
- Cross-space virtual context graph integration (separate feature)

## Risks

- **Cache invalidation changes** are high-risk — over-invalidation causes performance issues, under-invalidation causes stale data. Each fix needs targeted testing.
- **Multi-parent hierarchy change** (`parentId` to `parentIds`) touches TreeNode type, hierarchy-utils, sidebar, breadcrumb, and delete modal — cascading type changes.
- **Agent pipeline node creation** depends on backend `AgentProcessResponse` contract stability. If the agent service changes its response shape, node creation will break.

## Phases

### Phase 1: Type Foundation
REQ-01 (NodeDetails), REQ-02 (centralize utilities), REQ-05 (agent types to DTOs)

### Phase 2: Cache & Data Integrity
REQ-07 (cache invalidation), REQ-08 (multi-parent fix)

### Phase 3: Agent Pipeline
REQ-06 (create nodes/relationships from agent response)

### Phase 4: Routing & Graph
REQ-03 (hardcoded routing), REQ-04 (graph AI indicators), REQ-12 (block detection), REQ-16 (graph renderer unification)

### Phase 5: UX & Polish
REQ-09 (dead preferences), REQ-10 (context menu), REQ-13 (stale data)
