# Building a BACKEND Application

This walkthrough shows how to use Mujarrad as a structured backend — defining a schema, freezing it, and creating validated data instances — and then how the same primitives serve a free-form CONSUMER application.

## Step-by-step (BACKEND)

```bash
# 1. Sign up → INDIVIDUAL org + meta-space auto-created

# 2. Create a BACKEND space (starts in CONFIGURATION mode)
curl -X POST https://mujarrad.onrender.com/api/spaces \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "My CRM", "projectType": "BACKEND" }'

# 3. Define your schema (create CONTEXT nodes = classes)
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/contexts/{ctx}/contexts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Organizations", "nodeType": "CONTEXT" }'

curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/contexts/{ctx}/contexts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Contacts", "nodeType": "CONTEXT" }'

# 4. Add schema fields (create blocks inside CONTEXT nodes)
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/nodes/{contextId}/children" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "name",
    "nodeType": "REGULAR",
    "nodeDetails": { "blockType": "schema_field", "fieldType": "STRING", "required": true }
  }'

# 5. Switch to PRODUCTION mode (freeze the schema)
curl -X PATCH "https://mujarrad.onrender.com/api/spaces/{id}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "mode": "PRODUCTION" }'

# 6. Create data instances (validated against the schema)
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/contexts/organizations/nodes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Acme Corp", "nodeDetails": { "name": "Acme", "email": "info@acme.com" } }'

# 7. Query data
curl "https://mujarrad.onrender.com/api/spaces/{slug}/contexts/organizations/nodes?page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"
```

## Using as a CONSUMER Application

```bash
# 1. Create a CONSUMER space
curl -X POST https://mujarrad.onrender.com/api/spaces \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "My Notes" }'

# 2. Create contexts (organizational folders)
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/contexts/context-less/contexts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Work", "nodeType": "CONTEXT" }'

# 3. Create nodes inside contexts
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/contexts/work/nodes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Meeting notes", "nodeType": "REGULAR", "content": "# Meeting\n..." }'

# 4. Quick notes (no context needed) — assign to a space later
curl -X POST https://mujarrad.onrender.com/api/void/nodes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Quick thought" }'
```
