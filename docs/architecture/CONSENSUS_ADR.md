# EIAN Navigation and Context-Aware Creation — Architecture Decision Record

**Document type:** Consensus ADR
**Prepared by:** Integration Lead
**Branch:** `015-api-updates`
**Date:** 2026-06-06
**Status:** Approved for OpenSpec proposal authoring

All claims below are verified against live code. File paths and line numbers are exact.

---

## 1. Agreed Architecture Decisions

---

### ADR-01: The URL is the sole source of truth for navigation context

**Decision:** The origin context of a navigation event is carried in the URL query parameter `?fromContext=[contextSlug]`. No Zustand store, no localStorage, no router state object.

**Rationale (consensus):** The Software Architect, System Designer, and Data Engineer all converged on URL-based referrer tracking. The Zustand store (`navigationStore`) explicitly does not own back-navigation target because it is lost on browser refresh. `useSearchParams()` in Next.js App Router survives hard refresh and direct URL entry, which is required by US-05 AC-05.5. The System Designer proposed `?ctx=` and the Software Architect proposed `?from=context/${slug}`. Decision: use `?fromContext=${contextSlug}` (single, flat param, not a compound path fragment) to avoid URL-encoding issues and make parsing unambiguous.

**Dissenting view:** None. The System Designer noted `?from=context/[cs]` but the Integration Lead resolved it in favor of the flat `?fromContext` form.

**Implementation contract:**
- Navigation from context layer to any node: `router.push(\`/spaces/${spaceSlug}/node/${node.id}?fromContext=${contextSlug}\`)`
- Node detail page reads: `useSearchParams().get('fromContext')`
- Back target when present: `/spaces/${spaceSlug}/context/${fromContext}`
- Back target when absent: `/spaces/${spaceSlug}`

---

### ADR-02: All node-to-URL resolution goes through a single canonical routing function

**Decision:** A file `src/lib/routing.ts` must be created containing `getNodeRoute(spaceSlug, node, options?)`. Every component that produces a navigation URL for a node must call this function. Hardcoded route strings for node navigation outside of this file are a maintenance violation.

**Rationale (consensus):** The Software Architect made this recommendation as Group A (foundational). The QC Engineer confirmed that the bug is present at no fewer than seven distinct call sites (see fix list). The Data Engineer confirmed that query key factories follow the same principle — a single source of truth for key shape. The same principle applied to URLs eliminates the class of bugs described in BUG-03 through BUG-05.

**Dissenting view:** None. However, the Integration Lead notes that `app/spaces/[slug]/page.tsx` lines 295–311 already implement the correct type-aware routing pattern for its own context menu — this is the reference implementation to consolidate into `getNodeRoute`.

**Implementation contract:**
```typescript
// src/lib/routing.ts
import { NodeType } from '@/types/backend-dtos';
import type { Node } from '@/types/backend-dtos';

export function getNodeRoute(
  spaceSlug: string,
  node: Pick<Node, 'id' | 'nodeType' | 'slug'>,
  options?: { fromContext?: string }
): string {
  if (node.nodeType === NodeType.CONTEXT && node.slug) {
    return `/spaces/${spaceSlug}/context/${node.slug}`;
  }
  const base = `/spaces/${spaceSlug}/node/${node.id}`;
  return options?.fromContext ? `${base}?fromContext=${encodeURIComponent(options.fromContext)}` : base;
}
```

---

### ADR-03: NewNodeModal must receive contextSlug and call the correct creation endpoint

**Decision:** `NewNodeModalProps` gains `contextSlug?: string`. When `contextSlug` is present and `entityType === 'node'`, the mutation calls `nodeService.createNodeInContext(spaceSlug, contextSlug, data)`. When `contextSlug` is present and `entityType === 'context'`, the mutation calls `nodeService.createNestedContext(spaceSlug, contextSlug, data)`. When `contextSlug` is absent, existing flat-creation behavior is preserved.

**Rationale (consensus):** All six teams independently identified this as the root cause of the most user-visible failures. The Product Owner documented it as P0 (US-01). The Software Engineer identified the exact mutation at `NewNodeModal.tsx` line 145 that always calls the `@deprecated` `nodeService.createNode`. The Integration Engineer confirmed `useCreateNode` already supports `contextSlug` routing but `NewNodeModal` bypasses it with an inline mutation. The Data Engineer identified the secondary failure: the inline mutation's `onSuccess` handler at line 157 only invalidates `nodeKeys.lists()` — it does not invalidate `contextNodeKeys.nodes(spaceSlug, contextSlug)` or `blankKeys.count(spaceSlug)`.

**Dissenting view:** None. The decision to keep the inline mutation (rather than switching to `useCreateNode`) is intentional — the modal's inline mutation handles the `void` path and duplicate-detection flow; patching the branch condition is the minimal-risk change.

**Implementation contract:** See Fix F-01 and F-02 in Section 4.

---

### ADR-04: CONTEXT nodes have two views; the layer view is primary

**Decision:** For any CONTEXT node with a non-null `slug`, the primary navigation destination is the layer view at `/spaces/${spaceSlug}/context/${node.slug}`. The content/block-editor view at `/spaces/${spaceSlug}/node/${node.id}` is the secondary view, accessible exclusively via the "View Context Content" button on the layer view page or the `?fromContext` back-path.

**Rationale (consensus):** The Product Owner (US-03, US-04), System Designer (section 2), and Software Architect (section 2, section 3) all define this two-view contract identically. The Data Architect confirms CONTEXT nodes have a valid block editor view at `/node/:id` — the content view must not be removed, only deprioritized as secondary. BUG-07 is precisely the missing "View Context Content" affordance.

**Dissenting view:** None. The QA Engineer validated this in INV-03.

---

### ADR-05: Block nodes (REGULAR with parentNodeId set) are excluded at the data transformation layer

**Decision:** The filter `node.parentNodeId != null && node.nodeType === 'REGULAR'` must be applied in the data transformation layer (hook selector or the mapping function) before any listing component renders. It is not applied per-component.

**Rationale:** The Product Owner documented this as US-07. The Data Architect identified that `nodeDetails.showInSpaceList` and `nodeDetails.visibility` are the authoritative backend signals, but the frontend currently derives these per-component inconsistently. The Software Architect recommended a shared filter utility. The QC Engineer identified it as INV-01, INV-02.

**Dissenting view:** The Integration Engineer notes the backend may already filter these from context node listings (`GET /contexts/{contextSlug}/nodes` likely excludes block-level nodes). The frontend filter is therefore defensive, not compensatory. This is acceptable — defensive filtering at the data layer cannot cause regression.

---

### ADR-06: Query key factories are mandatory for all invalidateQueries calls

**Decision:** All calls to `queryClient.invalidateQueries` and `queryClient.setQueryData` must use the factory functions (`nodeKeys.*`, `contextNodeKeys.*`, `spaceKeys.*`, `blankKeys.*`, `voidKeys.*`). Inline string array literals are prohibited for keys that have a factory.

**Rationale:** BUG-08 is the documented instance. The Data Engineer identified seven additional ad-hoc key usages (CACHE-BUG-01 through CACHE-BUG-08). The QC Engineer listed this as Gate 6. The fix is mechanical and zero-risk.

**Dissenting view:** None. The useRestoreVersion wrong-key bug (CACHE-BUG-01) is a separate fix out of scope for this change.

---

### ADR-07: deleteAttribute and reorderChildren must be corrected before any attribute or block feature is considered functional

**Decision:** Two service-layer bugs produce HTTP 4xx on every call and must be fixed:
1. `attribute.service.ts` line 62: `deleteAttribute` path changed from `/nodes/${nodeId}/attributes/${attributeId}` to `/attributes/${attributeId}`.
2. `node.service.ts` line 247: `reorderChildren` body changed from `{ nodeIds }` to `{ orderedChildIds }`.

**Rationale:** The Data Architect identified both. The Integration Engineer confirmed both. The QC Engineer classified them as Critical. The Software Engineer confirmed the reorderChildren bug is in the service at line 247. These are not navigation bugs but they cause silent failures in attribute deletion (all relationship management) and block reordering (all block editor users). They are included in this ADR because the changes are mechanical and zero-risk.

**Dissenting view:** None.

---

### ADR-08: NavigationScope must include 'context' as a valid value

**Decision:** The `NavigationScope` type in `navigationStore.ts` must add `'context'` as a valid value alongside the existing scopes. The context layer view page must call `navigateToContext(spaceSlug, spaceId, contextSlug)` (or equivalent) on mount, setting scope to `'context'`.

**Rationale:** The Software Architect identified this gap. The `newNodeModalAvailableTypes` prop on `SpaceShell` already handles which types the modal shows, but the `scope` value drives the header "+" button's behavior via `resolvedAvailableTypes` in `NewNodeModal.tsx` lines 78–82. Without `'context'` scope, the header "+" button inside a context view resolves to `['node', 'context']` (the else branch at line 81) — this is accidentally correct, but is not semantically bound to the context page. Once `contextSlug` is passed to `NewNodeModal`, the scope value must accurately represent `'context'` to ensure `resolvedAvailableTypes` does not accidentally include `'space'`.

**Dissenting view:** None. This is a low-risk change that prevents a future regression when scope-based type filtering is tightened.

---

## 2. Complete API Contract Table

| Frontend Action | Service Method | Correct Endpoint | Method | Request Body | Gap Status |
|---|---|---|---|---|---|
| Create node (flat, space level) | `nodeService.createNode` | `POST /api/spaces/{spaceSlug}/nodes` | POST | `{ title, nodeType, content, nodeDetails }` | Correct but @deprecated — lands in Blank |
| Create node in context | `nodeService.createNodeInContext` | `POST /api/spaces/{spaceSlug}/contexts/{contextSlug}/nodes` | POST | `{ title, nodeType, content, nodeDetails }` | Correct; not called from NewNodeModal (BUG-01) |
| Create nested context | `nodeService.createNestedContext` | `POST /api/spaces/{spaceSlug}/contexts/{contextSlug}/contexts` | POST | `{ title, nodeDetails }` | Correct; not callable from any modal UI |
| Create block child | `nodeService.createChildNode` | `POST /api/spaces/{spaceSlug}/nodes/{parentNodeId}/children` | POST | `{ title, nodeType: REGULAR, nodeDetails: { blockType, showInSpaceList: false } }` | Correct |
| Get all space nodes | `nodeService.getNodes` | `GET /api/spaces/{spaceSlug}/nodes` | GET | — | Correct; `size: 1000` silently capped to 100 by backend |
| Get single node | `nodeService.getNode` | `GET /api/spaces/{spaceSlug}/nodes/{nodeId}` | GET | — | Correct |
| Update node | `nodeService.updateNode` | `PUT /api/spaces/{spaceSlug}/nodes/{nodeId}` | PUT | `UpdateNodeRequest` | Correct |
| Delete node | `nodeService.deleteNode` | `DELETE /api/spaces/{spaceSlug}/nodes/{nodeId}` | DELETE | — | Correct |
| Get nodes in context | `nodeService.getNodesInContext` | `GET /api/spaces/{spaceSlug}/contexts/{contextSlug}/nodes` | GET | — | Correct |
| Get child contexts | `nodeService.getChildContexts` | `GET /api/spaces/{spaceSlug}/contexts/{contextSlug}/children` | GET | — | Correct |
| Remove node from context | `nodeService.removeFromContext` | `DELETE /api/spaces/{spaceSlug}/contexts/{contextSlug}/nodes/{nodeId}` | DELETE | — | Correct |
| Get child blocks | `nodeService.getChildNodes` | `GET /api/spaces/{spaceSlug}/nodes/{parentNodeId}/children` | GET | — | Correct; not used by BlockEditor (efficiency bug) |
| Reorder child blocks | `nodeService.reorderChildren` | `PATCH /api/spaces/{spaceSlug}/nodes/{parentNodeId}/children/reorder` | PATCH | `{ orderedChildIds: string[] }` | **BROKEN**: service sends `{ nodeIds }` (node.service.ts:247) |
| Migrate node | `nodeService.migrateNode` | `POST /api/spaces/{spaceSlug}/nodes/{nodeId}/migrate` | POST | `MigrateNodeRequest` | Correct |
| Get blank nodes | `nodeService.getBlankNodes` | `GET /api/spaces/{spaceSlug}/blank` | GET | — | Correct |
| Get blank count | `nodeService.getBlankCount` | `GET /api/spaces/{spaceSlug}/blank/count` | GET | — | Correct |
| Assign from blank | `nodeService.assignFromBlank` | `POST /api/spaces/{spaceSlug}/blank/{nodeId}/assign` | POST | `{ contextSlug }` | Correct |
| Bulk assign from blank | `nodeService.bulkAssignFromBlank` | `POST /api/spaces/{spaceSlug}/blank/assign-bulk` | POST | `{ nodeIds, contextSlug }` | Correct |
| Search nodes | `nodeService.searchNodes` | `GET /api/spaces/{spaceSlug}/search` | GET | — | **BROKEN**: endpoint does not exist in backend |
| List spaces | `spaceService.getSpaces` | `GET /api/spaces` | GET | — | Correct |
| Get space by slug | `spaceService.getSpaceBySlug` | `GET /api/spaces/slug/{slug}` | GET | — | Correct |
| Create space | `spaceService.createSpace` | `POST /api/spaces` | POST | `{ name }` | Correct |
| Update space | `spaceService.updateSpace` | `PATCH /api/spaces/{id}` | PATCH | `{ name }` only | **BROKEN**: `useRenameSpace` also sends `projectType` and `mode`, corrupting space type |
| Delete space | `spaceService.deleteSpace` | `DELETE /api/spaces/{id}` | DELETE | — | Correct |
| Get node attributes (outgoing) | `attributeService.getNodeAttributes` | `GET /api/nodes/{nodeId}/attributes` | GET | — | Correct |
| Get node attributes (incoming) | `attributeService.getIncomingAttributes` | `GET /api/nodes/{nodeId}/incoming-attributes` | GET | — | Correct |
| Create attribute | `attributeService.createAttribute` | `POST /api/nodes/{nodeId}/attributes` | POST | `CreateAttributeRequest` | Correct |
| Delete attribute | `attributeService.deleteAttribute` | `DELETE /api/attributes/{attributeId}` | DELETE | — | **BROKEN**: service calls `/nodes/${nodeId}/attributes/${attributeId}` (attribute.service.ts:62) |
| Get space attributes (for graph) | `attributeService.getSpaceAttributes` | No confirmed backend GET endpoint for this path | GET | — | **BROKEN**: `GET /spaces/${spaceId}/attributes` does not exist as GET; only POST (create) exists |
| Lock/unlock node | `lockingService.*` | `PATCH /api/spaces/{spaceSlug}/nodes/{nodeId}/lock|unlock` | PATCH | `LockRequest` | Correct |
| List context types | `contextTypeService.listContextTypes` | `GET /api/spaces/{spaceId}/context-types` | GET | — | Correct (BACKEND spaces only) |
| Create void node | `voidService.createVoidNode` | `POST /api/void/nodes` | POST | `{ title, content, nodeDetails }` | Correct |
| List void nodes | `voidService.listVoidNodes` | `GET /api/void/nodes` | GET | — | Correct |
| Assign void to space | `voidService.assignToSpace` | `POST /api/void/nodes/{nodeId}/assign` | POST | `{ spaceId, contextSlug? }` | Correct |
| Virtual contexts CRUD | `virtualContextService.*` | `GET/POST/DELETE /api/virtual-contexts/*` | various | — | Correct |

---

## 3. Canonical URL and Route Map

| URL Pattern | View Type | Page Component | Data Fetched | Primary Use |
|---|---|---|---|---|
| `/spaces` | Space List | `app/spaces/page.tsx` | `GET /api/spaces` | Browse and create spaces |
| `/void` | Void | `app/void/page.tsx` | `GET /api/void/nodes` | Personal scratch nodes |
| `/spaces/[slug]` | Space Layer (Layer 0) | `app/spaces/[slug]/page.tsx` | `GET /api/spaces/slug/{slug}`, `GET /api/spaces/{slug}/nodes` | Context grid + space-level creation |
| `/spaces/[slug]/context/[contextSlug]` | Context Layer (Layer N) | `app/spaces/[slug]/context/[contextSlug]/page.tsx` | `GET /.../contexts/{ctx}/nodes`, `GET /.../contexts/{ctx}/children` | Child contexts + regular nodes in a context |
| `/spaces/[slug]/node/[id]` | Node Content (no origin) | `app/spaces/[slug]/node/[id]/page.tsx` | `GET /api/spaces/{slug}/nodes/{id}`, `GET /api/nodes/{id}/attributes` | Block editor for REGULAR node; back → space root |
| `/spaces/[slug]/node/[id]?fromContext=[ctx]` | Node Content (from context) | Same as above + `useSearchParams` | Same | Block editor; back → context layer view; breadcrumb has context crumb |
| `/spaces/[slug]/node/[ctxNodeId]?fromContext=[ctx]` | Context Content View | Same node detail page | Same | Block editor for the CONTEXT node's own documentation; back → context layer view |
| `/spaces/[slug]/blank` | Blank | `app/spaces/[slug]/blank/page.tsx` | `GET /api/spaces/{slug}/blank`, `GET /api/spaces/{slug}/blank/count` | Unorganized nodes |
| `/spaces/[slug]/whiteboard` | Whiteboard | `app/spaces/[slug]/whiteboard/page.tsx` | whiteboard-specific | Canvas editing |
| `/spaces/[slug]/graph` | Graph | `app/spaces/[slug]/graph/page.tsx` | `GET /api/nodes/{id}/attributes` | Graph visualization |

**Routing rule (canonical function):** Every navigation to a node must call `getNodeRoute(spaceSlug, node, { fromContext? })` from `src/lib/routing.ts`. The function returns the layer view URL for CONTEXT nodes and the content view URL for REGULAR nodes.

**Breadcrumb levels by route:**

| Route | Breadcrumb |
|---|---|
| `/spaces` | Spaces |
| `/spaces/[slug]` | Spaces > Space Name |
| `/spaces/[slug]/context/[ctx]` | Spaces > Space Name > Context Name |
| `/spaces/[slug]/node/[id]` (no fromContext) | Spaces > Space Name > Node Title |
| `/spaces/[slug]/node/[id]?fromContext=[ctx]` | Spaces > Space Name > Context Name (clickable) > Node Title |

---

## 4. Ordered Fix List

Each fix is scoped to the minimal change. Bugs are ordered so that no fix depends on an unfixed predecessor.

---

### P0 Fixes

**F-01 — Add `contextSlug` prop to `NewNodeModal` and branch creation logic**
- File: `src/shell/components/NewNodeModal.tsx`
- Changes:
  1. Add `contextSlug?: string` to `NewNodeModalProps` (after line 56).
  2. Destructure `contextSlug` in the function signature (after line 64).
  3. In `createNodeMutation.mutationFn` (lines 124–154), add a branch before the existing `return nodeService.createNode(...)` call:
     ```typescript
     if (contextSlug && manualSystemNodeType === 'CONTEXT') {
       return nodeService.createNestedContext(spaceSlug, contextSlug, { title: ..., nodeDetails: ... });
     }
     if (contextSlug) {
       return nodeService.createNodeInContext(spaceSlug, contextSlug, { title: ..., nodeType: ..., content: ..., nodeDetails: ... });
     }
     ```
  4. In `createNodeMutation.onSuccess`, add:
     ```typescript
     if (contextSlug) {
       queryClient.invalidateQueries({ queryKey: contextNodeKeys.nodes(spaceSlug, contextSlug) });
     }
     queryClient.invalidateQueries({ queryKey: blankKeys.count(spaceSlug) });
     ```
     Import `contextNodeKeys` from `@/hooks/api/useContextNodes` and `blankKeys` from `@/hooks/api/useBlankNodes`.
  5. Add `contextSlug` to the `useCallback` dependency array of `ensureEntityCreated` (line 344).
- Why all teams agree: BUG-01 confirmed at lines 51–57 and line 145. The inline mutation bypasses the correct `useCreateNodeInContext` hook entirely.

**F-02 — Forward `contextSlug` from SpaceShell to NewNodeModal**
- File: `src/shell/components/SpaceShell.tsx`
- Change: Line 300 — add `contextSlug={contextSlug}` to the `<NewNodeModal>` JSX.
- Why all teams agree: BUG-02 confirmed at lines 297–303. `contextSlug` is received (line 44, line 63) but not forwarded. F-01 has zero effect without F-02.

**F-03 — Create `src/lib/routing.ts` with canonical `getNodeRoute` function**
- File: `src/lib/routing.ts` (new file)
- Content: The function specified in ADR-02. Import `NodeType` from `@/types/backend-dtos`.
- Why all teams agree: Software Architect Group A. Unblocks F-04, F-05, F-06.

**F-04 — Replace "Create and open" routing in NewNodeModal to use getNodeRoute**
- File: `src/shell/components/NewNodeModal.tsx` lines 331–334
- Change:
  ```typescript
  // Replace:
  router.push(`/spaces/${spaceSlug}/node/${node.id}`);
  // With:
  import { getNodeRoute } from '@/lib/routing';
  router.push(getNodeRoute(spaceSlug, node, { fromContext: contextSlug }));
  ```
- Also fix `handleDuplicateAction` "merge" case at lines 371–374 with the same routing function.
- Why all teams agree: BUG-03 confirmed at line 332. `node.nodeType` is available on the returned DTO but ignored.

**F-05 — Fix SpaceShell context menu routing and label**
- File: `src/shell/components/SpaceShell.tsx`
- Changes:
  1. Lines 121–129 — replace hardcoded `/node/${contextMenuNode.id}` in both `openNewTab` and `openAsNode` cases with `getNodeRoute(spaceSlug, contextMenuNode)` and `getNodeRoute(spaceSlug, contextMenuNode)` respectively. For `openNewTab`, use `window.open(getNodeRoute(...), '_blank')`.
  2. Line 313 — change `openAsLabel="Open Node"` to:
     ```tsx
     openAsLabel={contextMenuNode?.nodeType === NodeType.CONTEXT ? 'Open Context' : 'Open Node'}
     ```
  3. Import `getNodeRoute` from `@/lib/routing`.
- Why all teams agree: BUG-04 confirmed at lines 122–129 and line 313. The reference implementation is at `app/spaces/[slug]/page.tsx` lines 295–311 — that code is correct and is the model.

**F-06 — Fix space page sidebar navigation**
- File: `app/spaces/[slug]/page.tsx` lines 238–243
- Change: Replace the handler with a node-lookup-based branch:
  ```typescript
  const handleSidebarNavigate = (path: string[]) => {
    if (path.length > 0) {
      const nodeId = path[path.length - 1];
      const node = nodes?.find((n) => n.id === nodeId);
      if (node) {
        router.push(getNodeRoute(slug, node));
      } else {
        router.push(`/spaces/${slug}/node/${nodeId}`);
      }
    }
  };
  ```
  Import `getNodeRoute` from `@/lib/routing`.
- Why all teams agree: BUG-05 confirmed at line 241. `nodes` is already in scope (line 130). The `nodeToCard` mapping (lines 56–71) loses `slug` — this fix avoids that by looking up the original node.

**F-07 — Fix SpaceShell sidebar navigation**
- File: `src/shell/components/SpaceShell.tsx` lines 179–183
- Change: `SpaceShell.handleSidebarNavigate` routes by ID only. The minimal fix is to look up the `sidebarItems` for the item's optional `slug` field. However `Card` has no `slug` field currently. The practical fix: pass the full node list as an additional prop or accept an `onSidebarNavigate` callback from the caller.
- Recommended approach: Add `onSidebarNavigate?: (path: string[]) => void` to `SpaceShellProps`. When provided, the shell delegates navigation to the caller. When absent, the shell uses its current fallback to `/node/${nodeId}`. All callers that need correct routing (context page, blank page) provide the callback using their locally available `nodes` data.
- Why all teams agree: BUG-05 affects this location too. The Software Engineer identified both locations (SpaceShell line 182 and space page line 241). The context layer page has no `nodes` array available in `SpaceShell` without either a prop change or a new query.

---

### P1 Fixes

**F-08 — Fix node detail page Back button and breadcrumb**
- File: `app/spaces/[slug]/node/[id]/page.tsx`
- Changes:
  1. Add `import { useSearchParams } from 'next/navigation'` and `const searchParams = useSearchParams()` and `const fromContext = searchParams.get('fromContext')`.
  2. Wrap the component content in a `<Suspense>` boundary if not already present (required by Next.js App Router for `useSearchParams`).
  3. Replace `handleBackClick` (line 182):
     ```typescript
     const handleBackClick = () => {
       if (fromContext) {
         router.push(`/spaces/${slug}/context/${fromContext}`);
       } else {
         router.push(`/spaces/${slug}`);
       }
     };
     ```
  4. Replace `breadcrumbPath` (lines 114–121):
     ```typescript
     const breadcrumbPath = useMemo(() => {
       const base = [
         { id: 'home', title: 'Home' },
         { id: 'spaces', title: 'Spaces' },
         { id: space?.id || slug, title: space?.name || slug },
       ];
       if (fromContext) {
         base.push({
           id: fromContext,
           title: fromContext.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
         });
       }
       base.push({ id: node?.id || nodeId, title: node?.title || 'Node' });
       return base;
     }, [space, node, slug, nodeId, fromContext]);
     ```
- Why all teams agree: BUG-06 confirmed at line 183 and lines 114–121. All teams referenced this fix.

**F-09 — Add "View Context Content" affordance to context layer view**
- File: `app/spaces/[slug]/context/[contextSlug]/page.tsx`
- Changes:
  1. Add a query to resolve the context node's own UUID. Since the context page already has access to `useSpace`, add:
     ```typescript
     import { useNodes } from '@/hooks/api/useNodes'; // or inline useQuery
     const { data: allSpaceNodes = [] } = useQuery({
       queryKey: nodeKeys.list(spaceSlug, { page: 0, size: 100 }),
       queryFn: () => nodeService.getNodes(spaceSlug),
       enabled: !!spaceSlug,
     });
     const contextNode = useMemo(
       () => allSpaceNodes.find((n) => n.slug === contextSlug && n.nodeType === NodeType.CONTEXT),
       [allSpaceNodes, contextSlug]
     );
     ```
  2. Render a button in the page header area (above the search bar):
     ```tsx
     {contextNode && (
       <button
         onClick={() => router.push(`/spaces/${spaceSlug}/node/${contextNode.id}?fromContext=${contextSlug}`)}
         className="..."
       >
         View Context Content
       </button>
     )}
     ```
- Why all teams agree: BUG-07 confirmed by reading the entire context page — no such affordance exists. All teams identified this gap.

**F-10 — Allow nested context creation from the context layer view**
- File: `app/spaces/[slug]/context/[contextSlug]/page.tsx` line 150
- Change: `newNodeModalAvailableTypes={['node']}` → `newNodeModalAvailableTypes={['node', 'context']}`
- Dependency: F-01 must be merged first so the modal knows how to route `context` creation through `createNestedContext`.
- Why all teams agree: System Designer section 4. The current setting silently prevents nested context creation even though `useCreateNestedContext` is implemented and correct.

---

### P2 Fixes

**F-11 — Fix BUG-08: replace hardcoded query key in context page retry button**
- File: `app/spaces/[slug]/context/[contextSlug]/page.tsx` line 235
- Change:
  ```typescript
  // From:
  queryClient.invalidateQueries({ queryKey: ['context-nodes', spaceSlug, contextSlug] })
  // To:
  queryClient.invalidateQueries({ queryKey: contextNodeKeys.nodes(spaceSlug, contextSlug) })
  ```
  `contextNodeKeys` is already imported at line 8 via `useContextNodes` — add it to the destructure.
- Why all teams agree: BUG-08 confirmed at line 235. Zero-risk mechanical change.

**F-12 — Fix deleteAttribute endpoint path**
- File: `src/services/api/attribute.service.ts` lines 57–64
- Change: Replace `/nodes/${nodeId}/attributes/${attributeId}` with `/attributes/${attributeId}`. Remove `nodeId` parameter from the function signature or make it unused.
- Why all teams agree: Data Architect BUG-B, Integration Engineer P0 gap, QC Engineer Critical finding. Every relationship delete in the app returns 404.

**F-13 — Fix reorderChildren request body field name**
- File: `src/services/api/node.service.ts` line 247
- Change: `{ nodeIds }` → `{ orderedChildIds: nodeIds }`
- Why all teams agree: Data Architect BUG-A, Integration Engineer P0 gap. Every block reorder in the block editor returns 400.

**F-14 — Fix NodeVersion DTO types**
- File: `src/types/backend-dtos.ts` lines 195–205
- Changes:
  - `id: number` → `id: string`
  - `nodeId: number` → `nodeId: string`
  - `version: number` → `versionNumber: number`
  - `nodeDetails?: Record<string, unknown>` → `nodeDetailsSnapshot?: Record<string, unknown>`
  - `createdBy?: number` → `createdBy?: string`
- Why all teams agree: Data Architect, Integration Engineer, QC Engineer all independently identified these as Critical type mismatches.

**F-15 — Fix Node nullable field types**
- File: `src/types/backend-dtos.ts` lines 131, 135
- Changes:
  - `content: string` → `content: string | null`
  - `currentVersionId: string` → `currentVersionId: string | null`
- Why all teams agree: Integration Engineer section 5, QC Engineer P3. Backend returns null for these fields; the frontend type contract is incorrect.

**F-16 — Fix AttributeKey enum**
- File: `src/types/backend-dtos.ts` lines 162–169
- Changes: Remove `TRIGGERS`, `NEXT`, `CALLS` (not in backend). Add `PARENT_OF = 'parent_of'` and `RELATES_TO = 'relates_to'`.
- Why all teams agree: Data Architect, Integration Engineer, QC Engineer all confirmed. These phantom values will cause backend rejections if used in attribute creation.

**F-17 — Fix canRenderAsPage to include CONTEXT nodes**
- File: `src/types/node-system.ts` line 116
- Change: `canRenderAsPage: nodeType === 'REGULAR'` → `canRenderAsPage: nodeType === 'REGULAR' || nodeType === 'CONTEXT'`
- Why all teams agree: Software Engineer BUG-09. A CONTEXT node opened in its block-editor view must be recognized as having a page editor representation.

---

## 5. OpenSpec Change IDs to Create

Each ID follows the `verb-noun-noun` kebab-case convention.

| Change ID | Scope | Addresses |
|---|---|---|
| `fix-context-aware-node-creation` | `NewNodeModal` prop, `SpaceShell` forwarding, `createNodeMutation` branch, cache invalidation | F-01, F-02, BUG-01, BUG-02 |
| `fix-nodetype-aware-routing` | `getNodeRoute` utility, all navigation call sites | F-03, F-04, F-05, F-06, F-07, BUG-03, BUG-04, BUG-05 |
| `fix-context-navigation-backpath` | Node detail page `?fromContext` param, breadcrumb, Back button | F-08, BUG-06 |
| `add-context-content-view-affordance` | "View Context Content" button on context layer page, `canRenderAsPage` fix | F-09, F-17, BUG-07 |
| `fix-query-key-discipline` | Retry button, all `invalidateQueries` with inline keys | F-11, BUG-08 |
| `fix-attribute-service-endpoints` | `deleteAttribute` path, `reorderChildren` body, `getSpaceAttributes` (remove or fix) | F-12, F-13 |
| `fix-backend-dto-types` | `NodeVersion` types, `Node` nullable fields, `AttributeKey` enum | F-14, F-15, F-16 |
| `enable-nested-context-creation` | Context page `availableTypes` to include `'context'` | F-10 |

---

## 6. Mermaid Diagrams to Create

Each diagram should be committed as a `.mmd` file under `/docs/diagrams/` alongside its OpenSpec proposal.

| Filename | Type | Content summary |
|---|---|---|
| `eian-url-structure.mmd` | flowchart TD | All URL routes and their navigational relationships; nodes color-coded by layer (space/context/node/block) |
| `node-creation-flow.mmd` | flowchart TD | Complete NewNodeModal decision tree: contextSlug present/absent × entityType × void/space |
| `context-dual-view.mmd` | stateDiagram-v2 | CONTEXT node two-view state machine: Layer View ↔ Content View transitions |
| `cache-invalidation-matrix.mmd` | flowchart LR | Mutation → invalidated query keys mapping for all create/update/delete operations |
| `eian-entity-relationship.mmd` | erDiagram | Full ER diagram as provided by Data Architect (already complete — copy verbatim) |
| `navigation-routing-function.mmd` | flowchart TD | `getNodeRoute` decision tree: CONTEXT+slug → layer view; REGULAR → node view; ?fromContext passthrough |

---

## 7. What NOT to Change

The following are explicitly in scope to preserve. No fix should touch these.

**Already correct — reference implementations:**
- `app/spaces/[slug]/page.tsx` lines 294–311: The space root context menu correctly branches on `node.nodeType === NodeType.CONTEXT` for both `openNewTab` and `openAsNode`. This is the exact pattern to replicate in SpaceShell's context menu handler.
- `app/spaces/[slug]/context/[contextSlug]/page.tsx` line 211: Child context cards correctly route to `/spaces/${spaceSlug}/context/${ctx.slug}`. Do not modify this.
- `src/hooks/api/useContextNodes.ts`: `contextNodeKeys` factory, `useContextNodes`, `useChildContexts`, `useCreateNodeInContext`, `useRemoveFromContext`, `useCreateNestedContext` — all correctly implemented. The issue is that they are not called from `NewNodeModal`.
- `src/hooks/api/useCreateNode.ts`: Already correctly branches on `contextSlug` at lines 25–28. Not used by `NewNodeModal` but correct.
- `src/services/api/node.service.ts`: All methods except `createNode` (deprecated), `reorderChildren` (wrong field), and `searchNodes` (non-existent endpoint) are correct.
- `src/types/backend-dtos.ts` `Node` interface lines 120–156: `id`, `spaceId`, `nodeType`, `title`, `slug`, `nodeDetails`, `lockLevel`, `effectiveLockLevel`, `lockInherited`, `lockSource`, `parentNodeId`, `createdBy`, `modifiedBy`, `createdAt`, `updatedAt` — all correctly typed. Only `content` (line 131) and `currentVersionId` (line 135) need nullability fixes.

**Out of scope for this change set:**
- Backend API — all fixes are frontend-only.
- Optimistic updates — owned by `add-optimistic-updates` OpenSpec change.
- Space creation dialog — owned by `add-space-creation-dialog` OpenSpec change.
- Assign-to-context from The Blank — owned by `add-unified-entity-creation` OpenSpec change.
- Graph view routing corrections — not in current bug inventory; graph view has deeper issues (`getSpaceAttributes` endpoint gap) that require a separate proposal.
- Deep ancestor breadcrumbs (more than one level) — requires `GET /ancestors` traversal; follow-on story.
- `useRestoreVersion` wrong invalidation key (CACHE-BUG-01) — version restore is a separate feature surface; tracked separately.
- `useRenameSpace` side-effect mutation (sends `projectType` + `mode`) — data-corrupting but not related to EIAN navigation; requires its own targeted fix tracked as a separate item.
- Pagination infrastructure (`extractPage` discards metadata, `size: 1000` hack) — architectural change requiring service layer refactor; tracked separately.
- `searchNodes` non-existent endpoint — remove or stub the feature; tracked separately with backend team.
- `getSpaceAttributes` wrong endpoint — graph page loads zero attributes currently; tracked in graph-specific work.
- `useNodeDependencies` fetching outside React Query — efficiency fix; tracked separately.