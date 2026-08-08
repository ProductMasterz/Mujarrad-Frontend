# Blocks (Child Nodes)

A block is a node that lives inside another node. Think of a page with paragraphs, headings, code blocks — each is a block node.

## Block Rules

- Blocks can ONLY be created via `POST /nodes/{parentId}/children`
- Blocks NEVER appear in space listings, context listings, graph views, or search
- Blocks ONLY appear when you list a parent's children: `GET /nodes/{parentId}/children`
- Blocks inherit their parent's lock level
- Blocks cannot have cross-space connections
- Blocks migrate atomically with their parent

## Block Types

Stored in `nodeDetails.blockType`:

| Block Type | Description |
|-----------|-------------|
| `text` | Paragraph |
| `heading_1`, `heading_2`, `heading_3` | Headings |
| `bullet_list`, `numbered_list` | Lists |
| `todo` | Checkbox item |
| `quote` | Blockquote |
| `code` | Code block |
| `math` | LaTeX / math equation |
| `mermaid` | Mermaid diagram |
| `callout` | Info / warning / note callout |
| `image` | Image |
| `divider` | Horizontal rule |

## Creating a Block

```bash
curl -X POST "https://mujarrad.onrender.com/api/spaces/{slug}/nodes/{pageId}/children" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Block 1",
    "nodeType": "REGULAR",
    "content": "Hello world",
    "nodeDetails": { "blockType": "text" }
  }'
```

## Reordering Blocks

```bash
curl -X PATCH "https://mujarrad.onrender.com/api/spaces/{slug}/nodes/{pageId}/children/reorder" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "orderedChildIds": ["uuid-1", "uuid-3", "uuid-2"] }'
```

## Listing Blocks

```bash
curl "https://mujarrad.onrender.com/api/nodes/{parentId}/children" \
  -H "Authorization: Bearer $TOKEN"
```
