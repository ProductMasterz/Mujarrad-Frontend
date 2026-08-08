# Mujarrad Developer Documentation

Welcome to the Mujarrad documentation. This guide covers everything you need to know to build on the Mujarrad platform.

## What is Mujarrad?

Mujarrad is a **knowledge graph backend** — a universal data platform where everything is a **node** and every relationship is an **attribute**. It can be used in two modes:

- **CONSUMER mode** — organize information freely (notes, documents, tasks, ideas)
- **BACKEND mode** — define structured data schemas (like building a database with classes and instances)

## The Hierarchy

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

## Quick Start

```bash
# 1. Register
curl -X POST https://mujarrad.onrender.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{ "email": "dev@example.com", "username": "dev", "password": "SecurePass123!" }'

# 2. Login
curl -X POST https://mujarrad.onrender.com/api/users/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "dev@example.com", "password": "SecurePass123!" }'
# Save the token:
export TOKEN="eyJhbGciOiJIUzI1NiJ9..."

# 3. Create a space
curl -X POST https://mujarrad.onrender.com/api/spaces \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "My CRM", "projectType": "BACKEND" }'

# 4. Create a node
curl -X POST "https://mujarrad.onrender.com/api/spaces/my-crm/nodes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "First Record", "nodeType": "REGULAR" }'

# 5. Swagger UI
open https://mujarrad.onrender.com/swagger-ui/index.html
```
