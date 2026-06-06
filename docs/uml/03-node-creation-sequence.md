# API Sequence Diagram — Node Creation Flow

**Filename:** `docs/uml/03-node-creation-sequence.md`
**Diagram type:** sequenceDiagram
**Scope:** All four node creation scenarios — space-level, context-level, nested context, and block child — showing the full call chain from UI through service to backend and back to cache invalidation.

---

## Scenario A: Space-Level Node Creation (Flat / No Context)

```mermaid
sequenceDiagram
    actor User
    participant Modal as NewNodeModal
    participant Mutation as createNodeMutation<br/>(inline mutation)
    participant Service as nodeService
    participant API as Backend API
    participant QC as QueryClient

    User->>Modal: Opens modal (no contextSlug prop)
    User->>Modal: Enters title, selects type, submits
    Modal->>Mutation: mutate({ title, nodeType, content, nodeDetails })
    Note over Mutation: contextSlug is undefined — flat creation path
    Mutation->>Service: nodeService.createNode(spaceSlug, data)
    Service->>API: POST /api/spaces/{spaceSlug}/nodes
    API-->>Service: 201 { Node }
    Service-->>Mutation: Node DTO
    Mutation->>QC: invalidateQueries(nodeKeys.lists())
    Mutation->>QC: invalidateQueries(blankKeys.count(spaceSlug))
    QC-->>Modal: Re-fetch triggers
    Note over Modal: If "Create and open": router.push(getNodeRoute(spaceSlug, node))
    Modal->>User: Closes, new node appears in space grid
```

---

## Scenario B: Context-Level Node Creation (Node inside a Context)

```mermaid
sequenceDiagram
    actor User
    participant CtxPage as Context Layer Page
    participant Shell as SpaceShell
    participant Modal as NewNodeModal
    participant Mutation as createNodeMutation<br/>(inline mutation — patched)
    participant Service as nodeService
    participant API as Backend API
    participant QC as QueryClient

    User->>CtxPage: Clicks "+" in context layer view
    CtxPage->>Shell: contextSlug prop passed
    Shell->>Modal: contextSlug={contextSlug} forwarded (F-02)
    User->>Modal: Enters title, selects REGULAR type, submits
    Modal->>Mutation: mutate({ title, nodeType, content, nodeDetails })
    Note over Mutation: contextSlug present, entityType != CONTEXT<br/>→ takes context creation branch (F-01)
    Mutation->>Service: nodeService.createNodeInContext(spaceSlug, contextSlug, data)
    Service->>API: POST /api/spaces/{spaceSlug}/contexts/{contextSlug}/nodes
    API-->>Service: 201 { Node }
    Service-->>Mutation: Node DTO
    Mutation->>QC: invalidateQueries(contextNodeKeys.nodes(spaceSlug, contextSlug))
    Mutation->>QC: invalidateQueries(nodeKeys.lists())
    Mutation->>QC: invalidateQueries(blankKeys.count(spaceSlug))
    QC-->>CtxPage: Re-fetch context nodes
    Note over Modal: If "Create and open": router.push(getNodeRoute(spaceSlug, node, { fromContext: contextSlug }))
    Modal->>User: Closes, new node appears in context grid
```

---

## Scenario C: Nested Context Creation (Context inside a Context)

```mermaid
sequenceDiagram
    actor User
    participant CtxPage as Context Layer Page
    participant Shell as SpaceShell
    participant Modal as NewNodeModal
    participant Mutation as createNodeMutation<br/>(inline mutation — patched)
    participant Service as nodeService
    participant API as Backend API
    participant QC as QueryClient

    User->>CtxPage: Clicks "+" (type selector shows 'node' and 'context')
    Note over CtxPage: availableTypes=['node','context'] (F-10)
    CtxPage->>Shell: contextSlug prop passed
    Shell->>Modal: contextSlug={contextSlug} forwarded (F-02)
    User->>Modal: Enters title, selects CONTEXT type, submits
    Modal->>Mutation: mutate({ title, nodeType: CONTEXT, nodeDetails })
    Note over Mutation: contextSlug present AND nodeType==CONTEXT<br/>→ takes nested context branch (F-01)
    Mutation->>Service: nodeService.createNestedContext(spaceSlug, contextSlug, data)
    Service->>API: POST /api/spaces/{spaceSlug}/contexts/{contextSlug}/contexts
    API-->>Service: 201 { Node (CONTEXT) }
    Service-->>Mutation: Node DTO (nodeType=CONTEXT, slug set)
    Mutation->>QC: invalidateQueries(contextNodeKeys.nodes(spaceSlug, contextSlug))
    Mutation->>QC: invalidateQueries(nodeKeys.lists())
    Mutation->>QC: invalidateQueries(blankKeys.count(spaceSlug))
    QC-->>CtxPage: Re-fetch child contexts
    Note over Modal: "Create and open": getNodeRoute returns layer view URL<br/>router.push('/spaces/{slug}/context/{newCtxSlug}')
    Modal->>User: Closes, new child context appears in context grid
```

---

## Scenario D: Block Child Node Creation (Block inside a Page Node)

```mermaid
sequenceDiagram
    actor User
    participant BlockEd as BlockEditor Component
    participant Hook as useCreateChildNode<br/>(or inline mutation)
    participant Service as nodeService
    participant API as Backend API
    participant QC as QueryClient

    User->>BlockEd: Presses Enter / adds new block
    BlockEd->>Hook: mutate({ parentNodeId, title, blockType, nodeType: REGULAR })
    Hook->>Service: nodeService.createChildNode(spaceSlug, parentNodeId, data)
    Note over Service: data.nodeDetails = { blockType, showInSpaceList: false }
    Service->>API: POST /api/spaces/{spaceSlug}/nodes/{parentNodeId}/children
    API-->>Service: 201 { Node (REGULAR, parentNodeId set) }
    Service-->>Hook: Node DTO (parentNodeId=parentNodeId, showInSpaceList=false)
    Hook->>QC: invalidateQueries(nodeKeys.children(spaceSlug, parentNodeId))
    QC-->>BlockEd: Re-fetch block list for this page
    Note over BlockEd: Block node NOT shown in space grid<br/>(showInSpaceList=false filtered at data layer — ADR-05)
    BlockEd->>User: New block appears in editor
```

---

## Creation Decision Tree (NewNodeModal — Post Fix F-01)

```mermaid
flowchart TD
    START([User submits NewNodeModal])
    CHECK_CTX{contextSlug\npresent?}
    CHECK_TYPE{entityType\n== 'context'?}
    NESTED[createNestedContext\nPOST /contexts/{ctx}/contexts]
    IN_CTX[createNodeInContext\nPOST /contexts/{ctx}/nodes]
    FLAT[createNode\nPOST /nodes\n@deprecated — lands in Blank]
    INVAL_CTX[Invalidate:\ncontextNodeKeys.nodes\nnodeKeys.lists\nblankKeys.count]
    INVAL_FLAT[Invalidate:\nnodeKeys.lists\nblankKeys.count]
    ROUTE[getNodeRoute\nfor Create-and-open]

    START --> CHECK_CTX
    CHECK_CTX -->|Yes| CHECK_TYPE
    CHECK_CTX -->|No| FLAT
    CHECK_TYPE -->|Yes CONTEXT| NESTED
    CHECK_TYPE -->|No REGULAR| IN_CTX
    NESTED --> INVAL_CTX
    IN_CTX --> INVAL_CTX
    FLAT --> INVAL_FLAT
    INVAL_CTX --> ROUTE
    INVAL_FLAT --> ROUTE
```
