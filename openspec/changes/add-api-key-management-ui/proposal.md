# Change: Add API Key Management UI

## Why
Developers need a UI to create, view, rotate, and revoke API keys so they can integrate their applications with the Mujarrad backend. The backend already exposes full CRUD endpoints for API keys (`/api/api-keys`), but there is no frontend UI to interact with them.

## What Changes
- Add a new Settings page accessible from the UserMenu
- Add an "API Keys" section within Settings where developers can:
  - View a list of their active API keys (name, public key prefix, created date, last used, expiration)
  - Create new API keys (with name, optional description, optional space scope, optional expiration)
  - Copy the secret key immediately after creation (shown only once)
  - Rotate an existing key's secret (zero-downtime rotation)
  - Revoke (delete) an API key with confirmation
- Add API key service layer (`api-key.service.ts`) and React Query hooks
- Add TypeScript types for API key DTOs

## Impact
- Affected specs: New `api-key-management` capability
- Affected code:
  - `src/services/api/` - new `api-key.service.ts`
  - `src/hooks/api/` - new `useApiKeys.ts`
  - `src/types/` - API key type definitions
  - `src/components/settings/` - new settings components
  - `app/settings/` - new settings page route
  - `src/shell/components/UserMenu.tsx` - add Settings navigation
