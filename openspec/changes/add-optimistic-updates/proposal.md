# Change: Add Optimistic Updates to CRUD Operations

## Why
Current CRUD operations wait for API responses before updating the UI, causing noticeable delays and poor user experience. Users see a "loading" state for every create, update, and delete operation, making the app feel sluggish compared to modern applications like Notion or Linear.

## What Changes
- Implement optimistic updates for Space CRUD operations
- Implement optimistic updates for Node CRUD operations
- Add rollback logic for failed mutations
- Standardize optimistic update patterns across all mutation hooks

## Impact
- Affected specs: crud-operations
- Affected code:
  - `src/hooks/api/useSpaces.ts`
  - `src/hooks/api/useNodes.ts`
  - Query cache manipulation patterns
