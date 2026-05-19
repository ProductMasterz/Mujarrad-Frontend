## Context
The Mujarrad backend already provides complete API key management endpoints:
- `GET /api/api-keys` - List keys (with optional `activeOnly` filter)
- `POST /api/api-keys` - Create key (returns secret once)
- `GET /api/api-keys/{keyId}` - Get key details
- `POST /api/api-keys/{keyId}/rotate` - Rotate secret
- `DELETE /api/api-keys/{keyId}` - Revoke key

The frontend currently has no settings page or developer-facing UI. This change introduces a Settings page with API key management as its first section.

## Goals / Non-Goals
- Goals:
  - Provide a functional UI for developers to manage API keys
  - Follow existing codebase patterns (service layer, React Query hooks, Zustand if needed)
  - Secure handling of secrets (show once, copy to clipboard, never persist client-side)
  - Settings page that can be extended with more sections later
- Non-Goals:
  - API key usage analytics or dashboards
  - API key permission/scope management beyond space scoping
  - Developer documentation portal (separate effort)
  - Rate limiting UI (backend concern)

## Decisions

### Settings Page Location
- Decision: Add `/app/settings/page.tsx` with a tabbed layout
- Rationale: Standard pattern, extensible for future sections (Profile, Preferences, etc.)
- The first (and initially only) tab will be "API Keys"

### Navigation Entry Point
- Decision: Add "Settings" link in UserMenu dropdown
- Rationale: UserMenu already has a non-functional "View profile" placeholder; replace/augment with Settings link
- Route: `/settings`

### Component Architecture
- Decision: Feature-based components in `src/components/settings/`
  - `ApiKeyList.tsx` - Table of existing keys
  - `CreateApiKeyDialog.tsx` - Modal form for creating new keys
  - `ApiKeySecretDisplay.tsx` - One-time secret display with copy button
  - `RotateApiKeyDialog.tsx` - Confirmation + current secret input for rotation
  - `RevokeApiKeyDialog.tsx` - Confirmation dialog for deletion
- Rationale: Matches existing component organization patterns

### Service Layer
- Decision: New `src/services/api/api-key.service.ts` with typed methods
- Rationale: Follows existing pattern (auth.service.ts, space.service.ts, etc.)

### Data Fetching
- Decision: React Query hooks in `src/hooks/api/useApiKeys.ts`
- Rationale: Matches existing pattern (useSpaces.ts, useNodes.ts)
- Query key factory: `apiKeyKeys` object

### Secret Handling
- Decision: Secret shown in a modal immediately after creation, with copy-to-clipboard button. Never stored in state after modal closes.
- Rationale: Security best practice - secrets should be ephemeral in the UI

## Risks / Trade-offs
- Risk: User closes secret modal before copying → Mitigation: Clear warning text, require explicit "I've copied it" confirmation before closing
- Risk: Settings page adds a new route outside the `/spaces` hierarchy → Mitigation: Keep navigation simple, breadcrumb shows "Settings > API Keys"

## Open Questions
- None - backend API is stable and well-defined
