# Locking

Mujarrad has a 4-level lock hierarchy that controls what can be edited.

## The 4-Level Lock Hierarchy

```
Level 1: Space Lock     → EVERYTHING frozen
Level 2: Schema Lock    → CONTEXT nodes frozen, data free (BACKEND+PRODUCTION)
Level 3: Node Lock      → Individual node frozen
Level 4: Attribute Lock → Individual relationship frozen
```

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

- `lockLevel` — the node's own explicit lock
- `effectiveLockLevel` — the computed lock considering space, schema, and parent
- `lockInherited` — true if the lock comes from somewhere above
- `lockSource` — where: "space", "schema", "parent", or "self"

## Locking Endpoints

```bash
# Lock a node
curl -X PATCH "https://mujarrad.onrender.com/api/spaces/{slug}/nodes/{id}/lock" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "lockLevel": "CONTENT_LOCKED" }'

# Unlock a node
curl -X PATCH "https://mujarrad.onrender.com/api/spaces/{slug}/nodes/{id}/unlock" \
  -H "Authorization: Bearer $TOKEN"

# Lock entire space
curl -X PATCH "https://mujarrad.onrender.com/api/spaces/{slug}/lock" \
  -H "Authorization: Bearer $TOKEN"

# Unlock space
curl -X PATCH "https://mujarrad.onrender.com/api/spaces/{slug}/unlock" \
  -H "Authorization: Bearer $TOKEN"
```
