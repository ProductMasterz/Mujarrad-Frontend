# Nodes

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

## 4 Creation Paths

| Path | What happens |
|------|-------------|
| `POST /spaces/{slug}/contexts/{ctx}/nodes` | Node created in the specified context (**recommended**) |
| `POST /spaces/{slug}/nodes` | Node created in The Blank (catch-all) |
| `POST /void/nodes` | Node created in The Void (personal, spaceless) |
| `POST /spaces/{slug}/nodes/{parentId}/children` | Block created inside a parent node |

## Creating a Node

```bash
# In a specific context (recommended)
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/contexts/{ctx}/nodes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Document",
    "content": "Document content here.",
    "nodeType": "REGULAR",
    "nodeDetails": {
      "status": "draft",
      "priority": "high"
    }
  }'
```

## Using nodeDetails

The `nodeDetails` JSONB field allows flexible custom properties:

```json
{
  "nodeDetails": {
    "status": "in-progress",
    "priority": "high",
    "tags": ["urgent", "client-facing"],
    "dueDate": "2025-03-15"
  }
}
```
