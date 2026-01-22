# Mujarrad MVP - Behavioral Requirements

**Last Updated:** 2026-01-22
**Purpose:** Define exact behaviors before implementation
**Source:** ISAAT PRD + PRD Section 8

---

## Document Purpose

This document captures the **exact expected behaviors** from the product requirements.
Before implementing any feature, understand:
1. What the user does (trigger)
2. What the system does (behavior)
3. What the user sees (outcome)

---

## Current Backend API Capabilities

> Source: https://mujarrad.onrender.com/swagger-ui/index.html

### Available Endpoints

| Resource | Endpoints | Status |
|----------|-----------|--------|
| Auth | register, login, me, oauth/google, password reset | ✅ Ready |
| Spaces | CRUD, slug lookup, batch upload | ✅ Ready |
| Nodes | CRUD, descendants, ancestors | ✅ Ready |
| Versions | history, restore | ✅ Ready |
| Attributes | CRUD with cycle detection | ✅ Ready |
| API Keys | CRUD, rotate | ✅ Ready |
| Templates | list with filtering | ✅ Ready |

---

## MVP Behavioral Specifications

### 1. Node System Behaviors

#### 1.1 Create Node
```
TRIGGER: User clicks "Create Node" or presses shortcut
BEHAVIOR:
  1. Modal opens with:
     - Title field (required)
     - Type selector (Node, Context)
     - Parent selector (optional, defaults to current context)
  2. On submit:
     - API: POST /api/spaces/{spaceSlug}/nodes
     - If duplicate title in same context → prompt merge or rename
     - If different context → allow duplicate
  3. On success:
     - Node appears in sidebar tree
     - Node card appears in main content
     - If modal had "Open after create" checked → navigate to node editor
OUTCOME: Node created, visible in hierarchy, optionally opened for editing
```

#### 1.2 Node Duplication Detection
```
TRIGGER: User creates node with existing title in same context
BEHAVIOR:
  1. Before creation, check for duplicates in current context
  2. If duplicate found:
     - Show dialog: "A node with this name exists. Merge or create new?"
     - Options: [Merge] [Create Anyway] [Rename]
  3. Merge behavior:
     - Content is appended
     - Attributes are merged (union)
     - User is taken to existing node
OUTCOME: User makes informed decision about duplicates
```

#### 1.3 Node Types
```
PRD TYPES:
  - regular (default node)
  - context (node_type = 'context')
  - attribute (for relationship definitions)
  - mapping (for transformations)
  - conditional (for branching logic)

CURRENT: Only regular + context implemented
MVP NEED: regular + context sufficient for MVP
```

#### 1.4 Delete Node
```
TRIGGER: User selects delete from context menu or modal
BEHAVIOR:
  1. Check for dependencies:
     - Child nodes (containment)
     - Referencing nodes (attributes)
     - Whiteboard elements linked
  2. If dependencies exist:
     - Show warning: "This node has X children and is referenced by Y nodes"
     - Options: [Delete All] [Delete Only This] [Cancel]
  3. Delete Only This:
     - Children become orphaned (move to space root or parent context)
     - References are broken (show broken link indicators)
  4. Delete All:
     - Cascade delete children
     - Remove all references
  5. API: DELETE /api/spaces/{spaceSlug}/nodes/{nodeId}?force=true|false
OUTCOME: Node removed with clear handling of dependencies
```

---

### 2. Context Behaviors (Contexts ARE Nodes)

#### 2.1 Create Context
```
TRIGGER: User selects "Create Context" from add menu
BEHAVIOR:
  1. Same modal as Create Node but:
     - Type is pre-selected to "Context"
     - Shows "Context contains nodes" hint
  2. On submit:
     - Creates node with node_type = 'context'
     - API: POST /api/spaces/{spaceSlug}/nodes with type: 'context'
  3. Context appears in sidebar with folder icon
  4. Context can contain other contexts (nesting)
OUTCOME: Context node created, ready to contain other nodes
```

#### 2.2 Add Node to Context (Containment)
```
TRIGGER: User drags node to context OR creates node inside context
BEHAVIOR:
  1. Create attribute relationship:
     - source: context node
     - target: child node
     - attribute_type: 'contains'
  2. API: POST /api/nodes/{contextId}/attributes
     {
       "targetNodeId": "<child-uuid>",
       "attributeType": "contains",
       "strength": 1.0
     }
  3. Child appears inside context in sidebar tree
  4. Child appears in context view
OUTCOME: Containment relationship established, visible in hierarchy
```

#### 2.3 Node in Multiple Contexts (Super Position)
```
TRIGGER: User adds existing node to another context
BEHAVIOR:
  1. Node can have multiple 'contains' relationships (different parents)
  2. When adding to second context:
     - Create new attribute with type 'contains'
     - Node appears in both contexts in sidebar
     - Node shows "In X contexts" indicator
  3. Deleting from one context:
     - Only removes that 'contains' relationship
     - Node still exists in other contexts
OUTCOME: Same node visible in multiple locations, changes sync everywhere
```

#### 2.4 Context View Mode vs Node View Mode
```
TRIGGER: User toggles view mode
CONTEXT VIEW MODE:
  - Shows only nodes INSIDE the selected context
  - Hides node metadata, focuses on content
  - Navigation: context tree only

NODE VIEW MODE:
  - Shows node with all its contexts as attributes/tags
  - Shows node's relationships to other nodes
  - Navigation: node relationships graph

PRD QUOTE: "Context and Nodes are not pairs in the same view"
```

---

### 3. Relationship/Wiring Behaviors

#### 3.1 Create Relationship (Wiring)
```
TRIGGER: User connects two nodes via UI or command
BEHAVIOR:
  1. Relationship types (PRD):
     - contains: hierarchy
     - depends_on: dependency
     - references: citation/link
     - parent_of: explicit parent
     - relates_to: general association
  2. Creating via UI:
     - Drag line from node A to node B
     - Select relationship type from dropdown
     - Optionally set strength (0.0 - 1.0)
  3. API: POST /api/nodes/{sourceId}/attributes
     {
       "targetNodeId": "<target-uuid>",
       "attributeType": "depends_on",
       "strength": 0.8
     }
  4. Backend performs cycle detection for 'contains' type
OUTCOME: Relationship visible in graph view, affects navigation
```

#### 3.2 Attribute Display Types
```
PRD TYPES:
  - label: tag-like display on node
  - button: clickable action on node
  - block: expanded view inside node

CURRENT: Not implemented
MVP: Labels sufficient for MVP
```

---

### 4. Versioning Behaviors

#### 4.1 Auto-Save Creates Version
```
TRIGGER: User edits node content (auto-save)
BEHAVIOR:
  1. Every save creates a new version
  2. API stores:
     - Full content snapshot
     - Timestamp
     - User who made change
     - Change delta (optional)
  3. Version number increments
  4. User sees "Saved" indicator
OUTCOME: Complete history maintained, can restore any version
```

#### 4.2 Version History View
```
TRIGGER: User opens version history panel
BEHAVIOR:
  1. Show list of all versions:
     - Version number
     - Timestamp
     - Author
     - Change summary (if available)
  2. User can:
     - Click to preview version (read-only)
     - Click "Restore" to make version current
     - Compare two versions (diff view)
  3. API: GET /api/nodes/{nodeId}/versions
OUTCOME: User can navigate through time, restore past states
```

#### 4.3 Restore Version
```
TRIGGER: User clicks "Restore" on a version
BEHAVIOR:
  1. Confirm dialog: "Restore to version X? Current content will become a new version."
  2. On confirm:
     - API: POST /api/nodes/{nodeId}/versions/{versionNumber}/restore
     - Current state saved as new version first
     - Content replaced with restored version
     - New version created with "Restored from vX" note
OUTCOME: Node content matches restored version, history preserved
```

---

### 5. Search Behaviors

#### 5.1 Global Search (Teleportation)
```
TRIGGER: User opens search modal (Cmd+K) and types query
BEHAVIOR:
  1. Search across:
     - Node titles (weighted high)
     - Node content (weighted medium)
     - Attribute values (weighted low)
  2. Results show:
     - Node title
     - Breadcrumb path (Space > Context > Context)
     - Content snippet with highlighted match
     - Type indicator (node/context)
  3. User selects result:
     - Navigate to node in editor
     - Expand sidebar to show node location
     - Scroll to matched content (if content match)

PRD QUOTE: "Search teleportation to target node and navigate to its parent contexts"
OUTCOME: User instantly arrives at searched content with full context
```

#### 5.2 Scoped Search (Within Context)
```
TRIGGER: User searches while inside a context
BEHAVIOR:
  1. Toggle: "Search in current context only"
  2. When enabled:
     - Only search descendants of current context
     - Filter by containment relationships
  3. API: GET /api/spaces/{spaceSlug}/search?contextId=<uuid>&query=<text>
OUTCOME: Focused search within specific scope
```

---

### 6. Application Modes Behaviors

#### 6.1 Mode State Management
```
MODES (Client-side state):
  1. Scoped View: Filter by context/dimension/attribute
  2. Full View: Display all accessible nodes
  3. Edit Mode: Enable CRUD operations (Member+)
  4. Configure Mode: System settings (Admin only)
  5. Setup Mode: Define structures (Editor+)
  6. Utilization Mode: Use without modification (Member)

BEHAVIOR:
  - Mode stored in client state (Zustand)
  - Mode affects UI rendering (show/hide controls)
  - Mode affects API queries (add filters)
  - Mode transitions are instant
  - Server validates permissions on mutations
```

#### 6.2 Scoped View Behavior
```
TRIGGER: User selects scope filters
BEHAVIOR:
  1. User can filter by:
     - Context (show only nodes in X)
     - Dimension (Time, Party, Process, Mission)
     - Attribute value
  2. UI updates to show only matching nodes
  3. Navigation tree collapses to show filtered items
  4. "X items hidden by filter" indicator shown
  5. Clear filter: "Show All" button
OUTCOME: User sees subset of data matching their focus
```

---

### 7. Sharing Behaviors

#### 7.1 Share Space/Context
```
TRIGGER: User clicks Share button
BEHAVIOR:
  1. Modal shows:
     - Current collaborators list
     - Invite by email field
     - Permission level selector (View, Edit, Admin)
     - Copy link button
  2. Invite flow:
     - Enter email(s)
     - Select permission level
     - Send invites
     - API creates pending invite
  3. Link sharing:
     - Generate shareable link
     - Link includes access token
     - Viewer can access without account (limited)
OUTCOME: Collaborators can access shared content with appropriate permissions
```

#### 7.2 Permission Levels
```
LEVELS (PRD):
  - Guest: Read-only, no account required
  - Member: CRUD on content (not structure)
  - Editor: CRUD on structure + content
  - Admin: Full access including settings

BEHAVIOR:
  - UI shows/hides controls based on permission
  - API enforces permissions
  - Insufficient permission → "Permission denied" toast
```

---

### 8. Whiteboard-Hierarchy Sync Behaviors

#### 8.1 Create Node from Whiteboard
```
TRIGGER: User creates element on whiteboard
BEHAVIOR:
  1. Element created in Excalidraw
  2. If element is text or shape with text:
     - Prompt: "Create as node?"
     - If yes: Create node with element text as title
     - Link element to node (store nodeId in element metadata)
  3. Linked elements show indicator
OUTCOME: Visual elements can become nodes, maintaining sync
```

#### 8.2 Node Changes Reflect in Whiteboard
```
TRIGGER: User renames node that's linked to whiteboard element
BEHAVIOR:
  1. Detect node title change
  2. Find linked whiteboard elements
  3. Update element text to match
  4. Save whiteboard state
OUTCOME: Whiteboard stays in sync with hierarchy
```

---

### 9. Block Editor Behaviors

#### 9.1 Slash Commands
```
TRIGGER: User types "/" in editor
BEHAVIOR:
  1. Command menu appears with options:
     - Text, Heading 1/2/3
     - Bullet List, Numbered List, To-do
     - Quote, Code, Divider
     - Math, Mermaid, Image
     - Callout
  2. User types to filter commands
  3. User selects command (click or enter)
  4. Block of that type inserted
  5. Cursor moves to block content
OUTCOME: User can quickly add structured content
```

#### 9.2 Block Drag & Drop
```
TRIGGER: User drags block handle
BEHAVIOR:
  1. Block becomes draggable
  2. Drop indicator shows between other blocks
  3. On drop:
     - Reorder blocks in content array
     - Auto-save triggers
  4. Undo available (Cmd+Z)
OUTCOME: User can reorder content visually
```

---

## Developer Platform Behaviors

### 10. API Key Management

#### 10.1 Create API Key
```
TRIGGER: Developer requests API key from settings
BEHAVIOR:
  1. API: POST /api/api-keys
  2. Response includes:
     - keyId: public identifier
     - secret: shown ONCE, user must save
     - scopes: permissions granted
  3. UI shows "Copy Secret" with warning
  4. Key appears in keys list (secret hidden)
OUTCOME: Developer has credentials for API access
```

#### 10.2 API Authentication Flow
```
FLOW:
  1. Developer includes key in header: X-API-Key: <keyId>:<secret>
  2. Server validates key, checks scopes
  3. Request processed with key's permissions
  4. Rate limiting applied per key
```

---

## Agent Integration Behaviors

### 11. MCP Server (To Be Implemented)

#### 11.1 MCP Resource: Nodes
```
RESOURCE: mujarrad://spaces/{spaceSlug}/nodes
BEHAVIOR:
  1. Agent requests node list
  2. MCP server calls API: GET /api/spaces/{spaceSlug}/nodes
  3. Returns nodes as MCP resources
  4. Agent can read node content
```

#### 11.2 MCP Tool: Create Node
```
TOOL: create_node
PARAMETERS:
  - spaceSlug: string
  - title: string
  - content: string (optional)
  - parentId: string (optional)
  - type: 'node' | 'context'
BEHAVIOR:
  1. Agent calls tool with parameters
  2. MCP server calls API: POST /api/spaces/{spaceSlug}/nodes
  3. Returns created node
```

#### 11.3 MCP Tool: Search
```
TOOL: search_nodes
PARAMETERS:
  - spaceSlug: string
  - query: string
  - contextId: string (optional)
BEHAVIOR:
  1. Agent performs search
  2. MCP server calls API search endpoint
  3. Returns matching nodes with paths
```

---

## Behavior Validation Checklist

Before implementing any feature, verify:

- [ ] Trigger is clearly defined (user action)
- [ ] System behavior is deterministic (same input → same output)
- [ ] Outcome is user-visible and verifiable
- [ ] Error cases are handled with clear messaging
- [ ] Loading states are defined
- [ ] API endpoints exist or are documented
- [ ] Permissions are enforced
- [ ] Undo/redo behavior is considered

---

## Gap Analysis: PRD vs Current Implementation

### Implemented ✅
- Basic node CRUD
- Space CRUD
- Context creation (as nodes)
- Basic versioning
- Search (basic)
- Block editor with slash commands
- Whiteboard (Excalidraw)
- Authentication (JWT + OAuth)
- Basic sharing

### Partially Implemented ⚠️
- Relationship types (only 'contains' used heavily)
- Duplicate detection (not enforced)
- Whiteboard-hierarchy sync
- Application modes (Edit mode implicit)

### Not Implemented ❌
- Node types (attribute, mapping, conditional)
- Existence types (Essential, Purposed, Functional, Temporary)
- Relationship strength weights
- Templates (is_template flag)
- Phantom/mask versioning
- Super position UI (node in multiple contexts)
- Application mode selector
- MCP server

---

## Next Steps

1. **Stabilize Current Features**
   - Fix dependency checking on delete
   - Complete duplicate detection
   - Sync whiteboard ↔ hierarchy

2. **Add Missing MVP Core**
   - Application mode selector UI
   - Relationship type selector
   - Templates (is_template flag)

3. **Developer Platform**
   - Document API (Swagger already exists)
   - Create TypeScript SDK
   - Add MCP server

4. **Agent Ready**
   - Build MCP server
   - Test with Claude Code
   - Document agent workflows

---

## Change Log

| Date | Change |
|------|--------|
| 2026-01-22 | Initial behavioral requirements created |
