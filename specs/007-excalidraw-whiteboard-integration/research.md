# Research: Excalidraw Whiteboard Integration

**Feature**: 007-excalidraw-whiteboard-integration
**Date**: 2025-11-22

## Executive Summary

This document captures research findings for integrating Excalidraw as the whiteboard engine for Mujarrad. Key decisions include using the official @excalidraw/excalidraw React package, storing complete element JSON in Node configurations, and mapping Excalidraw element types to Mujarrad Node types.

---

## 1. Excalidraw React Component

### Decision
Use `@excalidraw/excalidraw` npm package as the canvas component.

### Rationale
- Official React wrapper maintained by Excalidraw team
- MIT licensed - free for commercial use without watermark
- Well-documented API with TypeScript support
- Active development (74.8K GitHub stars)
- Large community and ecosystem

### Key API Surface

```typescript
import { Excalidraw } from "@excalidraw/excalidraw";

<Excalidraw
  // Initial data to load
  initialData={{
    elements: ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles
  }}

  // Called on every change
  onChange={(elements, appState, files) => void}

  // API ref for programmatic control
  excalidrawAPI={(api) => setApi(api)}

  // UI customization
  UIOptions={{
    canvasActions: {
      saveAsImage: boolean,
      loadScene: boolean,
      export: boolean,
      // ...more options
    }
  }}
/>
```

### Alternatives Considered
- **tldraw**: Better features but requires watermark (paid to remove)
- **React Flow**: Not designed for freeform whiteboard (node-based only)
- **Custom implementation**: Would take weeks, not recommended

---

## 2. Element Data Structure

### Decision
Store complete Excalidraw element JSON in Node's `node_details` field.

### Rationale
- Excalidraw elements have 20+ properties (position, style, bindings, etc.)
- Storing as JSON ensures perfect reconstruction
- No data loss or transformation errors
- Flexible for future Excalidraw updates

### Excalidraw Element Schema

```typescript
interface ExcalidrawElement {
  // Identity
  id: string;
  type: "rectangle" | "ellipse" | "diamond" | "text" | "arrow" | "line" | "freedraw" | "image";

  // Position & Dimensions
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;  // rotation in radians

  // Styling
  strokeColor: string;      // hex color
  backgroundColor: string;  // hex color
  fillStyle: "hachure" | "cross-hatch" | "solid";
  strokeWidth: number;
  strokeStyle: "solid" | "dashed" | "dotted";
  roughness: 0 | 1 | 2;     // hand-drawn effect
  opacity: number;          // 0-100

  // Grouping & Layering
  groupIds: string[];
  frameId: string | null;

  // Version tracking
  version: number;
  versionNonce: number;

  // Type-specific properties
  // For text:
  text?: string;
  fontSize?: number;
  fontFamily?: number;
  textAlign?: "left" | "center" | "right";

  // For arrows/lines:
  points?: [number, number][];
  startBinding?: { elementId: string; focus: number; gap: number };
  endBinding?: { elementId: string; focus: number; gap: number };
}
```

### Storage Format

```json
{
  "node_details": {
    "excalidraw_element": {
      "id": "abc123",
      "type": "rectangle",
      "x": 100,
      "y": 200,
      "width": 150,
      "height": 100,
      "strokeColor": "#000000",
      "backgroundColor": "#ffffff",
      // ... all properties
    },
    "whiteboard_meta": {
      "created_at": "2025-11-22T10:00:00Z",
      "last_modified": "2025-11-22T10:05:00Z"
    }
  }
}
```

---

## 3. Element-to-Node Mapping

### Decision
Map Excalidraw element types to Mujarrad Node types with specific configurations.

### Mapping Table

| Excalidraw Type | Mujarrad Node Type | Notes |
|-----------------|-------------------|-------|
| rectangle | REGULAR | node_details.element_subtype = "shape_rectangle" |
| ellipse | REGULAR | node_details.element_subtype = "shape_ellipse" |
| diamond | REGULAR | node_details.element_subtype = "shape_diamond" |
| text | REGULAR | node_details.element_subtype = "text", title = text content |
| freedraw | REGULAR | node_details.element_subtype = "drawing" |
| image | REGULAR | node_details.element_subtype = "image" |
| arrow | ATTRIBUTE | Creates relationship between bound elements |
| line | ATTRIBUTE | Creates relationship if bound, else standalone Node |

### Arrow/Connector Handling

Arrows and lines that connect two elements become Attributes (relationships):

```typescript
// Excalidraw arrow with bindings
{
  type: "arrow",
  startBinding: { elementId: "shape1" },
  endBinding: { elementId: "shape2" }
}

// Maps to Mujarrad Attribute
{
  source_node_id: "node-for-shape1",
  target_node_id: "node-for-shape2",
  attribute_key: "connects_to",
  attribute_value: {
    arrow_config: { /* arrow styling */ }
  }
}
```

### Lookup Table Design

```typescript
interface ElementTypeConfig {
  excalidraw_type: string;
  mujarrad_node_type: NodeType;
  element_subtype: string;
  title_source: "text" | "auto" | "custom";
  supports_content: boolean;
}

const ELEMENT_TYPE_CONFIGS: ElementTypeConfig[] = [
  {
    excalidraw_type: "rectangle",
    mujarrad_node_type: "REGULAR",
    element_subtype: "shape_rectangle",
    title_source: "auto",  // "Rectangle 1", "Rectangle 2"
    supports_content: false
  },
  {
    excalidraw_type: "text",
    mujarrad_node_type: "REGULAR",
    element_subtype: "text",
    title_source: "text",  // Use text content as title
    supports_content: true
  },
  // ... more configs
];
```

---

## 4. State Management Pattern

### Decision
Use lazy state initialization with debounced saves, wrapped in useMemo.

### Rationale
- Excalidraw's `onChange` fires on every interaction (mouse move during drag)
- Direct setState causes infinite render loops
- Debouncing prevents API overload while ensuring data safety

### Implementation Pattern

```typescript
// Avoid infinite loops with useMemo wrapper
const ExcalidrawComponent = useMemo(() => (
  <Excalidraw
    initialData={{ elements: initialElements }}
    excalidrawAPI={(api) => setExcalidrawAPI(api)}
    onChange={(elements, appState) => {
      // Debounced save - doesn't trigger re-render
      debouncedSave(elements, appState);
    }}
  />
), [initialElements]); // Only re-create on initial data change

// Debounce implementation
const debouncedSave = useMemo(
  () => debounce((elements, appState) => {
    saveToBackend(elements, appState);
  }, 2000),
  [saveToBackend]
);
```

### State Flow

```
User interacts with canvas
    ↓
Excalidraw onChange fires
    ↓
Debounce timer resets (2 sec)
    ↓
After 2 sec idle: save triggered
    ↓
Element mapper converts to Nodes
    ↓
API service sends to backend
    ↓
React Query cache invalidated
```

---

## 5. Persistence Strategy

### Decision
Debounced auto-save with full element array, 2 second delay.

### Rationale
- 2 seconds balances responsiveness with API efficiency
- Full array save is simpler than diff-based updates for MVP
- Backend can implement diffing later if needed

### Save Flow

```typescript
async function saveWhiteboard(elements: ExcalidrawElement[], spaceSlug: string) {
  // 1. Convert elements to Nodes
  const nodesToCreate: CreateNodeDTO[] = [];
  const nodesToUpdate: UpdateNodeDTO[] = [];
  const nodesToDelete: string[] = [];

  // 2. Diff with existing nodes (by excalidraw element ID)
  const existingNodes = await getWhiteboardNodes(spaceSlug);
  const existingElementIds = new Set(existingNodes.map(n => n.node_details.excalidraw_element.id));

  for (const element of elements) {
    if (existingElementIds.has(element.id)) {
      nodesToUpdate.push(mapToUpdateDTO(element));
    } else {
      nodesToCreate.push(mapToCreateDTO(element));
    }
  }

  // Find deleted elements
  const currentElementIds = new Set(elements.map(e => e.id));
  for (const node of existingNodes) {
    if (!currentElementIds.has(node.node_details.excalidraw_element.id)) {
      nodesToDelete.push(node.id);
    }
  }

  // 3. Batch API calls
  await Promise.all([
    ...nodesToCreate.map(n => nodeService.create(spaceSlug, n)),
    ...nodesToUpdate.map(n => nodeService.update(spaceSlug, n.id, n)),
    ...nodesToDelete.map(id => nodeService.delete(spaceSlug, id))
  ]);
}
```

### Load Flow

```typescript
async function loadWhiteboard(spaceSlug: string): Promise<ExcalidrawElement[]> {
  // 1. Fetch all whiteboard nodes for this space
  const nodes = await nodeService.getNodes(spaceSlug, {
    filter: "node_details.element_subtype IS NOT NULL"
  });

  // 2. Convert back to Excalidraw elements
  const elements = nodes.map(node => node.node_details.excalidraw_element);

  // 3. Fetch relationships (arrows/connectors)
  const attributes = await attributeService.getSpaceAttributes(spaceSlug);
  const arrowElements = attributes
    .filter(attr => attr.attribute_key === "connects_to")
    .map(attr => attr.attribute_value.arrow_config);

  return [...elements, ...arrowElements];
}
```

---

## 6. Performance Considerations

### Initial Load
- Fetch nodes with pagination if >100 elements
- Lazy load image assets
- Show loading skeleton while fetching

### During Editing
- Excalidraw handles its own rendering performance
- Don't interfere with Excalidraw's internal state
- Debounce saves to prevent API spam

### Memory Management
- Excalidraw manages its own element pool
- Clear React Query cache on space switch
- Dispose Excalidraw API on unmount

---

## 7. Error Handling

### Network Errors
- Queue failed saves for retry
- Show non-blocking toast notification
- Don't lose local changes

### Validation Errors
- Show inline error messages
- Highlight problematic elements
- Allow user to fix and retry

### Conflict Resolution (Future)
- For MVP: last-write-wins
- Future: implement OT or CRDT for collaboration

---

## 8. Security Considerations

### XSS Prevention
- Excalidraw sanitizes text input
- Don't render raw HTML from elements
- Validate JSON before storage

### Data Validation
- Validate element structure before save
- Reject malformed JSON
- Size limits on node_details (prevent DoS)

---

## References

- [Excalidraw React Component Docs](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api)
- [Excalidraw JSON Schema](https://docs.excalidraw.com/docs/codebase/json-schema)
- [Excalidraw GitHub](https://github.com/excalidraw/excalidraw)
- [Excalidraw State Management Article](https://dev.to/karataev/excalidraw-state-management-1842)
