# Quickstart: Obsidian-like Features Validation

**Feature**: 004-i-need-to
**Date**: 2025-10-07
**Purpose**: End-to-end validation of hierarchy navigation, markdown rendering, wiki-links, and graph visualization

## Prerequisites

- Backend running on http://localhost:3000
- Frontend running on http://localhost:3001
- User account created: `omar.h.shafeek@gmail.com` / `Om@r1234`
- Test workspace created: "Demo Workspace"

---

## Test Scenario 1: Hierarchical Navigation

**User Story**: Browse pages organized in folders, expand/collapse tree, navigate to pages

### Steps

1. **Login**:
   ```
   Navigate to: http://localhost:3001/login
   Email: omar.h.shafeek@gmail.com
   Password: Om@r1234
   Click: "Sign in"
   ```

2. **Select Workspace**:
   ```
   Click: "Demo Workspace" card
   ```

3. **View Hierarchy** (NEW UI):
   ```
   Expected: Left sidebar shows tree navigation
   Should see:
   ├── 📁 Projects (CONTEXT)
   ├── 📁 Notes (CONTEXT)
   └── 📄 Welcome (REGULAR)
   ```

4. **Expand Folder**:
   ```
   Click: Arrow icon next to "Projects"
   Expected: Tree expands to show children:
   ├── 📁 Projects ▼
   │   ├── 📄 Project A
   │   └── 📄 Project B
   ```

5. **Navigate to Page**:
   ```
   Click: "Project A"
   Expected: Main content area displays "Project A" page
   Expected: Markdown content rendered with formatting
   ```

6. **Verify Selection State**:
   ```
   Expected: "Project A" highlighted in tree
   Expected: Browser URL: /workspace/demo-workspace/node/{nodeId}
   ```

### Validation Checklist

- [ ] Tree shows CONTEXT nodes with folder icon (📁)
- [ ] Tree shows REGULAR nodes with document icon (📄)
- [ ] Expand/collapse works smoothly (< 100ms)
- [ ] Selected node is highlighted
- [ ] Page content loads and displays

---

## Test Scenario 2: Markdown Rendering with Wiki-links

**User Story**: View formatted markdown content, click wiki-links to navigate between pages

### Steps

1. **Navigate to Page with Wiki-links**:
   ```
   In tree, click: "Welcome"
   ```

2. **Verify Markdown Rendering**:
   ```
   Expected content:
   # Welcome to Mujarrad

   This is a **knowledge graph** system.

   - Feature 1
   - Feature 2

   See [[Projects]] for active work.
   ```

   ```
   Verify:
   - Headers rendered as <h1>, <h2>, etc.
   - Bold text (**...**) rendered correctly
   - Bulleted lists displayed
   - Wiki-link [[Projects]] is clickable and styled distinctly
   ```

3. **Click Wiki-link**:
   ```
   Click: The "Projects" wiki-link
   Expected: Navigate to "Projects" folder page
   Expected: URL changes to /workspace/demo-workspace/node/{projects-id}
   Expected: Tree automatically expands "Projects" folder
   ```

4. **Test Aliased Wiki-link**:
   ```
   Create test content with: "Read [[this article|Project A]]"
   Click: "this article" link
   Expected: Navigate to "Project A" page (not "this article")
   Expected: Display shows "this article" but links to Project A
   ```

### Validation Checklist

- [ ] All markdown formatting renders correctly
- [ ] Wiki-links are visually distinct (different color, underline)
- [ ] Clicking wiki-link navigates to target page
- [ ] Aliased wiki-links show display text but link to target
- [ ] Browser back/forward buttons work for navigation
- [ ] Navigation history maintained (can go back)

---

## Test Scenario 3: Wiki-link Parsing and Placeholder Creation

**User Story**: Edit page content with wiki-links, system creates relationships and placeholder pages

### Steps

1. **Edit Page**:
   ```
   Navigate to: "Welcome" page
   Click: "Edit" button
   ```

2. **Add New Wiki-link to Non-Existent Page**:
   ```
   In markdown editor, type:
   "Check out [[Future Feature]] for upcoming work."

   Click: "Save"
   ```

3. **Verify Placeholder Creation**:
   ```
   Expected: Toast notification: "Creating new page: Future Feature"
   Expected: Save completes successfully
   Expected: New page "Future Feature" appears in tree (at root or in current folder)
   Expected: Clicking [[Future Feature]] navigates to empty page
   ```

4. **Verify Relationship Created**:
   ```
   Open graph view (next test scenario)
   Expected: Edge from "Welcome" to "Future Feature"
   Expected: Edge labeled "references" or "wiki-link"
   ```

5. **Edit Placeholder Page**:
   ```
   Navigate to: "Future Feature" page
   Click: "Edit"
   Add content: "This will be implemented soon."
   Click: "Save"
   Expected: Page no longer empty
   ```

### Validation Checklist

- [ ] Editing UI allows markdown input
- [ ] Saving triggers wiki-link parsing
- [ ] Non-existent targets create placeholder pages
- [ ] Placeholder pages appear in tree immediately
- [ ] Relationships (attributes) created in backend
- [ ] Clicking wiki-link navigates to placeholder

---

## Test Scenario 4: Graph Visualization

**User Story**: View workspace as interactive graph, see connections, toggle node types

### Steps

1. **Open Graph View**:
   ```
   In workspace page, click: "Graph" tab
   Expected: Canvas displays all nodes as graph
   ```

2. **Verify Node Rendering**:
   ```
   Expected:
   - CONTEXT nodes: Rounded rectangles, folder icon, light color
   - REGULAR nodes: Standard rectangles, document icon
   - All nodes labeled with page titles
   ```

3. **Verify Edge Rendering**:
   ```
   Expected:
   - Edges connect related nodes
   - Different edge types have different styles:
     * "contains" (hierarchy): Solid line
     * "references" (wiki-links): Dashed line or different color
   ```

4. **Test Bidirectional Edge**:
   ```
   Create bidirectional link:
   - Edit "Project A": Add "See [[Project B]]"
   - Edit "Project B": Add "See [[Project A]]"

   In graph view:
   Expected: Single edge between Project A ↔ Project B
   Expected: Double-headed arrow or thicker line (distinct styling)
   ```

5. **Toggle CONTEXT Nodes**:
   ```
   In graph controls, click: "Hide Folders" toggle
   Expected: All CONTEXT nodes disappear from graph
   Expected: Only REGULAR nodes and their wiki-link edges shown
   Expected: Layout recalculates
   ```

6. **Toggle REGULAR Nodes**:
   ```
   Click: "Show Folders Only" option
   Expected: Only CONTEXT nodes shown
   Expected: Hierarchy edges (contains relationships) displayed
   ```

7. **Combined View**:
   ```
   Click: "Show All"
   Expected: Both CONTEXT and REGULAR nodes visible
   Expected: All relationship types displayed
   ```

8. **Interact with Graph**:
   ```
   - Pan: Click and drag background
   - Zoom: Scroll wheel
   - Select node: Click node
   - Navigate: Double-click node
   Expected: All interactions smooth (60fps)
   Expected: Double-clicking node navigates to that page
   ```

### Validation Checklist

- [ ] Graph renders all nodes correctly
- [ ] Node types visually distinct
- [ ] Edges connect related nodes
- [ ] Bidirectional edges merged with special styling
- [ ] Toggle controls filter nodes correctly
- [ ] Graph layout recalculates on filter change
- [ ] Pan, zoom, and navigation work smoothly
- [ ] Double-click navigates to page

---

## Test Scenario 5: Relationship Preservation (Clarification #4)

**User Story**: Relationships preserved when wiki-links removed from markdown

### Steps

1. **Create Wiki-link and Verify Relationship**:
   ```
   Edit "Welcome": Add "See [[Project A]]"
   Save
   Open graph view
   Expected: Edge from Welcome → Project A
   ```

2. **Remove Wiki-link from Markdown**:
   ```
   Edit "Welcome": Delete "See [[Project A]]" text
   Save
   ```

3. **Verify Relationship Still Exists**:
   ```
   Open graph view
   Expected: Edge from Welcome → Project A STILL EXISTS
   Rationale: Per clarification #4, relationships preserved for history
   ```

4. **Verify in Backend**:
   ```
   Open browser DevTools → Network tab
   GET /api/nodes/welcome-id/attributes
   Expected: Attribute with type="references", key="wiki-link" still present
   Expected: Target still points to Project A node
   ```

### Validation Checklist

- [ ] Removing wiki-link text does NOT delete relationship
- [ ] Graph still shows edge after markdown edit
- [ ] Backend attribute still exists (check via API)
- [ ] Connection history preserved

---

## Test Scenario 6: Error Handling

**User Story**: Graceful error handling for network issues, validation errors, circular dependencies

### Steps

1. **Test Network Error**:
   ```
   Stop backend server (Ctrl+C in backend terminal)
   Try to save page edit
   Expected: Toast notification: "Connection lost. Retrying..."
   Expected: Auto-retry 3 times
   Expected: Final error message: "Could not save. Please check connection."
   ```

2. **Test Validation Error**:
   ```
   Restart backend
   Create new page with empty title
   Click: "Save"
   Expected: Validation error: "Title is required"
   Expected: Error highlighted on title field
   ```

3. **Test Circular Dependency** (if UI allows hierarchy editing):
   ```
   Attempt to move "Projects" folder inside "Project A"
   (Project A is already inside Projects)
   Expected: Backend rejects with 409 Conflict
   Expected: Error message: "This would create a circular folder structure"
   Expected: Cycle path shown: ["Projects", "Project A", "Projects"]
   ```

### Validation Checklist

- [ ] Network errors trigger retry logic
- [ ] User-friendly error messages displayed
- [ ] Validation errors show field-level feedback
- [ ] Circular dependency prevention works
- [ ] Error states don't break UI

---

## Test Scenario 7: Performance

**User Story**: System performs well with 100+ nodes

### Steps

1. **Create Test Data** (automated script):
   ```bash
   # Run from backend
   npm run seed-test-data -- --nodes=150 --depth=5
   ```

2. **Refresh Frontend**:
   ```
   Reload page: http://localhost:3001/workspace/demo-workspace
   ```

3. **Measure Tree Load Time**:
   ```
   Open DevTools → Performance tab
   Record while loading tree
   Expected: Initial render < 1.5s
   Expected: Tree interactive < 2s
   ```

4. **Measure Graph Load Time**:
   ```
   Navigate to Graph view
   Record performance
   Expected: Graph renders < 3s
   Expected: Pan/zoom maintains 60fps
   ```

5. **Measure Search Performance**:
   ```
   In search box, type: "test"
   Expected: Debounced (300ms delay)
   Expected: Results appear < 500ms after typing stops
   ```

### Validation Checklist

- [ ] Tree loads < 2s with 150 nodes
- [ ] Graph renders < 3s with 150 nodes
- [ ] Pan/zoom maintains 60fps
- [ ] Search results appear quickly
- [ ] No UI freezing or stuttering

---

## Accessibility Verification

### Keyboard Navigation

```
Test with keyboard only (no mouse):
1. Tab through tree nodes
   Expected: Focus visible (outline)
   Expected: Tab moves to next node
2. Press Enter on selected node
   Expected: Navigate to that page
3. Use Arrow keys in tree
   Expected: Up/Down navigate nodes
   Expected: Right expands, Left collapses
4. Tab through graph nodes
   Expected: Can focus nodes via Tab
   Expected: Enter navigates to page
```

### Screen Reader

```
Test with VoiceOver (Mac) or NVDA (Windows):
1. Navigate tree
   Expected: Announces "Projects, folder, collapsed"
   Expected: Announces "Project A, page"
2. Activate expand button
   Expected: Announces "Projects, folder, expanded"
3. Click wiki-link
   Expected: Announces "Link to Projects"
```

### Validation Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible (2px outline)
- [ ] ARIA labels present (role="tree", aria-expanded)
- [ ] Screen reader announces node types and states
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)

---

## Final Validation

### Complete User Flow

```
1. Login → 2. Select workspace → 3. Browse tree →
4. Expand folder → 5. Click page → 6. Read markdown →
7. Click wiki-link → 8. Navigate → 9. View graph →
10. Toggle filters → 11. Edit page → 12. Save →
13. Verify relationship → 14. Logout
```

**Expected**: Entire flow completes without errors, UI responsive, data persists

### Checklist

- [ ] All 7 test scenarios pass
- [ ] Performance benchmarks met
- [ ] Accessibility requirements satisfied
- [ ] No console errors during testing
- [ ] Backend API calls logged correctly
- [ ] State management working (Zustand + React Query)

---

## Cleanup

```bash
# Optional: Reset test data
npm run db:reset
npm run seed-demo-data
```

---

## Success Criteria

✅ All test scenarios pass
✅ Performance within acceptable limits
✅ Accessibility WCAG AA compliant
✅ No breaking bugs or errors
✅ User experience smooth and intuitive

**Feature Ready for Production** 🎉
