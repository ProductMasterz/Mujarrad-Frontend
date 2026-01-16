# Research & Technical Decisions

**Feature**: Backend-Integrated Knowledge Graph Frontend
**Date**: 2025-10-07

## Overview

This document consolidates technical research and decisions for implementing the Mujarrad frontend. Since the constitution (v1.1.0) already mandates the core technology stack, this research focuses on implementation patterns, best practices, and specific library choices within the approved technologies.

**MAJOR UPDATE (2025-10-07)**: Migrated from Vite + React Router to **Next.js 14 with App Router** for improved developer experience, automatic code splitting, and built-in routing.

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
- Current space context
- UI preferences (theme, sidebar, graph layout)

**React Query** for server state:
- All API data (nodes, spaces, attributes, versions)
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
  "instance": "/api/spaces/my-space/nodes",
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

### 7. Build Tool & Framework: Next.js 14 with App Router

**Decision**: Use Next.js 14 with App Router (replacing Vite + React Router)

**Rationale**:
- **Built-in Routing**: File-based routing eliminates need for React Router
- **Automatic Code Splitting**: Each route is automatically split into separate chunks
- **SWC Compiler**: Faster builds and transpilation compared to Babel
- **Developer Experience**: Hot Module Replacement (HMR), better error messages
- **Production Ready**: Optimizations built-in (image optimization, font optimization, etc.)
- **Client-Side SPA Mode**: Can be configured for pure client-side rendering (no SSR needed)

**Configuration for SPA Mode**:
```javascript
// next.config.js - Client-side SPA configuration
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  // Proxy API requests to Spring Boot backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_BASE_URL + '/api/:path*',
      },
    ];
  },
};
```

**Key Patterns**:
- Use `'use client'` directive for interactive components
- Server Components for static layouts (minimal JS sent to client)
- Dynamic imports with `next/dynamic` for large components:
```typescript
import dynamic from 'next/dynamic';

const GraphView = dynamic(() => import('@/components/graph/GraphVisualization'), {
  loading: () => <Spinner />,
  ssr: false, // Client-side only
});
```

**Alternatives Considered**:
- **Vite + React Router**: More manual setup, no built-in routing
- **Create React App**: Deprecated, slower builds
- **Remix**: More opinionated, requires SSR mindset

### 8. Bundle Optimization

**Decision**: Next.js 14 automatic optimizations + manual splitting

**Automatic Optimizations**:
- App Router automatically splits each route
- SWC minification (faster than Terser)
- Automatic tree shaking with ES modules
- Font optimization (next/font)
- Image optimization (next/image)

**Manual Splitting**:
```typescript
// Dynamic imports for large components
const GraphVisualization = dynamic(() => import('@/components/graph/GraphVisualization'), { ssr: false });
const VersionHistory = dynamic(() => import('@/components/nodes/NodeVersionHistory'), { ssr: false });
const MarkdownEditor = dynamic(() => import('@/components/ui/MarkdownEditor'), { ssr: false });
```

**Tree Shaking**:
- Import only used Radix UI components
- Use named imports from lodash-es
- Exclude unused locales from date-fns

**Bundle Size Targets**:
- Main bundle: <200KB gzipped
- Total initial load: <500KB
- Largest chunk: <300KB

**Monitoring**:
- @next/bundle-analyzer for visualization
- CI check fails if bundle exceeds limits

### 9. Testing Strategy

**Decision**: 3-tier testing pyramid

**Unit Tests (Jest)**:
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
  - Space creation and switching
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
| Spaces | POST | `/api/spaces` | SpaceService.create() |
| Spaces | GET | `/api/spaces` | SpaceService.getAll() |
| Spaces | GET | `/api/spaces/{slug}` | SpaceService.getBySlug() |
| Spaces | DELETE | `/api/spaces/{slug}` | SpaceService.delete() |
| Nodes | POST | `/api/spaces/{slug}/nodes` | NodeService.create() |
| Nodes | GET | `/api/spaces/{slug}/nodes` | NodeService.getAll() |
| Nodes | GET | `/api/spaces/{slug}/nodes/{id}` | NodeService.getById() |
| Nodes | PUT | `/api/spaces/{slug}/nodes/{id}` | NodeService.update() |
| Nodes | DELETE | `/api/spaces/{slug}/nodes/{id}` | NodeService.delete() |
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

## Why Next.js 14 for This Project

### Benefits for Mujarrad Knowledge Graph Frontend

1. **File-Based Routing Matches Domain Model**
   - Space routing: `app/spaces/[slug]/page.tsx`
   - Node detail: `app/spaces/[slug]/node/[id]/page.tsx`
   - Graph view: `app/spaces/[slug]/graph/page.tsx`
   - Natural mapping to backend API structure

2. **Performance Optimization Out-of-the-Box**
   - Automatic code splitting per route (critical for large graph visualizations)
   - SWC compiler for faster development builds
   - Built-in image and font optimization
   - Reduced bundle size with automatic tree shaking

3. **Developer Experience**
   - TypeScript support built-in
   - Fast Refresh for instant feedback
   - Better error messages and debugging
   - Less boilerplate compared to Vite + React Router

4. **Integration with Spring Boot Backend**
   - API proxy via `rewrites()` in next.config.js
   - CORS handled by Next.js proxy
   - Easy environment variable management (NEXT_PUBLIC_ prefix)
   - No additional backend configuration needed

5. **Client-Side SPA Mode**
   - No SSR overhead (not needed for authenticated app)
   - All data fetching via React Query from backend API
   - Can still use Server Components for layouts (reduced JS bundle)
   - Flexible: Can add SSR later if needed (e.g., for SEO)

6. **Production Deployment**
   - Optimized production builds with SWC minification
   - Static export option for CDN deployment
   - Docker-friendly (official Next.js Dockerfile template)
   - Vercel deployment option for easy prototyping

### Trade-offs Accepted

- **Learning Curve**: Team needs to learn App Router concepts ('use client', Server Components)
- **Framework Lock-in**: More coupled to Next.js than vanilla React
- **Bundle Size**: Next.js runtime adds ~80KB (acceptable for our use case)

### Migration from Vite

| Aspect | Vite + React Router | Next.js 14 App Router |
|--------|---------------------|----------------------|
| **Routing** | Manual React Router setup | File-based, automatic |
| **Code Splitting** | Manual `React.lazy()` | Automatic per route |
| **Build Tool** | vite.config.ts | next.config.js |
| **Dev Server** | `vite dev` | `next dev` |
| **Production** | `vite build` | `next build` |
| **Testing** | Vitest | Jest (Next.js recommended) |
| **HMR Speed** | Very fast | Very fast (SWC) |
| **Bundle Size** | Smaller base | +80KB runtime |

## Next Steps

With research complete, proceed to Phase 1:
1. Create `data-model.md` with TypeScript type definitions
2. Generate Zod schemas in `contracts/` directory
3. Write contract tests (should fail initially)
4. Document manual test scenarios in `quickstart.md`
5. Update `CLAUDE.md` with new technology context (Next.js 14 App Router)

---
*Research complete. Technology decision: **Next.js 14 App Router**. Ready for Phase 1: Design & Contracts.*
