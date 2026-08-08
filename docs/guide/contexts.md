# Contexts

A context is a node of type `CONTEXT` that organizes other nodes inside a space.

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

```
CONTEXT "Organization" (= the class)
  ├── Block: "name"       → STRING, required
  ├── Block: "email"      → STRING, format: email
  ├── Block: "industry"   → ENUM: tech/finance/health
  └── Block: "founded"    → DATE

REGULAR nodes inside → instances of the class
  ├── "Acme Corp"   → {name: "Acme", email: "info@acme.com"}
  ├── "Beta Inc"    → {name: "Beta", email: "hi@beta.io"}
  └── "Gamma LLC"   → {name: "Gamma", email: "g@gamma.com"}
```

## Schema Enforcement

Each context type has an `enforcement_mode`:

| Mode | What happens when you create/update a node |
|------|---------------------------------------------|
| **NONE** | No validation — context is organizational only |
| **WARN** | Validates data against schema, logs warnings but allows |
| **STRICT** | Validates and rejects non-conforming data with 400 |

## Nested Contexts

Contexts can contain other contexts:

```
CONTEXT "Projects"
  └── CONTEXT "Q4 Deliverables"
        └── CONTEXT "Sprint 12"
              └── Node: "Implement login"
```

Create nested contexts via:

```bash
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/contexts/{parentContextSlug}/contexts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Sprint 12", "nodeType": "CONTEXT" }'
```

## Creating Nodes in a Context (Recommended)

```bash
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/contexts/{contextSlug}/nodes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "My Task", "nodeType": "REGULAR", "nodeDetails": { "priority": 5 } }'
```

This is the recommended way. The system automatically:

- Creates a CONTAINS relationship from the context to the node
- Validates data against the context's schema (if BACKEND + STRICT)
- The node does NOT appear in The Blank
