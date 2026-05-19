# Open Source Resources for Mujarrad

**Last Updated:** 2026-01-22
**Purpose:** Catalog open source projects to leverage, learn from, or integrate

---

## Legend

| Symbol | Meaning |
|--------|---------|
| **[C]** | Can use components directly |
| **[R]** | Reference/learn from architecture |
| **[I]** | Can integrate as dependency |
| **[S]** | SDK/library to use |

---

## Block Editors / Notion-like UX

### BlockNote [C][I]
- **URL:** https://github.com/TypeCellOS/BlockNote
- **License:** MPL-2.0
- **Stars:** 6k+
- **What it offers:**
  - Ready-to-use block-based editor
  - Slash commands built-in
  - Drag & drop blocks
  - Real-time collaboration ready
- **Use case:** Could replace/enhance our current block editor
- **Learn:** Block data structure, command handling

### Plate.js [C][I]
- **URL:** https://github.com/udecode/plate
- **License:** MIT
- **Stars:** 10k+
- **What it offers:**
  - Plugin-based rich text editor
  - Highly customizable
  - TypeScript first
  - Many block types available
- **Use case:** Foundation for custom editor
- **Learn:** Plugin architecture, extensibility patterns

### Novel [C][R]
- **URL:** https://github.com/steven-tey/novel
- **License:** Apache-2.0
- **Stars:** 13k+
- **What it offers:**
  - Notion-style WYSIWYG editor
  - AI-powered suggestions
  - Beautiful default UI
- **Use case:** Inspiration for AI-powered editing
- **Learn:** AI integration in editors

### Tiptap [I]
- **URL:** https://github.com/ueberdosis/tiptap
- **License:** MIT
- **Stars:** 27k+
- **What it offers:**
  - Headless editor framework
  - Extensive extension ecosystem
  - Collaboration ready (Y.js)
- **Use case:** If building custom editor
- **Learn:** Extension patterns, collaborative editing

---

## Knowledge Base / CMS Patterns

### Outline [R]
- **URL:** https://github.com/outline/outline
- **License:** BSL 1.1 (source available)
- **Stars:** 28k+
- **What it offers:**
  - Full knowledge base application
  - Document hierarchy
  - Search implementation
  - Sharing/permissions
- **Use case:** Reference for knowledge base patterns
- **Learn:** Document organization, search, permissions, API design

### Strapi [R]
- **URL:** https://github.com/strapi/strapi
- **License:** SEE LICENSE (MIT for v3)
- **Stars:** 63k+
- **What it offers:**
  - Headless CMS
  - Content type builder
  - REST & GraphQL APIs
  - Plugin architecture
- **Use case:** API design patterns for developer platform
- **Learn:** Content modeling, plugin system, admin UI

### Payload CMS [R]
- **URL:** https://github.com/payloadcms/payload
- **License:** MIT
- **Stars:** 25k+
- **What it offers:**
  - TypeScript-first CMS
  - Custom field types
  - Access control
  - Hooks system
- **Use case:** Reference for TypeScript CMS patterns
- **Learn:** Field types, access control, hooks

### Directus [R]
- **URL:** https://github.com/directus/directus
- **License:** GPL-3.0 (BSL for cloud)
- **Stars:** 28k+
- **What it offers:**
  - Database-first approach
  - REST + GraphQL
  - Flows (automation)
- **Use case:** Database wrapping patterns
- **Learn:** Dynamic schema, flows/automation

---

## Graph Visualization / Node-Based UI

> **Note:** These tools align with Mujarrad's "Everything is a Node" (EiaN) architecture principle.

### next-ai-draw-io [R][C]
- **URL:** https://github.com/DayuanJiang/next-ai-draw-io
- **License:** MIT
- **What it offers:**
  - AI-powered diagram creation ("Chat, Draw, Visualize")
  - Natural language to diagram conversion
  - Draw.io integration (XML-based diagrams)
  - MCP server built-in (Claude Desktop, Cursor, VS Code)
  - Animated connectors
  - Electron app available
- **Architecture:**
  - Next.js App Router
  - AI Chat → MCP Server → HTTP Server → Browser (draw.io)
  - React context for diagram state
  - Multi-provider AI support
- **Use case:**
  - Reference for AI-assisted diagramming
  - MCP server implementation patterns
  - Software architecture visualization
- **Learn:** MCP integration, diagram generation, XML processing
- **Priority:** HIGH - aligns with VizViews + Agent integration
- **Recommended models:** Claude Sonnet, GPT-4+, DeepSeek

### ReactFlow [C][I]
- **URL:** https://github.com/xyflow/xyflow
- **License:** MIT
- **Stars:** 25k+
- **What it offers:**
  - Interactive node graphs
  - Custom node/edge types
  - Minimap, controls
  - Selection, dragging
- **Use case:** Graph view for nodes/relationships
- **Learn:** Node layout algorithms, interaction handling
- **Priority:** HIGH - could implement Graph VizView

### Cytoscape.js [I]
- **URL:** https://github.com/cytoscape/cytoscape.js
- **License:** MIT
- **Stars:** 10k+
- **What it offers:**
  - Graph theory library
  - Multiple layout algorithms
  - Analysis functions
- **Use case:** Complex graph analysis
- **Learn:** Graph algorithms, layout strategies

### D3.js [I]
- **URL:** https://github.com/d3/d3
- **License:** ISC
- **Stars:** 109k+
- **What it offers:**
  - Data visualization primitives
  - Force-directed layouts
  - Custom visualizations
- **Use case:** Custom VizViews
- **Learn:** Visualization fundamentals

---

## MCP & Agent Integration

### mcp-typescript-sdk [S]
- **URL:** https://github.com/modelcontextprotocol/typescript-sdk
- **License:** MIT
- **What it offers:**
  - Official MCP TypeScript SDK
  - Server implementation helpers
  - Type definitions
- **Use case:** Build Mujarrad MCP server
- **Priority:** CRITICAL for agent integration

### Claude Code Reference
- **URL:** https://github.com/anthropics/claude-code (or docs)
- **What it offers:**
  - MCP server examples
  - Hook patterns
  - Agent interaction patterns
- **Use case:** Learn how to build MCP tools
- **Learn:** Tool definitions, resource patterns

### LangChain.js [R][I]
- **URL:** https://github.com/langchain-ai/langchainjs
- **License:** MIT
- **Stars:** 13k+
- **What it offers:**
  - LLM application framework
  - Document loaders
  - Retrieval patterns
- **Use case:** AI-powered features reference
- **Learn:** RAG patterns, agent patterns

---

## AI Chat Interface

### assistant-ui [C][I]
- **URL:** https://github.com/assistant-ui/assistant-ui
- **License:** MIT
- **Stars:** 8.1k+
- **What it offers:**
  - Production-grade AI chat UI primitives
  - Composable components (message list, input, thread, toolbar)
  - Built-in streaming support
  - Markdown + code syntax highlighting
  - Voice input support
  - Attachment handling
  - Tool call rendering with human approval
  - Compatible with multiple providers (OpenAI, Anthropic, etc.)
- **Use case:** Chat interface for AI agents within Mujarrad
- **Learn:** Chat UX patterns, streaming UI, tool approval flows
- **Priority:** HIGH - enables agent interaction UI
- **Tech stack:** TypeScript, React, Radix UI, shadcn/ui patterns

---

## UI Components

### Shadcn/ui [C][I]
- **URL:** https://github.com/shadcn-ui/ui
- **License:** MIT
- **Stars:** 75k+
- **Already using via:** Radix primitives
- **What it offers:**
  - Beautifully designed components
  - Copy-paste approach
  - Tailwind CSS based
- **Use case:** UI consistency

### Radix UI [I]
- **URL:** https://github.com/radix-ui/primitives
- **License:** MIT
- **Already using:** Yes
- **Use case:** Accessible primitives

### cmdk [C][I]
- **URL:** https://github.com/pacocoursey/cmdk
- **License:** MIT
- **Stars:** 9k+
- **What it offers:**
  - Command palette component
  - Fuzzy search
  - Keyboard navigation
- **Use case:** Enhance CommandPalette
- **Learn:** Command menu patterns

---

## Real-time & Collaboration

### Y.js [I]
- **URL:** https://github.com/yjs/yjs
- **License:** MIT
- **Stars:** 17k+
- **What it offers:**
  - CRDT implementation
  - Real-time sync
  - Offline support
- **Use case:** Future real-time collaboration
- **Learn:** CRDT patterns

### Liveblocks [R]
- **URL:** https://github.com/liveblocks/liveblocks
- **License:** Apache-2.0
- **Stars:** 3k+
- **What it offers:**
  - Collaboration infrastructure
  - Presence, comments
  - Storage
- **Use case:** Reference for collab features
- **Learn:** Collaboration patterns

---

## API & Backend Patterns

### Hono [R][I]
- **URL:** https://github.com/honojs/hono
- **License:** MIT
- **Stars:** 20k+
- **What it offers:**
  - Ultrafast web framework
  - TypeScript first
  - Edge ready
- **Use case:** If building edge functions
- **Learn:** Modern API patterns

### tRPC [R]
- **URL:** https://github.com/trpc/trpc
- **License:** MIT
- **Stars:** 35k+
- **What it offers:**
  - End-to-end typesafe APIs
  - No code generation
- **Use case:** Type-safe SDK generation
- **Learn:** Type-safe API patterns

### Zod [I]
- **URL:** https://github.com/colinhacks/zod
- **License:** MIT
- **Already using:** Yes
- **Use case:** Schema validation

---

## Documentation & Developer Portal

### Nextra [C][I]
- **URL:** https://github.com/shuding/nextra
- **License:** MIT
- **Stars:** 12k+
- **What it offers:**
  - Next.js documentation framework
  - MDX support
  - Search built-in
- **Use case:** Developer documentation site
- **Priority:** HIGH for developer platform

### Swagger UI / OpenAPI [I]
- **URL:** https://github.com/swagger-api/swagger-ui
- **License:** Apache-2.0
- **What it offers:**
  - API documentation UI
  - Interactive playground
- **Use case:** API docs
- **Priority:** HIGH for developer platform

### Mintlify [R]
- **URL:** https://github.com/mintlify/mint
- **License:** MIT
- **What it offers:**
  - Beautiful docs framework
  - API reference generation
- **Use case:** Documentation inspiration
- **Learn:** Modern docs patterns

---

## Automation & Operations

### xyOps [R][C]
- **URL:** https://github.com/pixlcore/xyops
- **License:** BSD-3-Clause
- **What it offers:**
  - Job scheduling + workflow management + monitoring + alerting in one
  - Visual workflow editor
  - Real-time fleet management
  - Server snapshots (CPU, network, processes)
  - Integrated ticketing with context
  - JavaScript/Node.js based
- **Use case:**
  - Reference for automation dashboard patterns
  - Workflow visualization
  - Job scheduling UI patterns
- **Learn:** Unified ops platform design, visual workflow editors
- **Relevance:** Could inform n8n integration UI and automation features

---

## Testing & Quality

### Playwright [I]
- **URL:** https://github.com/microsoft/playwright
- **License:** Apache-2.0
- **Stars:** 67k+
- **What it offers:**
  - E2E testing
  - Cross-browser
- **Use case:** E2E tests
- **Priority:** Medium

### Vitest [I]
- **URL:** https://github.com/vitest-dev/vitest
- **License:** MIT
- **Stars:** 13k+
- **What it offers:**
  - Fast unit testing
  - Vite-native
- **Use case:** Unit tests

---

## Node-Based Architecture Alignment

> Mujarrad's core principle: **"Everything is a Node" (EiaN)**
> These projects share this paradigm, making them highly compatible:

| Project | Node Concept | Alignment Score |
|---------|--------------|-----------------|
| ReactFlow | Nodes + Edges | **Perfect** - visual node graphs |
| next-ai-draw-io | Diagram elements as nodes | **High** - AI + node visualization |
| Excalidraw | Elements (already using) | **High** - whiteboard elements |
| BlockNote | Blocks as nodes | **High** - content blocks |
| Cytoscape.js | Graph nodes | **Perfect** - graph analysis |
| assistant-ui | Messages/threads as nodes | **Medium** - chat structure |

**Pattern:** All modern creative/knowledge tools converge on node-based data models.

---

## Priority Matrix for MVP

### Must Evaluate Now

| Project | Why | Action |
|---------|-----|--------|
| mcp-typescript-sdk | Agent integration | Start MCP server |
| assistant-ui | AI chat interface | Integrate for agent UI |
| next-ai-draw-io | MCP + diagrams | Study MCP patterns |
| Nextra | Dev docs | Setup docs site |
| ReactFlow | Graph view | Evaluate for VizViews |
| BlockNote | Block editor | Compare to current |

### Evaluate for V1.0

| Project | Why | Action |
|---------|-----|--------|
| Y.js | Real-time collab | Architecture review |
| tRPC | Type-safe SDK | SDK design |
| Outline | Full reference | Study patterns |

### Learn From

| Project | What to Learn |
|---------|---------------|
| Strapi | Plugin architecture |
| Payload | Hooks system |
| Outline | Permission model |
| Novel | AI integration |

---

## Integration Checklist

When evaluating a library for integration:

- [ ] License compatible? (MIT/Apache preferred)
- [ ] TypeScript support?
- [ ] Actively maintained? (commits in last 3 months)
- [ ] Bundle size acceptable?
- [ ] Does it conflict with existing deps?
- [ ] Documentation quality?
- [ ] Community size/support?

---

## Notes

- Prefer MIT/Apache-2.0 licensed projects
- TypeScript-first libraries are priority
- Consider bundle size impact
- Check for React 18 compatibility
- Document any license requirements

---

## Change Log

| Date | Change |
|------|--------|
| 2026-01-22 | Initial catalog created |
