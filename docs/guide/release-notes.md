# Release Notes — v1.0

Features 014 + Batch 015 + Batch 016

## New Features

- **Organizations** — INDIVIDUAL (auto) + TEAM (manual) with OWNER/ADMIN/MEMBER roles
- **The Void** — personal spaceless holding area for quick notes
- **The Blank** — per-space default context for unorganized nodes
- **Context-Scoped Access** — create/read nodes through their parent context
- **Block Architecture** — parent-child nodes with `parent_node_id`, atomic creation
- **Node Migration** — copy nodes between spaces (replaces move)
- **Schema Lock** — 4-level cascade: space → schema → node → attribute
- **Virtual Contexts** — cross-space connections stored as CONTEXT nodes
- **Nested Contexts** — contexts inside contexts
- **Schema Enforcement** — NONE/WARN/STRICT on context types
- **Pagination** — ALL list endpoints return PageResponse

## Infrastructure

- 9 database migrations (V031–V039)
- Centralized ResponseMapper — consistent 18-field NodeResponse across all endpoints
- SlugUtils — Unicode-aware slug generation
- JWT issuer validation — federation-ready token security

## Breaking Changes

- `ASSUMPTION` node type removed → use `REGULAR`
- All list endpoints return `{ content: [...], totalElements, ... }` not raw arrays
- Flat `POST /spaces/{slug}/nodes` creates in The Blank (not orphaned)
- Blocks (`nodeDetails.blockType`) rejected on flat endpoint — use `/nodes/{parentId}/children`

## Deprecations

- `POST /spaces/{slug}/nodes/{id}/move` → use `/migrate` instead
- `NodeMoveService` marked `@Deprecated(forRemoval = true)`
