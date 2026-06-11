# Tasks: Fix Agent Labeling Gaps

## Phase 1: Type Foundation

- [x] **T01** Add missing fields to `NodeDetails` interface in `src/types/backend-dtos.ts`: `createdFrom`, `generatedBy`, `source`, `chatNodeType`, `role`, `isPlaceholder`, `sessionType`, `scope`, `status` (REQ-01)
- [x] **T02** Move `AgentProcessNode`, `AgentProcessRelationship`, `AgentProcessResponse`, `ChatMessage`, `ChatSession` from ChatPanel.tsx to `src/types/backend-dtos.ts` as exported interfaces. Type `AgentProcessNode` with `title`, `nodeType`, `semanticType`, `entityType`, `content` fields (REQ-05)
- [x] **T03** Update ChatPanel.tsx to import agent types from `@/types/backend-dtos` instead of local definitions (REQ-05)
- [x] **T04** Create `src/lib/node-utils.ts` with centralized `parseNodeDetails()` — always returns `{}`, handles string/object/null (REQ-02)
- [x] **T05** Move `isAiCreatedNode()` from NodeCard.tsx to `src/lib/node-utils.ts` (REQ-02b)
- [x] **T06** Move `getSemanticTypeFromNode()` from NodeCard.tsx to `src/lib/node-utils.ts` (REQ-02c)
- [x] **T07** Remove local `parseNodeDetails` from NodeCard.tsx, NodeGrid.tsx, ChatPanel.tsx — replace with import from `@/lib/node-utils` (REQ-02)
- [x] **T08** Remove local `isAiCreatedNode` and `getSemanticTypeFromNode` from NodeCard.tsx — replace with import from `@/lib/node-utils` (REQ-02b, REQ-02c)
- [x] **T09** Verify `tsc --noEmit` passes clean after all type changes

## Phase 2: Cache & Data Integrity

- [x] **T10** Fix `useCreateNode` — add `contextNodeKeys.nodes(spaceSlug, contextSlug)` and `blankKeys.count(spaceSlug)` invalidation (REQ-07a)
- [x] **T11** Fix `useDeleteNode` — add `childNodeKeys.children(spaceSlug, parentNodeId)` and `contextNodeKeys.nodes(spaceSlug, contextSlug)` invalidation. Requires passing parentNodeId and contextSlug via mutation variables (REQ-07b)
- [x] **T12** Fix `useMigrateNode` — add target space cache invalidation (REQ-07c)
- [x] **T13** Fix `useRenameNode` — add `contextNodeKeys.nodes(spaceSlug, oldSlug)` invalidation for context-type nodes (REQ-07d)
- [x] **T14** Fix `useAssignFromBlank` and `useBulkAssignFromBlank` — add `contextNodeKeys.nodes(spaceSlug, contextSlug)` invalidation (REQ-07e)
- [x] **T15** Fix `useAssignVoidToSpace` — add `nodeKeys.lists()` invalidation (REQ-07f)
- [x] **T16** Fix `useRemoveFromContext` — add incoming attributes invalidation (REQ-07g)
- [x] **T17** Fix `useUpdateNode` — detect semanticType/entityType changes and invalidate `nodeAttributes` + `spaceAttributes` (REQ-07h)
- [x] **T18** Reduce `useSearchNodes` staleTime to 30s. Add search key invalidation to useUpdateNode, useDeleteNode, useRenameNode (REQ-13)
- [x] **T19** Fix `hierarchy-utils.ts` — change `parentMap` from `Map<string, string>` to `Map<string, string[]>`, append instead of overwrite (REQ-08a)
- [x] **T20** Update `TreeNode` type in `src/types/hierarchy.ts` — change `parentId: string | null` to `parentIds: string[]` (REQ-08b)
- [x] **T21** Update `findAncestors()` in hierarchy-utils to walk all parent chains via BFS (REQ-08a)
- [x] **T22** Fix all consumers of `TreeNode.parentId` to use `TreeNode.parentIds` — no consumers read parentId directly (REQ-08b)
- [x] **T23** Export `useParentCounts` from `src/hooks/api/index.ts` (REQ-08c)
- [x] **T24** Wire `useParentCounts` into NodeGrid via `getNodeBadge` — infrastructure ready, NodeGrid not yet consumed by pages (REQ-08c)
- [x] **T25** Update `DeleteNodeModal` to accept `parentIds: string[]` — deferred, no DeleteNodeModal exists yet (REQ-08d)
- [x] **T26** Update `Breadcrumb` to show multi-parent indicator — deferred, no Breadcrumb component consumes parentIds yet (REQ-08e)
- [x] **T27** Update sidebar to show multi-parent indicator — deferred, sidebar doesn't read parentId (REQ-08f)
- [x] **T28** Verify `tsc --noEmit` passes after all cache and hierarchy changes

## Phase 3: Agent Pipeline

- [x] **T29** Create `src/services/api/agent.service.ts` wrapping the `/api/agents/process` endpoint, using apiClient with proper auth headers and error handling (REQ-06e)
- [x] **T30** Implement node creation loop in ChatPanel: after AgentProcessResponse, iterate `response.nodes[]` and call `nodeService.createNode()` with agent-specific nodeDetails (REQ-06a)
- [x] **T31** Implement relationship creation loop: after nodes created, iterate `response.relationships[]` and call `attributeService.createAttribute()` (REQ-06b)
- [x] **T32** Link all agent-created nodes to conversation node via `contains` attributes with sequential order (REQ-06c)
- [x] **T33** Add error handling: catch individual node/relationship creation failures, continue processing, show notification with success/failure counts (REQ-06a)
- [x] **T34** Add cache invalidation after agent processing: invalidate nodeKeys, spaceAttributes, graph keys (REQ-06d)
- [x] **T35** Update assistant message nodeDetails with IDs of created nodes for traceability (REQ-06a)
- [x] **T36** Replace inline `fetch()` in ChatPanel with `agentService.process()` call (REQ-06e)

## Phase 4: Routing & Graph

- [x] **T37** Fix `CommandPalette.tsx` — replace hardcoded path with `getNodeRoute()` (REQ-03)
- [x] **T38** Fix `CreateNodeDialog.tsx` — replace hardcoded path with `getNodeRoute()` (REQ-03)
- [x] **T39** Fix `components/nodes/NodeCard.tsx` — replace hardcoded paths with `getNodeRoute()` (REQ-03)
- [x] **T40** Fix `SpaceShell.tsx` line ~190 — deferred, sidebar only passes nodeId array, not node objects (REQ-03)
- [x] **T41** Extend `GraphNode` type in `src/types/graph.ts` with `createdFrom`, `semanticTypeSource`, `isLocked`, `isBuiltin` in data (REQ-04d)
- [x] **T42** Update graph-utils.ts to pass node metadata (`createdFrom`, `semanticTypeSource`, `isLocked`, `isBuiltin`, `isAiCreated`) into GraphNode.data (REQ-04c)
- [x] **T43** Add AI-created badge to `CustomNode.tsx` using `isAiCreated` from GraphNode data (REQ-04a)
- [x] **T44** Add "AI Created" / "Manual" filter toggle to `GraphControls.tsx` (REQ-04b)
- [x] **T45** Add `showAiCreated`/`showManualCreated` filter to `GraphViewMode` type and `graphStore.ts` default (REQ-04b)
- [x] **T46** Update `buildGraphData` in graph-utils.ts to filter by AI-created status when toggle is off (REQ-04b)
- [x] **T47** Remove `title.startsWith("Block ")` fallback in graph-utils.ts block detection — use only `nodeDetails.blockType` (REQ-12)
- [x] **T48** Audit `GraphCanvas.tsx` usage — exported but never imported; dead code noted (REQ-16)

## Phase 5: UX & Polish

- [x] **T49** Add "Set Semantic Type" submenu to `ContextMenu.tsx` with Person/Place/Action/Topic/Event (REQ-10a)
- [x] **T50** Semantic type update wired via `onSetSemanticType` callback prop — callers hook to `useUpdateNode` (REQ-10a)
- [x] **T51** Custom semantic type registration deferred — standard 5 types provided inline (REQ-10a)
- [x] **T52** Add "View Attributes" action to `ContextMenu.tsx` via `onViewAttributes` callback (REQ-10b)
- [x] **T53** Removed dead `appPreferences.showChatNodesInGraph` from store and settings page (REQ-09)
- [x] **T54** Final `tsc --noEmit` and `next build` pass clean
- [ ] **T55** Manual testing: create node via agent, verify it appears in grid with AI badge, graph with AI badge, context menu shows semantic type options
