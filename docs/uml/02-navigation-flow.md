# Navigation Flow

**Filename:** `docs/uml/02-navigation-flow.md`
**Diagram type:** flowchart TD
**Scope:** Complete user navigation paths from login through all views, including both views for CONTEXT nodes and `?fromContext` back-path.

```mermaid
flowchart TD
    LOGIN(["/login\nAuthentication"]):::auth
    SPACES(["/spaces\nSpace List"]):::layer0
    VOID(["/void\nVoid — personal scratch"]):::special
    SPACE(["/spaces/[slug]\nSpace Root — Layer 0\nContext grid + blank shortcut"]):::layer0
    BLANK(["/spaces/[slug]/blank\nThe Blank\nUnorganized nodes"]):::special
    WHITEBOARD(["/spaces/[slug]/whiteboard\nWhiteboard Canvas"]):::special
    GRAPH(["/spaces/[slug]/graph\nGraph View"]):::special
    CTX_LAYER(["/spaces/[slug]/context/[contextSlug]\nContext Layer View — Layer N\nChild contexts + nodes in context"]):::layerN
    NODE_CONTENT_NO_CTX(["/spaces/[slug]/node/[id]\nNode Content View\nBlock editor — no origin context\nBack → Space Root"]):::nodeView
    NODE_CONTENT_FROM_CTX(["/spaces/[slug]/node/[id]?fromContext=[ctx]\nNode Content View\nBlock editor — arrived from context\nBack → Context Layer View"]):::nodeView
    CTX_CONTENT_VIEW(["/spaces/[slug]/node/[ctxNodeId]?fromContext=[ctx]\nContext Content View\nBlock editor for the CONTEXT node's\nown documentation content\nBack → Context Layer View"]):::nodeView

    LOGIN -->|"auth success"| SPACES
    SPACES -->|"click space card"| SPACE
    SPACES -->|"click Void"| VOID

    SPACE -->|"click CONTEXT node card\ngetNodeRoute → layer view"| CTX_LAYER
    SPACE -->|"click REGULAR node card\ngetNodeRoute → /node/[id]"| NODE_CONTENT_NO_CTX
    SPACE -->|"click Blank shortcut"| BLANK
    SPACE -->|"click Whiteboard"| WHITEBOARD
    SPACE -->|"click Graph"| GRAPH

    CTX_LAYER -->|"click REGULAR node card\ngetNodeRoute → /node/[id]?fromContext=[ctx]"| NODE_CONTENT_FROM_CTX
    CTX_LAYER -->|"click child CONTEXT card\ngetNodeRoute → /context/[childCtx]"| CTX_LAYER
    CTX_LAYER -->|"click 'View Context Content' button\n/node/[ctxNodeId]?fromContext=[ctx]"| CTX_CONTENT_VIEW

    NODE_CONTENT_NO_CTX -->|"Back button\n(no ?fromContext param)"| SPACE
    NODE_CONTENT_FROM_CTX -->|"Back button\n(?fromContext present)"| CTX_LAYER
    CTX_CONTENT_VIEW -->|"Back button\n(?fromContext present)"| CTX_LAYER

    BLANK -->|"back / breadcrumb"| SPACE
    WHITEBOARD -->|"back / breadcrumb"| SPACE
    GRAPH -->|"back / breadcrumb"| SPACE

    subgraph LEGEND["Legend"]
        L0["Space Root — Layer 0"]:::layer0
        LN["Context Layer — Layer N"]:::layerN
        NV["Node Content View"]:::nodeView
        SP["Special Views"]:::special
        AU["Auth"]:::auth
    end

    classDef layer0 fill:#4A90D9,color:#fff,stroke:#2C6FAC
    classDef layerN fill:#7B68EE,color:#fff,stroke:#5A4DB3
    classDef nodeView fill:#50C878,color:#fff,stroke:#3A9A5C
    classDef special fill:#F4A460,color:#fff,stroke:#C47D35
    classDef auth fill:#E74C3C,color:#fff,stroke:#B03A2E
```

## Routing Rules

| Source | Trigger | Destination | URL Pattern |
|---|---|---|---|
| Anywhere | Auth success | Space List | `/spaces` |
| Space List | Click space card | Space Root | `/spaces/[slug]` |
| Space Root | Click CONTEXT node | Context Layer View | `/spaces/[slug]/context/[contextSlug]` |
| Space Root | Click REGULAR node | Node Content (no ctx) | `/spaces/[slug]/node/[id]` |
| Context Layer | Click REGULAR node | Node Content (with ctx) | `/spaces/[slug]/node/[id]?fromContext=[ctx]` |
| Context Layer | Click child CONTEXT | Child Context Layer | `/spaces/[slug]/context/[childCtxSlug]` |
| Context Layer | "View Context Content" | Context Content View | `/spaces/[slug]/node/[ctxNodeId]?fromContext=[ctx]` |
| Node Content (no ctx) | Back button | Space Root | `/spaces/[slug]` |
| Node Content (from ctx) | Back button | Context Layer | `/spaces/[slug]/context/[ctx]` |
| Context Content | Back button | Context Layer | `/spaces/[slug]/context/[ctx]` |

## `getNodeRoute` Routing Function (canonical — ADR-02)

All navigation to a node must use `getNodeRoute(spaceSlug, node, { fromContext? })` from `src/lib/routing.ts`:
- If `node.nodeType === NodeType.CONTEXT` and `node.slug` is set → returns layer view URL.
- Otherwise → returns `/spaces/${spaceSlug}/node/${node.id}` with optional `?fromContext` appended.
