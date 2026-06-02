'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, ChevronDown, Book, Rocket, Code, Layers, Shield, Lock, Menu, X } from 'lucide-react';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { SwaggerEmbed } from '@/components/docs/SwaggerEmbed';
import { cn } from '@/lib/utils';

// Documentation content organized by sections
const docsContent: Record<string, string> = {
  'introduction': `# Mujarrad Developer Documentation

Welcome to the Mujarrad documentation. This guide covers everything you need to know to build on the Mujarrad platform.

## What is Mujarrad?

Mujarrad is a **knowledge graph backend** — a universal data platform where everything is a **node** and every relationship is an **attribute**. It can be used in two modes:

- **CONSUMER mode** — organize information freely (notes, documents, tasks, ideas)
- **BACKEND mode** — define structured data schemas (like building a database with classes and instances)

## The Hierarchy

Every piece of data in Mujarrad follows this hierarchy:

\`\`\`
Organization
  └── Space
        └── Context
              └── Node
                    └── Block (child node)
\`\`\`

- **Organization** — who owns this data (your account or your team)
- **Space** — a container for related content (like a database or project)
- **Context** — an organizer inside a space (like a table or folder)
- **Node** — a piece of content (a note, a record, a document)
- **Block** — a child element inside a node (a paragraph, a heading, a code block)

Nothing exists outside this hierarchy. If you create something without specifying where it goes, the system places it automatically:
- No space → goes to **The Void** (your personal holding area)
- No context → goes to **The Blank** (the space's default catch-all context)

## Quick Start

\`\`\`bash
# 1. Register
curl -X POST https://mujarrad.onrender.com/api/users/register \\
  -H "Content-Type: application/json" \\
  -d '{ "email": "dev@example.com", "username": "dev", "password": "SecurePass123!" }'

# 2. Login
curl -X POST https://mujarrad.onrender.com/api/users/login \\
  -H "Content-Type: application/json" \\
  -d '{ "email": "dev@example.com", "password": "SecurePass123!" }'
# Save the token:
export TOKEN="eyJhbGciOiJIUzI1NiJ9..."

# 3. Create a space
curl -X POST https://mujarrad.onrender.com/api/spaces \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "My CRM", "projectType": "BACKEND" }'

# 4. Create a node
curl -X POST "https://mujarrad.onrender.com/api/spaces/my-crm/nodes" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "title": "First Record", "nodeType": "REGULAR" }'

# 5. Swagger UI
open https://mujarrad.onrender.com/swagger-ui/index.html
\`\`\`
`,

  'organizations': `# Organizations

An organization is the top-level owner of everything in Mujarrad. Think of it like a GitHub account.

## Organization Types

| Type | Description |
|------|-------------|
| **INDIVIDUAL** | Auto-created for every user at signup. One person. Your personal workspace. |
| **TEAM** | Created manually. Multiple members with roles. For collaboration. |

You always have your INDIVIDUAL organization. You can also create or join TEAM organizations.

## Organization Roles

| Role | What you can do |
|------|----------------|
| **OWNER** | Everything — manage members, manage spaces, delete the organization |
| **ADMIN** | Manage members + spaces, but cannot delete the organization |
| **MEMBER** | Use spaces according to their space-level permissions |

## How It Works

\`\`\`
You sign up
  → INDIVIDUAL organization auto-created (you are the OWNER)
  → A hidden meta-space is created (for system data)
  → You can now create spaces under your organization

You create a team
  → POST /api/organizations { "name": "My Team" }
  → TEAM organization created (you are the OWNER)
  → Invite members: POST /api/organizations/{id}/members
\`\`\`

## Auto-Creation on Signup

When a user registers:
1. An INDIVIDUAL organization is automatically created
2. The user becomes the OWNER
3. A hidden meta-space is created for system infrastructure
4. The user can immediately start creating spaces
`,

  'spaces': `# Spaces

A space is a container for your data — like a database or a project workspace. Every space belongs to an organization.

## Space Types

| Type | Purpose | Schema enforcement |
|------|---------|-------------------|
| **CONSUMER** | Free-form content — notes, documents, ideas | None — contexts are organizational only |
| **BACKEND** | Structured data — like a database with schemas | Yes — contexts define schemas for their nodes |

## Space Modes (BACKEND only)

| Mode | What it means |
|------|--------------|
| **CONFIGURATION** | You're building the schema — editing context types, defining fields |
| **PRODUCTION** | Schema is frozen — you can only create/edit data instances, not change the structure |

## Creating a Space

\`\`\`bash
curl -X POST https://mujarrad.onrender.com/api/spaces \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "My CRM", "projectType": "BACKEND" }'
\`\`\`

The system auto-creates a **Context-Less** context (The Blank) inside every space.

If you don't specify an \`organizationId\`, the space goes to your INDIVIDUAL organization.

## System Spaces (hidden, automatic)

| Space | Purpose | Visible? |
|-------|---------|----------|
| **Void space** | Your personal quick-notes area | No — accessed via \`/api/void/nodes\` |
| **Meta-space** | System infrastructure (virtual contexts) | No — never shown |
| **Regular spaces** | Your data | Yes |

## Switching Modes

\`\`\`bash
# Switch to PRODUCTION (lock schema)
curl -X PATCH "https://mujarrad.onrender.com/api/spaces/{spaceId}" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "mode": "PRODUCTION" }'

# Switch to CONFIGURATION (unlock schema)
curl -X PATCH "https://mujarrad.onrender.com/api/spaces/{spaceId}" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "mode": "CONFIGURATION" }'
\`\`\`

> **Note:** Only the space owner can switch modes.
`,

  'contexts': `# Contexts

A context is a node of type \`CONTEXT\` that organizes other nodes inside a space.

## Contexts by Mode

- In **CONSUMER** mode: a folder or category
- In **BACKEND** mode: a database table / class definition

## The Blank (Context-Less Context)

Every space has a hidden, built-in context called **Context-Less** (The Blank). It's the catch-all:
- When you create a node without specifying a context → it goes to The Blank
- When you remove a node from all its contexts → it goes back to The Blank
- The Blank cannot be deleted, renamed, or modified

## Context as a Class (BACKEND mode)

In a BACKEND space, a CONTEXT node IS your class definition:

\`\`\`
CONTEXT "Organization" (= the class)
  ├── Block: "name"       → STRING, required
  ├── Block: "email"      → STRING, format: email
  ├── Block: "industry"   → ENUM: tech/finance/health
  └── Block: "founded"    → DATE

REGULAR nodes inside → instances of the class
  ├── "Acme Corp"   → {name: "Acme", email: "info@acme.com"}
  ├── "Beta Inc"    → {name: "Beta", email: "hi@beta.io"}
  └── "Gamma LLC"   → {name: "Gamma", email: "g@gamma.com"}
\`\`\`

## Schema Enforcement

Each context type has an \`enforcement_mode\`:

| Mode | What happens when you create/update a node |
|------|---------------------------------------------|
| **NONE** | No validation — context is organizational only |
| **WARN** | Validates data against schema, logs warnings but allows |
| **STRICT** | Validates and rejects non-conforming data with 400 |

## Nested Contexts

Contexts can contain other contexts:

\`\`\`
CONTEXT "Projects"
  └── CONTEXT "Q4 Deliverables"
        └── CONTEXT "Sprint 12"
              └── Node: "Implement login"
\`\`\`

Create nested contexts via:
\`\`\`bash
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/contexts/{parentContextSlug}/contexts" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "title": "Sprint 12", "nodeType": "CONTEXT" }'
\`\`\`

## Creating Nodes in a Context (Recommended)

\`\`\`bash
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/contexts/{contextSlug}/nodes" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "title": "My Task", "nodeType": "REGULAR", "nodeDetails": { "priority": 5 } }'
\`\`\`

This is the recommended way. The system automatically:
- Creates a CONTAINS relationship from the context to the node
- Validates data against the context's schema (if BACKEND + STRICT)
- The node does NOT appear in The Blank
`,

  'nodes': `# Nodes

A node is the fundamental unit of data in Mujarrad. Everything — notes, tasks, records, pages, contexts — is a node.

## Node Types

| Type | Purpose |
|------|---------|
| **REGULAR** | Data — a note, a task, a record, a page |
| **CONTEXT** | An organizer — a folder, a table, a class definition |
| **ATTRIBUTE** | A promoted relationship (advanced — created via attribute promotion API) |

## Node Fields

| Field | Description |
|-------|-------------|
| \`id\` | UUID — unique identifier |
| \`title\` | Human-readable name |
| \`slug\` | URL-friendly identifier |
| \`content\` | Markdown text content |
| \`nodeDetails\` | JSON object for custom metadata |
| \`nodeType\` | REGULAR, CONTEXT, or ATTRIBUTE |
| \`lockLevel\` | UNLOCKED, CONTENT_LOCKED, or FULLY_LOCKED |
| \`isBuiltin\` | True for system nodes (like The Blank) |
| \`parentNodeId\` | If this is a block inside another node |
| \`effectiveLockLevel\` | Computed lock considering space, schema, parent |

## 4 Creation Paths

| Path | What happens |
|------|-------------|
| \`POST /spaces/{slug}/contexts/{ctx}/nodes\` | Node created in the specified context (**recommended**) |
| \`POST /spaces/{slug}/nodes\` | Node created in The Blank (catch-all) |
| \`POST /void/nodes\` | Node created in The Void (personal, spaceless) |
| \`POST /spaces/{slug}/nodes/{parentId}/children\` | Block created inside a parent node |

## Creating a Node

\`\`\`bash
# In a specific context (recommended)
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/contexts/{ctx}/nodes" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "My Document",
    "content": "Document content here.",
    "nodeType": "REGULAR",
    "nodeDetails": {
      "status": "draft",
      "priority": "high"
    }
  }'
\`\`\`

## Using nodeDetails

The \`nodeDetails\` JSONB field allows flexible custom properties:

\`\`\`json
{
  "nodeDetails": {
    "status": "in-progress",
    "priority": "high",
    "tags": ["urgent", "client-facing"],
    "dueDate": "2025-03-15"
  }
}
\`\`\`
`,

  'blocks': `# Blocks (Child Nodes)

A block is a node that lives inside another node. Think of a page with paragraphs, headings, code blocks — each is a block node.

## Block Rules

- Blocks can ONLY be created via \`POST /nodes/{parentId}/children\`
- Blocks NEVER appear in space listings, context listings, graph views, or search
- Blocks ONLY appear when you list a parent's children: \`GET /nodes/{parentId}/children\`
- Blocks inherit their parent's lock level
- Blocks cannot have cross-space connections
- Blocks migrate atomically with their parent

## Block Types

Stored in \`nodeDetails.blockType\`:

| Block Type | Description |
|-----------|-------------|
| \`text\` | Paragraph |
| \`heading1\`, \`heading2\`, \`heading3\` | Headings |
| \`bulletList\`, \`numberedList\` | Lists |
| \`todo\` | Checkbox item |
| \`quote\` | Blockquote |
| \`code\` | Code block |
| \`divider\` | Horizontal rule |

## Creating a Block

\`\`\`bash
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/nodes/{pageId}/children" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Block 1",
    "nodeType": "REGULAR",
    "content": "Hello world",
    "nodeDetails": { "blockType": "text" }
  }'
\`\`\`

## Reordering Blocks

\`\`\`bash
curl -X PATCH "https://mujarrad.onrender.com/api/spaces/{slug}/nodes/{pageId}/children/reorder" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "orderedChildIds": ["uuid-1", "uuid-3", "uuid-2"] }'
\`\`\`

## Listing Blocks

\`\`\`bash
curl "https://mujarrad.onrender.com/api/nodes/{parentId}/children" \\
  -H "Authorization: Bearer $TOKEN"
\`\`\`
`,

  'the-void': `# The Void

The Void is your personal, private holding area for notes that don't belong to any space yet. Think of it as your inbox or scratchpad.

## Void Rules

- Every user has their own Void (private, no one else can see it)
- Notes in The Void cannot have relationships
- Notes can be moved to a space later via "assign"
- Only REGULAR and CONTEXT nodes allowed (no ATTRIBUTE)

## Using The Void

\`\`\`bash
# Create a quick note
curl -X POST https://mujarrad.onrender.com/api/void/nodes \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "title": "Quick thought" }'

# List your void notes
curl "https://mujarrad.onrender.com/api/void/nodes?page=0&size=20" \\
  -H "Authorization: Bearer $TOKEN"

# Assign to a space + context
curl -X POST "https://mujarrad.onrender.com/api/void/nodes/{nodeId}/assign" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "spaceId": "uuid", "contextId": "uuid" }'
\`\`\`
`,

  'the-blank': `# The Blank (Context-Less)

The Blank is the default context in every space. When a node is created without specifying a context, it lands in The Blank.

## Blank Rules

- Every space has exactly one Blank (auto-created, cannot be deleted)
- Nodes in The Blank can be assigned to a proper context later
- The Blank is a safety net — no node is ever truly orphaned

## Managing Blank Nodes

\`\`\`bash
# List unorganized nodes
curl "https://mujarrad.onrender.com/api/spaces/{slug}/blank/nodes?page=0&size=20" \\
  -H "Authorization: Bearer $TOKEN"

# Count unorganized nodes
curl "https://mujarrad.onrender.com/api/spaces/{slug}/blank/count" \\
  -H "Authorization: Bearer $TOKEN"

# Assign a node to a context
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/blank/assign" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "nodeId": "uuid", "contextSlug": "tasks" }'

# Bulk assign
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/blank/assign-bulk" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "nodeIds": ["uuid-1", "uuid-2"], "contextSlug": "tasks" }'
\`\`\`
`,

  'locking': `# Locking

Mujarrad has a 4-level lock hierarchy that controls what can be edited.

## The 4-Level Lock Hierarchy

\`\`\`
Level 1: Space Lock    → EVERYTHING frozen
Level 2: Schema Lock   → CONTEXT nodes frozen, data free (BACKEND+PRODUCTION)
Level 3: Node Lock     → Individual node frozen
Level 4: Attribute Lock → Individual relationship frozen
\`\`\`

Each level overrides the ones below it. Read operations always work at every level.

## Node Lock Levels

| Level | Title/Content | Relationships | Move/Delete |
|-------|--------------|---------------|-------------|
| **UNLOCKED** | Editable | Modifiable | Allowed |
| **CONTENT_LOCKED** | Frozen | Modifiable | Blocked |
| **FULLY_LOCKED** | Frozen | Frozen | Blocked |

## Schema Lock (BACKEND spaces)

When a BACKEND space is in PRODUCTION mode:
- **CONTEXT nodes are frozen** — you cannot edit, delete, or create new contexts
- **Blocks inside CONTEXT nodes are frozen** — no schema field changes
- **REGULAR nodes are free** — create, edit, delete data instances normally
- To edit the schema, switch to CONFIGURATION mode

## Effective Lock Level

Every node response includes:
- \`lockLevel\` — the node's own explicit lock
- \`effectiveLockLevel\` — the computed lock considering space, schema, and parent
- \`lockInherited\` — true if the lock comes from somewhere above
- \`lockSource\` — where: "space", "schema", "parent", or "self"

## Locking Endpoints

\`\`\`bash
# Lock a node
curl -X PATCH "https://mujarrad.onrender.com/api/spaces/{slug}/nodes/{id}/lock" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "lockLevel": "CONTENT_LOCKED" }'

# Unlock a node
curl -X PATCH "https://mujarrad.onrender.com/api/spaces/{slug}/nodes/{id}/unlock" \\
  -H "Authorization: Bearer $TOKEN"

# Lock entire space
curl -X PATCH "https://mujarrad.onrender.com/api/spaces/{slug}/lock" \\
  -H "Authorization: Bearer $TOKEN"

# Unlock space
curl -X PATCH "https://mujarrad.onrender.com/api/spaces/{slug}/unlock" \\
  -H "Authorization: Bearer $TOKEN"
\`\`\`
`,

  'relationships': `# Relationships (Attributes)

An attribute is a relationship between two nodes.

## Attribute Types

| Type | Meaning |
|------|---------|
| **CONTAINS** | Parent-child containment (Context→Node, Page→Block) |
| **REFERENCES** | Cross-reference (Node→Node) |
| **RELATES_TO** | Generic relationship |
| **DEPENDS_ON** | Dependency |

## Creating Attributes

\`\`\`bash
curl -X POST "https://mujarrad.onrender.com/api/nodes/{sourceId}/attributes" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "targetNodeId": "target-uuid",
    "attributeName": "references",
    "attributeType": "REFERENCES"
  }'
\`\`\`

## Cross-Space Connections (Virtual Contexts)

Nodes in different spaces can be connected via Virtual Contexts:

\`\`\`bash
# Create a virtual context (bridge between spaces)
curl -X POST https://mujarrad.onrender.com/api/virtual-contexts \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "CRM <> Finance", "ownerSpaceId": "uuid" }'

# Add the other space
curl -X POST "https://mujarrad.onrender.com/api/virtual-contexts/{id}/members" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "spaceId": "other-space-uuid", "role": "CONTRIBUTOR" }'

# Create cross-space connection
curl -X POST "https://mujarrad.onrender.com/api/virtual-contexts/{id}/attributes" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "sourceNodeId": "node-in-space-A",
    "targetNodeId": "node-in-space-B",
    "attributeName": "relates_to",
    "attributeType": "RELATES_TO"
  }'
\`\`\`

## Attribute Promotion

Attributes can be "promoted" to become first-class nodes:

\`\`\`bash
curl -X POST "https://mujarrad.onrender.com/api/spaces/{spaceSlug}/attributes/{attributeId}/promote" \\
  -H "Authorization: Bearer $TOKEN"
\`\`\`

The promoted node has \`nodeType: ATTRIBUTE\` and can participate in graph traversal with its own attributes.
`,

  'migration': `# Node Migration

Migration copies a node to another space. The original stays in place. The copy gets a fresh ID.

## Migrate a Node

\`\`\`bash
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/nodes/{nodeId}/migrate" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "targetSpaceId": "uuid",
    "targetContextId": "uuid",
    "includeReference": true
  }'
\`\`\`

## Response

\`\`\`json
{
  "original": { "...unchanged node..." },
  "copy": { "...new node in target space..." },
  "referenceAttributeId": "uuid (link from copy to original)"
}
\`\`\`

## Migration Rules

- Original node stays untouched with all its relationships
- Copy gets a new UUID (standard creation flow)
- All child blocks are copied atomically with the parent
- Blocks cannot be migrated independently
- Cross-organization migration is blocked

> **Note:** Migration replaces the old move functionality. \`POST /spaces/{slug}/nodes/{id}/move\` is deprecated — use \`/migrate\` instead.
`,

  'pagination': `# Pagination

Every list endpoint returns paginated responses.

## PageResponse Shape

\`\`\`json
{
  "content": [ "...items..." ],
  "totalElements": 150,
  "totalPages": 8,
  "page": 0,
  "size": 20
}
\`\`\`

## Parameters

| Parameter | Default | Max | Description |
|-----------|---------|-----|-------------|
| \`page\` | 0 | — | Page number (0-indexed) |
| \`size\` | 20 | 100 | Items per page |

## Example

\`\`\`bash
curl "https://mujarrad.onrender.com/api/spaces/my-space/nodes?page=0&size=50" \\
  -H "Authorization: Bearer $TOKEN"
\`\`\`

> **Breaking change:** All list endpoints now return the \`PageResponse\` wrapper object, not raw arrays.
`,

  'release-notes': `# Release Notes — v1.0

Features 014 + Batch 015 + Batch 016

## New Features

- **Organizations** — INDIVIDUAL (auto) + TEAM (manual) with OWNER/ADMIN/MEMBER roles
- **The Void** — personal spaceless holding area for quick notes
- **The Blank** — per-space default context for unorganized nodes
- **Context-Scoped Access** — create/read nodes through their parent context
- **Block Architecture** — parent-child nodes with \`parent_node_id\`, atomic creation
- **Node Migration** — copy nodes between spaces (replaces move)
- **Schema Lock** — 4-level cascade: space → schema → node → attribute
- **Virtual Contexts** — cross-space connections stored as CONTEXT nodes
- **Nested Contexts** — contexts inside contexts
- **Schema Enforcement** — NONE/WARN/STRICT on context types
- **Pagination** — ALL list endpoints return PageResponse

## Infrastructure

- 7 database migrations (V031-V039)
- Centralized ResponseMapper — consistent 18-field NodeResponse across all endpoints
- SlugUtils — Unicode-aware slug generation
- JWT issuer validation — federation-ready token security
- 923 tests passing, 0 failures

## Breaking Changes

- \`ASSUMPTION\` node type removed → use \`REGULAR\`
- All list endpoints return \`{ content: [...], totalElements, ... }\` not raw arrays
- Flat \`POST /spaces/{slug}/nodes\` creates in The Blank (not orphaned)
- Blocks (\`nodeDetails.blockType\`) rejected on flat endpoint — use \`/nodes/{parentId}/children\`

## Deprecations

- \`POST /spaces/{slug}/nodes/{id}/move\` → use \`/migrate\` instead
- \`NodeMoveService\` marked \`@Deprecated(forRemoval = true)\`
`,
};

// Swagger tags mapping for each documentation section
const swaggerTags: Record<string, { tag: string; title: string }[]> = {
  'organizations': [{ tag: 'organization', title: 'Organization' }],
  'spaces': [{ tag: 'space', title: 'Space' }],
  'contexts': [{ tag: 'context', title: 'Context' }],
  'nodes': [{ tag: 'node', title: 'Node' }],
  'blocks': [{ tag: 'node', title: 'Node (Blocks)' }],
  'the-void': [{ tag: 'void', title: 'Void' }],
  'the-blank': [{ tag: 'blank', title: 'Blank' }],
  'locking': [{ tag: 'node', title: 'Node (Locking)' }],
  'relationships': [
    { tag: 'attribute', title: 'Attribute' },
    { tag: 'virtual-context', title: 'Virtual Context' },
  ],
  'migration': [{ tag: 'node', title: 'Node (Migration)' }],
};

// Navigation structure
const navSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Rocket,
    items: [
      { id: 'introduction', title: 'Introduction' },
    ],
  },
  {
    id: 'core-concepts',
    title: 'Core Concepts',
    icon: Layers,
    items: [
      { id: 'organizations', title: 'Organizations' },
      { id: 'spaces', title: 'Spaces' },
      { id: 'contexts', title: 'Contexts' },
      { id: 'nodes', title: 'Nodes' },
      { id: 'blocks', title: 'Blocks' },
    ],
  },
  {
    id: 'special-areas',
    title: 'Special Areas',
    icon: Shield,
    items: [
      { id: 'the-void', title: 'The Void' },
      { id: 'the-blank', title: 'The Blank' },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    icon: Lock,
    items: [
      { id: 'locking', title: 'Locking' },
      { id: 'relationships', title: 'Relationships' },
      { id: 'migration', title: 'Migration' },
    ],
  },
  {
    id: 'reference',
    title: 'Reference',
    icon: Code,
    items: [
      { id: 'pagination', title: 'Pagination' },
      { id: 'release-notes', title: 'Release Notes' },
    ],
  },
];

export default function DocsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('introduction');
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleNavClick = (itemId: string, sectionId: string) => {
    setActiveSection(itemId);
    if (!expandedSections.includes(sectionId)) {
      setExpandedSections([...expandedSections, sectionId]);
    }
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Mobile header */}
      <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 border-b border-[#e5e5e5] bg-[#fafafa] px-4 py-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-md hover:bg-[#f0f0f0] transition-colors"
        >
          {sidebarOpen ? <X className="size-5 text-[#4f4f4f]" /> : <Menu className="size-5 text-[#4f4f4f]" />}
        </button>
        <Book className="size-4 text-[#4f4f4f]" />
        <span className="font-['Roboto:Medium',sans-serif] font-medium text-[14px] text-[#333]">Documentation</span>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "w-[280px] border-r border-[#e5e5e5] overflow-y-auto bg-[#fafafa] z-20",
          "md:sticky md:top-0 md:h-screen md:block",
          "fixed top-0 left-0 h-full transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 border-b border-[#e5e5e5]">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[13px] text-[#828282] hover:text-[#4f4f4f] transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <Book className="size-5 text-[#4f4f4f]" />
            <span className="font-['Roboto:Medium',sans-serif] font-medium text-[15px] text-[#333]">
              Documentation
            </span>
          </div>

          <nav className="space-y-1">
            {navSections.map((section) => {
              const IconComponent = section.icon;
              const isExpanded = expandedSections.includes(section.id);
              const hasActiveItem = section.items.some((item) => item.id === activeSection);

              return (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors",
                      hasActiveItem ? "bg-[#f0f0f0]" : "hover:bg-[#f5f5f5]"
                    )}
                  >
                    <IconComponent className="size-4 text-[#828282]" />
                    <span className="flex-1 font-['Roboto:Medium',sans-serif] font-medium text-[13px] text-[#4f4f4f]">
                      {section.title}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="size-4 text-[#828282]" />
                    ) : (
                      <ChevronRight className="size-4 text-[#828282]" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-0.5">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id, section.id)}
                          className={cn(
                            "w-full text-left px-3 py-1.5 rounded-md text-[13px] transition-colors",
                            activeSection === item.id
                              ? "bg-[#333] text-white"
                              : "text-[#828282] hover:text-[#4f4f4f] hover:bg-[#f5f5f5]"
                          )}
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        <div className="max-w-[850px] mx-auto px-4 py-6 md:px-8 md:py-10">
          <MarkdownRenderer
            content={docsContent[activeSection] || '# Page not found\n\nThis documentation page does not exist.'}
            className="docs-content"
          />

          {/* Live API Documentation from Swagger */}
          {swaggerTags[activeSection] && (
            <div className="mt-10 space-y-4">
              <h2 className="text-xl font-semibold text-[#333] border-b border-[#e5e5e5] pb-2">
                Live API Reference
              </h2>
              <p className="text-sm text-[#828282] mb-4">
                Interactive API endpoints fetched from the live Swagger documentation.
              </p>
              {swaggerTags[activeSection].map((swagger) => (
                <SwaggerEmbed
                  key={swagger.tag}
                  tag={swagger.tag}
                  title={swagger.title}
                  className="mb-4"
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}