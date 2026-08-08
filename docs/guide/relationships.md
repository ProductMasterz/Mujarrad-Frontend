# Relationships (Attributes)

An attribute is a relationship between two nodes.

## Attribute Types

| Type | Meaning |
|------|---------|
| **CONTAINS** | Parent-child containment (Context→Node, Page→Block) |
| **REFERENCES** | Cross-reference (Node→Node) |
| **RELATES_TO** | Generic relationship |
| **DEPENDS_ON** | Dependency |

## Creating Attributes

```bash
curl -X POST "https://mujarrad.onrender.com/api/nodes/{sourceId}/attributes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetNodeId": "target-uuid",
    "attributeName": "references",
    "attributeType": "REFERENCES"
  }'
```

## Cross-Space Connections (Virtual Contexts)

Nodes in different spaces can be connected via Virtual Contexts:

```bash
# Create a virtual context (bridge between spaces)
curl -X POST https://mujarrad.onrender.com/api/virtual-contexts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "CRM <> Finance", "ownerSpaceId": "uuid" }'

# Add the other space
curl -X POST "https://mujarrad.onrender.com/api/virtual-contexts/{id}/members" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "spaceId": "other-space-uuid", "role": "CONTRIBUTOR" }'

# Create cross-space connection
curl -X POST "https://mujarrad.onrender.com/api/virtual-contexts/{id}/attributes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceNodeId": "node-in-space-A",
    "targetNodeId": "node-in-space-B",
    "attributeName": "relates_to",
    "attributeType": "RELATES_TO"
  }'
```

## Attribute Promotion

Attributes can be "promoted" to become first-class nodes:

```bash
curl -X POST "https://mujarrad.onrender.com/api/spaces/{spaceSlug}/attributes/{attributeId}/promote" \
  -H "Authorization: Bearer $TOKEN"
```

The promoted node has `nodeType: ATTRIBUTE` and can participate in graph traversal with its own attributes.
