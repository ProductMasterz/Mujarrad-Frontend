# Change: Implement EIAN Node Routing and Context-Aware Creation

**Change ID:** `implement-eian-node-routing`
**Status:** Implemented
**Created:** 2026-06-06
**Author:** Claude (Integration Lead)

---

## Why

The frontend has accumulated eight categories of interconnected routing and creation bugs that together make the EIAN (Entity-In-A-Node) navigation model non-functional. The most user-visible failure is that creating a node while inside a context layer always creates a flat, unassigned (Blank) node — `NewNodeModal` hardcodes a call to the deprecated `nodeService.createNode` and never invokes `createNodeInContext` or `createNestedContext`, regardless of the current context. Navigation is equally broken: every component that produces a URL for a node constructs the string inline, which means CONTEXT nodes are routed to their block-editor view instead of their layer view, losing the entire context hierarchy on click. Back navigation from the node detail page ignores where the user came from. Seven service-layer and type-system bugs compound these failures by silently returning HTTP 4xx on every attribute deletion, block reorder, and NodeVersion read.

This change delivers a single, coordinated fix across all affected surfaces: a canonical routing function, a context-aware creation branch in `NewNodeModal`, URL-based referrer tracking via `?fromContext`, corrected service endpoints, and accurate DTO types. All fixes are frontend-only and non-breaking to the backend API.

---

## What Changes

### Foundation (must land first)
- **NEW** `src/lib/routing.ts` — exports `getNodeRoute(spaceSlug, node, options?)`, the single source of truth for producing any node navigation URL. CONTEXT nodes with a slug route to the layer view; REGULAR nodes route to the content view. An optional `fromContext` parameter appends `?fromContext=<slug>`.
- **MODIFIED** `src/types/backend-dtos.ts` — fixes `NodeVersion` field types (`id`, `nodeId`, `version`/`versionNumber`, `nodeDetailsSnapshot`, `createdBy`), adds nullability to `Node.content` and `Node.currentVersionId`, removes phantom `AttributeKey` values (`TRIGGERS`, `NEXT`, `CALLS`) and adds correct values (`PARENT_OF`, `RELATES_TO`), and extends `canRenderAsPage` to include CONTEXT nodes.
- **MODIFIED** `src/services/api/attribute.service.ts` line 62 — `deleteAttribute` path corrected from `/nodes/${nodeId}/attributes/${attributeId}` to `/attributes/${attributeId}`.
- **MODIFIED** `src/services/api/node.service.ts` line 247 — `reorderChildren` body field corrected from `{ nodeIds }` to `{ orderedChildIds: nodeIds }`.

### Context-Aware Creation
- **MODIFIED** `src/shell/components/NewNodeModal.tsx` — adds `contextSlug?: string` prop; when present, branches `createNodeMutation.mutationFn` to call `createNodeInContext` (regular nodes) or `createNestedContext` (context nodes) instead of the deprecated `createNode`; `onSuccess` invalidates `contextNodeKeys.nodes(spaceSlug, contextSlug)` and `blankKeys.count(spaceSlug)`; "Create and open" routing uses `getNodeRoute`.
- **MODIFIED** `src/shell/components/SpaceShell.tsx` — forwards `contextSlug` to `<NewNodeModal>`; replaces inline URL strings in context menu handlers with `getNodeRoute`; corrects `openAsLabel` to be type-aware; adds `onSidebarNavigate` escape-hatch prop.
- **MODIFIED** `src/stores/navigationStore.ts` — adds `'context'` to the `NavigationScope` union type.

### Routing Call-Sites
- **MODIFIED** `app/spaces/[slug]/page.tsx` — `handleSidebarNavigate` looks up the full node object before routing, then delegates to `getNodeRoute`.
- **MODIFIED** `app/spaces/[slug]/context/[contextSlug]/page.tsx` — `newNodeModalAvailableTypes` extended to include `'context'`; retry button uses `contextNodeKeys` factory instead of an inline string array; adds "View Context Content" button linking to the context node's block-editor view with `?fromContext` param appended.

### Back Navigation and Breadcrumb
- **MODIFIED** `app/spaces/[slug]/node/[id]/page.tsx` — reads `useSearchParams().get('fromContext')`; `handleBackClick` routes to the context layer view when the param is present; `breadcrumbPath` inserts a clickable context crumb between the space crumb and the node title crumb.

### Type-System Corrections
- **MODIFIED** `src/types/node-system.ts` line 116 — `canRenderAsPage` extended to include `nodeType === 'CONTEXT'`.

---

## Impact

- **Affected specs:** `node-routing` (new), `node-creation` (modified), `navigation` (new)
- **Affected code (primary):**
  - `src/lib/routing.ts` (new file)
  - `src/shell/components/NewNodeModal.tsx`
  - `src/shell/components/SpaceShell.tsx`
  - `app/spaces/[slug]/page.tsx`
  - `app/spaces/[slug]/context/[contextSlug]/page.tsx`
  - `app/spaces/[slug]/node/[id]/page.tsx`
  - `src/stores/navigationStore.ts`
  - `src/services/api/attribute.service.ts`
  - `src/services/api/node.service.ts`
  - `src/types/backend-dtos.ts`
  - `src/types/node-system.ts`
- **Breaking changes:** None. All changes are additive props or internal routing corrections. The deprecated `nodeService.createNode` remains but is only called when `contextSlug` is absent (preserving the flat-creation path for space-root use).
- **Dependencies on other changes:** None. This change is independent of `add-unified-entity-creation` and `add-space-creation-dialog`. The `contextSlug` prop added to `NewNodeModal` is additive and does not conflict with the `defaultType` prop proposed by `add-unified-entity-creation`.
- **Out of scope:** Optimistic updates, pagination infrastructure, graph view routing corrections, `searchNodes` non-existent endpoint, `getSpaceAttributes` wrong endpoint, `useRestoreVersion` wrong invalidation key, `useRenameSpace` side-effect mutation.

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| `getNodeRoute` missing a node type produces a broken URL | Function has an explicit fallback to `/spaces/${spaceSlug}/node/${node.id}` for unknown types |
| `useSearchParams` in App Router requires Suspense boundary | Fix F-08 explicitly wraps the node detail page client component in `<Suspense>` |
| `contextNodeKeys` not exported from `useContextNodes` | Import path is `@/hooks/api/useContextNodes`; key factory is already exported at line 8 |
| `NewNodeModal` inline mutation dep array stale closure | `contextSlug` is added to the `useCallback` dep array for `ensureEntityCreated` (line 344) |
| CONTEXT node has no `slug` (newly created, slug generation pending) | `getNodeRoute` falls back to `/node/${node.id}` when `node.slug` is null or undefined |

---

## Approval

- [x] Product Owner
- [x] Tech Lead
- [x] Design Lead
