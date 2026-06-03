## Context

Mujarrad's data model treats everything as nodes (`nodeType: REGULAR | CONTEXT | ATTRIBUTE`). Contexts are nodes that act as logical containers for other nodes via `CONTAINS` attributes. Currently, containment is single-parent and tree-shaped. This change introduces multi-parent containment (superposition) and bidirectional context relationships, alongside schema visibility in context pages for backend-type spaces.

## Goals / Non-Goals

- Goals:
  - Allow nodes to belong to multiple contexts and multiple parent nodes simultaneously
  - Allow contexts to contain other contexts, including bidirectional containment (A contains B, B contains A)
  - Display `ContextType.attributeSchema` as visual field items on context pages in BACKEND spaces
  - Schema locking via space mode (PRODUCTION locks schemas, CONFIGURATION unlocks)
  - Replace "Move To" with "Make a Child Of" in context menus

- Non-Goals:
  - Changing the backend database schema (use existing `Attribute` relationship model)
  - Creating new node types or entity tables
  - Implementing schema validation/enforcement on child nodes (future work)
  - Full graph cycle detection — circular containment between contexts is intentional

## Entity Relationship Model

### Node Types (all in one `nodes` table)

```mermaid
erDiagram
    NODE {
        uuid id PK
        string spaceId FK
        enum nodeType "REGULAR | CONTEXT | ATTRIBUTE"
        string title
        string content
        json nodeDetails
        string lockLevel "UNLOCKED | CONTENT_LOCKED | FULLY_LOCKED"
        string parentNodeId FK "block parent (page children)"
    }

    CONTEXT_TYPE {
        uuid id PK
        string spaceId FK
        string name
        string slug
        json attributeSchema "Record of FieldSchema"
        json schemaRelationships
        bool isBuiltin
    }

    ATTRIBUTE {
        uuid id PK
        string spaceId FK
        string sourceNodeId FK
        string targetNodeId FK
        enum attributeKey "contains | depends_on | references | ..."
    }

    SPACE {
        uuid id PK
        string name
        enum projectType "CONSUMER | BACKEND"
    }

    SPACE ||--o{ NODE : "contains"
    SPACE ||--o{ CONTEXT_TYPE : "defines"
    NODE ||--o{ NODE : "parentNodeId (blocks)"
    NODE ||--o{ ATTRIBUTE : "sourceNodeId"
    ATTRIBUTE }o--|| NODE : "targetNodeId"
```

### Containment Relationships (Superposition)

```mermaid
graph TD
    subgraph "Space (BACKEND)"
        CTX_A["Context A<br/>(nodeType: CONTEXT)"]
        CTX_B["Context B<br/>(nodeType: CONTEXT)"]
        CTX_C["Context C<br/>(nodeType: CONTEXT)"]
        NODE_1["Node 1<br/>(nodeType: REGULAR)"]
        NODE_2["Node 2<br/>(nodeType: REGULAR)"]
        NODE_3["Node 3<br/>(nodeType: REGULAR)"]
    end

    CTX_A -- "CONTAINS" --> CTX_B
    CTX_B -- "CONTAINS" --> CTX_A
    CTX_A -- "CONTAINS" --> NODE_1
    CTX_A -- "CONTAINS" --> NODE_2
    CTX_B -- "CONTAINS" --> NODE_1
    CTX_B -- "CONTAINS" --> NODE_3
    CTX_C -- "CONTAINS" --> CTX_A

    style CTX_A fill:#4a9eff,color:#fff
    style CTX_B fill:#4a9eff,color:#fff
    style CTX_C fill:#4a9eff,color:#fff
    style NODE_1 fill:#66bb6a,color:#fff
    style NODE_2 fill:#66bb6a,color:#fff
    style NODE_3 fill:#66bb6a,color:#fff
```

**Key observations from the diagram above:**
- Node 1 is contained by both Context A and Context B (multi-parent)
- Context A contains Context B, AND Context B contains Context A (bidirectional)
- Context C contains Context A (one-directional)
- All relationships use the existing `Attribute` entity with `attributeKey: 'contains'`

### Bidirectional Context Containment (Superposition Detail)

```mermaid
graph LR
    subgraph "Bidirectional Containment"
        A["Context A"]
        B["Context B"]
    end

    A -- "CONTAINS (Attribute 1)<br/>A is parent of B" --> B
    B -- "CONTAINS (Attribute 2)<br/>B is parent of A" --> A

    style A fill:#4a9eff,color:#fff
    style B fill:#4a9eff,color:#fff
```

This creates **two separate `Attribute` rows** in the database:
1. `{ sourceNodeId: A, targetNodeId: B, attributeKey: 'contains' }`
2. `{ sourceNodeId: B, targetNodeId: A, attributeKey: 'contains' }`

Each is an independent relationship. There is no hierarchy tree — it's a directed graph.

### What the User Sees

```mermaid
graph TD
    subgraph "Viewing Context A"
        A_VIEW["Context A (Page)"]
        A_CHILD_B["Context B (as child)"]
        A_CHILD_N1["Node 1 (as child)"]
        A_CHILD_N2["Node 2 (as child)"]
    end

    subgraph "Viewing Context B"
        B_VIEW["Context B (Page)"]
        B_CHILD_A["Context A (as child)"]
        B_CHILD_N1["Node 1 (as child)"]
        B_CHILD_N3["Node 3 (as child)"]
    end

    subgraph "Flat Space View"
        FLAT_A["Context A"]
        FLAT_B["Context B"]
        FLAT_C["Context C"]
    end

    style A_VIEW fill:#4a9eff,color:#fff
    style B_VIEW fill:#4a9eff,color:#fff
    style A_CHILD_B fill:#4a9eff,color:#fff,stroke-dasharray: 5 5
    style B_CHILD_A fill:#4a9eff,color:#fff,stroke-dasharray: 5 5
```

- Context B appears in the flat space view AND inside Context A's view
- Context A appears in the flat space view AND inside Context B's view
- Node 1 appears inside both Context A and Context B views

### Containment Rules Summary

```mermaid
graph TD
    subgraph "Allowed Relationships"
        C1["Context"] -- "CONTAINS" --> C2["Context"]
        C3["Context"] -- "CONTAINS" --> N1["Node"]
        N2["Node"] -- "CONTAINS" --> N3["Node"]
    end

    subgraph "NOT Allowed"
        N4["Node"] -. "CONTAINS" .-> C4["Context"]
    end

    style C1 fill:#4a9eff,color:#fff
    style C2 fill:#4a9eff,color:#fff
    style C3 fill:#4a9eff,color:#fff
    style C4 fill:#4a9eff,color:#fff
    style N1 fill:#66bb6a,color:#fff
    style N2 fill:#66bb6a,color:#fff
    style N3 fill:#66bb6a,color:#fff
    style N4 fill:#ff5252,color:#fff
```

| Parent | Child | Allowed | Multiple Parents | Bidirectional |
|--------|-------|---------|-----------------|---------------|
| Context | Context | Yes | Yes | Yes |
| Context | Node | Yes | Yes | N/A |
| Node | Node | Yes | Yes | N/A |
| Node | Context | **No** | - | - |

### Schema View (BACKEND spaces only)

```mermaid
graph TD
    subgraph "Context Page (BACKEND space)"
        CONTENT["Regular Content<br/>(blocks, markdown, metadata)"]
        SCHEMA["Schema Section<br/>(from ContextType.attributeSchema)"]
        F1["Field: status<br/>STRING, required"]
        F2["Field: priority<br/>NUMBER, optional"]
        F3["Field: assignee<br/>NODE_REF, optional"]
    end

    SCHEMA --> F1
    SCHEMA --> F2
    SCHEMA --> F3

    subgraph "Lock Control"
        MODE_TOGGLE["Space Mode Toggle<br/>PRODUCTION = locked | CONFIGURATION = editable"]
    end

    style CONTENT fill:#f5f5f5,stroke:#999
    style SCHEMA fill:#fff3e0,stroke:#ff9800
    style F1 fill:#fff8e1
    style F2 fill:#fff8e1
    style F3 fill:#fff8e1
    style MODE_TOGGLE fill:#e3f2fd,stroke:#2196f3
```

### Context Menu Changes

```mermaid
graph TD
    subgraph "Node Right-Click Menu (NEW)"
        NM1["View"]
        NM2["Edit"]
        NM3["Make a Child Of... → Context or Node"]
        NM4["Delete"]
    end

    subgraph "Node Right-Click Menu (OLD - removed)"
        OM1["View"]
        OM2["Edit"]
        OM3["Move To... ❌ REMOVED"]
        OM4["Delete"]
    end

    subgraph "Context Right-Click Menu (NEW)"
        CM1["View"]
        CM2["Open as Page"]
        CM3["Make a Child Of... → Context only"]
        CM4["Delete"]
    end

    style OM3 fill:#ff5252,color:#fff
    style NM3 fill:#66bb6a,color:#fff
    style CM3 fill:#66bb6a,color:#fff
    style CM4 fill:#e3f2fd,stroke:#2196f3
```

## Decisions

- **Use existing `Attribute` with `CONTAINS` key for all containment**: No new relationship types needed. Multi-parent is simply multiple `CONTAINS` attributes pointing to the same target from different sources. Bidirectional is two `CONTAINS` attributes with swapped source/target.
- **No backend cycle prevention**: Circular containment between contexts is intentional (superposition). The backend does not prevent cycles. The frontend MUST handle cycles gracefully in rendering (track visited IDs, show "already in view" indicator).
- **Schema from `ContextType.attributeSchema`**: No new backend entities. The frontend renders the existing JSONB field as visual items. Context nodes link to ContextType via `context_type_id` FK.
- **Schema locking via space mode**: No per-entity lock boolean. Space mode PRODUCTION = schemas locked (CONTEXT nodes CONTENT_LOCKED, blocks FULLY_LOCKED). CONFIGURATION = editable. Toggle via `PATCH /api/spaces/{id}` with mode field.
- **"Make a Child Of" replaces "Move To"**: Semantically, this is adding a relationship, not relocating. The old node stays in all its current parents and gains a new one.
- **Duplicate CONTAINS prevention**: Backend returns 409 if the same source→target CONTAINS already exists. Frontend should handle this gracefully (e.g., show "already a child of this context").
- **Remove from Context**: `DELETE /api/spaces/{slug}/contexts/{ctx}/nodes/{nodeId}` removes the CONTAINS relationship. Backend auto-assigns to Context-Less (Blank) if last context. Frontend shows "Remove from [Context]" in node context menu when viewed within a context.

## Risks / Trade-offs

- **Infinite rendering loops**: Bidirectional context containment could cause infinite recursion when rendering nested views. Mitigation: track visited context IDs during rendering and stop recursion when a cycle is detected.
- **Performance with many parents**: A node appearing in many contexts means multiple queries or a more complex query to find all parents. Mitigation: the existing `Attribute` query model already supports this; UI just needs to handle multiple results.
- **UX confusion**: Users might not expect Context B to appear inside Context A and vice versa. Mitigation: visual indicators (badges, icons) showing that a context/node exists in multiple places.
- **"Make a Child Of" discoverability**: Users accustomed to "Move To" need to understand the semantic change. Mitigation: tooltip explaining the difference.

## Resolved Questions

- **Visual multi-parent indicator**: Yes — nodes/contexts with multiple parents show a badge indicating parent count. Covered in task 5.4.
- **Removing a child relationship**: "Remove from [Context Name]" action in context menu. Calls `DELETE /api/spaces/{slug}/contexts/{ctx}/nodes/{nodeId}`. Does not delete the node.
- **Flat space view deduplication**: The flat space context list always shows each context exactly once, regardless of how many parent contexts it has. No duplication in the flat view.
