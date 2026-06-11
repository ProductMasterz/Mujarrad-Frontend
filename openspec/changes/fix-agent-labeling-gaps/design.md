# Design: Fix Agent Labeling Gaps

## Architecture Decisions

### AD-01: Centralized Node Utilities

**Decision:** Create `src/lib/node-utils.ts` as the single source of truth for node detail parsing and classification functions.

**Rationale:** `parseNodeDetails()` is duplicated 4 times with inconsistent return types. `isAiCreatedNode()` and `getSemanticTypeFromNode()` live in `NodeCard.tsx` but are needed by `CustomNode.tsx` (graph) and potentially other components.

**Functions to centralize:**
- `parseNodeDetails(node?: Node | null): Record<string, unknown>` — always returns `{}`, never `undefined`
- `isAiCreatedNode(node?: Node | null): boolean` — checks `createdFrom`, `generatedBy`, `source`, `chatNodeType`, `semanticTypeSource`
- `getSemanticTypeFromNode(node?: Node | null, fallback?: string): string` — resolution chain: fallback > node.semanticType > node.entityType > details.semanticType > details.entityType > details.nodeType > "unknown"

**Migration:** Remove local copies from NodeCard.tsx, NodeGrid.tsx, ChatPanel.tsx. Keep `entity-types.ts` for `getNodeEntityType()`, `normalizeEntityType()`, `withUpdatedEntityType()` (different concern — entity type store integration).

### AD-02: Cache Invalidation Strategy

**Decision:** Each mutation hook invalidates the minimum set of query keys that could be affected, using known context (spaceSlug, contextSlug, parentNodeId) passed via mutation variables.

**Rationale:** The current approach is inconsistent — some hooks over-invalidate (`nodeKeys.all`), others under-invalidate (missing context-specific keys). Targeted invalidation balances freshness with performance.

**Pattern:**
```
onSuccess: (result, variables) => {
  // Always: the direct entity
  queryClient.invalidateQueries({ queryKey: nodeKeys.detail(spaceSlug, nodeId) });
  // Contextual: only if we know the context
  if (variables.contextSlug) {
    queryClient.invalidateQueries({ queryKey: contextNodeKeys.nodes(spaceSlug, contextSlug) });
  }
  // Broad fallback: lists that could contain this entity
  queryClient.invalidateQueries({ queryKey: nodeKeys.lists() });
}
```

### AD-03: Multi-Parent Data Model

**Decision:** Change `TreeNode.parentId: string | null` to `TreeNode.parentIds: string[]` and update `hierarchy-utils.ts` to use `Map<string, string[]>` for the parent map.

**Rationale:** The backend supports multi-parent via multiple incoming `contains` attributes. The frontend hierarchy assumes single-parent, silently dropping all but the last parent. This is a data loss bug.

**Display strategy:**
- Sidebar: show node under its first (oldest) parent only, with a badge indicating "+N parents"
- Breadcrumb: show the path used to navigate to the node (from navigation store), with a tooltip listing all parent paths
- NodeGrid: show parent count badge via `useParentCounts` when count > 1

### AD-04: Agent Node Creation Pipeline

**Decision:** After receiving `AgentProcessResponse`, create nodes and relationships in the database using existing `nodeService.createNode()` and `attributeService.createAttribute()`.

**Rationale:** Currently the agent returns nodes/relationships but they are only displayed as text in the assistant message — never persisted. This defeats the purpose of the agent labeling flow.

**Flow:**
1. Agent returns `AgentProcessResponse` with `nodes[]` and `relationships[]`
2. For each node: `nodeService.createNode(spaceSlug, { title, nodeType, content, nodeDetails: { createdFrom: 'agent', generatedBy: 'agent', semanticTypeSource: 'agent', semanticType, entityType } })`
3. For each relationship: `attributeService.createAttribute(sourceId, { sourceNodeId, targetNodeId, attributeType, attributeTypeMode: 'SCHEMALESS', attributeName, attributeValue })`
4. Link all created nodes to conversation node via `contains` attribute
5. Invalidate all relevant caches
6. Update assistant message node with created node IDs in nodeDetails

**Error handling:** If individual node/relationship creation fails, log the error and continue with remaining items. Show notification with count of successes/failures.

### AD-05: Graph Renderer Unification

**Decision:** Deprecate `GraphCanvas.tsx` and use `GraphVisualization.tsx` as the single graph renderer.

**Rationale:** Two parallel implementations exist — `GraphCanvas` passes raw unfiltered data to ReactFlow (no viewMode, no semantic filtering), while `GraphVisualization` applies `buildGraphData` with full filter support. This creates inconsistent behavior depending on which renderer is used.

**If GraphCanvas is actively used:** Refactor it to use `buildGraphData` with viewMode from `graphStore`. Otherwise remove it.
