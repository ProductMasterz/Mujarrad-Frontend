# The Void

The Void is your personal, private holding area for notes that don't belong to any space yet. Think of it as your inbox or scratchpad.

## Void Rules

- Every user has their own Void (private, no one else can see it)
- Notes in The Void cannot have relationships
- Notes can be moved to a space later via "assign"
- Only REGULAR and CONTEXT nodes allowed (no ATTRIBUTE)

## Using The Void

```bash
# Create a quick note
curl -X POST https://mujarrad.onrender.com/api/void/nodes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Quick thought" }'

# List your void notes
curl "https://mujarrad.onrender.com/api/void/nodes?page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"

# Assign to a space + context
curl -X POST "https://mujarrad.onrender.com/api/void/nodes/{nodeId}/assign" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "spaceId": "uuid", "contextId": "uuid" }'
```
