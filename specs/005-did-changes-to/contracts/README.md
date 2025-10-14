# API Contracts

This directory contains OpenAPI specifications extracted from the backend for the space and node endpoints.

## Files

- `space-endpoints.yml` - Space management API contract
- `node-endpoints.yml` - Node management API contract (space-scoped)

## Purpose

These contracts serve as:
1. **Documentation** - Single source of truth for API shape
2. **Test specifications** - Contract tests verify implementation matches these specs
3. **Type generation** - Can generate TypeScript types from OpenAPI schemas

## Backend Source

Extracted from: `https://mujarrad.onrender.com/v3/api-docs`
Backend version: 0.0.1-SNAPSHOT
Date: 2025-10-13

## Key Changes from Previous Version

### Workspace → Space Migration
- Endpoint path change: `/api/workspaces/*` → `/api/spaces/*`
- Parameter change: `workspaceId: number` → `spaceSlug: string`

### Node Endpoints Now Space-Scoped
- Old: `/api/nodes/{nodeId}`
- New: `/api/spaces/{spaceSlug}/nodes/{nodeId}`

### No Changes
- Authentication endpoints (`/api/auth/*`)
- Attribute endpoints (`/api/nodes/{nodeId}/attributes`, `/api/attributes/{attributeId}`)
