'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';

const apiKeyDocs = `# API Key Authentication

API keys provide programmatic access to the Mujarrad API for B2B integrations and automated workflows.

## Creating an API Key

**Endpoint:** \`POST /api/api-keys\`
**Auth:** Bearer JWT token required

\`\`\`json
{
  "name": "My Integration Key",
  "description": "Used for syncing data with external service",
  "spaceId": "optional-uuid-for-space-scoping",
  "expiresAt": "2026-06-01T00:00:00Z"
}
\`\`\`

- \`name\` (required): 1-255 characters
- \`description\` (optional): up to 5000 characters
- \`spaceId\` (optional): restricts the key to a single space
- \`expiresAt\` (optional): ISO-8601 datetime; if omitted, key never expires

**Response (201):**

\`\`\`json
{
  "id": "uuid",
  "publicKey": "pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "secretKey": "sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "name": "My Integration Key",
  "description": "Used for syncing data with external service",
  "spaceId": null,
  "isActive": true,
  "expiresAt": "2026-06-01T00:00:00Z",
  "lastUsedAt": null,
  "createdAt": "2026-01-23T00:00:00Z",
  "updatedAt": "2026-01-23T00:00:00Z"
}
\`\`\`

> **Important:** The \`secretKey\` is only shown once in this response. Store it securely.

## Using an API Key

Once you have your public and secret keys, include them in your API requests using one of two methods:

### Method 1: Separate Headers (Recommended)

\`\`\`
X-API-Key: pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
X-API-Secret: sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

### Method 2: Combined Authorization Header

\`\`\`
Authorization: ApiKey pk_live_xxx:sk_live_xxx
\`\`\`

### Example: curl

\`\`\`bash
curl -X GET https://your-api.onrender.com/api/spaces \\
  -H "X-API-Key: pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \\
  -H "X-API-Secret: sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
\`\`\`

### Example: JavaScript (axios)

\`\`\`javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://your-api.onrender.com',
  headers: {
    'X-API-Key': 'pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'X-API-Secret': 'sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  }
});

const response = await api.get('/api/spaces');
\`\`\`

## Scoping

- **User-level key** (\`spaceId\` omitted): can access all spaces the user owns.
- **Space-scoped key** (\`spaceId\` provided): can only access that specific space.

## Key Limits

- Maximum **10 API keys** per user.

## Managing API Keys

### List Keys

\`\`\`
GET /api/api-keys
GET /api/api-keys?activeOnly=true
\`\`\`

Returns metadata only (no secret keys).

### Get a Specific Key

\`\`\`
GET /api/api-keys/{keyId}
\`\`\`

### Revoke a Key

\`\`\`
DELETE /api/api-keys/{keyId}
\`\`\`

Revoked keys cannot be reactivated. Create a new key instead.

### Rotate a Key's Secret

\`\`\`
POST /api/api-keys/{keyId}/rotate
\`\`\`

\`\`\`json
{
  "currentSecretKey": "sk_live_your_current_secret"
}
\`\`\`

This generates a new secret key while keeping the same public key, allowing zero-downtime rotation for integrations that reference the public key.

## Error Responses

| Status | Meaning |
|--------|---------|
| 401 | Invalid/missing API key, expired key, or revoked key |
| 403 | Key does not have access to the requested resource |
| 404 | Requested resource not found |

Error body format:

\`\`\`json
{
  "error": "API key is expired",
  "timestamp": "2026-01-23T00:00:00Z"
}
\`\`\`
`;

export default function DocsPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <div className="max-w-[800px] mx-auto px-6 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[13px] text-[#828282] hover:text-[#4f4f4f] transition-colors mb-6"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <MarkdownRenderer content={apiKeyDocs} className="docs-content" />
        </div>
      </div>
    </ProtectedRoute>
  );
}
