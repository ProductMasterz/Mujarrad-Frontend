# Change: Context Page Schema View + Multi-Parent Superposition

## Why
1. In backend-type spaces, contexts act as entity/table definitions. The `attributeSchema` on `ContextType` already stores the schema as JSONB, but there is no frontend UI to view or manage it. Developers need to see and lock the schema directly within the context page.
2. The current containment model is single-parent. Nodes and contexts need to exist in multiple places simultaneously (superposition) — a node can belong to many contexts, a context can contain other contexts, and two contexts can mutually contain each other (bidirectional).

## What Changes
- **Schema View in Context Page**: When `projectType: 'BACKEND'`, context pages display a schema section rendering each `attributeSchema` field as a visual item. Existing content is preserved alongside.
- **Schema Locking via Space Mode**: Space mode PRODUCTION locks all schemas (CONTEXT nodes CONTENT_LOCKED, blocks FULLY_LOCKED). CONFIGURATION mode unlocks. Toggle via `PATCH /api/spaces/{id}`.
- **Multi-Parent Containment (Superposition)**: Nodes can be children of multiple contexts and multiple nodes simultaneously. Contexts can be children of multiple contexts. All via existing `CONTAINS` attributes.
- **Bidirectional Context Containment**: Context A can contain Context B, and Context B can contain Context A at the same time. Two separate `Attribute` rows, no hierarchy restrictions.
- **Replace "Move To" with "Make a Child Of"**: Node context menu replaces "Move To" with "Make a Child Of" (additive, not relocating). Context context menu gets "Make a Child Of" restricted to contexts only.
- **Containment Rules**: Context can only be child of context (not node). Node can be child of context or node. Node cannot contain a context.
- **Remove from Context**: Frontend UI to remove a node from a context via `DELETE /api/spaces/{slug}/contexts/{ctx}/nodes/{nodeId}`. Removes CONTAINS relationship, not the node. Backend handles fallback to Blank.
- **Duplicate CONTAINS Prevention**: Backend returns 409 on duplicate; frontend handles gracefully.

## Impact
- Affected specs: `context-schema` (new capability)
- Affected code:
  - Context page component — add schema section/panel
  - `ContextType` API hooks — fetch and display `attributeSchema`
  - Space mode toggle (PRODUCTION/CONFIGURATION) for schema locking in BACKEND spaces
  - Node/context right-click menus — replace "Move To" with "Make a Child Of"
  - Attribute creation — support multiple CONTAINS from different parents to same target
  - Context view rendering — handle multi-parent display and cycle detection for bidirectional containment
  - Containment validation — enforce nodeType-based rules
