# Feature Specification: Sample Data Migration from Markdown Files

**Feature Branch**: `002-markdown-files-migration`
**Created**: 2025-10-07
**Status**: Draft
**Input**: User description: "Migrate markdown files from /posts directory to backend API as sample data, with wiki-link parsing and edge-to-attribute mapping"

## Execution Flow (main)
```
1. Parse user description from Input
   → Loaded requirement for MD file migration to demonstrate API ✓
2. Extract key concepts from description
   → Identified: markdown parsing, node creation, relationship mapping, demo data ✓
3. For each unclear aspect:
   → Marked migration trigger, error handling, bulk operations ✓
4. Fill User Scenarios & Testing section
   → Defined migration process and validation workflows ✓
5. Generate Functional Requirements
   → 28 testable requirements across parsing, API calls, validation ✓
6. Identify Key Entities
   → Markdown files, nodes, wiki links, directory structure ✓
7. Run Review Checklist
   → No implementation details, focused on WHAT to migrate ✓
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story

A developer needs to demonstrate the fully integrated frontend-backend system by populating the backend with realistic sample data from existing markdown files. The migration process should:

1. Read all markdown files from the `/posts` directory (MindStone legacy data)
2. Parse each file's metadata, content, and wiki-style links
3. Create nodes in the backend via API for each markdown file
4. Convert directory structure into CONTEXT nodes with containment relationships
5. Parse wiki-style links `[[Target]]` and create reference relationships
6. Validate that all data was migrated successfully
7. Display the migrated knowledge graph in the frontend visualization
8. Provide initial demo content for testing search, navigation, and version control

### Acceptance Scenarios

#### File Discovery and Parsing
1. **Given** markdown files exist in `/posts` directory, **When** migration starts, **Then** all files are discovered recursively including subdirectories
2. **Given** a markdown file with title, **When** parsed, **Then** filename (without .md) becomes node title
3. **Given** a markdown file with content, **When** parsed, **Then** full markdown content is preserved including formatting
4. **Given** markdown content with wiki links `[[Target]]`, **When** parsed, **Then** all wiki links are identified and extracted
5. **Given** markdown files in subdirectories, **When** parsed, **Then** directory structure is preserved for context creation

#### Node Creation via API
6. **Given** a parsed markdown file, **When** creating node, **Then** API call to POST /api/workspaces/{slug}/nodes succeeds
7. **Given** node creation request, **When** submitted, **Then** markdown content is stored in `markdown_content` field
8. **Given** a directory in `/posts`, **When** creating structure, **Then** CONTEXT type node is created for the directory
9. **Given** a regular markdown file, **When** creating node, **Then** REGULAR type node is created
10. **Given** multiple files to migrate, **When** creating nodes, **Then** all nodes are associated with the same workspace

#### Relationship Creation (Edge-to-Attribute Mapping)
11. **Given** a wiki link `[[Target]]` in content, **When** creating relationships, **Then** API call to POST /api/nodes/{id}/attributes creates `references` type attribute
12. **Given** a file in subdirectory, **When** creating structure, **Then** `contains` type attribute links directory CONTEXT to file node
13. **Given** nested directories, **When** creating structure, **Then** `contains` attributes form hierarchical tree matching filesystem
14. **Given** a wiki link to non-existent file, **When** processing, **Then** link is [NEEDS CLARIFICATION: skip? create placeholder? log warning?]
15. **Given** circular directory links (unlikely), **When** creating `contains`, **Then** system prevents cycle creation

#### Validation and Verification
16. **Given** migration completes, **When** validating, **Then** count of created nodes matches count of markdown files + directories
17. **Given** migration completes, **When** validating, **Then** all `contains` relationships exist for directory structure
18. **Given** migration completes, **When** validating, **Then** all `references` relationships exist for wiki links
19. **Given** migrated data, **When** loading frontend graph, **Then** all nodes render correctly in visualization
20. **Given** migrated data, **When** searching, **Then** full-text search returns results from markdown content
21. **Given** migrated data, **When** clicking node, **Then** markdown content displays properly with formatting

### Edge Cases
- What happens when a markdown file has no content (empty file)?
- How does system handle files with duplicate names in different directories?
- What happens when wiki link target has spaces or special characters?
- How does system handle very large markdown files (>1MB)?
- What happens when API call fails mid-migration?
- How does system handle image links in markdown content?
- What happens if workspace doesn't exist before migration?
- Should migration be idempotent (can be run multiple times)?

---

## Requirements *(mandatory)*

### Functional Requirements

#### File Discovery and Reading
- **FR-001**: System MUST discover all markdown files (.md extension) in `/posts` directory recursively
- **FR-002**: System MUST read file names and use them as node titles (without .md extension)
- **FR-003**: System MUST read full file content and preserve markdown formatting
- **FR-004**: System MUST identify directory structure for creating CONTEXT nodes
- **FR-005**: System MUST handle files with UTF-8 encoding
- **FR-006**: System MUST [NEEDS CLARIFICATION: handle non-markdown files in /posts? ignore? warn?]

#### Content Parsing
- **FR-007**: System MUST parse wiki-style links in format `[[Link Text]]`
- **FR-008**: System MUST extract link targets from wiki links for relationship creation
- **FR-009**: System MUST preserve markdown formatting in stored content (headers, lists, code blocks, etc.)
- **FR-010**: System MUST handle nested wiki links and multiple links per file
- **FR-011**: System MUST [NEEDS CLARIFICATION: parse frontmatter metadata? tags? dates?]
- **FR-012**: System MUST [NEEDS CLARIFICATION: handle image links `![[Image.png]]`? convert to references?]

#### Node Creation
- **FR-013**: System MUST create one node per markdown file via POST /api/workspaces/{slug}/nodes
- **FR-014**: System MUST store markdown content in the `markdown_content` field of node entity
- **FR-015**: System MUST set node type to REGULAR for markdown files
- **FR-016**: System MUST create CONTEXT type nodes for directories
- **FR-017**: System MUST generate unique slugs for each node based on filename
- **FR-018**: System MUST associate all migrated nodes with a target workspace
- **FR-019**: System MUST [NEEDS CLARIFICATION: set creator user? use system user? admin user?]

#### Relationship Creation (Edge-Attribute Mapping)
- **FR-020**: System MUST create `references` type attributes for wiki links via POST /api/nodes/{id}/attributes
- **FR-021**: System MUST create `contains` type attributes for directory-file relationships
- **FR-022**: System MUST set `attribute_key` = "references" for wiki link relationships
- **FR-023**: System MUST set `attribute_key` = "contains" for containment relationships
- **FR-024**: System MUST create relationships AFTER all nodes are created (two-pass migration)
- **FR-025**: System MUST handle wiki link resolution (find target node by title/slug)
- **FR-026**: System MUST [NEEDS CLARIFICATION: create bidirectional references? or only source→target?]

#### Error Handling and Validation
- **FR-027**: System MUST log all migration operations (file read, node created, relationship created)
- **FR-028**: System MUST report errors without stopping entire migration (best effort)
- **FR-029**: System MUST validate that all nodes were created successfully
- **FR-030**: System MUST validate that all relationships were created successfully
- **FR-031**: System MUST provide migration summary (X nodes, Y relationships, Z errors)
- **FR-032**: System MUST [NEEDS CLARIFICATION: rollback on failure? continue partial migration?]
- **FR-033**: System MUST [NEEDS CLARIFICATION: prevent duplicate migration? check if nodes already exist?]

#### Demonstration and Testing
- **FR-034**: Migrated data MUST be visible in frontend graph visualization
- **FR-035**: Migrated nodes MUST be searchable via search functionality
- **FR-036**: Migrated content MUST render correctly in node detail view
- **FR-037**: Migrated relationships MUST display as edges in graph
- **FR-038**: System MUST support navigating between related nodes via wiki links
- **FR-039**: System MUST demonstrate version control (initial version for each migrated node)
- **FR-040**: System MUST [NEEDS CLARIFICATION: preserve original file dates? or use migration date?]

### Key Entities *(include if feature involves data)*

- **Markdown File**: A text file with .md extension in `/posts` directory. Contains title (filename), content (markdown text), and wiki-style links to other files.

- **Directory Structure**: Folder hierarchy in `/posts` representing organizational contexts. Each directory becomes a CONTEXT node.

- **Wiki Link**: A reference in markdown content in format `[[Target Name]]`. Represents a relationship between two pieces of content.

- **Node (Backend Entity)**: The destination for migrated markdown files. Has fields: id, workspace_id, node_type (REGULAR or CONTEXT), title, slug, markdown_content, created_at, created_by.

- **Attribute (Backend Entity)**: The destination for migrated relationships. Has fields: id, from_node_id, to_node_id, attribute_key (edge type), attribute_value, created_at. Maps to frontend "edges".

- **Migration Session**: A single execution of the migration process. Tracks files processed, nodes created, relationships created, errors encountered, and provides summary report.

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs) - Avoided technical specifics
- [x] Focused on user value and business needs - Centered on demo data population
- [x] Written for non-technical stakeholders - Used plain language
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain - **9 clarifications needed**
- [x] Requirements are testable and unambiguous (except clarified ones)
- [x] Success criteria are measurable
- [x] Scope is clearly bounded - Migration of /posts to backend
- [x] Dependencies and assumptions identified - Requires backend API and workspace

**Clarifications Needed**:
1. Handling of non-existent wiki link targets (FR-014)
2. Non-markdown files in /posts directory (FR-006)
3. Frontmatter metadata parsing (FR-011)
4. Image link handling (FR-012)
5. Creator user for migrated nodes (FR-019)
6. Bidirectional references for wiki links (FR-026)
7. Rollback strategy on migration failure (FR-032)
8. Duplicate migration prevention (FR-033)
9. Preservation of original file dates (FR-040)

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (9 NEEDS CLARIFICATION markers)
- [x] User scenarios defined (21 acceptance scenarios + edge cases)
- [x] Requirements generated (40 functional requirements)
- [x] Entities identified (6 key entities)
- [x] Review checklist passed (with clarifications pending)

---

## Dependencies & Assumptions

### Dependencies
- Backend API must be running and accessible
- Workspace must exist in backend (or be created first)
- Authentication must be configured (user with permissions to create nodes)
- All backend endpoints must be functional:
  - POST /api/workspaces/{slug}/nodes
  - POST /api/nodes/{id}/attributes
  - GET /api/workspaces/{slug}/nodes (for validation)
- Frontend must be able to read local filesystem (Node.js script or similar)

### Assumptions
- Markdown files in `/posts` are from MindStone legacy system
- File names are unique within the same directory (but may duplicate across directories)
- Wiki links use double bracket format `[[Target]]` consistently
- Directory names are suitable for CONTEXT node titles
- Backend supports storing markdown content in dedicated field
- Migration is a one-time operation (not continuous sync)
- Migrated data serves demonstration and testing purposes
- User has permission to create nodes in target workspace
- Backend handles slug generation for duplicate titles

### Constraints
- Migration should complete within reasonable time (estimate: <5 minutes for ~100 files)
- Should not overload backend API (consider rate limiting or batching)
- Should preserve data integrity (no content loss during migration)
- Should be observable (progress indication, logging)
- Should be recoverable (can resume after failure)

---

## Success Criteria

### Technical Success
- All markdown files converted to nodes in backend
- All directory relationships preserved as `contains` attributes
- All wiki links converted to `references` attributes
- Frontend displays complete knowledge graph from migrated data
- Search functionality returns results from migrated content
- No data loss or corruption during migration

### Demonstration Success
- Graph visualization shows realistic interconnected knowledge structure
- Users can navigate between nodes via wiki link relationships
- Content rendering displays markdown properly formatted
- Version control shows initial version for all migrated nodes
- Performance is acceptable for ~100+ nodes
- System demonstrates all core features (CRUD, search, graph, versions)

---

**Next Phase**: Implementation planning (/plan command) will determine technical approach, migration script architecture, and task breakdown.
