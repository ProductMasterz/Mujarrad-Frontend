# Research & Technical Decisions

**Feature**: Backend-Integrated Knowledge Graph Frontend
**Date**: 2025-10-07

## Overview

This document consolidates technical research and decisions for implementing the Mujarrad frontend. Since the constitution (v1.1.0) already mandates the core technology stack, this research focuses on implementation patterns, best practices, and specific library choices within the approved technologies.

## Technology Decisions

### 1. Graph Visualization: React Flow

**Decision**: Use React Flow v11+ for graph visualization

**Rationale**:
- React-native API integrates seamlessly with React ecosystem
- Built-in controls (zoom, pan, minimap) reduce implementation effort
- Excellent performance for interactive graphs (handles 1000+ nodes)
- Extensive customization for node/edge rendering
- Built-in layout algorithms (Dagre, force-directed)
- Active community and documentation

**Alternatives Considered**:
- **D3.js**: More flexible but requires more manual implementation. Considered for future custom layouts.
- **Cytoscape.js**: Used in legacy MindStone, but less React-friendly and harder to customize.

**Implementation Notes**:
- Use Dagre layout for hierarchical graphs (CONTEXT containment)
- Render back-edges with dashed lines to indicate cycles
- Implement virtual rendering for graphs >1000 nodes
- Custom node/edge components for different types (CONTEXT, REGULAR, ASSUMPTION)

### 2. State Management: Zustand + React Query

**Decision**: Dual state management strategy

**Zustand** for client state:
- Authentication state (user, token, isAuthenticated)
- Current workspace context
- UI preferences (theme, sidebar, graph layout)

**React Query** for server state:
- All API data (nodes, workspaces, attributes, versions)
- Automatic caching with configurable stale times
- Optimistic updates for mutations
- Background refetching
- Query invalidation on mutations

**Rationale**:
- Separation of concerns (client vs server state)
- React Query eliminates manual cache management
- Zustand is simpler than Redux for client state
- Both libraries have minimal bundle size impact

**Alternatives Considered**:
- **Redux**: Too much boilerplate for this use case
- **Context API**: Not optimized for frequent updates
- **SWR**: Similar to React Query but less feature-rich

### 3. Form Handling: React Hook Form + Zod

**Decision**: React Hook Form for forms, Zod for validation

**Rationale**:
- React Hook Form uses uncontrolled inputs (better performance)
- Zod provides type-safe schema validation
- Schemas match backend DTOs exactly
- Integration via `@hookform/resolvers/zod`

**Example**:
```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<CreateNodeInput>({
  resolver: zodResolver(createNodeSchema),
});
```

**Alternatives Considered**:
- **Formik**: More verbose, slower for large forms
- **Native validation**: Not type-safe, harder to test

### 4. Authentication: JWT in httpOnly Cookies

**Decision**: Store JWT in httpOnly cookies set by backend

**Flow**:
1. User submits login credentials
2. Backend validates and sets httpOnly cookie with JWT
3. Axios automatically sends cookie with each request
4. Frontend stores minimal user info in Zustand (id, email, username)

**Token Refresh**:
- Axios interceptor catches 401 responses
- Calls refresh endpoint
- Retries original request with new token

**CSRF Protection**:
- Backend provides CSRF token on login
- Frontend sends token in header for state-changing operations

**Rationale**:
- httpOnly cookies prevent XSS attacks
- No manual token storage/retrieval needed
- Backend controls token expiration

**Alternatives Considered**:
- **localStorage**: Vulnerable to XSS
- **sessionStorage**: Doesn't persist across tabs

### 5. Error Handling: RFC 7807 Problem Details

**Decision**: Parse RFC 7807 responses from backend

**Backend Format**:
```json
{
  "type": "https://api.mujarrad.com/errors/validation-error",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Title is required",
  "instance": "/api/workspaces/my-workspace/nodes",
  "errors": {
    "title": ["Must not be empty"]
  }
}
```

**Frontend Handling**:
```typescript
// Axios interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      const problemDetail: ProblemDetail = error.response.data;
      throw new ApiError(problemDetail);
    }
    throw error;
  }
);
```

**Error Display**:
- Field-level errors → inline validation messages
- General errors → toast notifications
- Critical errors → error boundary with fallback UI

**Rationale**:
- Standard format for error responses
- Type-safe error handling
- Consistent UX across all error scenarios

### 6. Graph Layout Algorithms

**Decision**: Multi-strategy layout based on graph structure

**Primary**: Dagre (hierarchical)
- Best for CONTEXT containment hierarchies
- Handles acyclic graphs efficiently
- Clear parent-child relationships

**Secondary**: Force-directed (d3-force)
- For non-hierarchical graphs (references, dependencies)
- Natural clustering of related nodes
- Better for cyclic relationships

**Cycle Visualization**:
- Detect back-edges in containment relationships
- Render with dashed lines + different color
- Show cycle path in tooltip on hover

**Performance Optimization**:
- Virtual rendering (only render visible nodes)
- Debounced layout recalculation
- WebWorker for layout computation (large graphs)

### 7. Bundle Optimization

**Decision**: Vite code splitting + lazy loading

**Route-based Splitting**:
```typescript
const GraphView = lazy(() => import('./routes/workspace/graph'));
const NodeDetail = lazy(() => import('./routes/workspace/node/$id'));
```

**Component-level Splitting**:
- GraphVisualization component (large dependency: React Flow)
- VersionHistory component (markdown diff library)
- MarkdownEditor component (CodeMirror)

**Tree Shaking**:
- Import only used Radix UI components
- Use named imports from lodash-es
- Exclude unused locales from date-fns

**Bundle Size Targets**:
- Main bundle: <200KB gzipped
- Total initial load: <500KB
- Largest chunk: <300KB

**Monitoring**:
- vite-plugin-bundle-analyzer for visualization
- CI check fails if bundle exceeds limits

### 8. Testing Strategy

**Decision**: 3-tier testing pyramid

**Unit Tests (Vitest)**:
- Services (80% coverage target)
- Hooks (80% coverage target)
- Utilities (90% coverage target)
- Zod schemas (100% coverage)

**Integration Tests (React Testing Library)**:
- Components (60% coverage target)
- User interactions
- Form submissions
- Error states

**E2E Tests (Playwright)**:
- Critical user flows:
  - Authentication flow
  - Workspace creation and switching
  - Node CRUD operations
  - Graph visualization and navigation
  - Version history and restoration

**API Mocking**:
- MSW (Mock Service Worker) for tests
- Mock backend responses matching Swagger spec
- Separate mocks for success/error scenarios

## API Endpoint Mapping

From backend Swagger specification:

| Category | Method | Endpoint | Frontend Usage |
|----------|--------|----------|----------------|
| Auth | POST | `/api/users/register` | AuthService.register() |
| Auth | POST | `/api/users/login` | AuthService.login() |
| Workspaces | POST | `/api/workspaces` | WorkspaceService.create() |
| Workspaces | GET | `/api/workspaces` | WorkspaceService.getAll() |
| Workspaces | GET | `/api/workspaces/{slug}` | WorkspaceService.getBySlug() |
| Workspaces | DELETE | `/api/workspaces/{slug}` | WorkspaceService.delete() |
| Nodes | POST | `/api/workspaces/{slug}/nodes` | NodeService.create() |
| Nodes | GET | `/api/workspaces/{slug}/nodes` | NodeService.getAll() |
| Nodes | GET | `/api/workspaces/{slug}/nodes/{id}` | NodeService.getById() |
| Nodes | PUT | `/api/workspaces/{slug}/nodes/{id}` | NodeService.update() |
| Nodes | DELETE | `/api/workspaces/{slug}/nodes/{id}` | NodeService.delete() |
| Attributes | POST | `/api/nodes/{id}/attributes` | AttributeService.create() |
| Attributes | GET | `/api/nodes/{id}/attributes` | AttributeService.getAll() |
| Attributes | DELETE | `/api/nodes/{id}/attributes/{attrId}` | AttributeService.delete() |
| Versions | GET | `/api/nodes/{id}/versions` | VersionService.getAll() |
| Versions | POST | `/api/nodes/{id}/versions/{versionId}/restore` | VersionService.restore() |
| Search | GET | `/api/nodes/search?q={query}` | SearchService.search() |

## Performance Optimization Strategies

### React Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});
```

### Debouncing
- Search input: 300ms debounce
- Auto-save: 1000ms debounce
- Graph layout recalculation: 100ms debounce

### Infinite Scroll
- Node list: Load 20 items per page
- Search results: Load 50 items per page
- Use `useInfiniteQuery` from React Query

### Image Optimization
- Lazy load with Intersection Observer
- Use `loading="lazy"` attribute
- Responsive images with srcset

## Security Considerations

### XSS Prevention
- Use DOMPurify for user-generated markdown
- Sanitize before rendering with `dangerouslySetInnerHTML`
- Content Security Policy headers

### CSRF Protection
- CSRF token in header for POST/PUT/DELETE
- Token obtained from backend on login
- Verified on backend for state-changing operations

### Input Validation
- Client-side: Zod schemas (UX)
- Server-side: Backend validation (security)
- Never trust client input

### Secrets Management
- API base URL in environment variables
- No hardcoded credentials
- `.env.example` for documentation

## Accessibility Guidelines (WCAG AA)

### Keyboard Navigation
- All interactive elements focusable
- Logical tab order
- Skip links for main content
- Keyboard shortcuts documented

### Screen Reader Support
- ARIA labels on all controls
- ARIA live regions for dynamic content
- Semantic HTML (`<nav>`, `<main>`, `<article>`)

### Color Contrast
- Text: 4.5:1 minimum
- Large text: 3:1 minimum
- Use color + icon for states (not color alone)

### Focus Management
- Visible focus indicators
- Focus trap in modals
- Restore focus after modal close

## Next Steps

With research complete, proceed to Phase 1:
1. Create `data-model.md` with TypeScript type definitions
2. Generate Zod schemas in `contracts/` directory
3. Write contract tests (should fail initially)
4. Document manual test scenarios in `quickstart.md`
5. Update `CLAUDE.md` with new technology context

---
*Research complete. Ready for Phase 1: Design & Contracts.*
