# Cache Invalidation Flow

**Filename:** `docs/uml/06-cache-invalidation.md`
**Diagram type:** flowchart LR
**Scope:** Complete mutation-to-cache-invalidation mapping. Shows which query keys each mutation invalidates after success, derived from live hook implementations. Bug annotations mark incorrect patterns (per ADR-06 / BUG-08).

---

## Query Key Factories Reference

```mermaid
flowchart TD
    subgraph KEYS["Query Key Factories (canonical — ADR-06)"]
        NK["nodeKeys\nsrc/hooks/api/useNodes.ts\n---\n.all → ['nodes']\n.lists() → ['nodes','list']\n.list(slug,params) → ['nodes','list',slug,params]\n.details() → ['nodes','detail']\n.detail(slug,id) → ['nodes','detail',slug,id]"]
        CNK["contextNodeKeys\nsrc/hooks/api/useContextNodes.ts\n---\n.all → ['context-nodes']\n.nodes(slug,ctx) → ['context-nodes','nodes',slug,ctx]\n.children(slug,ctx) → ['context-nodes','children',slug,ctx]"]
        BK["blankKeys\nsrc/hooks/api/useBlankNodes.ts\n---\n.all → ['blank-nodes']\n.nodes(slug) → ['blank-nodes','nodes',slug]\n.count(slug) → ['blank-nodes','count',slug]"]
        SK["spaceKeys\nsrc/hooks/api/useSpaces.ts\n---\n.all → ['spaces']\n.lists() → ['spaces','list']\n.detail(id) → ['spaces','detail',id]"]
        VK["voidKeys\nsrc/hooks/api/useVoidNodes.ts\n---\n.all → ['void-nodes']\n.detail(id) → ['void-nodes','detail',id]"]
    end
```

---

## Node Mutations — Invalidation Map

```mermaid
flowchart LR
    subgraph MUTATIONS_NODE["Node Mutations"]
        M_CREATE["useCreateNode\nPOST /spaces/{slug}/nodes"]
        M_CREATE_IN_CTX["useCreateNodeInContext\nPOST /spaces/{slug}/contexts/{ctx}/nodes"]
        M_CREATE_NESTED["useCreateNestedContext\nPOST /spaces/{slug}/contexts/{ctx}/contexts"]
        M_UPDATE["useUpdateNode\nPUT /spaces/{slug}/nodes/{id}"]
        M_DELETE["useDeleteNode\nDELETE /spaces/{slug}/nodes/{id}"]
        M_RENAME_NODE["useRenameNode (node)\nPATCH /spaces/{slug}/nodes/{id}"]
        M_MIGRATE["useMigrateNode\nPOST /spaces/{slug}/nodes/{id}/migrate"]
        M_REORDER["useReorderChildren — BROKEN\nPATCH body sends nodeIds not orderedChildIds"]
    end

    subgraph KEYS_NODE["Invalidated Keys"]
        K_NODES_ALL["nodeKeys.all\n['nodes']"]
        K_NODES_LIST["nodeKeys.lists()\n['nodes','list']"]
        K_NODES_DETAIL["nodeKeys.detail(slug,id)\n['nodes','detail',slug,id]"]
        K_CTX_NODES["contextNodeKeys.nodes(slug,ctx)\n['context-nodes','nodes',slug,ctx]"]
        K_CTX_CHILDREN["contextNodeKeys.children(slug,ctx)\n['context-nodes','children',slug,ctx]"]
    end

    M_CREATE -->|invalidates| K_NODES_ALL
    M_CREATE -->|invalidates| K_SPACES_ALL

    M_CREATE_IN_CTX -->|invalidates| K_CTX_NODES
    M_CREATE_IN_CTX -->|invalidates| K_NODES_ALL

    M_CREATE_NESTED -->|invalidates| K_CTX_CHILDREN
    M_CREATE_NESTED -->|invalidates| K_NODES_ALL

    M_UPDATE -->|invalidates| K_NODES_DETAIL
    M_UPDATE -->|invalidates| K_NODES_ALL

    M_DELETE -->|invalidates| K_NODES_ALL

    M_RENAME_NODE -->|invalidates| K_NODES_DETAIL
    M_RENAME_NODE -->|invalidates| K_NODES_LIST

    M_MIGRATE -->|invalidates| K_NODES_ALL

    K_SPACES_ALL["spaceKeys.all\n['spaces']"]

    M_CREATE -->|invalidates| K_SPACES_ALL
```

---

## Blank and Context Assignment Mutations

```mermaid
flowchart LR
    subgraph MUTATIONS_BLANK["Blank / Assignment Mutations"]
        M_ASSIGN["useAssignFromBlank\nPOST /spaces/{slug}/blank/{nodeId}/assign"]
        M_BULK_ASSIGN["useBulkAssignFromBlank\nPOST /spaces/{slug}/blank/assign-bulk"]
        M_REMOVE_CTX["useRemoveFromContext\nDELETE /spaces/{slug}/contexts/{ctx}/nodes/{nodeId}"]
    end

    subgraph KEYS_BLANK["Invalidated Keys"]
        KB_NODES["blankKeys.nodes(slug)\n['blank-nodes','nodes',slug]"]
        KB_COUNT["blankKeys.count(slug)\n['blank-nodes','count',slug]"]
        KN_ALL["nodeKeys.all\n['nodes']"]
        KCN_NODES["contextNodeKeys.nodes(slug,ctx)\n['context-nodes','nodes',slug,ctx]"]
    end

    M_ASSIGN -->|invalidates| KB_NODES
    M_ASSIGN -->|invalidates| KB_COUNT
    M_ASSIGN -->|invalidates| KN_ALL

    M_BULK_ASSIGN -->|invalidates| KB_NODES
    M_BULK_ASSIGN -->|invalidates| KB_COUNT
    M_BULK_ASSIGN -->|invalidates| KN_ALL

    M_REMOVE_CTX -->|invalidates| KCN_NODES
    M_REMOVE_CTX -->|invalidates| KN_ALL
```

---

## Space, Lock, and Void Mutations

```mermaid
flowchart LR
    subgraph MUTATIONS_SPACE["Space Mutations"]
        M_CREATE_SPACE["useCreateSpace\nPOST /spaces"]
        M_UPDATE_SPACE["useUpdateSpace\nPATCH /spaces/{id}"]
        M_DELETE_SPACE["useDeleteSpace\nDELETE /spaces/{id}"]
        M_RENAME_SPACE["useRenameNode (space)\n— same hook, entity='space'"]
    end

    subgraph MUTATIONS_LOCK["Lock Mutations"]
        M_LOCK_NODE["useLockNode\nPATCH /spaces/{slug}/nodes/{id}/lock"]
        M_UNLOCK_NODE["useUnlockNode\nPATCH /spaces/{slug}/nodes/{id}/unlock"]
        M_LOCK_SPACE["useLockSpace\nPATCH /spaces/{id}/lock"]
        M_UNLOCK_SPACE["useUnlockSpace\nPATCH /spaces/{id}/unlock"]
    end

    subgraph MUTATIONS_VOID["Void Mutations"]
        M_CREATE_VOID["useCreateVoidNode\nPOST /void/nodes"]
        M_UPDATE_VOID["useUpdateVoidNode\nPUT /void/nodes/{id}"]
        M_DELETE_VOID["useDeleteVoidNode\nDELETE /void/nodes/{id}"]
        M_ASSIGN_VOID["useAssignVoidToSpace\nPOST /void/nodes/{id}/assign"]
    end

    subgraph KEYS_SPACE["Space Keys"]
        KS_ALL["spaceKeys.all\n['spaces']"]
        KS_LISTS["spaceKeys.lists()\n['spaces','list']"]
        KS_DETAIL["spaceKeys.detail(id)\n['spaces','detail',id]"]
    end

    subgraph KEYS_NODE2["Node Keys"]
        KN2_ALL["nodeKeys.all\n['nodes']"]
    end

    subgraph KEYS_VOID["Void Keys"]
        KV_ALL["voidKeys.all\n['void-nodes']"]
        KV_DETAIL["voidKeys.detail(id)\n['void-nodes','detail',id]"]
    end

    M_CREATE_SPACE -->|"inline ['spaces'] — BUG: should use spaceKeys.all"| KS_ALL
    M_UPDATE_SPACE -->|"inline ['spaces'] — BUG: should use spaceKeys.all"| KS_ALL
    M_DELETE_SPACE -->|"inline ['spaces'] — BUG: should use spaceKeys.all"| KS_ALL
    M_RENAME_SPACE -->|invalidates| KS_ALL
    M_RENAME_SPACE -->|invalidates| KS_LISTS

    M_LOCK_NODE -->|invalidates| KN2_ALL
    M_UNLOCK_NODE -->|invalidates| KN2_ALL
    M_LOCK_SPACE -->|invalidates| KS_ALL
    M_UNLOCK_SPACE -->|invalidates| KS_ALL

    M_CREATE_VOID -->|invalidates| KV_ALL
    M_UPDATE_VOID -->|invalidates| KV_ALL
    M_UPDATE_VOID -->|invalidates| KV_DETAIL
    M_DELETE_VOID -->|invalidates| KV_ALL
    M_ASSIGN_VOID -->|invalidates| KV_ALL
```

---

## Known Bugs in Cache Invalidation (per ADR-06)

```mermaid
flowchart TD
    subgraph BUGS["Cache Invalidation Bugs — Must Fix"]
        BUG1["BUG-08: Context page retry button\napp/spaces/[slug]/context/[contextSlug]/page.tsx line 235\ninvalidates inline key:\n['context-nodes', spaceSlug, contextSlug]\ninstead of: contextNodeKeys.nodes(spaceSlug, contextSlug)\nFix: F-11"]:::bug

        BUG2["BUG (NewNodeModal inline mutation)\nsrc/shell/components/NewNodeModal.tsx lines 145-157\nonSuccess only invalidates nodeKeys.lists()\nMissing: contextNodeKeys.nodes(spaceSlug, contextSlug)\nMissing: blankKeys.count(spaceSlug)\nFix: F-01"]:::bug

        BUG3["BUG (useSpaces mutations)\nsrc/hooks/api/useSpaces.ts lines 50, 62, 78, 105\ninvalidates inline string ['spaces']\ninstead of spaceKeys.all\nMinor — functionally equivalent today but violates ADR-06"]:::warn

        BUG4["CACHE-BUG-01: useRestoreVersion\nWrong invalidation key — out of scope for this change set\nTracked separately"]:::info
    end

    classDef bug fill:#E74C3C,color:#fff,stroke:#B03A2E
    classDef warn fill:#F39C12,color:#fff,stroke:#D68910
    classDef info fill:#3498DB,color:#fff,stroke:#2471A3
```

---

## Complete Mutation-to-Key Matrix

| Mutation Hook | Endpoint | Invalidates |
|---|---|---|
| `useCreateNode` | `POST /spaces/{slug}/nodes` | `nodeKeys.all`, `spaceKeys.all` |
| `useCreateNodeInContext` | `POST /spaces/{slug}/contexts/{ctx}/nodes` | `contextNodeKeys.nodes(slug,ctx)`, `nodeKeys.all` |
| `useCreateNestedContext` | `POST /spaces/{slug}/contexts/{ctx}/contexts` | `contextNodeKeys.children(slug,ctx)`, `nodeKeys.all` |
| `useUpdateNode` | `PUT /spaces/{slug}/nodes/{id}` | `nodeKeys.detail(slug,id)`, `nodeKeys.all` |
| `useDeleteNode` | `DELETE /spaces/{slug}/nodes/{id}` | `nodeKeys.all` |
| `useRenameNode` (node) | `PATCH ...` | `nodeKeys.detail(slug,id)`, `nodeKeys.lists()` |
| `useRenameNode` (space) | `PATCH ...` | `spaceKeys.all`, `spaceKeys.lists()` |
| `useMigrateNode` | `POST /spaces/{slug}/nodes/{id}/migrate` | `nodeKeys.all` |
| `useAssignFromBlank` | `POST /spaces/{slug}/blank/{id}/assign` | `blankKeys.nodes(slug)`, `blankKeys.count(slug)`, `nodeKeys.all` |
| `useBulkAssignFromBlank` | `POST /spaces/{slug}/blank/assign-bulk` | `blankKeys.nodes(slug)`, `blankKeys.count(slug)`, `nodeKeys.all` |
| `useRemoveFromContext` | `DELETE /spaces/{slug}/contexts/{ctx}/nodes/{id}` | `contextNodeKeys.nodes(slug,ctx)`, `nodeKeys.all` |
| `useLockNode` | `PATCH .../lock` | `nodeKeys.all` |
| `useUnlockNode` | `PATCH .../unlock` | `nodeKeys.all` |
| `useLockSpace` | `PATCH /spaces/{id}/lock` | `spaceKeys.all` |
| `useUnlockSpace` | `PATCH /spaces/{id}/unlock` | `spaceKeys.all` |
| `useCreateVoidNode` | `POST /void/nodes` | `voidKeys.all` |
| `useUpdateVoidNode` | `PUT /void/nodes/{id}` | `voidKeys.all`, `voidKeys.detail(id)` |
| `useDeleteVoidNode` | `DELETE /void/nodes/{id}` | `voidKeys.all` |
| `useAssignVoidToSpace` | `POST /void/nodes/{id}/assign` | `voidKeys.all` |
| `NewNodeModal inline mutation` (pre-fix) | `POST /spaces/{slug}/nodes` | `nodeKeys.lists()` only — **MISSING** `contextNodeKeys`, `blankKeys.count` |
| Context page retry button (pre-fix) | N/A — just a re-fetch trigger | inline `['context-nodes', slug, ctx]` — **WRONG KEY** |
