# Feature Specification: Integrate Obsidian-like Page Hierarchy and Graph Navigation

**Feature Branch**: `004-i-need-to`
**Created**: 2025-10-07
**Status**: Draft
**Input**: User description: "I need to merge the features that we initially started this repo with which is a copy of obsedian features where we have heirarchy that is presenting pages those pages previewing markdown, as well as the cgraph of connnections between the pages. We did record the change cost in the specify 002, I need yo to go to that branch continue updates according to the status where are currently and where we shoud go. Then we proceed with /clarify, /plan, /tasks, and /implement."

## Execution Flow (main)
```
1. Parse user description from Input
   → Feature: Integrate Obsidian-like page hierarchy + markdown preview + connection graph
2. Extract key concepts from description
   → Actors: Knowledge workers, note-takers, researchers
   → Actions: Navigate hierarchy, preview markdown, visualize connections
   → Data: Nodes (pages), hierarchical structure, wiki-links, markdown content
   → Context: spec 002 already defined markdown migration approach
3. For each unclear aspect:
   → Hierarchy display format (tree, sidebar, breadcrumbs?)
   → Integration with existing workspace/node CRUD
   → Wiki-link parsing and rendering
   → Graph visualization enhancement for bidirectional navigation
4. Fill User Scenarios & Testing section
   → Browse page hierarchy → Select page → View markdown → Navigate via links
5. Generate Functional Requirements
   → Hierarchy navigation, markdown rendering, link-based traversal
6. Identify Key Entities
   → Page (Node), Hierarchy (CONTEXT relationships), Wiki-link (references)
7. Run Review Checklist
   → WARN "Spec has uncertainties regarding UI layout and navigation patterns"
8. Return: SUCCESS (spec ready for clarification then planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## Clarifications

### Session 2025-10-07
- Q: When a user creates a wiki-link to a page that doesn't exist yet, what should happen when they save the page? → A: Create placeholder page automatically - System creates empty page with that title immediately
- Q: Should the system support wiki-link aliases with pipe syntax `[[Display Text|Target Page]]`? → A: Full support - Parse and render aliases, store both display text and target in relationship metadata for flexible UX
- Q: How should CONTEXT nodes (folders) appear in the graph visualization? → A: Optional toggle - User can show/hide CONTEXT nodes on demand. Future enhancement: Multiple view modes (CONTEXT-only, nodes-only, combined) with scoping features
- Q: When a user removes a wiki-link from page content, what should happen to the relationship? → A: Keep relationship - Preserve `references` attributes even after wiki-link removed to maintain connection history
- Q: How should bidirectional wiki-links be displayed in the graph? → A: Single edge with special styling - Merge A→B and B→A into one edge with distinct visual indicator (e.g., double-headed arrow, thicker line, different color)

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story

A knowledge worker uses Mujarrad to organize interconnected notes in a hierarchical structure similar to Obsidian. The system should provide:

1. **Hierarchical Page Navigation**: Browse pages organized in folders/contexts
2. **Markdown Content Preview**: View formatted markdown content for each page
3. **Wiki-link Navigation**: Click `[[links]]` to jump between related pages
4. **Connection Graph Visualization**: See how pages connect to each other
5. **Seamless Integration**: Works with existing workspace, node creation, and editing features

The user can:
- Start from workspace view
- Navigate into a page hierarchy (folder tree or list)
- Select a page to view its markdown content
- Click wiki-links within content to navigate to referenced pages
- View a graph visualization showing connections between pages
- Create new pages and link them using `[[Page Title]]` syntax
- Edit pages and have wiki-links automatically update relationships

### Acceptance Scenarios

#### Hierarchy Navigation
1. **Given** user is in a workspace, **When** they view the workspace, **Then** they see a hierarchical list of pages organized by CONTEXT nodes (folders)
2. **Given** pages are nested in folders, **When** displaying hierarchy, **Then** tree structure shows parent-child relationships
3. **Given** user clicks a folder in hierarchy, **When** expanded, **Then** all contained pages are displayed
4. **Given** user clicks a page in hierarchy, **When** selected, **Then** page content is displayed in preview pane

#### Markdown Content Display
5. **Given** user selects a page, **When** viewing content, **Then** markdown is rendered with proper formatting (headers, lists, code blocks, bold, italic)
6. **Given** markdown contains wiki-links `[[Target Page]]`, **When** rendered, **Then** links are clickable and styled distinctly
7. **Given** user clicks a wiki-link, **When** activated, **Then** navigation jumps to the target page
8. **Given** target page doesn't exist, **When** wiki-link clicked, **Then** user sees option to create the page
9. **Given** markdown contains images, **When** rendered, **Then** images are [NEEDS CLARIFICATION: displayed inline? linked? not supported?]

#### Wiki-link Parsing and Relationships
10. **Given** user edits page content with wiki-links, **When** saving, **Then** system automatically creates `references` relationships to target pages
11. **Given** wiki-link target exists, **When** creating relationship, **Then** relationship connects source node to target node
12. **Given** wiki-link target doesn't exist, **When** parsing, **Then** system automatically creates an empty placeholder page with the target title and establishes the relationship
13. **Given** user removes wiki-link from content, **When** saving, **Then** existing `references` relationship is preserved in database to maintain connection history
14. **Given** bidirectional wiki-links (A→B and B→A exist), **When** displaying in graph, **Then** system merges into single edge with special visual indicator (double-headed arrow or distinct styling)

#### Graph Visualization
15. **Given** user views workspace graph, **When** displayed, **Then** all pages appear as nodes
16. **Given** pages have wiki-link relationships, **When** displaying graph, **Then** edges connect related pages
17. **Given** user clicks node in graph, **When** selected, **Then** page content is displayed
18. **Given** user hovers over edge in graph, **When** hovered, **Then** relationship type and metadata are shown
19. **Given** hierarchy has CONTEXT nodes, **When** displaying graph, **Then** user can toggle CONTEXT node visibility with a graph view control
19a. **Given** user toggles CONTEXT nodes on, **When** graph renders, **Then** CONTEXT nodes display with distinct visual styling (different shape/color from REGULAR nodes)
19b. **Given** user toggles CONTEXT nodes off, **When** graph renders, **Then** only REGULAR nodes and their wiki-link relationships are displayed

#### Integration with Existing Features
20. **Given** user creates new page via Create Node dialog, **When** created, **Then** page appears in hierarchy
21. **Given** user edits page via Edit Node dialog, **When** markdown content changes, **Then** wiki-links are re-parsed and relationships updated
22. **Given** user deletes page, **When** deleted, **Then** [NEEDS CLARIFICATION: update wiki-links in other pages? show broken links? remove references?]
23. **Given** page has collaborators, **When** viewing, **Then** all collaborators see same hierarchy and content
24. **Given** page has version history, **When** viewing older version, **Then** markdown content from that version is displayed

### Edge Cases
- What happens when page title changes and wiki-links reference old title?
- How does system handle circular references (A→B→C→A)?
- What happens when hierarchy is very deep (10+ levels)?
- How does system handle pages with same title in different folders?
- What happens when wiki-link has case variations `[[Page]]` vs `[[page]]`?
- How does system handle special characters in page titles for wiki-links?
- What happens when graph has hundreds of nodes and connections?
- How does system handle real-time updates when multiple users edit linked pages?

---

## Requirements *(mandatory)*

### Functional Requirements

#### Hierarchy Display and Navigation
- **FR-001**: System MUST display pages organized in hierarchical structure based on CONTEXT node relationships
- **FR-002**: System MUST support expanding and collapsing hierarchy levels
- **FR-003**: System MUST allow users to navigate to any page by clicking in hierarchy
- **FR-004**: System MUST show visual indicators for page type (REGULAR vs CONTEXT)
- **FR-005**: System MUST display page metadata (title, last updated, creator) in hierarchy
- **FR-006**: System MUST [NEEDS CLARIFICATION: support drag-and-drop to reorganize hierarchy? read-only display?]
- **FR-007**: System MUST [NEEDS CLARIFICATION: show breadcrumb navigation for current page location?]

#### Markdown Content Rendering
- **FR-008**: System MUST render markdown content with standard formatting (headers, bold, italic, lists, code blocks, tables, blockquotes)
- **FR-009**: System MUST identify wiki-links in format `[[Target Page]]` or `[[Display Text|Target Page]]`
- **FR-009a**: System MUST parse wiki-link aliases to extract display text and target page separately
- **FR-009b**: System MUST render wiki-link display text while linking to the target page
- **FR-010**: System MUST render wiki-links as clickable elements with distinct styling
- **FR-011**: System MUST navigate to target page when wiki-link is clicked
- **FR-012**: System MUST handle wiki-link resolution by page title (case-insensitive matching)
- **FR-013**: System MUST preserve all markdown content during rendering (no content loss)
- **FR-014**: System MUST [NEEDS CLARIFICATION: support syntax highlighting for code blocks? if yes, which languages?]
- **FR-015**: System MUST [NEEDS CLARIFICATION: render LaTeX/math expressions? or plain text?]

#### Wiki-link Relationship Management
- **FR-016**: System MUST automatically parse wiki-links when page content is saved
- **FR-017**: System MUST create `references` type attributes for each wiki-link found
- **FR-018**: System MUST set attribute_key = "wiki-link" for wiki-link relationships
- **FR-019**: System MUST resolve wiki-link targets to actual node IDs
- **FR-019a**: System MUST automatically create placeholder pages (empty pages with target title) when wiki-link target doesn't exist
- **FR-020**: System MUST add new relationships when new wiki-links are added to page content
- **FR-020a**: System MUST preserve existing `references` relationships even when corresponding wiki-links are removed from content (maintain connection history)
- **FR-021**: System MUST support aliases in wiki-links `[[Display Text|Target Page]]`
- **FR-021a**: System MUST store both display text and target page in relationship metadata
- **FR-022**: System MUST [NEEDS CLARIFICATION: handle ambiguous targets (multiple pages with same title)? show picker? use first match?]

#### Graph Visualization Enhancement
- **FR-023**: System MUST display all pages in workspace as nodes in graph
- **FR-024**: System MUST display wiki-link relationships as edges in graph
- **FR-024a**: System MUST detect bidirectional relationships (A→B and B→A both exist)
- **FR-024b**: System MUST merge bidirectional relationships into single edge with distinct visual styling (double-headed arrow, thicker line, or different color)
- **FR-025**: System MUST allow navigation to page by clicking node in graph
- **FR-026**: System MUST show relationship type when hovering over edges
- **FR-027**: System MUST support zooming and panning in graph view
- **FR-028**: System MUST provide toggle control to show/hide CONTEXT nodes in graph
- **FR-028a**: System MUST visually distinguish CONTEXT nodes from REGULAR nodes when both are displayed (different shape, color, or icon)
- **FR-028b**: System MUST filter graph display based on toggle state (CONTEXT-only, nodes-only, or combined view)
- **FR-029**: System MUST [NEEDS CLARIFICATION: highlight connected nodes when page is selected?]
- **FR-030**: System MUST [NEEDS CLARIFICATION: support different layout algorithms (force-directed, hierarchical, circular)?]
- **FR-031**: System MUST [NEEDS CLARIFICATION: show backlinks (pages referencing current page)?]

#### Integration with Existing CRUD Features
- **FR-032**: System MUST work with existing CreateNodeDialog for creating new pages
- **FR-033**: System MUST work with existing EditNodeDialog for editing page content
- **FR-034**: System MUST work with existing DeleteNodeDialog for deleting pages
- **FR-035**: System MUST update hierarchy display when pages are created, edited, or deleted
- **FR-036**: System MUST maintain workspace access control (only show pages user has permission to view)
- **FR-037**: System MUST preserve existing node metadata (type, slug, timestamps, creator)
- **FR-038**: System MUST support version history for all page edits
- **FR-039**: System MUST [NEEDS CLARIFICATION: show recent pages? favorites? bookmarks?]

### Key Entities *(include if feature involves data)*

- **Page (Node)**: A knowledge unit containing markdown content. Can be REGULAR (document) or CONTEXT (folder). Has title, slug, markdown_content, and relationships to other pages.

- **Hierarchy (CONTEXT Relationship)**: Organizational structure formed by `contains` attributes linking CONTEXT nodes to child pages. Represents folder/subfolder structure.

- **Wiki-link**: A reference in markdown content in format `[[Target]]` or `[[Text|Target]]`. When parsed, creates a `references` attribute linking source page to target page.

- **Markdown Content**: Text content stored in node's markdown_content field. Contains formatting syntax and wiki-links. Rendered as formatted HTML for display.

- **Graph Visualization**: Interactive display of pages (nodes) and their connections (edges). Shows wiki-link relationships visually, supports navigation by clicking nodes.

- **Navigation State**: Current page being viewed, position in hierarchy, selected node in graph. Persisted across view changes.

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain - **13 clarifications remaining**
- [x] Requirements are testable and unambiguous (except clarified ones)
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

**Clarifications Resolved (5)**:
1. ✅ Wiki-link target creation when doesn't exist → Auto-create placeholder page
2. ✅ Wiki-link aliases → Full support with `[[Display|Target]]` syntax
3. ✅ CONTEXT nodes in graph visualization → Optional toggle with view modes
4. ✅ Relationship handling when wiki-link removed → Keep relationships (preserve history)
5. ✅ Bidirectional wiki-link display → Single edge with special styling

**Clarifications Remaining (13)**:
1. Image handling in markdown (scenario #9)
2. Broken link handling after page deletion (scenario #22, FR-022)
3. Drag-and-drop hierarchy reorganization (FR-006)
4. Breadcrumb navigation (FR-007)
5. Code syntax highlighting (FR-014)
6. LaTeX/math expression support (FR-015)
7. Ambiguous wiki-link target resolution (FR-022)
8. Node highlighting in graph (FR-029)
9. Graph layout algorithms (FR-030)
10. Backlink display (FR-031)
11. Recent pages/favorites feature (FR-039)
12. Page title change wiki-link updates (Edge case)
13. Case-insensitive wiki-link matching specifics (Edge case)

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (18 NEEDS CLARIFICATION markers)
- [x] User scenarios defined (24 acceptance scenarios + edge cases)
- [x] Requirements generated (45 functional requirements)
- [x] Entities identified (6 key entities)
- [x] Review checklist passed (with clarifications pending)
- [x] **Clarification session completed (5 of 5 highest-priority questions resolved)**

---

## Dependencies & Assumptions

### Dependencies
- **Spec 002 (Markdown Migration)**: Analysis and patterns for wiki-link parsing
- **Spec 003 (CRUD UI)**: Existing workspace, node, and relationship CRUD operations
- **Backend API**: All endpoints from spec 003 must be functional
- **Current Components**: CreateNodeDialog, EditNodeDialog, WorkspaceCard, NodeList components
- **Graph Visualization**: Existing graph component from initial implementation

### Assumptions
- Users are familiar with Obsidian or similar note-taking tools
- Workspace and node CRUD features from spec 003 are complete and working
- Backend supports markdown_content field on nodes
- Backend supports `references` and `contains` attribute types
- Graph visualization component exists and can be enhanced
- Wiki-link syntax follows Obsidian conventions `[[Target]]`
- Page titles are unique within a workspace (or system handles duplicates)
- Markdown content is stored as plain text with wiki-link syntax preserved
- Real-time collaboration is out of scope (async updates acceptable)

### Constraints
- Must integrate seamlessly with existing UI (no complete redesign)
- Performance must be acceptable for workspaces with 100+ pages
- Wiki-link parsing should not block page save operations
- Graph visualization must render efficiently for large networks
- Hierarchy navigation must be intuitive (follow file explorer patterns)
- Mobile responsiveness is desired but not critical for initial release

---

## Success Criteria

### User Experience Success
- Users can navigate page hierarchy like a file explorer
- Markdown content displays beautifully formatted
- Wiki-links enable fluid navigation between related concepts
- Graph visualization provides spatial understanding of knowledge structure
- Experience feels cohesive (Obsidian-like UX in Mujarrad system)

### Technical Success
- All pages in workspace visible in hierarchy
- Wiki-links automatically create relationships in backend
- Graph displays all relationships accurately
- No performance degradation with 100+ pages
- Integration doesn't break existing CRUD operations
- Version control preserves markdown content and relationships

### Feature Completeness
- Hierarchy display shows full workspace structure
- Markdown rendering supports all common syntax
- Wiki-links are clickable and navigate correctly
- Graph is interactive (pan, zoom, click to navigate)
- Create/edit/delete operations update all views
- Works across all user permission levels

---

## Relationship to Spec 002

Spec 002 defined the **migration** of markdown files from `/posts` to the backend API. This spec (004) defines the **user interface** for navigating and interacting with that migrated content.

**Reusable from Spec 002**:
- Wiki-link parsing logic and patterns
- Markdown content handling approach
- `references` and `contains` attribute usage
- Node type distinctions (REGULAR vs CONTEXT)

**New in Spec 004**:
- User-facing hierarchy navigation UI
- Interactive markdown preview with clickable wiki-links
- Enhanced graph visualization for navigation
- Integration with existing workspace/node CRUD operations
- Real-time relationship updates on content changes

---

**Status**: 5 critical clarifications resolved. 13 lower-priority clarifications remain (can be addressed during planning or implementation).

**Next Phase**: Planning (/plan command) to determine UI layout, component architecture, wiki-link parsing strategy, graph visualization approach, and task breakdown.
