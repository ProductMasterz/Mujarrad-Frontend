## 1. Types & Service Layer
- [x] 1.1 Add API key TypeScript types to `src/types/` (`ApiKeyResponse`, `ApiKeyListResponse`, `ApiKeyCreateRequest`, `ApiKeyRotateRequest`)
- [x] 1.2 Create `src/services/api/api-key.service.ts` with methods: `listKeys`, `createKey`, `getKey`, `rotateKey`, `revokeKey`

## 2. React Query Hooks
- [x] 2.1 Create `src/hooks/api/useApiKeys.ts` with query key factory (`apiKeyKeys`)
- [x] 2.2 Implement `useApiKeys` query hook (list keys, with `activeOnly` filter option)
- [x] 2.3 Implement `useCreateApiKey` mutation hook (invalidates list on success)
- [x] 2.4 Implement `useRotateApiKey` mutation hook (invalidates list on success)
- [x] 2.5 Implement `useRevokeApiKey` mutation hook (optimistic removal from list)

## 3. Settings Page Route
- [x] 3.1 Create `app/settings/page.tsx` with basic layout (header, content area)
- [x] 3.2 Wrap with `ProtectedRoute` to require authentication
- [x] 3.3 Add "Settings" link to `UserMenu.tsx` dropdown (replace/augment "View profile" placeholder)

## 4. API Key UI Components
- [x] 4.1 Create `src/components/settings/ApiKeyList.tsx` - table with columns: name, public key (masked), created, last used, expires, status, actions
- [x] 4.2 Create `src/components/settings/ApiKeyEmptyState.tsx` - empty state with "Create your first API key" prompt
- [x] 4.3 Create `src/components/settings/CreateApiKeyDialog.tsx` - form with: name (required), description, space selector, expiration date picker
- [x] 4.4 Create `src/components/settings/ApiKeySecretDisplay.tsx` - one-time secret display with copy button, warning text, and "I've saved my key" confirmation
- [x] 4.5 Create `src/components/settings/RotateApiKeyDialog.tsx` - current secret input + confirmation, then shows new secret via `ApiKeySecretDisplay`
- [x] 4.6 Create `src/components/settings/RevokeApiKeyDialog.tsx` - confirmation dialog with key name displayed

## 5. Integration & Polish
- [x] 5.1 Wire components together on Settings page (ApiKeyList + dialogs)
- [x] 5.2 Add loading skeletons for key list
- [x] 5.3 Add error handling with toast notifications for API failures
- [x] 5.4 Add clipboard copy feedback (toast or inline indicator)
- [x] 5.5 Test full flow: create key, copy secret, view in list, rotate, revoke
