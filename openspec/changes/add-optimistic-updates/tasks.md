# Tasks: Add Optimistic Updates to CRUD Operations

## 1. Space CRUD Optimistic Updates
- [ ] 1.1 Add optimistic update to `useCreateSpace` - immediately add to list with temp ID
- [ ] 1.2 Add optimistic update to `useUpdateSpace` - immediately update in cache
- [ ] 1.3 Add optimistic update to `useDeleteSpace` - immediately remove from list
- [ ] 1.4 Add rollback logic for each Space mutation on error

## 2. Node CRUD Optimistic Updates
- [ ] 2.1 Add optimistic update to `useCreateNode` - immediately add to hierarchy
- [ ] 2.2 Verify existing optimistic update in `useUpdateNode` - ensure rollback works
- [ ] 2.3 Add optimistic update to `useDeleteNode` - immediately remove from hierarchy
- [ ] 2.4 Add rollback logic for each Node mutation on error

## 3. Standardize Patterns
- [ ] 3.1 Create reusable optimistic update helper functions
- [ ] 3.2 Document optimistic update pattern in code comments
- [ ] 3.3 Add TypeScript types for optimistic update context

## 4. Testing
- [ ] 4.1 Write tests for optimistic update behavior
- [ ] 4.2 Write tests for rollback behavior on API errors
- [ ] 4.3 Test race condition handling
