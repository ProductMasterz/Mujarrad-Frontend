# Research: Backend API Endpoint Synchronization

**Feature**: 005-did-changes-to
**Date**: 2025-10-13
**Status**: Complete

## Research Overview

All technical unknowns were resolved during the specification phase via direct analysis of the backend OpenAPI specification. This document consolidates key migration decisions and patterns for the space-to-space endpoint migration.

## 1. Space-to-Space Migration Pattern

### Decision
Rename all space-related files and update imports in a single atomic changeset.

### Rationale
- **Clean conceptual break**: Eliminates confusion between old space and new space terminology
- **Easier code review**: All changes visible in one PR, relationships clear
- **Prevents dual-path complexity**: No need to maintain both space and space concepts simultaneously
- **Simplifies testing**: Test the new pattern once, not gradual migration steps

###  Alternatives Considered

**Alternative 1: Gradual migration with type aliases**
```typescript
// Create aliases to maintain backward compatibility
type Space = Space;
const spaceService = spaceService;
```
- ❌ **Rejected**: Creates confusion - developers unsure which name to use
- ❌ **Rejected**: Dual paths increase maintenance burden
- ❌ **Rejected**: Extends migration timeline unnecessarily

**Alternative 2: Feature flag with conditional logic**
```typescript
const service = useFeatureFlag('spaces') ? spaceService : spaceService;
```
- ❌ **Rejected**: Adds runtime complexity for zero benefit
- ❌ **Rejected**: Backend has already migrated - no conditional needed
- ❌ **Rejected**: Feature flags better for new features, not renames

### Implementation Pattern
```typescript
// Before
import { spaceService } from '@/services/api/space.service';
const spaces = await spaceService.getSpaces();

// After
import { spaceService } from '@/services/api/space.service';
const spaces = await spaceService.getSpaces();
```

---

## 2. Slug-based Routing vs ID-based Routing

### Decision
Use space slugs for all node-related operations as required by the backend API.

### Rationale
- **Backend requirement**: Backend endpoints explicitly require `{spaceSlug}` path parameter
- **Human-readable URLs**: `/space/my-project/nodes/123` more intuitive than `/space/a8f3.../nodes/123`
- **SEO benefits**: Slugs improve discoverability (if app becomes public)
- **Consistency**: Matches backend's slug-first architecture

### Migration Pattern
```typescript
// OLD: Space ID-based
async getNodes(spaceId: number): Promise<Node[]> {
  return apiClient.get(`/spaces/${spaceId}/nodes`);
}

// NEW: Space slug-based
async getNodes(spaceSlug: string): Promise<Node[]> {
  return apiClient.get(`/spaces/${spaceSlug}/nodes`);
}
```

### Slug Retrieval Strategy

**Option A**: Store slug in URL/route params (recommended)
```typescript
// URL: /space/my-project/nodes
const { slug } = useParams();
const { data: nodes } = useNodes(slug);
```

**Option B**: Fetch space first, extract slug
```typescript
const { data: space } = useSpace(spaceId);
const { data: nodes } = useNodes(space.slug);
```

**Decision**: Use **Option A** for better performance (one less API call)

### Alternatives Considered

**Alternative: Continue using space IDs**
- ❌ **Rejected**: Backend endpoints don't support IDs in these paths
- ❌ **Rejected**: Would require backend changes (out of scope)

---

## 3. Type Migration Strategy

### Decision
Create new `Space` interface, add deprecated type alias for `Space` to enable incremental component updates.

### Rationale
- **Type safety maintained**: No `any` types introduced during migration
- **Incremental updates**: Components can be updated file-by-file
- **Clear deprecation path**: TypeScript warnings guide developers to new types
- **Backward compatibility window**: Allows gradual component updates

### Implementation Pattern

**Phase 1: Add Space type and alias**
```typescript
// types/backend-dtos.ts

export interface Space {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

/** @deprecated Use Space instead. Space has been renamed to Space in backend API. */
export type Space = Space;
```

**Phase 2: Update services to use Space**
```typescript
// services/api/space.service.ts
import type { Space, CreateSpaceRequest } from '@/types/backend-dtos';

export const spaceService = {
  async getSpaces(): Promise<Space[]> { ... }
};
```

**Phase 3: Update components incrementally**
```typescript
// components/spaces/SpaceList.tsx
import type { Space } from '@/types/backend-dtos';

interface Props {
  spaces: Space[];  // No longer Space[]
}
```

### Alternatives Considered

**Alternative: Hard cutover (rename all at once)**
- ❌ **Rejected**: Too many files (20+ components), high risk of breaking changes
- ❌ **Rejected**: Large changeset difficult to code review
- ❌ **Rejected**: All-or-nothing approach prevents incremental validation

**Alternative: Keep both types indefinitely**
- ❌ **Rejected**: Confuses future developers
- ❌ **Rejected**: No clear migration path
- ❌ **Rejected**: Violates clean code principles

---

## 4. Testing Strategy

### Decision
Test-Driven Development (TDD) approach: Contract tests → Services → Integration tests → E2E tests

### Rationale
- **Contract-first**: Verify API shape before implementation
- **Fail-first**: Tests must fail before implementation (proves they work)
- **Layer-by-layer**: Build from foundation (services) up to UI (E2E)
- **Confidence**: Each layer validated before building next

### Testing Layers

**Layer 1: Contract Tests** (verify API shape)
```typescript
// tests/contracts/space.contract.test.ts
describe('Space API Contract', () => {
  it('GET /api/spaces returns SpaceResponse[]', () => {
    // Mock endpoint, verify response schema
  });
});
```

**Layer 2: Service Tests** (verify service logic)
```typescript
// tests/unit/space.service.test.ts
describe('spaceService', () => {
  it('getSpaces calls correct endpoint', () => {
    // Verify axios call matches contract
  });
});
```

**Layer 3: Integration Tests** (verify hooks + services)
```typescript
// tests/integration/useSpaces.test.ts
describe('useSpaces hook', () => {
  it('fetches and caches spaces', () => {
    // Verify React Query integration
  });
});
```

**Layer 4: E2E Tests** (verify full user flows)
```typescript
// tests/e2e/space-workflows.spec.ts
test('user can create and navigate to space', async ({ page }) => {
  // Full browser test
});
```

### Mock Service Worker (MSW) Strategy

**Decision**: Update MSW handlers to match new endpoints
```typescript
// tests/mocks/handlers.ts
rest.get('/api/spaces', (req, res, ctx) => {
  return res(ctx.json([
    { id: '123', name: 'Test Space', slug: 'test-space', ... }
  ]));
}),
rest.get('/api/spaces/:spaceSlug/nodes', (req, res, ctx) => {
  const { spaceSlug } = req.params;
  return res(ctx.json(mockNodes[spaceSlug] || []));
}),
```

### Alternatives Considered

**Alternative: Integration tests first**
- ❌ **Rejected**: No services to integrate yet
- ❌ **Rejected**: Would require stubbing implementation

**Alternative: Skip contract tests**
- ❌ **Rejected**: No verification that our types match backend
- ❌ **Rejected**: Increases risk of runtime type errors

---

## 5. Optional Features Decision

### Decision
Focus on core synchronization (auth, spaces, nodes, attributes); defer node versioning, templates, and health checks to future features.

### Rationale
- **Minimize scope**: Core sync is critical; optional features are enhancements
- **Faster delivery**: Smaller scope = quicker implementation and deployment
- **Risk reduction**: Fewer changes = fewer potential bugs
- **Incremental value**: Core sync unblocks current development

### Core Features (In Scope)
✅ Space management endpoints (`GET/POST /api/spaces`, `GET /api/spaces/{id}`, `GET /api/spaces/slug/{slug}`)
✅ Space-scoped node endpoints (`/api/spaces/{spaceSlug}/nodes/*`)
✅ Authentication endpoints (no changes - verify still working)
✅ Attribute endpoints (no changes - verify still working)

### Optional Features (Out of Scope - Future Work)
🔮 Node versioning (`GET /api/nodes/{id}/versions`, `POST /api/nodes/{id}/versions/{v}/restore`)
🔮 Space templates (`GET /api/templates`)
🔮 Health checks (`GET /api/health`, `GET /api/health/database`)
🔮 Ancestor/descendant traversal (`GET /api/spaces/{slug}/nodes/{id}/ancestors`)

### Future Feature Prioritization
1. **Node versioning** (High value - enables content history/rollback)
2. **Ancestor/descendant traversal** (Medium value - improves graph navigation)
3. **Space templates** (Medium value - accelerates space creation)
4. **Health checks** (Low value - mainly for ops/monitoring)

### Alternatives Considered

**Alternative: Implement all available endpoints**
- ❌ **Rejected**: Scope creep - extends timeline significantly
- ❌ **Rejected**: Optional features not blocking current work
- ❌ **Rejected**: Better to ship core sync quickly, iterate on enhancements

**Alternative: Implement versioning now**
- ⚠️ **Considered but deferred**: High value but increases scope by ~30%
- ⚠️ **Risk**: Versioning UI requires significant design work
- ✅ **Better approach**: Separate feature spec for versioning (future)

---

## 6. Error Handling Strategy

### Decision
Maintain existing RFC 7807 error handling; no changes needed (backend format unchanged).

### Current Pattern (No Changes)
```typescript
// services/api/client.ts
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.data) {
      // Backend returns RFC 7807 Problem Details
      const problem: ProblemDetails = error.response.data;
      throw new ApiError(problem.status, problem.title, problem.detail);
    }
    throw error;
  }
);
```

### Verification
- ✅ Error format unchanged in backend API
- ✅ Authentication errors (401) still redirect to login
- ✅ Validation errors (400) still show field-level messages
- ✅ Server errors (5xx) still logged to Sentry

---

## 7. React Query Caching Strategy

### Decision
Maintain existing caching strategy with updated query keys to reflect space terminology.

### Query Key Migration
```typescript
// Before
const spaceKeys = {
  all: ['spaces'] as const,
  lists: () => [...spaceKeys.all, 'list'] as const,
  list: (filters: string) => [...spaceKeys.lists(), { filters }] as const,
  details: () => [...spaceKeys.all, 'detail'] as const,
  detail: (id: number) => [...spaceKeys.details(), id] as const,
};

// After
const spaceKeys = {
  all: ['spaces'] as const,
  lists: () => [...spaceKeys.all, 'list'] as const,
  list: (filters: string) => [...spaceKeys.lists(), { filters }] as const,
  details: () => [...spaceKeys.all, 'detail'] as const,
  detail: (slug: string) => [...spaceKeys.details(), slug] as const,
};
```

### Node Query Keys (Updated for Space Scoping)
```typescript
const nodeKeys = {
  all: ['nodes'] as const,
  listsInSpace: (spaceSlug: string) => [...nodeKeys.all, 'list', spaceSlug] as const,
  details: () => [...nodeKeys.all, 'detail'] as const,
  detail: (spaceSlug: string, nodeId: string) => [...nodeKeys.details(), spaceSlug, nodeId] as const,
};
```

### Cache Invalidation Strategy
```typescript
// When space is updated, invalidate its node cache
queryClient.invalidateQueries({ queryKey: nodeKeys.listsInSpace(spaceSlug) });

// When switching spaces, no need to clear cache (slug changes automatically)
```

---

## Research Conclusions

### Key Decisions Summary
1. ✅ **Migration pattern**: Atomic rename (all files in one PR)
2. ✅ **Routing**: Slug-based (backend requirement)
3. ✅ **Types**: Incremental with deprecation alias
4. ✅ **Testing**: TDD (contract → service → integration → E2E)
5. ✅ **Scope**: Core sync only; defer optional features
6. ✅ **Error handling**: No changes (RFC 7807 unchanged)
7. ✅ **Caching**: Update query keys, maintain strategy

### Technical Risks Identified
| Risk | Mitigation |
|------|------------|
| Breaking existing UI during rename | TDD approach + comprehensive test coverage |
| Missing API calls that need updating | Grep for `/spaces/` + TypeScript compiler |
| Cache key conflicts during migration | Query key refactor with slug-based keys |
| Performance impact of slug lookups | Slug already in URL params (no extra calls) |

### Ready for Phase 1
All research complete. No unknowns remain. Proceed to design phase to generate:
- data-model.md (Space/Node/Attribute interfaces)
- contracts/*.yml (OpenAPI specs for space/node endpoints)
- Contract tests (TDD - must fail initially)
- quickstart.md (Manual verification steps)

---

**Status**: ✅ Research Complete
**Next Phase**: Phase 1 (Design & Contracts)
