# Mujarrad — User Documentation v1.0

**Covers**: Features 014, Batch 015, Batch 016
**For**: End users, developers building on Mujarrad, frontend documentation teams

---

## Part 1: What is Mujarrad?

Mujarrad is a knowledge graph backend — a universal data platform where everything is a **node** and every relationship is an **attribute**. It can be used in two modes:

- **CONSUMER mode** — organize information freely (notes, documents, tasks, ideas)
- **BACKEND mode** — define structured data schemas (like building a database with classes and instances)

### The Hierarchy

Every piece of data in Mujarrad follows this hierarchy:

```
Organization
  └── Space
        └── Context
              └── Node
                    └── Block (child node)
```

- **Organization** — who owns this data (your account or your team)
- **Space** — a container for related content (like a database or project)
- **Context** — an organizer inside a space (like a table or folder)
- **Node** — a piece of content (a note, a record, a document)
- **Block** — a child element inside a node (a paragraph, a heading, a code block)

Nothing exists outside this hierarchy. If you create something without specifying where it goes, the system places it automatically:
- No space → goes to **The Void** (your personal holding area)
- No context → goes to **The Blank** (the space's default catch-all context)

---

## Part 2: Organizations

### What is an Organization?

An organization is the top-level owner of everything. Think of it like a GitHub account:

- **INDIVIDUAL** — auto-created for every user at signup. One person. Your personal workspace.
- **TEAM** — created manually. Multiple members with roles. For collaboration.

You always have your INDIVIDUAL organization. You can also create or join TEAM organizations.

### Organization Roles

| Role | What you can do |
|------|----------------|
| **OWNER** | Everything — manage members, manage spaces, delete the organization |
| **ADMIN** | Manage members + spaces, but cannot delete the organization |
| **MEMBER** | Use spaces according to their space-level permissions |

### How it works

```
You sign up
  → INDIVIDUAL organization auto-created (you are the OWNER)
  → A hidden meta-space is created (for system data)
  → You can now create spaces under your organization

You create a team
  → POST /api/organizations { "name": "My Team" }
  → TEAM organization created (you are the OWNER)
  → Invite members: POST /api/organizations/{id}/members
```

---

## Part 3: Spaces

### What is a Space?

A space is a container for your data — like a database or a project workspace. Every space belongs to an organization.

### Space Types

| Type | Purpose | Schema enforcement |
|------|---------|-------------------|
| **CONSUMER** | Free-form content — notes, documents, ideas | None — contexts are organizational only |
| **BACKEND** | Structured data — like a database with schemas | Yes — contexts define schemas for their nodes |

### Space Modes (BACKEND only)

| Mode | What it means |
|------|--------------|
| **CONFIGURATION** | You're building the schema — editing context types, defining fields |
| **PRODUCTION** | Schema is frozen — you can only create/edit data instances, not change the structure |

### Creating a Space

```
POST /api/spaces
{ "name": "My CRM", "projectType": "BACKEND" }
```

The system auto-creates a **Context-Less** context (The Blank) inside every space.

If you don't specify an `organizationId`, the space goes to your INDIVIDUAL organization.

### System Spaces (hidden, automatic)

| Space | Purpose | Visible? |
|-------|---------|----------|
| **Void space** | Your personal quick-notes area | No — accessed via /api/void/nodes |
| **Meta-space** | System infrastructure (virtual contexts) | No — never shown |
| **Regular spaces** | Your data | Yes |

---

## Part 4: Contexts

### What is a Context?

A context is a node of type `CONTEXT` that organizes other nodes inside a space. Think of it as:
- In **CONSUMER** mode: a folder or category
- In **BACKEND** mode: a database table / class definition

### The Blank (Context-Less Context)

Every space has a hidden, built-in context called **Context-Less** (The Blank). It's the catch-all:
- When you create a node without specifying a context → it goes to The Blank
- When you remove a node from all its contexts → it goes back to The Blank
- The Blank cannot be deleted, renamed, or modified

### Context as a Class (BACKEND mode)

In a BACKEND space, a CONTEXT node IS your class definition:

```
CONTEXT "Organization" (= the class)
  ├── Block: "name"       → STRING, required
  ├── Block: "email"      → STRING, format: email  
  ├── Block: "industry"   → ENUM: tech/finance/health
  └── Block: "founded"    → DATE

REGULAR nodes inside → instances of the class
  ├── "Acme Corp"   → {name: "Acme", email: "info@acme.com"}
  ├── "Beta Inc"    → {name: "Beta", email: "hi@beta.io"}
  └── "Gamma LLC"   → {name: "Gamma", email: "g@gamma.com"}
```

### Schema Enforcement

Each context type has an `enforcement_mode`:

| Mode | What happens when you create/update a node |
|------|---------------------------------------------|
| **NONE** | No validation — context is organizational only |
| **WARN** | Validates data against schema, logs warnings but allows |
| **STRICT** | Validates and rejects non-conforming data with 400 |

### Nested Contexts

Contexts can contain other contexts:

```
CONTEXT "Projects"
  └── CONTEXT "Q4 Deliverables"
        └── CONTEXT "Sprint 12"
              └── Node: "Implement login"
```

Create nested contexts via:
```
POST /api/spaces/{slug}/contexts/{parentContextSlug}/contexts
{ "title": "Sprint 12", "nodeType": "CONTEXT" }
```

### Creating Nodes in a Context (Recommended)

```
POST /api/spaces/{slug}/contexts/{contextSlug}/nodes
{ "title": "My Task", "nodeType": "REGULAR", "nodeDetails": { "priority": 5 } }
```

This is the recommended way. The system automatically:
- Creates a CONTAINS relationship from the context to the node
- Validates data against the context's schema (if BACKEND + STRICT)
- The node does NOT appear in The Blank

---

## Part 5: Nodes

### What is a Node?

A node is the fundamental unit of data in Mujarrad. Everything — notes, tasks, records, pages, contexts — is a node.

### Node Types

| Type | Purpose |
|------|---------|
| **REGULAR** | Data — a note, a task, a record, a page |
| **CONTEXT** | An organizer — a folder, a table, a class definition |
| **ATTRIBUTE** | A promoted relationship (advanced — created via attribute promotion API) |

### Node Fields

| Field | Description |
|-------|-------------|
| `id` | UUID — unique identifier |
| `title` | Human-readable name |
| `slug` | URL-friendly identifier |
| `content` | Markdown text content |
| `nodeDetails` | JSON object for custom metadata |
| `nodeType` | REGULAR, CONTEXT, or ATTRIBUTE |
| `lockLevel` | UNLOCKED, CONTENT_LOCKED, or FULLY_LOCKED |
| `isBuiltin` | True for system nodes (like The Blank) |
| `parentNodeId` | If this is a block inside another node |
| `effectiveLockLevel` | Computed lock considering space, schema, parent |

### Creating Nodes

| Path | What happens |
|------|-------------|
| `POST /spaces/{slug}/contexts/{ctx}/nodes` | Node created in the specified context (**recommended**) |
| `POST /spaces/{slug}/nodes` | Node created in The Blank (catch-all) |
| `POST /void/nodes` | Node created in The Void (personal, spaceless) |
| `POST /spaces/{slug}/nodes/{parentId}/children` | Block created inside a parent node |

---

## Part 6: Blocks (Child Nodes)

### What is a Block?

A block is a node that lives inside another node. Think of a page with paragraphs, headings, code blocks — each is a block node.

### Block Rules

- Blocks can ONLY be created via `POST /nodes/{parentId}/children`
- Blocks NEVER appear in space listings, context listings, graph views, or search
- Blocks ONLY appear when you list a parent's children: `GET /nodes/{parentId}/children`
- Blocks inherit their parent's lock level
- Blocks cannot have cross-space connections
- Blocks migrate atomically with their parent

### Block Types

Stored in `nodeDetails.blockType`:
- `text` — paragraph
- `heading1`, `heading2`, `heading3` — headings
- `bulletList`, `numberedList` — lists
- `todo` — checkbox item
- `quote` — blockquote
- `code` — code block
- `divider` — horizontal rule

### Creating a Block

```
POST /api/spaces/{slug}/nodes/{pageId}/children
{
  "title": "Block 1",
  "nodeType": "REGULAR",
  "content": "Hello world",
  "nodeDetails": { "blockType": "text" }
}
```

### Reordering Blocks

```
PATCH /api/spaces/{slug}/nodes/{pageId}/children/reorder
{ "orderedChildIds": ["uuid-1", "uuid-3", "uuid-2"] }
```

---

## Part 7: The Void

### What is The Void?

The Void is your personal, private holding area for notes that don't belong to any space yet. Think of it as your inbox or scratchpad.

### Void Rules

- Every user has their own Void (private, no one else can see it)
- Notes in The Void cannot have relationships
- Notes can be moved to a space later via "assign"
- Only REGULAR and CONTEXT nodes allowed (no ATTRIBUTE)

### Using The Void

```
# Create a quick note
POST /api/void/nodes
{ "title": "Quick thought" }

# List your void notes
GET /api/void/nodes?page=0&size=20

# Assign to a space + context
POST /api/void/nodes/{nodeId}/assign
{ "spaceId": "uuid", "contextId": "uuid" }
```

---

## Part 8: The Blank (Context-Less)

### What is The Blank?

The Blank is the default context in every space. When a node is created without specifying a context, it lands in The Blank.

### Blank Rules

- Every space has exactly one Blank (auto-created, cannot be deleted)
- Nodes in The Blank can be assigned to a proper context later
- The Blank is a safety net — no node is ever truly orphaned

### Managing Blank Nodes

```
# List unorganized nodes
GET /api/spaces/{slug}/blank/nodes?page=0&size=20

# Count unorganized nodes
GET /api/spaces/{slug}/blank/count

# Assign a node to a context
POST /api/spaces/{slug}/blank/assign
{ "nodeId": "uuid", "contextSlug": "tasks" }

# Bulk assign
POST /api/spaces/{slug}/blank/assign-bulk
{ "nodeIds": ["uuid-1", "uuid-2"], "contextSlug": "tasks" }
```

---

## Part 9: Locking

### The 4-Level Lock Hierarchy

```
Level 1: Space Lock → EVERYTHING frozen
Level 2: Schema Lock → CONTEXT nodes frozen, data free (BACKEND+PRODUCTION)
Level 3: Node Lock → Individual node frozen
Level 4: Attribute Lock → Individual relationship frozen
```

Each level overrides the ones below it. Read operations always work at every level.

### Node Lock Levels

| Level | Title/Content | Relationships | Move/Delete |
|-------|--------------|---------------|-------------|
| **UNLOCKED** | ✅ Editable | ✅ Modifiable | ✅ Allowed |
| **CONTENT_LOCKED** | ❌ Frozen | ✅ Modifiable | ❌ Blocked |
| **FULLY_LOCKED** | ❌ Frozen | ❌ Frozen | ❌ Blocked |

### Schema Lock (BACKEND spaces)

When a BACKEND space is in PRODUCTION mode:
- **CONTEXT nodes are frozen** — you cannot edit, delete, or create new contexts
- **Blocks inside CONTEXT nodes are frozen** — no schema field changes
- **REGULAR nodes are free** — create, edit, delete data instances normally
- To edit the schema, switch to CONFIGURATION mode

### Effective Lock Level

Every node response includes:
- `lockLevel` — the node's own explicit lock
- `effectiveLockLevel` — the computed lock considering space, schema, and parent
- `lockInherited` — true if the lock comes from somewhere above
- `lockSource` — where: "space", "schema", "parent", or "self"

### Locking Endpoints

```
# Lock a node
PATCH /api/spaces/{slug}/nodes/{id}/lock
{ "lockLevel": "CONTENT_LOCKED" }

# Unlock a node
PATCH /api/spaces/{slug}/nodes/{id}/unlock

# Lock entire space
PATCH /api/spaces/{slug}/lock

# Unlock space
PATCH /api/spaces/{slug}/unlock
```

---

## Part 10: Relationships (Attributes)

### What is an Attribute?

An attribute is a relationship between two nodes. The main types:

| Type | Meaning |
|------|---------|
| **CONTAINS** | Parent-child containment (Context→Node, Page→Block) |
| **REFERENCES** | Cross-reference (Node→Node) |
| **RELATES_TO** | Generic relationship |
| **DEPENDS_ON** | Dependency |

### Cross-Space Connections (Virtual Contexts)

Nodes in different spaces can be connected via Virtual Contexts:

```
# Create a virtual context (bridge between spaces)
POST /api/virtual-contexts
{ "name": "CRM ↔ Finance", "ownerSpaceId": "uuid" }

# Add the other space
POST /api/virtual-contexts/{id}/members
{ "spaceId": "other-space-uuid", "role": "CONTRIBUTOR" }

# Create cross-space connection
POST /api/virtual-contexts/{id}/attributes
{ "sourceNodeId": "node-in-space-A", "targetNodeId": "node-in-space-B",
  "attributeName": "relates_to", "attributeType": "RELATES_TO" }
```

---

## Part 11: Node Migration

### What is Migration?

Migration copies a node to another space. The original stays in place. The copy gets a fresh ID.

```
POST /api/spaces/{slug}/nodes/{nodeId}/migrate
{
  "targetSpaceId": "uuid",
  "targetContextId": "uuid",
  "includeReference": true
}
```

Response:
```json
{
  "original": { ...unchanged node... },
  "copy": { ...new node in target space... },
  "referenceAttributeId": "uuid (link from copy → original)"
}
```

### Migration Rules

- Original node stays untouched with all its relationships
- Copy gets a new UUID (standard creation flow)
- All child blocks are copied atomically with the parent
- Blocks cannot be migrated independently
- Cross-organization migration is blocked

---

## Part 12: Pagination

Every list endpoint returns paginated responses:

```json
{
  "content": [ ...items... ],
  "totalElements": 150,
  "totalPages": 8,
  "page": 0,
  "size": 20
}
```

Parameters: `?page=0&size=20` (max size: 100)

---

## Part 13: Building a BACKEND Application

### Step-by-step

```
1. Sign up → INDIVIDUAL org + meta-space auto-created

2. Create a BACKEND space
   POST /api/spaces { "name": "My CRM", "projectType": "BACKEND" }
   → Space in CONFIGURATION mode

3. Define your schema (create CONTEXT nodes = classes)
   POST /api/spaces/{slug}/contexts/{ctx}/contexts
   { "title": "Organizations", "nodeType": "CONTEXT" }
   
   POST /api/spaces/{slug}/contexts/{ctx}/contexts
   { "title": "Contacts", "nodeType": "CONTEXT" }

4. Add schema fields (create blocks inside CONTEXT nodes)
   POST /api/spaces/{slug}/nodes/{contextId}/children
   { "title": "name", "nodeType": "REGULAR",
     "nodeDetails": { "blockType": "schema_field", "fieldType": "STRING", "required": true } }

5. Switch to PRODUCTION mode
   PATCH /api/spaces/{id}
   { "mode": "PRODUCTION" }
   → Schema is now frozen

6. Create data instances
   POST /api/spaces/{slug}/contexts/organizations/nodes
   { "title": "Acme Corp", "nodeDetails": { "name": "Acme", "email": "info@acme.com" } }
   → Validated against schema if enforcement_mode is WARN or STRICT

7. Query data
   GET /api/spaces/{slug}/contexts/organizations/nodes?page=0&size=20
```

### Using as a CONSUMER Application

```
1. Create a CONSUMER space
   POST /api/spaces { "name": "My Notes" }

2. Create contexts (organizational folders)
   POST /api/spaces/{slug}/contexts/context-less/contexts
   { "title": "Work", "nodeType": "CONTEXT" }

3. Create nodes inside contexts
   POST /api/spaces/{slug}/contexts/work/nodes
   { "title": "Meeting notes", "nodeType": "REGULAR", "content": "# Meeting\n..." }

4. Quick notes (no context needed)
   POST /api/void/nodes
   { "title": "Quick thought" }
   → Assign to a space later
```

---

# Release Notes — v1.0 (Features 014 + Batch 015 + Batch 016)

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

- **7 database migrations** (V031-V039)
- **Centralized ResponseMapper** — consistent 18-field NodeResponse across all endpoints
- **SlugUtils** — Unicode-aware slug generation
- **JWT issuer validation** — federation-ready token security
- **923 tests passing, 0 failures**

## Breaking Changes

- `ASSUMPTION` node type removed → use `REGULAR`
- All list endpoints return `{ content: [...], totalElements, ... }` not raw arrays
- Flat `POST /spaces/{slug}/nodes` creates in The Blank (not orphaned)
- Blocks (`nodeDetails.blockType`) rejected on flat endpoint — use `/nodes/{parentId}/children`

## Deprecations

- `POST /spaces/{slug}/nodes/{id}/move` → use `/migrate` instead
- `NodeMoveService` marked `@Deprecated(forRemoval = true)`
