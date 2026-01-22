<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Mujarrad-Frontend Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-07

## Active Technologies
- (004-i-need-to)
- TypeScript 5.3.3, React 18.2.0, Next.js 14.1.0 + @tanstack/react-query 5.17.19, axios 1.6.5, zustand 4.4.7, react-hook-form 7.49.3, zod 3.22.4 (005-did-changes-to)
- Remote backend API (https://mujarrad.onrender.com), no local persistence (005-did-changes-to)
- Existing entity fields (Node.description, Space.documentation, Comment.text, Note.content) - no schema changes, plain markdown text stored in backend PostgreSQL via REST API (006-markdown-features-start)
- TypeScript 5.3.3, React 18.2.0, Next.js 14.1.0 + @excalidraw/excalidraw, @tanstack/react-query 5.17.19, axios 1.6.5, zustand 4.4.7 (007-excalidraw-whiteboard-integration)
- PostgreSQL via REST API (https://mujarrad.onrender.com), JSON configuration fields (007-excalidraw-whiteboard-integration)

## Project Structure
```
backend/
frontend/
tests/
```

## Commands
# Add commands for 

## Code Style
: Follow standard conventions

## Recent Changes
- 007-excalidraw-whiteboard-integration: Added TypeScript 5.3.3, React 18.2.0, Next.js 14.1.0 + @excalidraw/excalidraw, @tanstack/react-query 5.17.19, axios 1.6.5, zustand 4.4.7
- 006-markdown-features-start: Added TypeScript 5.3.3, React 18.2.0, Next.js 14.1.0
- 005-did-changes-to: Added TypeScript 5.3.3, React 18.2.0, Next.js 14.1.0 + @tanstack/react-query 5.17.19, axios 1.6.5, zustand 4.4.7, react-hook-form 7.49.3, zod 3.22.4

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
