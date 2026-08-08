# Node Migration

Migration copies a node to another space. The original stays in place. The copy gets a fresh ID.

## Migrate a Node

```bash
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/nodes/{nodeId}/migrate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetSpaceId": "uuid",
    "targetContextId": "uuid",
    "includeReference": true
  }'
```

## Response

```json
{
  "original": { "...unchanged node..." },
  "copy": { "...new node in target space..." },
  "referenceAttributeId": "uuid (link from copy to original)"
}
```

## Migration Rules

- Original node stays untouched with all its relationships
- Copy gets a new UUID (standard creation flow)
- All child blocks are copied atomically with the parent
- Blocks cannot be migrated independently
- Cross-organization migration is blocked

> **Note:** Migration replaces the old move functionality. `POST /spaces/{slug}/nodes/{id}/move` is deprecated — use `/migrate` instead.
