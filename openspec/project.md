# Project Context

## Purpose
Mujarrad is a knowledge management and whiteboard collaboration platform. The frontend provides:
- **Space Management**: Create, organize, and navigate knowledge spaces
- **Node/Document CRUD**: Create, read, update, delete knowledge nodes with hierarchical relationships
- **Graph Visualization**: Interactive graph view of node relationships
- **Excalidraw Whiteboard**: Integrated whiteboard with hierarchy synchronization
- **Markdown Editing**: Rich markdown editing with wikilinks support
- **Version Control**: Document versioning and history

## Tech Stack
- **Framework**: Next.js 14.1.0 (App Router)
- **Language**: TypeScript 5.3.3
- **UI**: React 18.2.0, Tailwind CSS, shadcn/ui components
- **State Management**:
  - Server state: @tanstack/react-query 5.17.19
  - Client state: Zustand 4.4.7
- **Forms**: react-hook-form 7.49.3 + Zod 3.22.4
- **API Client**: Axios 1.6.5
- **Whiteboard**: @excalidraw/excalidraw
- **Authentication**: Google OAuth 2.0 (@react-oauth/google)

## Project Conventions

### Code Style
- Use TypeScript strict mode
- Functional components with hooks
- Prefer named exports over default exports
- Use absolute imports with `@/` prefix
- Store files use `.store.ts` suffix pattern

### Architecture Patterns
- **API Layer**: Services in `src/services/api/` wrap axios calls
- **Query Hooks**: Custom hooks in `src/hooks/api/` wrap React Query
- **Query Keys**: Factory pattern with `*Keys` objects (e.g., `spaceKeys`, `nodeKeys`)
- **Components**: Feature-based organization in `src/components/`
- **Stores**: Zustand stores in `src/stores/` for client-only state

### Testing Strategy
- **Unit Tests**: Jest + React Testing Library
- **Contract Tests**: API contract validation
- **E2E Tests**: Playwright for critical user flows
- **Current Coverage**: ~15-20% (needs improvement)

### Git Workflow
- Feature branches: `feature/description` or `NNN-feature-name`
- Commit message format: `type: description`
- PR-based workflow with code review

## Domain Context

### Entity Model
- **Space**: Top-level container for nodes (like a workspace/vault)
- **Node**: Core entity representing a document/note with:
  - Title, description, content (markdown)
  - Type (document, folder, whiteboard)
  - Parent/child relationships (hierarchy)
  - Attributes (custom metadata)
  - Relationships (graph edges to other nodes)
- **Whiteboard**: Excalidraw data stored as JSON in node
- **Version**: Historical snapshots of node content

### Key Relationships
- Space contains many Nodes
- Node can have parent Node (hierarchy)
- Node can have relationships to other Nodes (graph)
- Node can have Attributes and Versions

## Important Constraints
- **Backend API**: Remote REST API at https://mujarrad.onrender.com
- **No local persistence**: All data stored in backend PostgreSQL
- **Authentication required**: JWT token-based auth for all API calls
- **Optimistic updates**: Needed for responsive UX but currently limited

## External Dependencies
- **Backend API**: Spring Boot REST API (not in this repo)
- **Google OAuth**: For authentication
- **Render.com**: Deployment platform

## Current Status (as of Jan 2026)
Based on architecture analysis:
- Feature completion: 44%
- Test coverage: 15-20%
- CRUD consistency: 70%

### Critical Gaps
1. Space Creation Dialog - blocking primary workflow
2. Whiteboard-Hierarchy Sync - 0% implemented
3. Optimistic updates missing on most CRUD operations
4. Version History UI - no UI exists
