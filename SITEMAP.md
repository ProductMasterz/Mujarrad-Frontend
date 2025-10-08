# Mujarrad Frontend - Site Map & Navigation

## Application Structure

### Public Routes (Unauthenticated)
- `/` - Landing/Home page
- `/login` - User login
- `/register` - User registration

### Protected Routes (Authenticated)

#### Workspace Management
- `/workspaces` - List all user's workspaces
  - **Components**: CreateWorkspaceDialog
  - **Actions**: View all workspaces, Create new workspace

#### Workspace Detail View
- `/workspaces/[slug]` - Individual workspace view
  - **Tabs**:
    - Node List (default)
    - Hierarchy Navigator
    - Graph Visualization
  - **Components**: CreateNodeDialog, NodeList, HierarchyNavigator, GraphVisualization
  - **Actions**: Create nodes, View nodes, Navigate hierarchy, Visualize relationships

#### Node Detail View
- `/workspaces/[slug]/node/[id]` - Individual node view
  - **Components**: NodeDetailView, MarkdownRenderer with WikiLinks
  - **Actions**: View node content, Edit node, Delete node, Navigate via wiki-links

#### Legacy Routes (Deprecated - should be removed)
- `/workspace/[slug]` - Old workspace route (duplicate)
- `/workspace/[slug]/node/[id]` - Old node route (duplicate)

#### Demo/Testing
- `/feature-004-demo` - Feature showcase (currently disabled)

## Component Hierarchy

### Layout Components
```
app/
  layout.tsx (Root layout with Providers)
    ├─ Navbar/Header (Missing!)
    ├─ Sidebar (Missing!)
    └─ Main content area
```

### Page-Specific Components

#### Workspaces List Page (`/workspaces`)
```
WorkspacesPage
  ├─ CreateWorkspaceDialog
  └─ Workspace cards/list (Basic implementation)
```

#### Workspace Detail Page (`/workspaces/[slug]`)
```
WorkspaceDetailPage
  ├─ Workspace Header/Title
  ├─ Tab Navigation
  │   ├─ Node List Tab
  │   │   ├─ CreateNodeDialog
  │   │   └─ NodeList
  │   ├─ Hierarchy Tab
  │   │   └─ HierarchyNavigator
  │   │       └─ TreeNode (recursive)
  │   └─ Graph Tab
  │       ├─ GraphVisualization
  │       │   ├─ CustomNode
  │       │   └─ Custom edges
  │       └─ GraphControls
  └─ CreateNodeDialog (global action)
```

#### Node Detail Page (`/workspaces/[slug]/node/[id]`)
```
NodeDetailPage
  ├─ Node Header (title, type, version)
  ├─ EditNodeDialog
  ├─ DeleteNodeDialog
  └─ MarkdownRenderer
      └─ WikiLink components (clickable [[links]])
```

## Design Issues & Gaps

### Missing Core Components
1. **Global Navigation/Navbar**
   - No consistent header across pages
   - No breadcrumbs for navigation context
   - No user profile/logout menu

2. **Workspace Sidebar**
   - No persistent navigation between workspaces
   - No quick access to recent nodes
   - No workspace switcher

3. **Empty States**
   - No "no workspaces" placeholder
   - No "no nodes" placeholder
   - No loading skeletons

4. **Error States**
   - Basic error boundaries exist
   - No user-friendly error messages
   - No retry mechanisms in UI

### Inconsistent Patterns
1. **Duplicate Routes**
   - `/workspace/[slug]` vs `/workspaces/[slug]`
   - Need to consolidate and redirect

2. **Tab Component Missing**
   - Using custom tab implementation
   - Should use consistent UI library (shadcn/ui)

3. **Layout Inconsistency**
   - Different pages have different spacing
   - No unified content container widths
   - Inconsistent padding/margins

### User Experience Issues
1. **Navigation Flow**
   - No clear path to go back to workspace list from node detail
   - No breadcrumbs showing: Workspaces > My Workspace > Node Title
   - Can't navigate between nodes easily without going back

2. **Discovery**
   - Hard to find nodes within large workspaces
   - No search functionality
   - No filters or sorting options

3. **Visual Hierarchy**
   - All nodes look similar regardless of type (CONTEXT vs REGULAR vs ASSUMPTION)
   - Graph nodes have basic styling but could be more distinctive
   - No visual indicators for node relationships

## Recommended Structure (Ideal)

```
/
├─ Global Navigation Bar
│   ├─ Logo / Home
│   ├─ Workspace Switcher Dropdown
│   ├─ Search
│   └─ User Menu (Profile, Settings, Logout)
│
├─ Main Content Area
│   ├─ Breadcrumbs
│   ├─ Page Title & Actions
│   └─ Content
│
└─ Optional Right Sidebar
    └─ Contextual help / Recent items
```

### Proposed Page Layouts

#### `/workspaces` - Workspace Gallery
```
[Nav Bar]
[Breadcrumbs: Workspaces]
[Page Title: "My Workspaces" | Create Button]
[Grid/List of Workspace Cards]
  - Workspace name
  - Description
  - Node count
  - Last modified
  - Thumbnail/Icon
```

#### `/workspaces/[slug]` - Workspace Detail
```
[Nav Bar with Workspace Switcher]
[Breadcrumbs: Workspaces > Workspace Name]
[Workspace Header: Title | Create Node | Settings]
[Tabs: List | Hierarchy | Graph]
[Tab Content]
```

#### `/workspaces/[slug]/node/[id]` - Node Detail
```
[Nav Bar]
[Breadcrumbs: Workspaces > Workspace > Node Title]
[Node Header: Type Badge | Edit | Delete]
[Markdown Content with Wiki Links]
[Related Nodes Sidebar]
```

## Feature 004 Implementation Status

### ✅ Completed
- Hierarchy tree navigation with keyboard support
- Graph visualization with React Flow
- Markdown rendering with wiki-link support
- Error boundaries and retry logic
- WCAG AA accessibility compliance
- Performance optimizations (React.memo, useMemo)

### ⚠️ Partially Implemented
- Basic layouts exist but inconsistent
- Node CRUD operations implemented but UI lacks polish
- Navigation works but not intuitive

### ❌ Missing
- Persistent navigation/header
- Breadcrumbs
- Empty states
- Loading states with skeletons
- Tabs UI component
- Workspace switcher
- Search functionality
- Node filtering/sorting
- Visual distinction for node types
- Related nodes sidebar

## Priority Recommendations

### P0 - Critical
1. Add global navigation header
2. Implement breadcrumbs
3. Add Tabs UI component (shadcn/ui)
4. Remove duplicate `/workspace` routes

### P1 - High
5. Empty states for all lists
6. Loading skeletons
7. Workspace switcher in header
8. Visual node type indicators

### P2 - Medium
9. Search functionality
10. Node filters and sorting
11. Related nodes sidebar
12. Settings pages

### P3 - Nice to Have
13. Dark mode
14. Customizable layouts
15. Keyboard shortcuts
16. Node templates
