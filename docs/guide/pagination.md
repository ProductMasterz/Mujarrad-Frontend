# Pagination

Every list endpoint returns paginated responses.

## PageResponse Shape

```json
{
  "content": [ "...items..." ],
  "totalElements": 150,
  "totalPages": 8,
  "page": 0,
  "size": 20
}
```

## Parameters

| Parameter | Default | Max | Description |
|-----------|---------|-----|-------------|
| `page` | 0 | — | Page number (0-indexed) |
| `size` | 20 | 100 | Items per page |

## Example

```bash
curl "https://mujarrad.onrender.com/api/spaces/my-space/nodes?page=0&size=50" \
  -H "Authorization: Bearer $TOKEN"
```

> **Breaking change:** All list endpoints now return the `PageResponse` wrapper object, not raw arrays.
