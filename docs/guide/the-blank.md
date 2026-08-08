# The Blank (Context-Less)

The Blank is the default context in every space. When a node is created without specifying a context, it lands in The Blank.

## Blank Rules

- Every space has exactly one Blank (auto-created, cannot be deleted)
- Nodes in The Blank can be assigned to a proper context later
- The Blank is a safety net — no node is ever truly orphaned

## Managing Blank Nodes

```bash
# List unorganized nodes
curl "https://mujarrad.onrender.com/api/spaces/{slug}/blank/nodes?page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"

# Count unorganized nodes
curl "https://mujarrad.onrender.com/api/spaces/{slug}/blank/count" \
  -H "Authorization: Bearer $TOKEN"

# Assign a node to a context
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/blank/assign" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "nodeId": "uuid", "contextSlug": "tasks" }'

# Bulk assign
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/blank/assign-bulk" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "nodeIds": ["uuid-1", "uuid-2"], "contextSlug": "tasks" }'
```
