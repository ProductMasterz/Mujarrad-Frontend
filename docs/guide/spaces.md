# Spaces

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

```bash
curl -X POST https://mujarrad.onrender.com/api/spaces \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "My CRM", "projectType": "BACKEND" }'
```

The system auto-creates a **Context-Less** context (The Blank) inside every space.

If you don't specify an `organizationId`, the space goes to your INDIVIDUAL organization.

## System Spaces (hidden, automatic)

| Space | Purpose | Visible? |
|-------|---------|----------|
| **Void space** | Your personal quick-notes area | No — accessed via `/api/void/nodes` |
| **Meta-space** | System infrastructure (virtual contexts) | No — never shown |
| **Regular spaces** | Your data | Yes |

## Switching Modes

```bash
# Switch to PRODUCTION (lock schema)
curl -X PATCH "https://mujarrad.onrender.com/api/spaces/{spaceId}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "mode": "PRODUCTION" }'

# Switch to CONFIGURATION (unlock schema)
curl -X PATCH "https://mujarrad.onrender.com/api/spaces/{spaceId}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "mode": "CONFIGURATION" }'
```

> **Note:** Only the space owner can switch modes.
