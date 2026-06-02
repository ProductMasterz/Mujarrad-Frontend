# Integrate Mujarrad Backend Feature 014 + Batch 015 + Batch 016

**Status**: IMPLEMENTED
**Date**: 2026-05-30 to 2026-06-01

## Summary

Full integration of three major backend releases into Mujarrad-Frontend. These releases changed the data model (organizations, contexts, locking), the access pattern (context-scoped creation), and the response format (PageResponse pagination wrapping).

## Why

The Mujarrad backend shipped Feature 014 (foundation), Batch 015 (quality + context-scoped access), and Batch 016 (universal pagination). The frontend was broken in production after each release because API response shapes changed. This change brings the frontend in line with all three releases.

## What Changed

### Backend Integration (API Layer)
- All 13+ list services use `extractPage<T>()` utility to handle PageResponse
- Blank endpoints: `/blank` → `/blank/nodes`, assign path changed
- Node migration replaces move: `POST /nodes/{id}/migrate`
- Context-scoped creation: `POST /spaces/{slug}/contexts/{contextSlug}/nodes`
- Child node endpoints: `createChildNode`, `getChildNodes`, `reorderChildren`
- Block editor uses atomic `createChildNode` (replaces two-step create + CONTAINS)

### Type System
- TEMPLATE and ASSUMPTION node types removed (backend rejects both)
- NodeType: `REGULAR | CONTEXT | ATTRIBUTE`
- New Node fields: `effectiveLockLevel`, `lockInherited`, `lockSource`, `parentNodeId`
- New Attribute fields: `isLocked`, `virtualContextId`
- Space fields: `organizationId`, `isLocked` (always present)
- PageResponse, MigrateNodeResponse, BlankCount types added

### UI Features
- Organization switcher in sidebar (INDIVIDUAL/TEAM orgs)
- Lock management: content lock (nodes/attributes) vs schema lock (space)
- The Blank: collapsible unorganized nodes panel per space
- The Void: quick notes page at /void
- Node migration dialog
- Virtual context management panel
- Context type/schema viewer and editor
- Context list with filtering in space view

### Navigation
- Space view shows ONLY contexts (using ProjectCard) + The Blank card
- New context detail page at `/spaces/[slug]/context/[contextSlug]`
- Sidebar hierarchy: Org → Spaces → Contexts → Blank → Void
- Universal "New" button opens NewNodeModal everywhere
- Context right-click → "Open as Page" for markdown content
