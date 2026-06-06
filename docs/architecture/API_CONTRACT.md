# Mujarrad API Contract Reference

**Source:** Synthesized from backend controller analyses (phase 1) + Integration Engineer analysis (phase 2)  
**Branch:** `015-api-updates`  
**Date:** 2026-06-06  
**Status:** Reference — do not modify; re-generate from workflow output

---

# Mujarrad Frontend — Integration Contract

**Prepared by:** Integration Engineer  
**Branch:** `015-api-updates`  
**Date:** 2026-06-06

---

## 1. Endpoint Inventory Table

| Frontend Action | Current Service Call / File | Correct Backend Endpoint | Gap? |
|---|---|---|---|
| List all space nodes | `nodeService.getNodes(spaceSlug)` → `GET /spaces/{spaceSlug}/nodes` | `GET /api/spaces/{spaceSlug}/nodes` | None — correct |
| Get single node | `nodeService.getNode(spaceSlug, nodeId)` → `GET /spaces/{spaceSlug}/nodes/{nodeId}` | `GET /api/spaces/{spaceSlug}/nodes/{nodeId}` | None — correct |
| Create node (flat) | `nodeService.createNode(spaceSlug, data)` → `POST /spaces/{spaceSlug}/nodes` | Deprecated — lands in The Blank | **BUG-01/02**: called unconditionally from `NewNodeModal` |
| Create node in context | `nodeService.createNodeInContext(spaceSlug, ctx, data)` → `POST /spaces/{spaceSlug}/contexts/{contextSlug}/nodes` | `POST /api/spaces/{spaceSlug}/contexts/{contextSlug}/nodes` | Correct endpoint, never called from `NewNodeModal` — dead path |
| Update node | `nodeService.updateNode(spaceSlug, nodeId, data)` → `PUT /spaces/{spaceSlug}/nodes/{nodeId}` | `PUT /api/spaces/{spaceSlug}/nodes/{nodeId}` | None — correct |
| Delete node | `nodeService.deleteNode(spaceSlug, nodeId, force?)` → `DELETE /spaces/{spaceSlug}/nodes/{nodeId}` | `DELETE /api/spaces/{spaceSlug}/nodes/{nodeId}?force={bool}` | None — correct |
| Create nested context | `nodeService.createNestedContext(spaceSlug, parentCtx, data)` → `POST /spaces/{spaceSlug}/contexts/{parentContextSlug}/contexts` | `POST /api/spaces/{spaceSlug}/contexts/{contextSlug}/contexts` | None — correct |
| Get context nodes | `nodeService.getNodesInContext(spaceSlug, contextSlug)` → `GET /spaces/{spaceSlug}/contexts/{contextSlug}/nodes` | `GET /api/spaces/{spaceSlug}/contexts/{contextSlug}/nodes` | None — correct |
| Get child contexts | `nodeService.getChildContexts(spaceSlug, contextSlug)` → `GET /spaces/{spaceSlug}/contexts/{contextSlug}/children` | `GET /api/spaces/{spaceSlug}/contexts/{contextSlug}/children` | None — correct |
| Get single node in context | Not implemented in frontend service | `GET /api/spaces/{spaceSlug}/contexts/{contextSlug}/nodes/{nodeId}` | **GAP**: no frontend method |
| Remove node from context | `nodeService.removeFromContext(spaceSlug, contextSlug, nodeId)` → `DELETE /spaces/{spaceSlug}/contexts/{contextSlug}/nodes/{nodeId}` | `DELETE /api/spaces/{spaceSlug}/contexts/{contextSlug}/nodes/{nodeId}` | None — correct |
| Create child node (block) | `nodeService.createChildNode(spaceSlug, parentNodeId, data)` → `POST /spaces/{spaceSlug}/nodes/{parentNodeId}/children` | `POST /api/spaces/{spaceSlug}/nodes/{parentNodeId}/children` | None — correct |
| Get child nodes (blocks) | `nodeService.getChildNodes(spaceSlug, parentNodeId)` → `GET /spaces/{spaceSlug}/nodes/{parentNodeId}/children` | `GET /api/spaces/{spaceSlug}/nodes/{parentNodeId}/children` | **EFFICIENCY BUG**: block editor doesn't use this — calls `getNodes()` and filters client-side |
| Reorder child nodes | `nodeService.reorderChildren(spaceSlug, parentNodeId, nodeIds)` → `PATCH /spaces/{spaceSlug}/nodes/{parentNodeId}/children/reorder` with `{ nodeIds }` | `PATCH /api/spaces/{spaceSlug}/nodes/{parentNodeId}/children/reorder` with `{ orderedChildIds }` | **FIELD NAME MISMATCH**: sends `nodeIds`, backend expects `orderedChildIds` |
| Migrate node | `nodeService.migrateNode(spaceSlug, nodeId, data)` → `POST /spaces/{spaceSlug}/nodes/{nodeId}/migrate` | `POST /api/spaces/{spaceSlug}/nodes/{nodeId}/migrate` | None — correct |
| Get node descendants | Not implemented | `GET /api/spaces/{spaceSlug}/nodes/{nodeId}/descendants` | **GAP**: no frontend method |
| Get node ancestors | Not implemented | `GET /api/spaces/{spaceSlug}/nodes/{nodeId}/ancestors` | **GAP**: no frontend method |
| Move node (deprecated) | `nodeMoveService.moveNode()` → `POST /spaces/{spaceSlug}/nodes/{nodeId}/move` | Deprecated; use `/migrate` | Service exists but should not be used |
| Get blank nodes | `nodeService.getBlankNodes(spaceSlug)` → `GET /spaces/{spaceSlug}/blank` | `GET /api/spaces/{spaceSlug}/blank` | None — correct |
| Get blank count | `nodeService.getBlankCount(spaceSlug)` → `GET /spaces/{spaceSlug}/blank/count` | `GET /api/spaces/{spaceSlug}/blank/count` | None — correct |
| Assign from blank (single) | `nodeService.assignFromBlank(spaceSlug, nodeId, contextSlug)` → `POST /spaces/{spaceSlug}/blank/{nodeId}/assign` | `POST /api/spaces/{spaceSlug}/blank/{nodeId}/assign` | None — correct |
| Assign from blank (bulk) | `nodeService.bulkAssignFromBlank(spaceSlug, nodeIds, contextSlug)` → `POST /spaces/{spaceSlug}/blank/assign-bulk` | `POST /api/spaces/{spaceSlug}/blank/assign-bulk` | None — correct |
| Search nodes | `nodeService.searchNodes(spaceSlug, params)` → `GET /spaces/{spaceSlug}/search` | **Does not exist in backend** | **CRITICAL GAP**: endpoint `GET /api/spaces/{spaceSlug}/search` is not in any backend controller |
| List spaces | `spaceService.getSpaces()` → `GET /spaces` | `GET /api/spaces` | None — correct |
| Get space by slug | `spaceService.getSpaceBySlug(slug)` → `GET /spaces/slug/{slug}` | `GET /api/spaces/slug/{slug}` | None — correct |
| Get space by ID | `spaceService.getSpace(id)` → `GET /spaces/{id}` | `GET /api/spaces/{id}` | None — correct |
| Create space | `spaceService.createSpace(data)` → `POST /spaces` | `POST /api/spaces` | None — correct |
| Update space | `spaceService.updateSpace(id, data)` → `PATCH /spaces/{id}` | `PATCH /api/spaces/{id}` | None — correct |
| Delete space | `spaceService.deleteSpace(id)` → `DELETE /spaces/{id}` | `DELETE /api/spaces/{id}` | None — correct |
| List space collaborators | `spaceService.getCollaborators(spaceId)` → `GET /spaces/{spaceId}/collaborators` | **Does not exist in backend** | **GAP**: no `/collaborators` endpoint in `SpaceController` |
| Get outgoing attributes | `attributeService.getNodeAttributes(nodeId)` → `GET /nodes/{nodeId}/attributes` | `GET /api/nodes/{nodeId}/attributes` | None — correct |
| Get incoming attributes | `attributeService.getIncomingAttributes(nodeId)` → `GET /nodes/{nodeId}/incoming-attributes` | `GET /api/nodes/{nodeId}/incoming-attributes` | None — correct |
| Create attribute | `attributeService.createAttribute(nodeId, data)` → `POST /nodes/{nodeId}/attributes` | `POST /api/nodes/{nodeId}/attributes` | None — correct |
| Delete attribute | `attributeService.deleteAttribute(nodeId, attributeId)` → `DELETE /nodes/{nodeId}/attributes/{attrId}` | `DELETE /api/attributes/{attributeId}` (no nodeId in path) | **WRONG PATH**: frontend constructs wrong URL; will 404 |
| Get space attributes (graph) | `attributeService.getSpaceAttributes(spaceId)` → `GET /spaces/${spaceId}/attributes` | `POST /api/spaces/{spaceId}/attributes` (creation only; no GET on this path in `AttributeController`) | **WRONG METHOD + PATH**: no GET endpoint for space-scoped attribute listing exists |
| Get attribute by ID | Not in `attributeService` | `GET /api/attributes/{attributeId}` | **GAP**: no frontend method |
| Update attribute | Not in `attributeService` | `PUT /api/attributes/{attributeId}` | **GAP**: no frontend method |
| Promote attribute to node | Not in `attributeService` | `POST /api/spaces/{spaceSlug}/attributes/{attributeId}/promote` | **GAP**: no frontend method |
| Lock node | `lockingService.lockNode(spaceSlug, nodeId, data)` → `PATCH /spaces/{spaceSlug}/nodes/{nodeId}/lock` | `PATCH /api/spaces/{spaceSlug}/nodes/{nodeId}/lock` | None — correct |
| Unlock node | `lockingService.unlockNode(spaceSlug, nodeId)` → `PATCH /spaces/{spaceSlug}/nodes/{nodeId}/unlock` | `PATCH /api/spaces/{spaceSlug}/nodes/{nodeId}/unlock` | None — correct |
| Lock attribute | `lockingService.lockAttribute(spaceSlug, attributeId)` → `PATCH /spaces/{spaceSlug}/attributes/{attributeId}/lock` | `PATCH /api/spaces/{spaceSlug}/attributes/{attributeId}/lock` | None — correct |
| Lock space | `lockingService.lockSpace(spaceSlug)` → `PATCH /spaces/{spaceSlug}/lock` | `PATCH /api/spaces/{spaceSlug}/lock` | None — correct |
| List context types | `contextTypeService.listContextTypes(spaceId)` → `GET /spaces/${spaceId}/context-types` | `GET /api/spaces/{spaceId}/context-types` | None — correct |
| Create context type | `contextTypeService.createContextType(spaceId, data, mode?)` → `POST /spaces/${spaceId}/context-types` with optional `X-Space-Mode` header | `POST /api/spaces/{spaceId}/context-types` | None — correct |
| Void: list nodes | `voidService.listVoidNodes()` → `GET /void/nodes` | `GET /api/void/nodes` | None — correct |
| Void: create node | `voidService.createVoidNode(data)` → `POST /void/nodes` | `POST /api/void/nodes` | None — correct |
| Void: assign to space | `voidService.assignToSpace(nodeId, data)` → `POST /void/nodes/{nodeId}/assign` | `POST /api/void/nodes/{nodeId}/assign` | None — correct |
| Virtual contexts: CRUD | `virtualContextService.*` | `GET/POST/DELETE /api/virtual-contexts/*` | None — correct |
| Cross-space attributes | `virtualContextService.createCrossSpaceAttribute(vcId, data)` → `POST /virtual-contexts/{id}/attributes` | `POST /api/virtual-contexts/{id}/attributes` | None — correct |

---

## 2. Creation Flow Contract

### Creating a node at space level (no context)

**Correct endpoint:** `POST /api/spaces/{spaceSlug}/nodes`  
**Status:** Deprecated by backend comment — results land in The Blank (Context-Less container).  
**Request body:**
```json
{
  "title": "string (required, 1-255)",
  "nodeType": "REGULAR | CONTEXT | ATTRIBUTE",
  "content": "string (optional)",
  "nodeDetails": {} 
}
```
**Response:** `NodeResponse` (HTTP 201). Response header `X-Mujarrad-Context: context-less` is set but the frontend never reads it.

**Current frontend behavior:** `NewNodeModal.createNodeMutation` calls `nodeService.createNode(spaceSlug, {...})` unconditionally regardless of whether `contextSlug` is available — confirmed at `NewNodeModal.tsx` line 145.

---

### Creating a node inside a specific context

**Correct endpoint:** `POST /api/spaces/{spaceSlug}/contexts/{contextSlug}/nodes`  
**Request body:**
```json
{
  "title": "string (required, 1-255)",
  "nodeType": "REGULAR | CONTEXT | ATTRIBUTE",
  "content": "string (optional)",
  "nodeDetails": {}
}
```
**Response:** `NodeResponse` (HTTP 201).

**Current frontend behavior:** `nodeService.createNodeInContext()` exists and is correct. `useCreateNode` hook routes to this when `contextSlug` is provided. However, `NewNodeModal` has no `contextSlug` prop and never passes one — making `useCreateNodeInContext` and the `contextSlug` branch of `useCreateNode` completely dead code.

---

### Creating a CONTEXT node at space level

**Correct endpoint:** `POST /api/spaces/{spaceSlug}/nodes` with `nodeType: "CONTEXT"` — lands in The Blank, then must be assigned.  
**Intended flow for immediate context placement:** `POST /api/spaces/{spaceSlug}/contexts/{parentContextSlug}/contexts` (nested under an existing context), but there is no endpoint to create a top-level CONTEXT node directly into the space's context list outside of The Blank workflow.

**Current frontend behavior:** `NewNodeModal` sets `manualSystemNodeType = "CONTEXT"` when `entityType === "context"` and calls `nodeService.createNode()` — the flat deprecated endpoint. The CONTEXT node is created in The Blank.

---

### Creating a nested context

**Correct endpoint:** `POST /api/spaces/{spaceSlug}/contexts/{parentContextSlug}/contexts`  
**Request body:** `NodeCreateRequest` — `nodeType` and `content` fields are **ignored** by the backend for this endpoint; only `title` and `nodeDetails` are used.  
**Response:** `NodeResponse` (HTTP 201).

**Current frontend:** `nodeService.createNestedContext()` is correctly implemented. `useCreateNestedContext()` hook exists. No UI currently calls it.

---

### Creating a block (child node) inside a page

**Correct endpoint:** `POST /api/spaces/{spaceSlug}/nodes/{parentNodeId}/children`  
**Request body:**
```json
{
  "title": "string (required, 1-255)",
  "nodeType": "REGULAR",
  "content": "string",
  "nodeDetails": { "blockType": "text|heading1|...", "showInSpaceList": false, "order": 1000 }
}
```
**Response:** `NodeResponse` (HTTP 201). The backend atomically creates the CONTAINS attribute linking parent to child.

**Current frontend:** `useBlockEditor.createBlockMutation` calls `nodeService.createChildNode(spaceSlug, pageId, {...})` — correct. The `order` value is calculated client-side using `calculateOrderBetween()` and stored in `nodeDetails.order`. This is correct.

---

## 3. Read Flow Contract

### List all nodes in a space

**Correct endpoint:** `GET /api/spaces/{spaceSlug}/nodes?page=0&size=100`  
**Frontend:** `nodeService.getNodes(spaceSlug)` with default `size: 100` — correct.  
**Query key:** `nodeKeys.list(spaceSlug, { page: 0, size: 1000 })` — note: `size: 1000` exceeds the backend cap of 100; backend silently clamps to 100. All space pages use this, meaning they never get more than 100 nodes even when requesting 1000.

---

### List nodes in a specific context

**Correct endpoint:** `GET /api/spaces/{spaceSlug}/contexts/{contextSlug}/nodes?page=0&size=100`  
**Frontend:** `nodeService.getNodesInContext()` → `useContextNodes()` hook — correct.  
**Query key:** `contextNodeKeys.nodes(spaceSlug, contextSlug)` = `['context-nodes', spaceSlug, contextSlug]`.  
**Note:** The retry button at `context/[contextSlug]/page.tsx` line 235 hardcodes `['context-nodes', spaceSlug, contextSlug]` instead of using `contextNodeKeys.nodes()` (BUG-08).

---

### Get child contexts of a context

**Correct endpoint:** `GET /api/spaces/{spaceSlug}/contexts/{contextSlug}/children?page=0&size=100`  
**Frontend:** `nodeService.getChildContexts()` → `useChildContexts()` hook — correct.  
**Query key:** `contextNodeKeys.children(spaceSlug, contextSlug)`.

---

### Get child blocks of a node (content page)

**Correct endpoint:** `GET /api/spaces/{spaceSlug}/nodes/{parentNodeId}/children?page=0&size=100`  
**Frontend (actual):** `useBlockEditor` calls `nodeService.getNodes(spaceSlug)` (all space nodes) + `attributeService.getNodeAttributes(pageId)` to find CONTAINS edges, then filters client-side. This is two round-trips and fetches the entire space's node list every time a page is opened.  
**Correct frontend (unused):** `nodeService.getChildNodes(spaceSlug, parentNodeId)` → `useChildNodes(spaceSlug, parentId)` exist and call the correct endpoint but are never used by `useBlockEditor`.

---

## 4. Navigation Contract

| URL Pattern | Page Component | API Calls Made | Issues |
|---|---|---|---|
| `/spaces` | `app/spaces/page.tsx` | `GET /api/spaces` | None |
| `/spaces/[slug]` | `app/spaces/[slug]/page.tsx` | `GET /api/spaces/slug/{slug}`, `GET /api/spaces/{slug}/nodes?size=1000` (capped at 100) | Size cap mismatch; `handleSidebarNavigate` routes all to `/node/${id}` regardless of node type (BUG-05) |
| `/spaces/[slug]/context/[contextSlug]` | `app/spaces/[slug]/context/[contextSlug]/page.tsx` | `GET /api/spaces/slug/{slug}`, `GET /api/spaces/{slug}/contexts/{contextSlug}/nodes`, `GET /api/spaces/{slug}/contexts/{contextSlug}/children`, `GET /api/spaces/{id}/context-types` | `contextSlug` accepted by SpaceShell but never forwarded to NewNodeModal (BUG-02); no link to the context node's own `/node/{id}` (BUG-07); hardcoded invalidation key (BUG-08) |
| `/spaces/[slug]/node/[id]` | `app/spaces/[slug]/node/[id]/page.tsx` | `GET /api/spaces/slug/{slug}`, `GET /api/spaces/{slug}/nodes/{nodeId}`, `GET /api/nodes/{nodeId}/attributes` (for origin), blocks loaded via full-space `getNodes()` + `getNodeAttributes()` | Back button goes to `/spaces/${slug}` regardless of navigation origin (BUG-06); no context in breadcrumb (BUG-06); block loading is inefficient (see section 3) |
| `/spaces/[slug]/blank` | `app/spaces/[slug]/blank/page.tsx` | `GET /api/spaces/{slug}/blank`, `GET /api/spaces/{slug}/blank/count` | None identified |
| `/spaces/[slug]/graph` | `app/spaces/[slug]/graph/page.tsx` | `GET /api/spaces/{spaceId}/attributes` (wrong — no GET on this path) | `attributeService.getSpaceAttributes` hits a non-existent GET endpoint |
| `/spaces/[slug]/whiteboard` | `app/spaces/[slug]/whiteboard/page.tsx` | Various whiteboard node/attribute calls | Separate scope |
| `/void` | `app/void/page.tsx` | `GET /api/void/nodes` | None |

**Post-creation navigation gaps:**

| Creation Action | Current Route | Correct Route |
|---|---|---|
| Create CONTEXT node + "Create and open" | `/spaces/${slug}/node/${node.id}` | `/spaces/${slug}/context/${node.slug}` |
| Context menu "Open Node" on CONTEXT card (SpaceShell) | `/spaces/${slug}/node/${id}` | `/spaces/${slug}/context/${node.slug}` |
| Context menu "Open in new tab" on CONTEXT card (SpaceShell) | `/spaces/${slug}/node/${id}` | `/spaces/${slug}/context/${node.slug}` |
| Sidebar click on CONTEXT node (space page) | `/spaces/${slug}/node/${id}` | `/spaces/${slug}/context/${node.slug}` |
| Card click on CONTEXT node in context page | `/spaces/${slug}/node/${id}` (via `handleCardClick`) | `/spaces/${slug}/context/${node.slug}` |

---

## 5. Response Shape Analysis

### `Node` interface vs. backend `NodeResponse`

| Backend Field | Backend Type | Frontend Field | Frontend Type | Mismatch? |
|---|---|---|---|---|
| `id` | UUID | `id` | `string` | No |
| `spaceId` | UUID | `spaceId` | `string` | No |
| `nodeType` | `NodeType` enum | `nodeType` | `NodeType` enum | No |
| `title` | `String` | `title` | `string` | No |
| `slug` | `String` | `slug` | `string` | No |
| `content` | `String` (nullable) | `content` | `string` (non-nullable!) | **MISMATCH**: backend can return `null`, frontend requires `string` |
| `nodeDetails` | `Map<String,Object>` | `nodeDetails` | `NodeDetails` (typed interface) | No functional mismatch |
| `lockLevel` | `LockLevel` enum | `lockLevel` | `'UNLOCKED' | 'CONTENT_LOCKED' | 'FULLY_LOCKED'` | No |
| `isBuiltin` | `Boolean` (nullable) | `isBuiltin` | `boolean` (non-nullable) | **MISMATCH**: Java `Boolean` can be null; TypeScript `boolean` cannot |
| `effectiveLockLevel` | `LockLevel` | `effectiveLockLevel` | `...` (optional) | No |
| `lockInherited` | `Boolean` | `lockInherited` | `boolean` (optional) | No |
| `lockSource` | `String` | `lockSource` | `'space' | 'schema' | 'parent' | 'self' | null` (optional) | No |
| `parentNodeId` | UUID (nullable) | `parentNodeId` | `string | null` (optional) | No |
| `currentVersionId` | UUID (nullable) | `currentVersionId` | `string` (non-nullable!) | **MISMATCH**: backend nullable, frontend required |
| `createdBy` | UUID | `createdBy` | `string` | No |
| `modifiedBy` | UUID | `modifiedBy` | `string` | No |
| `createdAt` | `Instant` | `createdAt` | `string` | No |
| `updatedAt` | `Instant` | `updatedAt` | `string` | No |

### `NodeVersion` interface vs. backend `NodeVersionResponse`

| Backend Field | Backend Type | Frontend Field | Frontend Type | Mismatch? |
|---|---|---|---|---|
| `id` | UUID | `id` | `number` | **CRITICAL**: backend UUID string, frontend number |
| `nodeId` | UUID | `nodeId` | `number` | **CRITICAL**: backend UUID string, frontend number |
| `versionNumber` | `Integer` | `version` | `number` | **FIELD NAME MISMATCH**: backend `versionNumber`, frontend `version` |
| `title` | `String` | `title` | `string` | No |
| `content` | `String` | `content` | `string` | No |
| `nodeDetailsSnapshot` | `Map<String,Object>` | `nodeDetails` | `Record<string,unknown>` (optional) | **FIELD NAME MISMATCH**: backend `nodeDetailsSnapshot`, frontend `nodeDetails` |
| `createdBy` | UUID | `createdBy` | `number` (optional) | **TYPE MISMATCH**: UUID vs number |
| `createdAt` | `Instant` | `createdAt` | `string` | No |

### `Attribute` interface vs. backend `AttributeResponse`

| Backend Field | Backend Type | Frontend Field | Frontend Type | Mismatch? |
|---|---|---|---|---|
| `isLocked` | `boolean` (primitive) | `isLocked` | `boolean` | No |
| `attributeTypeMode` | `AttributeTypeMode` enum | `attributeTypeMode` | `string` | Looser typing but functional |
| `attributeDataType` | `AttributeDataType` (nullable) | `attributeDataType` | `string | null` (optional) | No |
| `updatedAt` | Not in `AttributeResponse` | Not in `Attribute` | — | No |

### Enum mismatches

**`AttributeKey` (frontend) vs. `AttributeType` (backend):**

| Frontend `AttributeKey` | Backend `AttributeType` | Valid? |
|---|---|---|
| `CONTAINS = 'contains'` | `CONTAINS("contains")` | Yes |
| `DEPENDS_ON = 'depends_on'` | `DEPENDS_ON("depends_on")` | Yes |
| `REFERENCES = 'references'` | `REFERENCES("references")` | Yes |
| `TRIGGERS = 'triggers'` | Not in backend enum | **INVALID** |
| `NEXT = 'next'` | Not in backend enum | **INVALID** |
| `CALLS = 'calls'` | Not in backend enum | **INVALID** |
| (missing) | `PARENT_OF("parent_of")` | **MISSING from frontend** |
| (missing) | `RELATES_TO("relates_to")` | **MISSING from frontend** |

**`FieldSchema.type` (frontend) vs. `SchemaDataType` (backend):**

Frontend `ContextType.attributeSchema` values use `'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'NODE_REF' | 'LIST'` but backend `SchemaDataType` is `STRING, NUMBER, BOOLEAN, DATE, DATETIME, ENUM, ARRAY, JSON`. Frontend is missing `DATETIME`, `ENUM`, `ARRAY`, `JSON` and has a non-backend value `NODE_REF`.

---

## 6. Critical Gaps Summary

### P0 — Will cause runtime 4xx errors

| Gap | File | Detail |
|---|---|---|
| `attributeService.deleteAttribute()` hits wrong path | `src/services/api/attribute.service.ts:53` | Constructs `DELETE /nodes/{nodeId}/attributes/{attrId}` — endpoint does not exist. Correct path is `DELETE /api/attributes/{attributeId}` |
| `attributeService.getSpaceAttributes()` calls non-existent GET | `src/services/api/attribute.service.ts:70` | `GET /spaces/${spaceId}/attributes` does not exist in `AttributeController`. Only `POST` (create) exists at that path. Graph page will fail to load attributes |
| `nodeService.searchNodes()` calls non-existent endpoint | `src/services/api/node.service.ts:274` | `GET /spaces/{slug}/search` is not in any backend controller |
| `nodeService.reorderChildren()` sends wrong field name | `src/services/api/node.service.ts:246` | Sends `{ nodeIds: [...] }` but backend expects `{ orderedChildIds: [...] }` — backend returns 400 |

### P1 — Wrong behavior, node goes to wrong location

| Gap | File | Detail |
|---|---|---|
| `NewNodeModal` has no `contextSlug` prop; always flat-creates | `src/shell/components/NewNodeModal.tsx:51` | Every node created via the modal while inside a context goes to The Blank instead of the current context |
| `SpaceShell` receives `contextSlug` but does not forward to `NewNodeModal` | `src/shell/components/SpaceShell.tsx:297` | Even if `NewNodeModal` were fixed with a prop, SpaceShell never passes `contextSlug` to it |

### P1 — Wrong navigation target

| Gap | File | Detail |
|---|---|---|
| Post-creation "Create and open" routes CONTEXT to `/node/${id}` | `src/shell/components/NewNodeModal.tsx:332` | `node.nodeType === 'CONTEXT'` should go to `/spaces/${spaceSlug}/context/${node.slug}` |
| SpaceShell context menu routes all nodes to `/node/${id}` | `src/shell/components/SpaceShell.tsx:122-129` | Does not check `node.nodeType`; correct for CONTEXT is `/context/${node.slug}` |
| Space page sidebar routes all nodes to `/node/${id}` | `app/spaces/[slug]/page.tsx:238` | `handleSidebarNavigate` ignores node type |
| Context page card click routes CONTEXT children to `/node/${id}` | `app/spaces/[slug]/context/[contextSlug]/page.tsx:81` | `handleCardClick` unconditionally goes to `/node/${node.id}` for all types |

### P2 — Efficiency / correctness

| Gap | File | Detail |
|---|---|---|
| Block editor loads all space nodes to find blocks | `src/components/blocks/hooks/useBlockEditor.ts:157` | Calls `getNodes(spaceSlug)` (all nodes, up to 100) then filters client-side. Should call `getChildNodes(spaceSlug, pageId)` which uses `GET /spaces/{slug}/nodes/{pageId}/children` |
| Backend page size cap is 100 but queries request 1000 | Multiple files | `nodeKeys.list(slug, { page: 0, size: 1000 })` — backend silently clamps. Query key contains `1000` but data is only 100 items. Can cause stale-cache bugs if page size is later changed |
| Retry button uses hardcoded query key | `app/spaces/[slug]/context/[contextSlug]/page.tsx:235` | `['context-nodes', spaceSlug, contextSlug]` should be `contextNodeKeys.nodes(spaceSlug, contextSlug)` |

### P2 — Missing service methods (no frontend coverage)

| Missing Method | Backend Endpoint |
|---|---|
| `attributeService.getAttribute(attributeId)` | `GET /api/attributes/{attributeId}` |
| `attributeService.updateAttribute(attributeId, data)` | `PUT /api/attributes/{attributeId}` |
| `attributeService.promoteAttribute(spaceSlug, attributeId)` | `POST /api/spaces/{spaceSlug}/attributes/{attributeId}/promote` |
| `attributeService.demoteAttribute(spaceSlug, attributeId, force?)` | `DELETE /api/spaces/{spaceSlug}/attributes/{attributeId}/promote` |
| `nodeService.getDescendants(spaceSlug, nodeId)` | `GET /api/spaces/{spaceSlug}/nodes/{nodeId}/descendants` |
| `nodeService.getAncestors(spaceSlug, nodeId)` | `GET /api/spaces/{spaceSlug}/nodes/{nodeId}/ancestors` |
| `nodeService.getNodeInContext(spaceSlug, contextSlug, nodeId)` | `GET /api/spaces/{spaceSlug}/contexts/{contextSlug}/nodes/{nodeId}` |
| `nodeService.createContextNode(spaceSlug, contextSlug, data)` (re-export of createNestedContext with clearer name) | `POST /api/spaces/{spaceSlug}/contexts/{contextSlug}/contexts` |
| `organizationService.removeMember(orgId, memberId)` | `DELETE /api/organizations/{id}/members/{memberId}` |
| `organizationService.updateMemberRole(orgId, memberId, role)` | `PATCH /api/organizations/{id}/members/{memberId}/role` |
| `spaceService.batchUpload(spaceId, formData)` | `POST /api/spaces/{spaceId}/upload/batch` |

### P3 — Type safety

| Issue | Location |
|---|---|
| `Node.content` typed as `string` but backend returns `null` | `src/types/backend-dtos.ts:130` — should be `string \| null` |
| `Node.currentVersionId` typed as `string` but backend returns `null` | `src/types/backend-dtos.ts:135` — should be `string \| null` |
| `NodeVersion.id` typed as `number` but backend returns UUID string | `src/types/backend-dtos.ts:197` |
| `NodeVersion.nodeId` typed as `number` but backend returns UUID string | `src/types/backend-dtos.ts:198` |
| `NodeVersion.version` should be `versionNumber` | `src/types/backend-dtos.ts:199` |
| `NodeVersion.nodeDetails` should be `nodeDetailsSnapshot` | `src/types/backend-dtos.ts:202` |
| `AttributeKey` enum contains `TRIGGERS`, `NEXT`, `CALLS` not in backend | `src/types/backend-dtos.ts:163-168` |
| `AttributeKey` missing `PARENT_OF`, `RELATES_TO` | `src/types/backend-dtos.ts` |
| `FieldSchema.type` missing `DATETIME`, `ENUM`, `ARRAY`, `JSON`; has non-backend `NODE_REF` | `src/types/backend-dtos.ts:676` |

---

## Appendix A — Raw Controller Analyses

The sections below are verbatim structured analyses extracted directly from each backend controller.

---

### A.1 NodeController (`NodeController.java`)

Base path: `/api/spaces/{spaceSlug}/nodes`

[
  {
    "method": "POST",
    "path": "/api/spaces/{spaceSlug}/nodes",
    "description": "Create a node in the space. The node is placed into the default hidden 'Context-Less (Blank)' context. Response includes header X-Mujarrad-Context: context-less.",
    "pathParams": {
      "spaceSlug": "string — space slug, resolved to spaceId via request attribute"
    },
    "requestBody": {
      "title": "string, required, 1–255 chars",
      "nodeType": "enum NodeType, required — REGULAR | TEMPLATE",
      "slug": "string, optional — auto-generated from title if omitted",
      "content": "string, optional — markdown supported",
      "nodeDetails": "Map<String,Object>, optional — arbitrary JSON object",
      "contextTypeId": "UUID, optional — context type for schema validation (BACKEND spaces only)",
      "spaceId": "UUID, auto-set from URL path, do not send"
    },
    "responseBody": "NodeResponse (HTTP 201)",
    "responseShape": {
      "id": "UUID",
      "spaceId": "UUID",
      "nodeType": "REGULAR | TEMPLATE",
      "title": "string",
      "slug": "string",
      "content": "string",
      "nodeDetails": "Map<String,Object>",
      "lockLevel": "LockLevel enum",
      "effectiveLockLevel": "LockLevel enum",
      "lockInherited": "boolean",
      "lockSource": "string (space | schema | parent | self | null)",
      "isBuiltin": "boolean",
      "parentNodeId": "UUID",
      "currentVersionId": "UUID",
      "createdBy": "UUID",
      "modifiedBy": "UUID",
      "createdAt": "Instant (ISO 8601)",
      "updatedAt": "Instant (ISO 8601)"
    },
    "validations": [
      "title: @NotBlank, @Size(1-255)",
      "nodeType: @NotNull"
    ],
    "statusCodes": { "201": "Node created", "400": "Invalid request (ErrorResponse)" },
    "auth": "Bearer token required (spaceId + userId injected as request attributes)"
  },
  {
    "method": "GET",
    "path": "/api/spaces/{spaceSlug}/nodes",
    "description": "List all nodes in the space, paginated.",
    "pathParams": {
      "spaceSlug": "string"
    },
    "queryParams": {
      "page": "int, default 0",
      "size": "int, default 20, capped at 100"
    },
    "requestBody": null,
    "responseBody": "PageResponse<NodeResponse> (HTTP 200)",
    "responseShape": {
      "content": "NodeResponse[]",
      "totalElements": "long",
      "totalPages": "int",
      "page": "int",
      "size": "int",
      "cursor": "string (unused, always null in current impl)"
    },
    "validations": [],
    "statusCodes": { "200": "OK", "403": "Access denied (ErrorResponse)" },
    "auth": "Bearer token required"
  },
  {
    "method": "GET",
    "path": "/api/spaces/{spaceSlug}/nodes/{nodeId}",
    "description": "Retrieve a single node by UUID.",
    "pathParams": {
      "spaceSlug": "string",
      "nodeId": "UUID"
    },
    "requestBody": null,
    "responseBody": "NodeResponse (HTTP 200)",
    "validations": [],
    "statusCodes": { "200": "OK", "404": "Node not found (ErrorResponse)" },
    "auth": "Bearer token required"
  },
  {
    "method": "PUT",
    "path": "/api/spaces/{spaceSlug}/nodes/{nodeId}",
    "description": "Update an existing node. All fields are optional (partial update). Creates a new version snapshot on each update. spaceId in body must match the node's current space if provided — nodes cannot be moved between spaces via this endpoint.",
    "pathParams": {
      "spaceSlug": "string",
      "nodeId": "UUID"
    },
    "requestBody": {
      "title": "string, optional, 1–255 chars",
      "content": "string, optional",
      "nodeDetails": "Map<String,Object>, optional",
      "spaceId": "UUID, optional — must match node's current space if provided"
    },
    "responseBody": "NodeResponse (HTTP 200)",
    "validations": [
      "title: @Size(1-255) if present"
    ],
    "statusCodes": { "200": "OK", "400": "Invalid request", "404": "Node not found" },
    "auth": "Bearer token required"
  },
  {
    "method": "DELETE",
    "path": "/api/spaces/{spaceSlug}/nodes/{nodeId}",
    "description": "Delete a node. Context nodes with children cannot be deleted unless force=true. With force=true: single-parent children are cascade-deleted; multi-parent children are orphaned (parent link removed but node kept).",
    "pathParams": {
      "spaceSlug": "string",
      "nodeId": "UUID"
    },
    "queryParams": {
      "force": "boolean, default false"
    },
    "requestBody": null,
    "responseBody": "HTTP 204 No Content",
    "validations": [],
    "statusCodes": { "204": "Deleted", "400": "Context node has children, use force=true", "404": "Node not found" },
    "auth": "Bearer token required"
  },
  {
    "method": "POST",
    "path": "/api/spaces/{spaceSlug}/nodes/{nodeId}/move",
    "deprecated": true,
    "description": "DEPRECATED — use /migrate instead. Move node to another space.",
    "pathParams": {
      "spaceSlug": "string",
      "nodeId": "UUID"
    },
    "requestBody": {
      "targetSpaceId": "UUID, required",
      "targetContextId": "UUID, optional",
      "contextAction": "string, optional",
      "confirm": "boolean, optional"
    },
    "responseBody": "MoveNodeResponse (HTTP 200)",
    "responseShape": {
      "node": "NodeResponse",
      "convertedRelationships": "int",
      "severedRelationships": "int",
      "contextAction": "string",
      "preview": {
        "totalRelationships": "int",
        "relationships": [
          {
            "attributeId": "UUID",
            "attributeName": "string",
            "connectedNodeId": "UUID",
            "connectedNodeTitle": "string"
          }
        ]
      }
    },
    "validations": [
      "targetSpaceId: @NotNull"
    ],
    "statusCodes": { "200": "OK" },
    "auth": "Bearer token required"
  },
  {
    "method": "POST",
    "path": "/api/spaces/{spaceSlug}/nodes/{parentNodeId}/children",
    "description": "Atomically create a child node inside a parent node (block creation). The child is linked to the parent via a CONTAINS attribute.",
    "pathParams": {
      "spaceSlug": "string",
      "parentNodeId": "UUID — the parent node to attach the new child to"
    },
    "requestBody": {
      "title": "string, required, 1–255 chars",
      "nodeType": "enum NodeType, required — REGULAR | TEMPLATE",
      "slug": "string, optional",
      "content": "string, optional",
      "nodeDetails": "Map<String,Object>, optional",
      "contextTypeId": "UUID, optional"
    },
    "responseBody": "NodeResponse (HTTP 201)",
    "validations": [
      "title: @NotBlank, @Size(1-255)",
      "nodeType: @NotNull"
    ],
    "statusCodes": { "201": "Child node created" },
    "auth": "Bearer token required"
  },
  {
    "method": "GET",
    "path": "/api/spaces/{spaceSlug}/nodes/{parentNodeId}/children",
    "description": "List direct child nodes of the given parent node, paginated. Children are resolved via CONTAINS attributes.",
    "pathParams": {
      "spaceSlug": "string",
      "parentNodeId": "UUID"
    },
    "queryParams": {
      "page": "int, default 0",
      "size": "int, default 20, capped at 100"
    },
    "requestBody": null,
    "responseBody": "PageResponse<NodeResponse> (HTTP 200)",
    "validations": [],
    "statusCodes": { "200": "OK" },
    "auth": "Bearer token required"
  },
  {
    "method": "PATCH",
    "path": "/api/spaces/{spaceSlug}/nodes/{parentNodeId}/children/reorder",
    "description": "Batch reorder child nodes of a parent. Updates the 'order' value (multiples of 1000) on each CONTAINS attribute linking parent to child. Returns 400 if orderedChildIds is missing or empty.",
    "pathParams": {
      "spaceSlug": "string",
      "parentNodeId": "UUID"
    },
    "requestBody": {
      "orderedChildIds": "UUID[], required — full ordered list of child node UUIDs"
    },
    "responseBody": "HTTP 200 (empty body on success), HTTP 400 (if orderedChildIds null or empty)",
    "validations": [
      "orderedChildIds must be present and non-empty"
    ],
    "statusCodes": { "200": "OK", "400": "Missing or empty orderedChildIds" },
    "auth": "Bearer token required"
  },
  {
    "method": "POST",
    "path": "/api/spaces/{spaceSlug}/nodes/{nodeId}/migrate",
    "description": "Migrate a node to another space. The original node stays in the source space; a copy is created in the target space. Optionally creates a reference attribute linking original to copy.",
    "pathParams": {
      "spaceSlug": "string",
      "nodeId": "UUID — the node to migrate"
    },
    "requestBody": {
      "targetSpaceId": "UUID, required",
      "targetContextId": "UUID, optional",
      "includeReference": "boolean, optional, default true — whether to create a reference attribute linking original to copy"
    },
    "responseBody": "MigrateNodeResponse (HTTP 201)",
    "responseShape": {
      "original": "NodeResponse — unchanged original node",
      "copy": "NodeResponse — newly created copy in target space",
      "referenceAttributeId": "UUID | null — ID of the reference attribute if includeReference=true"
    },
    "validations": [
      "targetSpaceId: @NotNull"
    ],
    "statusCodes": { "201": "Migration successful" },
    "auth": "Bearer token required",
    "transactional": "readOnly=true on the controller method (write logic is inside NodeMigrationService)"
  },
  {
    "method": "GET",
    "path": "/api/spaces/{spaceSlug}/nodes/{nodeId}/descendants",
    "description": "Return all nodes reachable by traversing 'contains' relationships downward from the given node. Handles cyclic graphs (visited-set deduplication). Results are returned in BFS/DFS traversal order, paginated.",
    "pathParams": {
      "spaceSlug": "string",
      "nodeId": "UUID"
    },
    "queryParams": {
      "page": "int, default 0",
      "size": "int, default 20, capped at 100"
    },
    "requestBody": null,
    "responseBody": "PageResponse<NodeResponse> (HTTP 200)",
    "validations": [],
    "statusCodes": { "200": "OK", "404": "Node not found" },
    "auth": "Bearer token required"
  },
  {
    "method": "GET",
    "path": "/api/spaces/{spaceSlug}/nodes/{nodeId}/ancestors",
    "description": "Return all nodes reachable by traversing 'contains' relationships upward from the given node. Supports multi-parent graphs (a node can have multiple parents). Results paginated in traversal order.",
    "pathParams": {
      "spaceSlug": "string",
      "nodeId": "UUID"
    },
    "queryParams": {
      "page": "int, default 0",
      "size": "int, default 20, capped at 100"
    },
    "requestBody": null,
    "responseBody": "PageResponse<NodeResponse> (HTTP 200)",
    "validations": [],
    "statusCodes": { "200": "OK", "404": "Node not found" },
    "auth": "Bearer token required"
  }
]

---

### A.2 ContextScopedNodeController (`ContextScopedNodeController.java`)

Here is the complete structured list of all HTTP endpoints in `ContextScopedNodeController.java`.

Base path: `/api/spaces/{spaceSlug}/contexts/{contextSlug}`
Security: Bearer token required on all endpoints.

---

**1. GET /api/spaces/{spaceSlug}/contexts/{contextSlug}/nodes**
- Method: GET
- Path params: `spaceSlug` (String), `contextSlug` (String)
- Request attributes (middleware-injected): `spaceId` (UUID)
- Query params: `page` (int, default 0), `size` (int, default 20, max clamped to 100)
- Request body: none
- Response type: `ResponseEntity<PageResponse<NodeResponse>>` — 200 OK
- Description: List nodes in context (paginated)
- Constraints: `size` is silently clamped to 100 if exceeded

---

**2. POST /api/spaces/{spaceSlug}/contexts/{contextSlug}/nodes**
- Method: POST
- Path params: `spaceSlug` (String), `contextSlug` (String)
- Request attributes (middleware-injected): `spaceId` (UUID), `userId` (UUID)
- Request body: `NodeCreateRequest` (validated with `@Valid`) — fields used: `title`, `nodeType`, `content`, `nodeDetails`
- Response type: `ResponseEntity<NodeResponse>` — 201 Created
- Description: Create a node inside the specified context
- Constraints: Request body must pass `@Valid` bean validation

---

**3. GET /api/spaces/{spaceSlug}/contexts/{contextSlug}/nodes/{nodeId}**
- Method: GET
- Path params: `spaceSlug` (String), `contextSlug` (String), `nodeId` (UUID)
- Request attributes (middleware-injected): `spaceId` (UUID)
- Request body: none
- Response type: `ResponseEntity<NodeResponse>` — 200 OK
- Description: Get a single node within the context; resolves and validates context membership before fetching
- Constraints: Context is resolved/validated via `contextNodeService.resolveContext` before delegating to `nodeService.getNode`

---

**4. POST /api/spaces/{spaceSlug}/contexts/{contextSlug}/contexts**
- Method: POST
- Path params: `spaceSlug` (String), `contextSlug` (String)
- Request attributes (middleware-injected): `spaceId` (UUID), `userId` (UUID)
- Request body: `NodeCreateRequest` (validated with `@Valid`) — fields used: `title`, `nodeDetails` (note: `nodeType` and `content` are NOT used)
- Response type: `ResponseEntity<NodeResponse>` — 201 Created
- Description: Create a nested child context inside the current context
- Constraints: Request body must pass `@Valid` bean validation; `nodeType` and `content` fields from the request are ignored

---

**5. DELETE /api/spaces/{spaceSlug}/contexts/{contextSlug}/nodes/{nodeId}**
- Method: DELETE
- Path params: `spaceSlug` (String), `contextSlug` (String), `nodeId` (UUID)
- Request attributes (middleware-injected): `spaceId` (UUID), `userId` (UUID)
- Request body: none
- Response type: `ResponseEntity<Void>` — 204 No Content
- Description: Remove a node from the context
- Constraints: none beyond path param types

---

**6. GET /api/spaces/{spaceSlug}/contexts/{contextSlug}/children**
- Method: GET
- Path params: `spaceSlug` (String), `contextSlug` (String)
- Request attributes (middleware-injected): `spaceId` (UUID)
- Query params: `page` (int, default 0), `size` (int, default 20, max clamped to 100)
- Request body: none
- Response type: `ResponseEntity<PageResponse<NodeResponse>>` — 200 OK
- Description: List child contexts of the current context (paginated)
- Constraints: `size` is silently clamped to 100 if exceeded

---

### A.3 BlankController (`BlankController.java`)

Here are all HTTP endpoints defined in `BlankController.java`:

Base path: `/api/spaces/{spaceSlug}/blank`
Auth: Bearer token required on all endpoints.

---

1. Method: GET
   Path: `/api/spaces/{spaceSlug}/blank`
   Request Body: none
   Query Params: `page` (default 0), `size` (default 20, max 100)
   Path Vars: `spaceSlug` (String), `spaceId` (UUID, injected via request attribute)
   Response: `PageResponse<NodeResponse>`
   Description: List all unorganized nodes in the Blank context for a space, paginated.

---

2. Method: POST
   Path: `/api/spaces/{spaceSlug}/blank/{nodeId}/assign`
   Request Body: `{ "contextSlug": "string" }` (Map<String, String>)
   Path Vars: `spaceSlug` (String), `nodeId` (UUID)
   Request Attributes: `spaceId` (UUID), `userId` (UUID)
   Response: `NodeResponse`
   Description: Assign a single node from the Blank to a named context. Returns 400 if `contextSlug` is missing or blank.

---

3. Method: POST
   Path: `/api/spaces/{spaceSlug}/blank/assign-bulk`
   Request Body: `{ "nodeIds": ["uuid", ...], "contextSlug": "string" }` (`BulkAssignRequest` record)
   Path Vars: `spaceSlug` (String)
   Request Attributes: `spaceId` (UUID), `userId` (UUID)
   Response: `List<NodeResponse>`
   Description: Bulk assign multiple nodes from the Blank to a named context in a single call. Returns 400 if `nodeIds` is null/empty or `contextSlug` is missing/blank.

---

4. Method: GET
   Path: `/api/spaces/{spaceSlug}/blank/count`
   Request Body: none
   Path Vars: `spaceSlug` (String)
   Request Attributes: `spaceId` (UUID)
   Response: `{ "count": long }`
   Description: Return the total count of unorganized nodes currently sitting in the Blank for a space.

---

### A.4 VoidController (`VoidController.java`)

Here is the complete structured list of all HTTP endpoints in VoidController.java. All routes are under the base path `/api/void/nodes` and require Bearer token authentication. The authenticated user's identity is resolved server-side from the token via `@RequestAttribute("userId")` — it is never passed in the request body.

---

**1. Create Void Node**
- Method: POST
- Path: `/api/void/nodes`
- Request Body (`VoidNodeCreateRequest`):
  - `title` (string, required, max 500 chars)
  - `content` (string, optional)
  - `nodeType` (enum NodeType, optional — defaults to `REGULAR`)
  - `nodeDetails` (Map<String,Object>, optional — arbitrary key/value metadata)
- Response: `201 Created` — `NodeResponse`
- Description: Creates a new node in the authenticated user's Void (no space association).

---

**2. List Void Nodes (paginated)**
- Method: GET
- Path: `/api/void/nodes`
- Query Params:
  - `page` (int, default `0`)
  - `size` (int, default `20`, capped at `100`)
- Request Body: none
- Response: `200 OK` — `PageResponse<NodeResponse>`
- Description: Returns a paginated list of all nodes in the authenticated user's Void.

---

**3. Get Single Void Node**
- Method: GET
- Path: `/api/void/nodes/{nodeId}`
- Path Param: `nodeId` (UUID)
- Request Body: none
- Response: `200 OK` — `NodeResponse`
- Description: Retrieves a specific Void node by ID, scoped to the authenticated user.

---

**4. Update Void Node**
- Method: PUT
- Path: `/api/void/nodes/{nodeId}`
- Path Param: `nodeId` (UUID)
- Request Body (`VoidNodeUpdateRequest`, all fields optional):
  - `title` (string, max 500 chars)
  - `content` (string)
  - `nodeDetails` (Map<String,Object>)
- Response: `200 OK` — `NodeResponse`
- Description: Updates title, content, and/or metadata of a Void node owned by the authenticated user.

---

**5. Delete Void Node**
- Method: DELETE
- Path: `/api/void/nodes/{nodeId}`
- Path Param: `nodeId` (UUID)
- Request Body: none
- Response: `204 No Content`
- Description: Permanently deletes a Void node owned by the authenticated user.

---

**6. Assign Void Node to a Space**
- Method: POST
- Path: `/api/void/nodes/{nodeId}/assign`
- Path Param: `nodeId` (UUID)
- Request Body (`AssignToSpaceRequest`):
  - `spaceId` (UUID, required)
  - `contextId` (UUID, optional — target context/container within the space)
- Response: `200 OK` — `NodeResponse`
- Description: Moves a Void node out of the holding area by assigning it to a specific Space (and optionally a context within that space).

---

### A.5 SpaceController (`SpaceController.java`)

--- SpaceController.java ---
Base path: /api/spaces
Auth: Bearer JWT required (all endpoints)

1. POST /api/spaces
   - Method: POST
   - Request body: SpaceCreateRequest (JSON, @Valid) — fields include name, slug (optional; auto-derived from name if absent)
   - Response: SpaceResponse — 200 if space already existed for this user, 201 if newly created, 409 if slug is taken by a different user
   - Description: Get-or-create (idempotent). If the slug resolves to an existing space owned by the caller it is returned as-is; if it does not exist it is created. 409 if the slug exists but is owned by another user.

2. GET /api/spaces
   - Method: GET
   - Query params: page (default 0), size (default 20, max 100)
   - Request body: none
   - Response: PageResponse<SpaceResponse> — 200
   - Description: Returns all spaces owned by or shared with the authenticated user, paginated in-memory.

3. GET /api/spaces/{id}
   - Method: GET
   - Path param: id (UUID)
   - Request body: none
   - Response: SpaceResponse — 200, or 404 if not found/access denied
   - Description: Fetch a single space by UUID. Requires ownership or membership.

4. GET /api/spaces/slug/{slug}
   - Method: GET
   - Path param: slug (String)
   - Request body: none
   - Response: SpaceResponse — 200, or 404 if not found/access denied
   - Description: Fetch a single space by slug. Requires ownership or membership.

5. PATCH /api/spaces/{id}
   - Method: PATCH
   - Path param: id (UUID)
   - Request body: SpaceUpdateRequest (JSON, @Valid) — can update name, project type (CONSUMER/BACKEND), mode (CONFIGURATION/PRODUCTION)
   - Response: SpaceResponse — 200; 400 for invalid mode for CONSUMER; 403 for mode restriction (e.g. converting from PRODUCTION); 404 if not found/access denied
   - Description: Update space properties. Only the owner can update. Used for converting between CONSUMER and BACKEND project types, and switching between CONFIGURATION and PRODUCTION modes.

6. DELETE /api/spaces/{id}
   - Method: DELETE
   - Path param: id (UUID)
   - Request body: none
   - Response: 204 No Content; 401 Unauthorized; 404 not found/access denied
   - Description: Deletes a space and cascades to all nodes and attributes within it. Owner only.

7. POST /api/spaces/{spaceId}/upload/batch
   - Method: POST
   - Content-Type: multipart/form-data
   - Path param: spaceId (UUID)
   - Form params:
     - files (MultipartFile, required) — blob containing a JSON array of FileUploadData objects
     - batchNumber (Integer, optional)
     - sessionId (String, optional) — for multi-batch sessions
     - commitMessage (String, optional)
   - Response: BatchUploadResponse — 202 Accepted; 400 for invalid/missing data; 401 Unauthorized; 404 Space not found
   - Description: Batch upload for CLI/Obsidian vault sync. Accepts up to 100 files per batch. Files blob is a JSON array parsed server-side. Returns per-file success/error counts.

---

--- ContextTypeController.java ---
Base path: /api/spaces/{spaceId}/context-types
Auth: Bearer JWT required (all endpoints)
Scope: BACKEND spaces only. Write operations (create/update/delete) require CONFIGURATION mode, enforced via the optional X-Space-Mode request header.

1. POST /api/spaces/{spaceId}/context-types
   - Method: POST
   - Path param: spaceId (UUID)
   - Request header: X-Space-Mode (String, optional, owner only) — mode override
   - Request body: ContextTypeCreateRequest (JSON, @Valid)
   - Response: ContextTypeResponse — 201 Created; 400 invalid request; 403 CONFIGURATION mode required; 409 duplicate slug
   - Description: Creates a new context type schema in a BACKEND space. Only allowed when space is in CONFIGURATION mode (or header override granted to owner).

2. GET /api/spaces/{spaceId}/context-types
   - Method: GET
   - Path param: spaceId (UUID)
   - Request body: none
   - Response: PageResponse<ContextTypeResponse> — 200 (single page, all results); 404 Space not found
   - Description: Lists all context types (custom and built-in) defined in the space. No pagination server-side — all are returned in one page wrapper.

3. GET /api/spaces/{spaceId}/context-types/{slug}
   - Method: GET
   - Path params: spaceId (UUID), slug (String)
   - Request body: none
   - Response: ContextTypeResponse — 200; 404 not found
   - Description: Returns a single context type by its slug.

4. PUT /api/spaces/{spaceId}/context-types/{slug}
   - Method: PUT
   - Path params: spaceId (UUID), slug (String)
   - Request header: X-Space-Mode (String, optional, owner only)
   - Request body: ContextTypeUpdateRequest (JSON, @Valid)
   - Response: ContextTypeResponse — 200; 400 invalid request or built-in type; 403 CONFIGURATION mode required; 404 not found
   - Description: Updates an existing context type schema. Built-in types cannot be modified. CONFIGURATION mode required.

5. DELETE /api/spaces/{spaceId}/context-types/{slug}
   - Method: DELETE
   - Path params: spaceId (UUID), slug (String)
   - Request header: X-Space-Mode (String, optional, owner only)
   - Request body: none
   - Response: 204 No Content; 400 built-in type cannot be deleted; 403 CONFIGURATION mode required; 404 not found; 409 type is in use by nodes
   - Description: Deletes a context type. Guards: cannot delete built-in types, cannot delete types that have existing nodes referencing them. CONFIGURATION mode required.

---

Space mode / context type enforcement notes:

- Space project types: CONSUMER and BACKEND. The PATCH endpoint on SpaceController is how a space is converted between them.
- Space modes: CONFIGURATION and PRODUCTION. Switching is done via PATCH /api/spaces/{id}. The controller comment notes a restriction against converting FROM PRODUCTION (403).
- All ContextTypeController write endpoints (POST, PUT, DELETE) enforce CONFIGURATION mode. A space in PRODUCTION mode will be rejected with 403.
- The X-Space-Mode header is an owner-only override that allows bypassing the mode check without first switching the space.
- Context types are scoped to BACKEND spaces. The class-level Swagger tag reads "Context type schema management for BACKEND spaces."
- Built-in context types are protected: they cannot be updated (PUT returns 400) or deleted (DELETE returns 400).
- A context type that is referenced by existing nodes cannot be deleted (409).

---

### A.6 AttributeController (`AttributeController.java`)

Here is the complete structured endpoint list extracted from `AttributeController.java`:

---

## AttributeController Endpoints

### 1. POST /api/spaces/{spaceId}/attributes
- **Method:** POST
- **Path param:** `spaceId` (UUID)
- **Request body:** `AttributeCreateRequest`
  - `sourceNodeId` (UUID, required)
  - `targetNodeId` (UUID, optional)
  - `attributeName` (String, required) — e.g. `"contains"`, `"references"`
  - `attributeType` (String, required) — e.g. `"relationship"`
  - `attributeTypeMode` (enum: `SCHEMALESS` | `SCHEMA`, required)
  - `attributeDataType` (enum, optional)
  - `attributeValue` (Map<String,Object>, optional) — arbitrary JSON
  - `properties` (Map<String,Object>, optional) — arbitrary JSON
- **Request attributes (middleware-injected):** `userId`
- **Response 201:** `AttributeResponse`
- **Response 400:** `ErrorResponse` — invalid request, cycle detected, or cardinality violation
- **Response 403:** `ErrorResponse` — access denied
- **Description:** Space-scoped attribute creation. Both source and target nodes are specified explicitly in the body. Includes cycle detection for CONTAINS relationships and cardinality validation.

---

### 2. POST /api/nodes/{nodeId}/attributes
- **Method:** POST
- **Path param:** `nodeId` (UUID)
- **Request body:** `AttributeCreateRequest` (same fields as above)
- **Request attributes (middleware-injected):** `userId`, `spaceId`
- **Response 201:** `AttributeResponse`
- **Response 400:** `ErrorResponse`
- **Response 403:** `ErrorResponse`
- **Description:** Node-scoped attribute creation. The `sourceNodeId` is overridden by the path `nodeId` — the caller only needs to specify `targetNodeId` and relationship metadata in the body. The `spaceId` comes from middleware context, not the URL.

---

### 3. GET /api/nodes/{nodeId}/attributes
- **Method:** GET
- **Path param:** `nodeId` (UUID)
- **Query params:** `page` (default 0), `size` (default 20, capped at 100)
- **Request attributes (middleware-injected):** `userId`
- **Response 200:** `PageResponse<AttributeResponse>`
- **Response 404:** `ErrorResponse` — node not found
- **Description:** Returns all **outgoing** attributes from the specified node (where this node is the source). Paginated in-memory from the full list.

---

### 4. GET /api/nodes/{nodeId}/incoming-attributes
- **Method:** GET
- **Path param:** `nodeId` (UUID)
- **Query params:** `attributeType` (optional filter, case-insensitive), `page` (default 0), `size` (default 20, capped at 100)
- **Request attributes (middleware-injected):** `userId`
- **Response 200:** `PageResponse<AttributeResponse>`
- **Response 404:** `ErrorResponse` — node not found
- **Description:** Returns all **incoming** attributes where this node is the **target**. Optional `attributeType` filter narrows results (e.g. only `CONTAINS` edges pointing at this node). Paginated in-memory.

---

### 5. GET /api/attributes/{attributeId}
- **Method:** GET
- **Path param:** `attributeId` (UUID)
- **Request attributes (middleware-injected):** `spaceId`
- **Response 200:** `AttributeResponse`
- **Response 404:** `ErrorResponse`
- **Description:** Fetch a single attribute by its own ID. Space context is injected by middleware for access control.

---

### 6. PUT /api/attributes/{attributeId}
- **Method:** PUT
- **Path param:** `attributeId` (UUID)
- **Request body:** `AttributeUpdateRequest` (all fields optional/partial update)
  - `attributeName` (String, max 255 chars)
  - `attributeTypeMode` (enum: `SCHEMALESS` | `SCHEMA`)
  - `attributeDataType` (enum)
  - `attributeValue` (Map<String,Object>)
  - `properties` (Map<String,Object>)
- **Request attributes (middleware-injected):** `userId`, `spaceId`
- **Response 200:** `AttributeResponse`
- **Response 400:** `ErrorResponse` — invalid request or cycle detected
- **Response 404:** `ErrorResponse`
- **Description:** Partial update of an attribute. Cannot change `sourceNodeId` or `targetNodeId` — only the metadata, value, and properties. Cycle detection still applies.

---

### 7. DELETE /api/attributes/{attributeId}
- **Method:** DELETE
- **Path param:** `attributeId` (UUID)
- **Request attributes (middleware-injected):** `spaceId`
- **Response 204:** No content
- **Response 404:** `ErrorResponse`
- **Description:** Deletes an attribute edge. If the attribute was previously promoted to a representative node, that node is also deleted.

---

### 8. POST /api/spaces/{spaceSlug}/attributes/{attributeId}/promote
- **Method:** POST
- **Path params:** `spaceSlug` (String), `attributeId` (UUID)
- **Request attributes (middleware-injected):** `userId`, `spaceId`
- **Response 201:** `NodeResponse`
- **Response 404:** `ErrorResponse`
- **Response 409:** `ErrorResponse` — already promoted
- **Description:** Promotes an attribute edge to a first-class graph node (`nodeType=ATTRIBUTE`). The returned node has its own identity and can itself carry attributes and relationships — enabling hyperedge-like modeling.

---

### 9. DELETE /api/spaces/{spaceSlug}/attributes/{attributeId}/promote
- **Method:** DELETE
- **Path params:** `spaceSlug` (String), `attributeId` (UUID)
- **Query param:** `force` (boolean, default `false`)
- **Request attributes (middleware-injected):** `userId`, `spaceId`
- **Response 204:** No content
- **Response 404:** `ErrorResponse` — not found or not currently promoted
- **Response 409:** `ErrorResponse` — representative node has children (blocked unless `force=true`)
- **Description:** Demotes a promoted attribute back to a plain edge by deleting its representative node. If the representative node has CONTAINS children, the operation is blocked by default. `force=true` cascades deletion or orphans children that have multiple parents.

---

## CONTAINS vs Cross-Space Connections

**CONTAINS (parent-child containment):**
- Used via `attributeName: "contains"` on endpoint 2 (node-scoped) or endpoint 1 (space-scoped).
- Subject to **cycle detection** — the service prevents cycles in the CONTAINS hierarchy (i.e., a node cannot eventually contain one of its own ancestors).
- Subject to **cardinality validation** (space-scoped endpoint only).
- The outgoing/incoming split (endpoints 3 and 4) allows traversing the tree in both directions.
- If the containment relationship is complex enough, it can be promoted (endpoint 8) so the edge itself becomes a node with its own metadata.

**Cross-space connections (REFERENCES, RELATES_TO, DEPENDS_ON, etc.):**
- The `AttributeResponse` carries a `virtualContextId` field — populated when the attribute bridges two different spaces.
- These use the same creation endpoints but with `attributeType` set to a non-containment value.
- No cycle detection is enforced for non-CONTAINS types (cycle detection is specific to the containment hierarchy).
- The `isLocked` flag on `AttributeResponse` can restrict mutation of system-managed cross-space edges.

---

## Appendix B — Backend DTO Definitions

Here is the complete data contract extracted from the backend Java source files:

---

## NodeResponse (18 fields)

File: `dto/response/NodeResponse.java`

| Field | Java Type | Notes |
|---|---|---|
| `id` | `UUID` | |
| `spaceId` | `UUID` | |
| `nodeType` | `NodeType` enum | `REGULAR`, `CONTEXT`, `ATTRIBUTE` |
| `title` | `String` | |
| `slug` | `String` | URL-friendly |
| `content` | `String` | markdown supported |
| `nodeDetails` | `Map<String, Object>` | JSON |
| `lockLevel` | `LockLevel` enum | self-declared lock |
| `isBuiltin` | `Boolean` | |
| `effectiveLockLevel` | `LockLevel` enum | computed from space/schema/parent/self |
| `lockInherited` | `Boolean` | |
| `lockSource` | `String` | `"space"`, `"schema"`, `"parent"`, `"self"`, or null |
| `parentNodeId` | `UUID` | nullable |
| `currentVersionId` | `UUID` | nullable |
| `createdBy` | `UUID` | |
| `modifiedBy` | `UUID` | |
| `createdAt` | `Instant` | ISO 8601 |
| `updatedAt` | `Instant` | ISO 8601 |

---

## NodeCreateRequest

File: `dto/request/NodeCreateRequest.java`

| Field | Java Type | Validation |
|---|---|---|
| `spaceId` | `UUID` | optional (set from URL path) |
| `title` | `String` | `@NotBlank`, 1–255 chars |
| `slug` | `String` | optional, auto-generated if absent |
| `nodeType` | `NodeType` enum | `@NotNull` — `REGULAR`, `CONTEXT`, `ATTRIBUTE` |
| `contextTypeId` | `UUID` | optional, BACKEND spaces only |
| `content` | `String` | optional |
| `nodeDetails` | `Map<String, Object>` | optional |

---

## NodeUpdateRequest

File: `dto/request/NodeUpdateRequest.java`

All fields optional (partial update):

| Field | Java Type | Validation |
|---|---|---|
| `title` | `String` | 1–255 chars |
| `content` | `String` | |
| `nodeDetails` | `Map<String, Object>` | |
| `spaceId` | `UUID` | validation only — must match current space if provided |

---

## PageResponse\<T\>

File: `dto/response/PageResponse.java`

| Field | Java Type |
|---|---|
| `content` | `List<T>` |
| `totalElements` | `long` |
| `totalPages` | `int` |
| `page` | `int` (0-indexed, Spring `page.getNumber()`) |
| `size` | `int` |
| `cursor` | `String` (nullable, cursor-based pagination) |

---

## Enums

### NodeType
```
REGULAR, CONTEXT, ATTRIBUTE
```

### LockLevel
```
UNLOCKED, CONTENT_LOCKED, FULLY_LOCKED
```

### AttributeType (enum with `.getValue()` string)
```
CONTAINS ("contains")
DEPENDS_ON ("depends_on")
REFERENCES ("references")
PARENT_OF ("parent_of")
RELATES_TO ("relates_to")
```

### AttributeDataType
```
TEXT, NUMBER, BOOLEAN, DATE, NODE_REF, LIST
```

### AttributeTypeMode
```
TYPED, SCHEMALESS
```

### ProjectType
```
CONSUMER, BACKEND
```

### SpaceMode
```
CONFIGURATION, PRODUCTION
```

### SpaceRole
```
OWNER, ADMIN, EDITOR, VIEWER
```

### Role (user system role)
```
DEVELOPER, EDITOR, VIEWER, ADMIN
```

### NodeVisibility
```
INTERNAL, VISIBLE, HIDDEN
```

### NodeOrigin
```
PAGE, BLOCK, WHITEBOARD, IMPORT
```

### Cardinality
```
ONE_TO_ONE, ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY
```

### OrganizationRole
```
OWNER, ADMIN, MEMBER
```

### VirtualContextRole
```
OWNER, CONTRIBUTOR, READONLY
```

### SchemaDataType
```
STRING, NUMBER, BOOLEAN, DATE, DATETIME, ENUM, ARRAY, JSON
```

### PreferredView
```
PAGE_EDITOR, WHITEBOARD, MARKDOWN, AUTO
```

### OrderingStrategy
```
MANUAL, ALPHABETICAL, CHRONOLOGICAL, CUSTOM
```

### EntityType
```
NODE, ATTRIBUTE, MAPPING, CONDITIONAL, USER, SPACE, API_KEY
```

---

## Other Key Response Types

### AttributeResponse (14 fields)
`id`, `spaceId`, `sourceNodeId`, `targetNodeId`, `attributeName`, `attributeType` (String), `attributeTypeMode` (AttributeTypeMode), `attributeDataType` (AttributeDataType), `attributeValue` (Map), `properties` (Map), `representativeNodeId`, `isLocked` (boolean primitive), `virtualContextId`, `createdBy`, `createdAt`

### NodeDetailResponse
`id`, `spaceId`, `nodeType`, `title`, `slug`, `content`, `nodeDetails`, `creatorId`, `creatorName`, `currentVersion` (Integer), `recentVersions` (List<NodeVersionResponse>), `createdAt`, `updatedAt`, `outgoingAttributes` (List<AttributeSummaryResponse>), `incomingAttributes` (List<AttributeSummaryResponse>), `totalVersions`, `outgoingCount`, `incomingCount`

### NodeVersionResponse
`id`, `nodeId`, `versionNumber` (Integer), `title`, `content`, `nodeDetailsSnapshot` (Map), `attributesSnapshot` (List<Map>), `createdBy`, `createdAt`

### AttributeSummaryResponse
`id`, `nodeId`, `nodeTitle`, `attributeName`, `attributeType` (String)

### SpaceResponse
`id`, `name`, `slug`, `ownerId`, `organizationId`, `projectType` (ProjectType), `mode` (SpaceMode), `isLocked` (Boolean), `createdAt`, `updatedAt`

### LockNodeRequest
`lockLevel` (LockLevel, `@NotNull`)

### MoveNodeRequest
`targetSpaceId` (UUID, `@NotNull`), `targetContextId` (UUID), `contextAction` (String), `confirm` (Boolean)

### LockResponse
`success` (boolean), `message` (String)

### MoveNodeResponse
`node` (NodeResponse), `convertedRelationships` (int), `severedRelationships` (int), `contextAction` (String), `preview` (MovePreview with `totalRelationships` int + `relationships` List of `{attributeId, attributeName, connectedNodeId, connectedNodeTitle}`)

---

**Critical notes for TypeScript alignment:**
- `isBuiltin` and `isLocked` in responses use Java `Boolean`/`boolean` — map to `boolean | null` vs `boolean` respectively (AttributeResponse uses primitive `boolean isLocked`, NodeResponse uses `Boolean isBuiltin`)
- `page` in `PageResponse` is **0-indexed** (Spring `page.getNumber()`)
- All timestamps are `Instant` → serialized as ISO 8601 strings
- `AttributeResponse.attributeType` is a `String`, not the `AttributeType` enum — the enum is used in `AttributeCreateRequest` implicitly (field is `@NotBlank String attributeType`)
- `NodeType` has 3 values: `REGULAR`, `CONTEXT`, `ATTRIBUTE` (not just 2 as the `@Schema` example suggests)
