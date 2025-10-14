# Research: Obsidian-like Page Hierarchy and Graph Navigation

**Feature**: 004-i-need-to
**Date**: 2025-10-07
**Status**: Complete

## Overview

This document captures research decisions for implementing Obsidian-like features in Mujarrad: hierarchical page navigation, markdown preview with wiki-links, and enhanced graph visualization.

---

## 1. Markdown Rendering with Wiki-links

### Decision: react-markdown + remark-gfm + custom wiki-link plugin

**Rationale:**
- `react-markdown` is the de facto standard for React markdown rendering (37k+ stars)
- `remark-gfm` provides GitHub Flavored Markdown (tables, task lists, strikethrough)
- Custom remark plugin can intercept and transform `[[wiki-link]]` syntax
- Integrates seamlessly with Next.js (no SSR issues)
- Supports custom components for rendering (can inject click handlers)

**Alternatives Considered:**
- **marked.js**: Lower-level, requires more manual DOM manipulation
- **markdown-it**: Excellent but not React-native, would need wrapper
- **MDX**: Overkill for this use case, adds complexity

**Implementation Approach:**
```typescript
// Custom remark plugin to transform [[Target]] → <WikiLink>
function remarkWikiLinks() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      const matches = node.value.match(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g);
      // Transform to custom node type
      // React component will handle click navigation
    });
  };
}
```

**References:**
- [react-markdown docs](https://github.com/remarkjs/react-markdown)
- [remark plugins guide](https://github.com/remarkjs/remark/blob/main/doc/plugins.md)

---

## 2. Hierarchical Tree Navigation

### Decision: Custom recursive component with collapsible state

**Rationale:**
- Simple data structure (CONTEXT nodes with `contains` relationships)
- Full control over styling and interaction
- No external library dependency (lightweight)
- Matches backend's node hierarchy model
- Easy to integrate expand/collapse state management

**Alternatives Considered:**
- **react-arborist**: Feature-rich but heavy (100KB+), unnecessary complexity
- **react-complex-tree**: Good but opinionated styling, harder to customize
- **Material-UI TreeView**: Requires full MUI dependency

**Implementation Approach:**
```typescript
// Recursive tree component
function TreeNode({ node, level, onNavigate }) {
  const [expanded, setExpanded] = useState(false);
  const children = node.children || [];

  return (
    <div style={{ paddingLeft: `${level * 20}px` }}>
      {node.type === 'CONTEXT' && (
        <button onClick={() => setExpanded(!expanded)}>
          {expanded ? '▼' : '▶'}
        </button>
      )}
      <span onClick={() => onNavigate(node.id)}>{node.title}</span>
      {expanded && children.map(child => (
        <TreeNode key={child.id} node={child} level={level + 1} />
      ))}
    </div>
  );
}
```

---

## 3. Graph Visualization Enhancement

### Decision: Continue with React Flow, add custom node types and edge detection

**Rationale:**
- React Flow already in use (constitution-locked)
- Excellent performance with large graphs (1000+ nodes)
- Built-in zoom, pan, minimap features
- Custom node types easily extensible
- Edge styling fully customizable
- Active maintenance and community support

**Enhancements Needed:**
1. **Custom Node Types**:
   - `CONTEXT` nodes: Folder icon, rounded rectangle, lighter color
   - `REGULAR` nodes: Document icon, standard rectangle
2. **Bidirectional Edge Detection**:
   - Algorithm to detect A→B + B→A pairs
   - Merge into single edge with double-headed arrow
3. **Toggle Filter**:
   - Filter nodes by type before rendering
   - Recalculate layout when toggling

**Implementation Approach:**
```typescript
// Detect bidirectional edges
function detectBidirectional(edges: Edge[]): Edge[] {
  const bidirectional = new Set<string>();
  const edgeMap = new Map<string, Edge>();

  edges.forEach(edge => {
    const key = `${edge.source}-${edge.target}`;
    const reverseKey = `${edge.target}-${edge.source}`;

    if (edgeMap.has(reverseKey)) {
      bidirectional.add(key);
      bidirectional.add(reverseKey);
    }
    edgeMap.set(key, edge);
  });

  // Merge bidirectional pairs
  return mergeBidirectional(edges, bidirectional);
}
```

**References:**
- [React Flow docs](https://reactflow.dev/)
- [Custom nodes guide](https://reactflow.dev/learn/customization/custom-nodes)

---

## 4. Wiki-link Parsing Strategy

### Decision: Client-side parsing on save + backend relationship storage

**Rationale:**
- Parsing on frontend allows immediate visual feedback
- Backend stores parsed relationships as `attributes` (constitutional requirement)
- Relationship history preserved (clarification #4: keep relationships)
- Enables real-time graph updates without page reload

**Workflow:**
1. User edits markdown content in textarea
2. On save, client-side regex extracts all `[[Target]]` or `[[Display|Target]]`
3. For each wiki-link:
   - Resolve target to node ID (search by title, case-insensitive)
   - If not found, create placeholder node (clarification #1)
   - Create `references` attribute with metadata: `{ displayText, targetTitle }`
4. Submit to backend: `POST /api/nodes/{id}/attributes`
5. Refresh graph visualization

**Regex Pattern:**
```javascript
const wikiLinkPattern = /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g;
// Captures:
// Group 1: Display text or target (if no pipe)
// Group 3: Target (if pipe present)
```

**Edge Cases Handled:**
- Case-insensitive matching (`[[page]]` = `[[Page]]`)
- Alias support (`[[see this|Actual Page]]`) - clarification #2
- Multiple links in one line
- Escaped brackets `\[\[not a link\]\]`

---

## 5. State Management Architecture

### Decision: Zustand for UI state + React Query for server state

**Rationale:**
- Constitution-locked: Zustand for global, React Query for server
- React Query handles caching, refetching, optimistic updates
- Zustand for:
  - Current space context
  - Selected node ID
  - Graph view mode (CONTEXT-only, nodes-only, combined) - clarification #3
  - Navigation history
- React Query for:
  - Nodes data (with relationships)
  - Space metadata
  - User permissions

**Store Structure:**
```typescript
interface NavigationStore {
  spaceId: string;
  selectedNodeId: string | null;
  graphViewMode: 'context' | 'nodes' | 'combined';
  navigationHistory: string[];
  setSelectedNode: (id: string) => void;
  setGraphViewMode: (mode: string) => void;
  pushHistory: (id: string) => void;
}
```

---

## 6. Performance Optimization

### Decision: Virtual scrolling for tree + incremental graph rendering

**Rationale:**
- Large spaces (100+ nodes) must remain responsive
- Constitution requirement: Lighthouse score > 90

**Strategies:**
1. **Tree Navigation**:
   - Render only visible nodes (react-window)
   - Lazy load children on expand
   - Debounce search input (300ms)

2. **Graph Visualization**:
   - React Flow handles viewport culling automatically
   - Load initial graph with core nodes only
   - Fetch additional nodes on demand (expand neighborhood)

3. **Markdown Rendering**:
   - Memoize rendered markdown (React.memo)
   - Parse wiki-links only on save, not on every keystroke
   - Code splitting for markdown editor (lazy import)

**Metrics to Track:**
- Time to Interactive (TTI) < 3s
- First Contentful Paint (FCP) < 1.5s
- Tree expand/collapse < 100ms
- Graph pan/zoom 60fps

---

## 7. Testing Strategy

### Decision: Jest + React Testing Library + Playwright E2E

**Rationale:**
- Constitution-locked testing stack
- Unit tests for parsing logic (wiki-links, tree traversal)
- Integration tests for components (tree, markdown, graph)
- E2E tests for user workflows (navigate hierarchy → edit → see graph update)

**Test Coverage Goals:**
- Utility functions (wiki-link parser): 100%
- React components: 80%
- E2E user stories: All acceptance scenarios from spec

**Example Tests:**
```typescript
// Unit test
describe('parseWikiLinks', () => {
  it('extracts basic wiki-links', () => {
    const result = parseWikiLinks('See [[Page A]] and [[Page B]]');
    expect(result).toEqual([
      { display: 'Page A', target: 'Page A' },
      { display: 'Page B', target: 'Page B' }
    ]);
  });

  it('extracts aliased wiki-links', () => {
    const result = parseWikiLinks('Read [[this|Einstein Theory]]');
    expect(result).toEqual([
      { display: 'this', target: 'Einstein Theory' }
    ]);
  });
});

// E2E test
test('navigate hierarchy and edit page', async ({ page }) => {
  await page.goto('/space/my-space');
  await page.click('text=My Folder');
  await page.click('text=My Page');
  await page.click('button:has-text("Edit")');
  await page.fill('textarea', 'New content with [[Another Page]]');
  await page.click('button:has-text("Save")');
  await expect(page.locator('text=Another Page')).toBeVisible();
});
```

---

## 8. Accessibility Considerations

### Decision: WCAG AA compliance with keyboard navigation

**Rationale:**
- Constitution requirement: WCAG AA minimum
- Tree navigation fully keyboard accessible
- Graph nodes focusable via Tab key
- Screen reader announces node types and relationships

**Implementation:**
- Tree: Arrow keys for navigation, Enter to expand/collapse
- Graph: Tab to focus nodes, Enter to navigate
- ARIA labels: `role="tree"`, `aria-expanded`, `aria-label`
- Focus indicators: 2px outline on focus

---

## 9. Error Handling

### Decision: Graceful degradation + user-friendly messages

**Scenarios:**
1. **Wiki-link target not found**: Create placeholder (clarification #1)
2. **Network error during save**: Retry 3 times, show toast notification
3. **Circular containment detection**: Backend returns cycle path, display to user
4. **Graph rendering timeout**: Show partial graph + "Load more" button

**Error Messages:**
- "Creating new page: {{title}}" (on placeholder creation)
- "Connection lost. Retrying..." (on network error)
- "This would create a circular folder structure" (on cycle detection)

---

## 10. Deployment Considerations

### Decision: Incremental rollout with feature flag

**Rationale:**
- Large feature, potential for bugs
- Feature flag allows gradual rollout
- Easy to disable if critical issues discovered

**Feature Flag:**
```typescript
const ENABLE_HIERARCHY_NAV = process.env.NEXT_PUBLIC_ENABLE_HIERARCHY === 'true';

if (ENABLE_HIERARCHY_NAV) {
  return <HierarchyNavigator />;
} else {
  return <NodeList />; // Fallback to existing UI
}
```

---

## Unresolved Items (Lower Priority)

The following items from the spec have [NEEDS CLARIFICATION] markers but can be resolved during implementation:

1. **Image handling in markdown**: Display inline vs linked
2. **Code syntax highlighting**: Which languages to support
3. **LaTeX/math expressions**: Render vs plain text
4. **Drag-and-drop hierarchy**: User can reorganize tree
5. **Breadcrumb navigation**: Show current page location
6. **Ambiguous wiki-link targets**: Multiple pages with same title
7. **Broken links after deletion**: Update other pages
8. **Node highlighting in graph**: Highlight connected nodes on selection
9. **Graph layout algorithms**: Force-directed vs hierarchical
10. **Backlink display**: Show pages referencing current page
11. **Recent pages/favorites**: Quick access feature
12. **Page title change handling**: Update wiki-links in other pages
13. **Case-insensitive matching**: Exact behavior for `[[Page]]` vs `[[page]]`

**Recommendation**: Address these during implementation based on user feedback and priority.

---

## Summary

All critical technical decisions are documented and justified. The research phase confirms:

✅ All tools and libraries align with constitutional requirements
✅ All clarified spec items have concrete implementation plans
✅ Performance and accessibility requirements are addressed
✅ Testing strategy covers unit, integration, and E2E levels
✅ Error handling and edge cases are planned
✅ No blocking unknowns remain for Phase 1 design

**Ready to proceed to Phase 1: Design & Contracts**
