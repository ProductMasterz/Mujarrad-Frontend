<!--
Sync Impact Report
==================
Version change: 1.1.0 → 1.2.0
Modified principles:
  - Technology Stack Requirements: Locked frontend stack to Next.js 14+ (FROZEN STACK POLICY)
  - Replaced Vite + React Router with Next.js 14 App Router
  - Updated testing stack from Vitest to Jest
  - Added explicit rationale for Next.js selection
Added sections:
  - LOCKED STACK POLICY: Prevents future framework migrations
  - Rationale for Next.js: 8 key benefits documented
Removed sections: None
Templates requiring updates:
  ✅ .specify/templates/plan-template.md - Updated for Next.js patterns
  ✅ .specify/templates/spec-template.md - No changes needed (generic enough)
  ✅ .specify/templates/tasks-template.md - No changes needed (generic enough)
Follow-up TODOs:
  - All spec files (spec.md, plan.md, tasks.md, research.md) updated to Next.js
  - Implementation ready to proceed with Next.js 14 foundation
-->

# Mujarrad Frontend Constitution

## Core Principles

### I. Node Supremacy
All content, structure, and relationships MUST be represented as nodes in the knowledge
graph. No hard-coded organizational structures, templates, or contexts exist outside
the node system. Every piece of information - whether it's a concept, a container, a
relationship, or a template - MUST be a node with appropriate type and attributes.

**Rules:**
- Contexts ARE nodes with `node_type = 'CONTEXT'`
- Templates ARE nodes with `is_template = true` in `node_details`
- Organizational structures ARE expressed via `contains` relationships
- NO separate tables for contexts, templates, or categories
- ALL structure emerges from node relationships

**Rationale:** This ensures the system remains truly flexible and extensible without
schema migrations. Users can create any organizational structure through nodes and
relationships alone.

### II. Relationship-Driven Structure & Edge-Attribute Mapping
Structure emerges from relationships between nodes, not from predefined hierarchies.
Containment, dependencies, references, and workflow connections are all expressed
through the `attributes` table with appropriate relationship types.

**Frontend-Backend Mapping:**
- Frontend "edges" in graph visualization MUST map to backend "attributes"
- The `attribute_key` field determines the relationship type (edge type)
- Edge styling in UI MUST reflect the `attribute_key` value
- All graph edge operations MUST use the attributes API endpoints

**Rules:**
- `contains`: Hierarchical organization (CONTEXT → Node relationships prevent cycles for UI navigation)
- `depends_on`: Dependency relationships (cycles allowed)
- `references`: Cross-references and citations (cycles allowed)
- `triggers`: Workflow connections (cycles allowed for loops)
- `next`: Sequential flow (cycles allowed for iteration)
- `calls`: Function/process invocation (cycles allowed for recursion)
- ALL non-CONTAINS relationships MUST allow cycles to enable Abstract Logic
- Frontend edge creation MUST call `POST /api/nodes/{id}/attributes`
- Frontend edge deletion MUST call `DELETE /api/nodes/{id}/attributes/{attrId}`
- Graph edges MUST be retrieved via `GET /api/nodes/{id}/attributes`

**Rationale:** Different relationship types have different semantic meanings and cycle
constraints. Containment must be acyclic for UI navigation, but workflow and logic
relationships must support cycles for loops, recursion, and state machines. The
frontend-backend mapping ensures consistency between visual representation and data
storage.

### III. Abstraction Immutability
Logic, workflows, and processes are defined as abstract node graphs, not as
code. Once defined, these abstract structures MUST remain stable while allowing
the underlying implementation to evolve.

**Rules:**
- Workflow logic MUST be expressed as node relationships (not code)
- Conditional branching MUST use `conditional` nodes with targets
- Collections and sequences MUST use `mapping` nodes
- Data-driven execution MUST be preferred over hard-coded logic
- Changes to abstract logic MUST be versioned and tracked

**Rationale:** This enables the "Abstract Logic" paradigm where logic is data that
can be visualized, versioned, and executed without code changes.

### IV. Backend Architecture Alignment
The frontend MUST align with the Spring Boot backend architecture, respecting its
layered structure and API contracts. Communication MUST follow RESTful principles
with proper JWT authentication and RFC 7807 error handling.

**Rules:**
- API calls MUST use the documented endpoints from Swagger/OpenAPI specification
- Request/Response DTOs MUST match backend contracts
- Authentication MUST use JWT Bearer tokens with proper header management
- Error handling MUST parse RFC 7807 Problem Details format
- State management MUST reflect the backend's entity relationships
- Pagination MUST use backend's Pageable parameters (page, size, sort)
- Optimistic locking MUST be implemented using version fields

**Rationale:** Consistency with backend architecture prevents integration issues,
reduces bugs, and ensures proper data flow through all application layers.

### V. Clean Architecture in React
The frontend MUST implement Clean Architecture principles with clear separation
between UI components, business logic, and data access layers.

**Architecture Layers:**
```
┌─────────────────────────────────────┐
│   Components (Presentation)        │
│   ├─ Pages (route containers)      │
│   ├─ Layouts (structure)           │
│   └─ UI Components (reusable)      │
└────────────┬────────────────────────┘
             │ Uses
┌────────────▼────────────────────────┐
│   Hooks & Services (Logic)          │
│   ├─ Custom hooks (state/effects)  │
│   ├─ Services (API calls)          │
│   └─ Utilities (helpers)           │
└────────────┬────────────────────────┘
             │ Uses
┌────────────▼────────────────────────┐
│   Store & Context (State)           │
│   ├─ Zustand/Redux stores          │
│   ├─ React Context providers       │
│   └─ State selectors               │
└────────────┬────────────────────────┘
             │ Manages
┌────────────▼────────────────────────┐
│   Types & Models (Domain)           │
│   ├─ TypeScript interfaces         │
│   ├─ API types                     │
│   └─ Validators (Zod)              │
└─────────────────────────────────────┘
```

**Rules:**
- Components MUST NOT contain business logic or API calls
- API services MUST be centralized in `/services` directory
- State management MUST use Zustand for global state, React Query for server state
- Types MUST be defined using TypeScript interfaces matching backend DTOs
- Form validation MUST use Zod schemas aligned with backend validation

**Rationale:** Separation of concerns enables testability, reusability, and
maintainability while making it easy to swap implementations.

### VI. Type Safety and Validation
All data structures MUST have TypeScript interfaces derived from backend DTOs,
and all user inputs MUST be validated using Zod schemas before submission.

**Rules:**
- TypeScript strict mode MUST be enabled
- Backend response types MUST be defined as interfaces
- Request payloads MUST be validated with Zod schemas
- API responses MUST be type-guarded before use
- Enum types MUST match backend enums exactly
- NO `any` types unless absolutely necessary with justification

**Rationale:** Type safety prevents runtime errors, improves developer experience,
and ensures frontend-backend contract compliance.

### VII. Graph Visualization First
Since Mujarrad is a knowledge graph system, visualization of node relationships
MUST be a first-class citizen. All graph operations MUST have visual representations.

**Rules:**
- Primary view MUST be a graph visualization (Canvas/SVG based)
- Node types MUST have distinct visual representations
- Relationship types MUST have distinct edge styles (based on attribute_key)
- Cycle detection MUST be visually indicated for containment relationships
- Graph layout MUST use cycle-aware algorithms (e.g., Sugiyama with back-edges)
- Users MUST be able to navigate by clicking nodes/edges
- Context (super-position) MUST show multiple parent relationships visually
- Edge rendering MUST use data from attributes API

**Rationale:** Visual representation makes the abstract node system intuitive and
enables users to understand complex relationship structures at a glance.

### VIII. Workspace Isolation
All operations MUST be scoped to workspaces. Users access nodes within workspaces,
and workspace membership determines access control.

**Rules:**
- ALL API calls MUST include workspace context (slug or ID)
- Workspace switching MUST clear cached data from previous workspace
- URLs MUST follow pattern: `/workspace/{slug}/nodes/{nodeId}`
- Search MUST be workspace-scoped by default
- Cross-workspace references MUST be explicitly marked and handled

**Rationale:** Multi-tenancy isolation prevents data leakage and enables proper
access control at the workspace level.

### IX. Version Awareness
All content changes MUST be versioned, and users MUST have access to version
history and restoration capabilities.

**Rules:**
- Node updates MUST create new versions in backend
- Version history MUST be accessible from node detail view
- Version comparison MUST show diffs (markdown content, metadata)
- Version restoration MUST be a first-class operation
- Current version MUST always be clearly indicated

**Rationale:** Version control provides audit trails, enables content rollback,
and supports collaborative editing with conflict resolution.

### X. Performance and Optimization
The application MUST be optimized for performance with lazy loading, code splitting,
and efficient data fetching strategies.

**Rules:**
- Route-based code splitting MUST be implemented
- React Query MUST cache API responses with appropriate stale times
- Infinite scroll MUST be used for long lists (nodes, search results)
- Images and large assets MUST be lazy-loaded
- Debouncing MUST be applied to search inputs and auto-save operations
- Bundle size MUST be monitored and optimized
- Lighthouse performance score MUST be > 90

**Rationale:** Performance directly impacts user experience, especially with large
knowledge graphs. Optimization ensures scalability.

## Technology Stack Requirements

**LOCKED STACK POLICY**: The frontend technology stack is **FROZEN** for this project. No changes to core framework, build tools, or routing solutions are permitted without explicit project owner approval and constitutional amendment. This stability ensures consistent development patterns and prevents disruptive migrations.

### Core Technologies (LOCKED)
- **Framework:** Next.js 14+ with App Router (LOCKED - SSR/SPA hybrid with file-based routing)
- **React Version:** React 18+ with TypeScript (LOCKED)
- **State Management:** Zustand (global) + TanStack Query / React Query (server state) (LOCKED)
- **Routing:** Next.js App Router (built-in file-based routing) (LOCKED)
- **Styling:** Tailwind CSS + CSS Modules for scoped styles (LOCKED)
- **Form Handling:** React Hook Form + Zod validation (LOCKED)
- **API Client:** Axios with interceptors (LOCKED)
- **Graph Visualization:** React Flow (LOCKED - chosen for React integration and performance)
- **UI Components:** Radix UI primitives + custom components (LOCKED)

### Development Tools (LOCKED)
- **Linting:** ESLint with TypeScript plugin (next/core-web-vitals preset)
- **Formatting:** Prettier
- **Type Checking:** TypeScript strict mode
- **Testing:** Jest + React Testing Library + Playwright (E2E)
- **Git Hooks:** Husky + lint-staged
- **API Mocking:** MSW (Mock Service Worker) for testing

### Build and Deployment
- **Build Tool:** Next.js built-in (SWC compiler)
- **Environment Management:** .env files with NEXT_PUBLIC_ prefix for client vars
- **CI/CD:** GitHub Actions (build, test, deploy)
- **Hosting:** Vercel (recommended for Next.js) or Netlify
- **Monitoring:** Sentry for error tracking

### Rationale for Next.js
Next.js 14 was chosen for:
1. **File-based routing** eliminates manual route configuration (React Router not needed)
2. **Automatic code splitting** per route optimizes bundle sizes
3. **SWC compiler** provides faster builds than traditional bundlers
4. **App Router** enables modern React patterns (Server Components, streaming)
5. **Built-in optimizations** for images, fonts, and scripts
6. **SPA mode capability** when not using SSR (matches backend-driven architecture)
7. **Industry standard** with extensive ecosystem and long-term support
8. **Developer experience** with Fast Refresh, TypeScript integration, and error overlay

## Quality Standards

### Code Quality
- **Test Coverage:** Minimum 80% for business logic, 60% overall
- **Type Coverage:** 100% (no `any` types without explicit justification)
- **Linting Errors:** Zero errors, warnings acceptable with justification
- **Bundle Size:** Main bundle < 200KB gzipped, total initial load < 500KB

### Security Requirements
- **Authentication:** JWT tokens stored in httpOnly cookies or secure storage
- **CSRF Protection:** Tokens for state-changing operations
- **XSS Prevention:** DOMPurify for user-generated markdown content
- **Input Validation:** All forms validated client-side and server-side
- **Secrets Management:** No hardcoded API keys, use environment variables
- **Dependency Scanning:** Regular vulnerability audits with npm audit

### Accessibility Standards
- **WCAG Compliance:** Minimum AA level
- **Keyboard Navigation:** All interactive elements accessible via keyboard
- **Screen Reader Support:** Proper ARIA labels and roles
- **Focus Management:** Clear focus indicators and logical tab order
- **Color Contrast:** Minimum 4.5:1 for text, 3:1 for large text

## Development Workflow

### Feature Development Process
1. **Specification Review:** Understand backend API endpoints and data models
2. **Type Definition:** Create TypeScript interfaces matching backend DTOs
3. **Service Layer:** Implement API service functions with proper error handling
4. **State Management:** Define Zustand store slices or React Query hooks
5. **Component Development:** Build UI components with proper separation of concerns
6. **Validation:** Implement Zod schemas for forms
7. **Testing:** Write unit tests for services, integration tests for components
8. **Documentation:** Document complex logic and API integrations

### Code Review Requirements
- **Type Safety:** No `any` types without justification
- **Error Handling:** Proper try-catch blocks and error boundaries
- **Performance:** Check for unnecessary re-renders and API calls
- **Accessibility:** Verify keyboard navigation and ARIA labels
- **Testing:** Ensure tests cover critical paths
- **Architecture Compliance:** Verify adherence to Clean Architecture

### Git Workflow
- **Branch Naming:** `feature/`, `bugfix/`, `hotfix/` prefixes
- **Commit Messages:** Conventional Commits format (feat:, fix:, chore:, etc.)
- **PR Requirements:** Description, screenshots, test results
- **Review Process:** Minimum 1 approval, CI checks must pass
- **Merge Strategy:** Squash and merge for features, regular merge for releases

## Governance

### Constitutional Authority
This constitution supersedes all other development practices and guidelines.
When in conflict, constitutional principles take precedence. Any deviation
MUST be documented with explicit rationale and approval.

### Amendment Process
1. **Proposal:** Document proposed changes with rationale
2. **Review:** Discuss impact on existing architecture
3. **Approval:** Require unanimous team consensus for core principles
4. **Migration:** Create migration plan for affected code
5. **Version:** Increment version using semantic versioning
   - MAJOR: Breaking changes to core principles
   - MINOR: New principles or significant expansions
   - PATCH: Clarifications, typo fixes, non-semantic updates

### Compliance Verification
- **All PRs** MUST verify alignment with constitutional principles
- **Architecture Reviews** MUST happen quarterly to ensure continued compliance
- **Refactoring Tasks** MUST be created when violations are discovered
- **Documentation** MUST be updated to reflect constitutional amendments

### Continuous Improvement
- Review constitution quarterly for relevance and completeness
- Gather feedback from team on pain points and ambiguities
- Update principles based on lessons learned from production issues
- Maintain changelog of amendments with rationale

## Special Provisions

### Abstract Logic Implementation
When implementing UI for Abstract Logic workflows:
- Cycles MUST be visualized with different edge styles (dashed or colored)
- Infinite loop detection MUST warn users during execution
- Iteration count MUST be displayed during workflow execution
- User MUST be able to pause/resume/stop workflow execution
- Execution state MUST be preserved across sessions

### Multi-Context Membership (Super Position)
When a node belongs to multiple contexts:
- ALL parent contexts MUST be displayed in node detail view
- Breadcrumbs MUST show current navigation path, not all parents
- Context switcher MUST allow jumping between parent contexts
- Deletion MUST handle orphaning vs. cascading based on parent count

### Search and Discovery
Search implementation MUST support:
- Full-text search across title, content, and tags
- Filter by node type, creator, date range
- Search within current context or workspace-wide
- Relevance ranking based on backend's tsvector
- Search result previews with highlighted matches

### Error Handling Strategy
- Network errors: Retry with exponential backoff (max 3 attempts)
- Authentication errors: Redirect to login and preserve intended destination
- Validation errors: Display field-level errors from backend
- Server errors (5xx): Display user-friendly message, log to Sentry
- Circular containment: Display backend error with cycle path

### Data Migration and Sample Data
When migrating legacy data or loading sample data for demonstration:

**Markdown Files to Nodes:**
- Each markdown file in `/posts` directory MUST be converted to a node
- File name (without .md extension) MUST become the node title
- File content MUST become the node content (preserve markdown formatting)
- Directory structure MUST be converted to CONTEXT nodes with `contains` relationships
- Wiki-style links `[[Link]]` MUST be parsed and converted to `references` attributes

**Edge Parsing and Attribute Creation:**
- Wiki links `[[Target]]` MUST create `references` type attributes
- Parent directory relationships MUST create `contains` type attributes
- Any embedded images or files MUST be handled as attachment references
- All relationship types MUST use the attributes API with `attribute_key` = edge type

**Migration Validation:**
- Verify all nodes created successfully via API
- Verify all relationships (edges) created as attributes
- Verify graph visualization renders migrated data correctly
- Confirm cycle detection works for directory structures (CONTEXT nodes)
- Ensure markdown content renders properly with links

**Sample Data Purpose:**
- Demonstrate successful backend API integration
- Validate graph visualization with real-world data structure
- Test search and navigation functionality
- Verify version control and relationship management
- Provide initial content for user onboarding and testing

**Version**: 1.2.0 | **Ratified**: 2025-10-07 | **Last Amended**: 2025-10-07
**Amendment**: Technology stack locked to Next.js 14+ (FROZEN STACK POLICY)
