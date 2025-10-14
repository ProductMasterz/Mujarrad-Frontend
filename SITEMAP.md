# Mujarrad Frontend - Site Map & Navigation

## Application Structure

### Public Routes (Unauthenticated)
- `/` - Landing/Home page
- `/login` - User login
- `/register` - User registration

### Protected Routes (Authenticated)

#### Space Management
- `/spaces` - List all user's spaces
  - **Components**: CreateSpaceDialog
  - **Actions**: View all spaces, Create new space

#### Space Detail View
- `/spaces/[slug]` - Individual space view
  - **Tabs**:
    - Node List (default)
    - Hierarchy Navigator
    - Graph Visualization
  - **Components**: CreateNodeDialog, NodeList, HierarchyNavigator, GraphVisualization
  - **Actions**: Create nodes, View nodes, Navigate hierarchy, Visualize relationships

#### Node Detail View
- `/spaces/[slug]/node/[id]` - Individual node view
  - **Components**: NodeDetailView, MarkdownRenderer with WikiLinks
  - **Actions**: View node content, Edit node, Delete node, Navigate via wiki-links

#### Legacy Routes (Deprecated - should be removed)
- `/space/[slug]` - Old space route (duplicate)
- `/space/[slug]/node/[id]` - Old node route (duplicate)

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

#### Spaces List Page (`/spaces`)
```
SpacesPage
  ├─ CreateSpaceDialog
  └─ Space cards/list (Basic implementation)
```

#### Space Detail Page (`/spaces/[slug]`)
```
SpaceDetailPage
  ├─ Space Header/Title
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

#### Node Detail Page (`/spaces/[slug]/node/[id]`)
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

2. **Space Sidebar**
   - No persistent navigation between spaces
   - No quick access to recent nodes
   - No space switcher

3. **Empty States**
   - No "no spaces" placeholder
   - No "no nodes" placeholder
   - No loading skeletons

4. **Error States**
   - Basic error boundaries exist
   - No user-friendly error messages
   - No retry mechanisms in UI

### Inconsistent Patterns
1. **Duplicate Routes**
   - `/space/[slug]` vs `/spaces/[slug]`
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
   - No clear path to go back to space list from node detail
   - No breadcrumbs showing: Spaces > My Space > Node Title
   - Can't navigate between nodes easily without going back

2. **Discovery**
   - Hard to find nodes within large spaces
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
│   ├─ Space Switcher Dropdown
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

#### `/spaces` - Space Gallery
```
[Nav Bar]
[Breadcrumbs: Spaces]
[Page Title: "My Spaces" | Create Button]
[Grid/List of Space Cards]
  - Space name
  - Description
  - Node count
  - Last modified
  - Thumbnail/Icon
```

#### `/spaces/[slug]` - Space Detail
```
[Nav Bar with Space Switcher]
[Breadcrumbs: Spaces > Space Name]
[Space Header: Title | Create Node | Settings]
[Tabs: List | Hierarchy | Graph]
[Tab Content]
```

#### `/spaces/[slug]/node/[id]` - Node Detail
```
[Nav Bar]
[Breadcrumbs: Spaces > Space > Node Title]
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
- Space switcher
- Search functionality
- Node filtering/sorting
- Visual distinction for node types
- Related nodes sidebar

## Priority Recommendations

### P0 - Critical
1. Add global navigation header
2. Implement breadcrumbs
3. Add Tabs UI component (shadcn/ui)
4. Remove duplicate `/space` routes

### P1 - High
5. Empty states for all lists
6. Loading skeletons
7. Space switcher in header
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
