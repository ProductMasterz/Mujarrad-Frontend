# Tasks: Implement EIAN Node Routing and Context-Aware Creation

**Change ID:** `implement-eian-node-routing`
**Created:** 2026-06-06

---

## Overview

Tasks are ordered so that each group unblocks the next. The foundation group (Group A) must land before any call-site fix. No task requires backend changes.

**Legend:**
- `[NEW]` = New file
- `[MOD]` = Modify existing file
- `[TYPE]` = Type system only (zero runtime risk)
- `[SVC]` = Service layer fix
- `[TEST]` = Test-only task

---

## Group A — Foundation (no dependencies; do these first)

- [x] A-01 [NEW] Create `src/lib/routing.ts` exporting `getNodeRoute(spaceSlug, node, options?)`.
  - Import `NodeType` from `@/types/backend-dtos`.
  - If `node.nodeType === NodeType.CONTEXT && node.slug` return `/spaces/${spaceSlug}/context/${node.slug}`.
  - Otherwise build `base = /spaces/${spaceSlug}/node/${node.id}`.
  - If `options?.fromContext` return `${base}?fromContext=${encodeURIComponent(options.fromContext)}`.
  - Otherwise return `base`.
  - Export the function as a named export. No default export.

- [x] A-02 [SVC] Fix `attribute.service.ts` line 62 `deleteAttribute` path.
  - Change `/nodes/${nodeId}/attributes/${attributeId}` to `/attributes/${attributeId}`.
  - Remove `nodeId` from the function signature or mark it `_nodeId` if callers pass it.
  - Ensure `useDeleteAttribute` hook call sites are updated if the signature changes.

- [x] A-03 [SVC] Fix `node.service.ts` line 247 `reorderChildren` request body.
  - Change `{ nodeIds }` to `{ orderedChildIds: nodeIds }`.
  - No other changes to the function signature or hook.

- [x] A-04 [TYPE] Fix `NodeVersion` DTO types in `src/types/backend-dtos.ts` lines 195–205.
  - `id: number` → `id: string`
  - `nodeId: number` → `nodeId: string`
  - `version: number` → `versionNumber: number`
  - `nodeDetails?: Record<string, unknown>` → `nodeDetailsSnapshot?: Record<string, unknown>`
  - `createdBy?: number` → `createdBy?: string`
  - Update any usages of the old field names in the codebase (`rg -n "\.version\b" src/` to find callers of the renamed field).

- [x] A-05 [TYPE] Fix `Node` nullable fields in `src/types/backend-dtos.ts`.
  - `content: string` → `content: string | null` (line 131)
  - `currentVersionId: string` → `currentVersionId: string | null` (line 135)
  - Audit all usages with `rg -n "node\.content" src/` and add null-guards where needed.

- [x] A-06 [TYPE] Fix `AttributeKey` enum in `src/types/backend-dtos.ts` lines 162–169.
  - Remove `TRIGGERS`, `NEXT`, `CALLS` (not in backend schema).
  - Add `PARENT_OF = 'parent_of'` and `RELATES_TO = 'relates_to'`.
  - Check for usages of removed keys and replace with the closest valid key or remove.

- [x] A-07 [TYPE] Fix `canRenderAsPage` in `src/types/node-system.ts` line 116.
  - `canRenderAsPage: nodeType === 'REGULAR'` → `canRenderAsPage: nodeType === 'REGULAR' || nodeType === 'CONTEXT'`

- [x] A-08 [MOD] Add `'context'` to `NavigationScope` union in `src/stores/navigationStore.ts`.
  - Locate the `NavigationScope` type definition and add `| 'context'`.
  - Verify the context layer page calls the appropriate `navigateTo*` action on mount to set scope to `'context'`.

---

## Group B — Context-Aware Creation (depends on A-01)

- [x] B-01 [MOD] Add `contextSlug?: string` to `NewNodeModalProps` in `src/shell/components/NewNodeModal.tsx`.
  - Insert after the last existing prop in the interface (approximately line 56).
  - Destructure `contextSlug` in the component function signature (approximately line 64).

- [x] B-02 [MOD] Branch `createNodeMutation.mutationFn` in `NewNodeModal.tsx` on `contextSlug`.
  - Before the existing `return nodeService.createNode(...)` call (approximately line 145), insert:
    ```typescript
    if (contextSlug && manualSystemNodeType === 'CONTEXT') {
      return nodeService.createNestedContext(spaceSlug, contextSlug, {
        title: formValues.title,
        nodeDetails: formValues.nodeDetails,
      });
    }
    if (contextSlug) {
      return nodeService.createNodeInContext(spaceSlug, contextSlug, {
        title: formValues.title,
        nodeType: manualSystemNodeType as NodeType,
        content: formValues.content,
        nodeDetails: formValues.nodeDetails,
      });
    }
    ```
  - The existing `createNode` call remains as the final fallback (space-root flat creation).

- [x] B-03 [MOD] Fix `createNodeMutation.onSuccess` cache invalidation in `NewNodeModal.tsx`.
  - Add after existing invalidations (approximately line 157):
    ```typescript
    if (contextSlug) {
      queryClient.invalidateQueries({ queryKey: contextNodeKeys.nodes(spaceSlug, contextSlug) });
    }
    queryClient.invalidateQueries({ queryKey: blankKeys.count(spaceSlug) });
    ```
  - Add `import { contextNodeKeys } from '@/hooks/api/useContextNodes'` if not already imported.
  - Add `import { blankKeys } from '@/hooks/api/useBlankNodes'` if not already imported.

- [x] B-04 [MOD] Fix "Create and open" routing in `NewNodeModal.tsx` lines 331–334.
  - Replace `router.push(\`/spaces/${spaceSlug}/node/${node.id}\`)` with:
    `router.push(getNodeRoute(spaceSlug, node, { fromContext: contextSlug }))`
  - Apply the same fix to the `handleDuplicateAction` "merge" case (approximately lines 371–374).
  - Add `import { getNodeRoute } from '@/lib/routing'` at the top of the file.

- [x] B-05 [MOD] Add `contextSlug` to the `useCallback` dependency array of `ensureEntityCreated` in `NewNodeModal.tsx` (approximately line 344).

- [x] B-06 [MOD] Forward `contextSlug` from `SpaceShell` to `<NewNodeModal>` in `src/shell/components/SpaceShell.tsx` line 300.
  - Add `contextSlug={contextSlug}` to the `<NewNodeModal ... />` JSX.
  - Verify `contextSlug` is already in `SpaceShellProps` (line 44) and destructured (line 63). If not, add it.

---

## Group C — Navigation Call-Sites (depends on A-01)

- [x] C-01 [MOD] Fix SpaceShell context menu routing in `src/shell/components/SpaceShell.tsx` lines 121–129.
  - Replace the `openNewTab` case: `window.open(\`/spaces/${spaceSlug}/node/${contextMenuNode.id}\`, '_blank')` with `window.open(getNodeRoute(spaceSlug, contextMenuNode), '_blank')`.
  - Replace the `openAsNode` case route with `router.push(getNodeRoute(spaceSlug, contextMenuNode))`.
  - Add `import { getNodeRoute } from '@/lib/routing'`.

- [x] C-02 [MOD] Fix SpaceShell context menu `openAsLabel` in `src/shell/components/SpaceShell.tsx` line 313.
  - Change static `openAsLabel="Open Node"` to:
    `openAsLabel={contextMenuNode?.nodeType === NodeType.CONTEXT ? 'Open Context' : 'Open Node'}`
  - Import `NodeType` from `@/types/backend-dtos` if not already imported.

- [x] C-03 [MOD] Fix space page `handleSidebarNavigate` in `app/spaces/[slug]/page.tsx` lines 238–243.
  - Replace the handler body with a node-lookup that calls `getNodeRoute`:
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
  - Add `import { getNodeRoute } from '@/lib/routing'`.

- [x] C-04 [MOD] Add `onSidebarNavigate` escape-hatch prop to `SpaceShellProps` in `src/shell/components/SpaceShell.tsx`.
  - Add `onSidebarNavigate?: (path: string[]) => void` to the props interface.
  - In `handleSidebarNavigate` (lines 179–183), if `onSidebarNavigate` is provided call it instead of the internal fallback.
  - Update all `<SpaceShell>` usage sites (context page, blank page) to pass `onSidebarNavigate` using their locally available `nodes` data and `getNodeRoute`.

---

## Group D — Back Navigation and Breadcrumb (depends on A-01)

- [x] D-01 [MOD] Add `useSearchParams` to `app/spaces/[slug]/node/[id]/page.tsx`.
  - Add `import { useSearchParams } from 'next/navigation'`.
  - Add `const searchParams = useSearchParams()` and `const fromContext = searchParams.get('fromContext')` inside the component.
  - Wrap the client component export in a `<Suspense fallback={...}>` boundary at the page level if not already present (required by Next.js App Router for `useSearchParams`).

- [x] D-02 [MOD] Fix `handleBackClick` in the node detail page (approximately line 182).
  - Replace existing implementation with:
    ```typescript
    const handleBackClick = () => {
      if (fromContext) {
        router.push(`/spaces/${slug}/context/${fromContext}`);
      } else {
        router.push(`/spaces/${slug}`);
      }
    };
    ```

- [x] D-03 [MOD] Fix `breadcrumbPath` in the node detail page (approximately lines 114–121).
  - Update the `useMemo` to insert a context crumb between the space crumb and the node crumb when `fromContext` is present:
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
  - Add `fromContext` to the dependency array.

---

## Group E — Context Layer View Enhancements (depends on A-01, B-01)

- [x] E-01 [MOD] Extend `newNodeModalAvailableTypes` in `app/spaces/[slug]/context/[contextSlug]/page.tsx` line 150.
  - Change `newNodeModalAvailableTypes={['node']}` to `newNodeModalAvailableTypes={['node', 'context']}`.
  - Dependency: B-01 and B-02 must be merged first.

- [x] E-02 [MOD] Fix hardcoded query key in context page retry button in `app/spaces/[slug]/context/[contextSlug]/page.tsx` line 235.
  - Replace `queryClient.invalidateQueries({ queryKey: ['context-nodes', spaceSlug, contextSlug] })` with `queryClient.invalidateQueries({ queryKey: contextNodeKeys.nodes(spaceSlug, contextSlug) })`.
  - Ensure `contextNodeKeys` is destructured from the `useContextNodes` import at the top of the file.

- [x] E-03 [MOD] Add "View Context Content" affordance to context layer view in `app/spaces/[slug]/context/[contextSlug]/page.tsx`.
  - Add a query to find the context node's UUID in the space:
    ```typescript
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
  - Render a "View Context Content" button in the page header area (above the search bar) when `contextNode` is defined:
    ```tsx
    {contextNode && (
      <button
        onClick={() =>
          router.push(
            `/spaces/${spaceSlug}/node/${contextNode.id}?fromContext=${encodeURIComponent(contextSlug)}`
          )
        }
        className="text-sm text-muted-foreground hover:text-foreground underline"
      >
        View Context Content
      </button>
    )}
    ```
  - Import `nodeKeys` from `@/hooks/api/useNodes` and `NodeType` from `@/types/backend-dtos`.

---

## Group F — Verification

- [x] F-01 [TEST] Run `tsc --noEmit` and confirm zero type errors introduced by A-04 through A-07.
- [x] F-02 [TEST] Manually verify: create a node from within a context layer — confirm it appears in the context node list, not in Blank.
- [x] F-03 [TEST] Manually verify: click a CONTEXT node card from the space root page — confirm it navigates to the context layer view, not the block editor.
- [x] F-04 [TEST] Manually verify: navigate from a context layer view to a regular node, then click Back — confirm return to the context layer view, not the space root.
- [x] F-05 [TEST] Manually verify: the breadcrumb on a node opened via `?fromContext` shows the context name as a clickable crumb.
- [x] F-06 [TEST] Manually verify: "View Context Content" button appears on the context layer page and navigates to the block-editor view of the context node.
- [x] F-07 [TEST] Manually verify: creating a nested context from within a context layer succeeds (HTTP 201, child context appears in the grid).
- [x] F-08 [TEST] Manually verify: deleting an attribute no longer returns HTTP 404.
- [x] F-09 [TEST] Manually verify: reordering blocks in the block editor no longer returns HTTP 400.
- [x] F-10 [TEST] Run `next build` and confirm zero build errors.
