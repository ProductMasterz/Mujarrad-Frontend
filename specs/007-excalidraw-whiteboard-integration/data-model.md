# Data Model: Excalidraw Whiteboard Integration

**Feature**: 007-excalidraw-whiteboard-integration
**Date**: 2025-11-22

## Overview

This document defines the data structures for mapping Excalidraw whiteboard elements to Mujarrad's Node/Attribute model. The design follows a data-driven configuration approach where element properties are stored as JSON.

---

## Core Entities

### 1. WhiteboardNode

Extension of the existing Node entity to store Excalidraw elements.

```typescript
interface WhiteboardNode extends Node {
  node_type: NodeType;  // REGULAR for most elements
  title: string;        // Auto-generated or from text content
  content: string;      // Optional markdown content
  node_details: {
    // Identifies this as a whiteboard element
    element_subtype: WhiteboardElementSubtype;

    // Complete Excalidraw element for perfect reconstruction
    excalidraw_element: ExcalidrawElement;

    // Metadata
    whiteboard_meta: {
      space_slug: string;
      created_at: string;
      last_modified: string;
      z_index: number;  // Layer ordering
    };
  };
}

type WhiteboardElementSubtype =
  | "shape_rectangle"
  | "shape_ellipse"
  | "shape_diamond"
  | "text"
  | "drawing"
  | "image"
  | "frame";
```

### 2. ExcalidrawElement

The complete Excalidraw element structure stored in node_details.

```typescript
interface ExcalidrawElement {
  // Core identity
  id: string;
  type: ExcalidrawElementType;

  // Position and dimensions
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;

  // Visual styling
  strokeColor: string;
  backgroundColor: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  roughness: number;
  opacity: number;

  // Grouping
  groupIds: string[];
  frameId: string | null;

  // Versioning
  version: number;
  versionNonce: number;
  isDeleted: boolean;

  // Binding (for arrows/lines)
  boundElements: BoundElement[] | null;

  // Type-specific
  text?: string;
  fontSize?: number;
  fontFamily?: number;
  textAlign?: TextAlign;
  verticalAlign?: VerticalAlign;
  points?: Point[];
  startBinding?: Binding;
  endBinding?: Binding;
  startArrowhead?: Arrowhead;
  endArrowhead?: Arrowhead;
}

type ExcalidrawElementType =
  | "rectangle"
  | "ellipse"
  | "diamond"
  | "text"
  | "arrow"
  | "line"
  | "freedraw"
  | "image"
  | "frame";

type FillStyle = "hachure" | "cross-hatch" | "solid";
type StrokeStyle = "solid" | "dashed" | "dotted";
type TextAlign = "left" | "center" | "right";
type VerticalAlign = "top" | "middle" | "bottom";
type Arrowhead = "arrow" | "bar" | "dot" | "triangle" | null;
type Point = [number, number];

interface Binding {
  elementId: string;
  focus: number;
  gap: number;
}

interface BoundElement {
  id: string;
  type: "arrow" | "text";
}
```

### 3. WhiteboardConnector

Arrows and lines that connect elements are stored as Attributes.

```typescript
interface WhiteboardConnector extends Attribute {
  attribute_key: "connects_to";
  attribute_value: {
    // The arrow/line element configuration
    excalidraw_element: ExcalidrawElement;

    // Relationship metadata
    connector_meta: {
      source_element_id: string;  // Excalidraw element ID
      target_element_id: string;  // Excalidraw element ID
      bidirectional: boolean;
      label?: string;
    };
  };
}
```

---

## Configuration Entities

### 4. ElementTypeConfig

Lookup table for mapping Excalidraw types to Mujarrad types.

```typescript
interface ElementTypeConfig {
  // Excalidraw identification
  excalidraw_type: ExcalidrawElementType;

  // Mujarrad mapping
  mujarrad_node_type: NodeType;
  element_subtype: WhiteboardElementSubtype;

  // Title generation
  title_source: TitleSource;
  title_prefix?: string;  // e.g., "Rectangle" for auto-numbering

  // Capabilities
  supports_content: boolean;
  supports_connections: boolean;
  is_connector: boolean;
}

type TitleSource = "text" | "auto" | "custom";

// Default configurations
const DEFAULT_ELEMENT_CONFIGS: ElementTypeConfig[] = [
  {
    excalidraw_type: "rectangle",
    mujarrad_node_type: "REGULAR",
    element_subtype: "shape_rectangle",
    title_source: "auto",
    title_prefix: "Rectangle",
    supports_content: false,
    supports_connections: true,
    is_connector: false
  },
  {
    excalidraw_type: "ellipse",
    mujarrad_node_type: "REGULAR",
    element_subtype: "shape_ellipse",
    title_source: "auto",
    title_prefix: "Ellipse",
    supports_content: false,
    supports_connections: true,
    is_connector: false
  },
  {
    excalidraw_type: "diamond",
    mujarrad_node_type: "REGULAR",
    element_subtype: "shape_diamond",
    title_source: "auto",
    title_prefix: "Diamond",
    supports_content: false,
    supports_connections: true,
    is_connector: false
  },
  {
    excalidraw_type: "text",
    mujarrad_node_type: "REGULAR",
    element_subtype: "text",
    title_source: "text",
    supports_content: true,
    supports_connections: true,
    is_connector: false
  },
  {
    excalidraw_type: "freedraw",
    mujarrad_node_type: "REGULAR",
    element_subtype: "drawing",
    title_source: "auto",
    title_prefix: "Drawing",
    supports_content: false,
    supports_connections: false,
    is_connector: false
  },
  {
    excalidraw_type: "image",
    mujarrad_node_type: "REGULAR",
    element_subtype: "image",
    title_source: "auto",
    title_prefix: "Image",
    supports_content: false,
    supports_connections: true,
    is_connector: false
  },
  {
    excalidraw_type: "arrow",
    mujarrad_node_type: "REGULAR",  // Stored as Attribute if bound
    element_subtype: "shape_rectangle",  // Fallback if standalone
    title_source: "auto",
    title_prefix: "Arrow",
    supports_content: false,
    supports_connections: false,
    is_connector: true
  },
  {
    excalidraw_type: "line",
    mujarrad_node_type: "REGULAR",
    element_subtype: "shape_rectangle",
    title_source: "auto",
    title_prefix: "Line",
    supports_content: false,
    supports_connections: false,
    is_connector: true
  }
];
```

---

## API DTOs

### 5. CreateWhiteboardNodeDTO

```typescript
interface CreateWhiteboardNodeDTO {
  title: string;
  node_type: NodeType;
  content?: string;
  node_details: {
    element_subtype: WhiteboardElementSubtype;
    excalidraw_element: ExcalidrawElement;
    whiteboard_meta: {
      space_slug: string;
      created_at: string;
      last_modified: string;
      z_index: number;
    };
  };
}
```

### 6. UpdateWhiteboardNodeDTO

```typescript
interface UpdateWhiteboardNodeDTO {
  id: string;
  title?: string;
  content?: string;
  node_details: {
    element_subtype: WhiteboardElementSubtype;
    excalidraw_element: ExcalidrawElement;
    whiteboard_meta: {
      space_slug: string;
      created_at: string;
      last_modified: string;
      z_index: number;
    };
  };
}
```

### 7. WhiteboardStateDTO

Complete whiteboard state for load/save operations.

```typescript
interface WhiteboardStateDTO {
  space_slug: string;
  elements: ExcalidrawElement[];
  app_state: Partial<AppState>;
  files: Record<string, BinaryFileData>;
  version: number;
  last_modified: string;
}

interface AppState {
  viewBackgroundColor: string;
  zoom: { value: number };
  scrollX: number;
  scrollY: number;
  // ... other Excalidraw app state
}

interface BinaryFileData {
  mimeType: string;
  id: string;
  dataURL: string;
  created: number;
}
```

---

## Relationships

### Element Relationships

```
WhiteboardNode (shape)
    │
    ├── boundElements[] ──► WhiteboardConnector (arrow)
    │                            │
    │                            └── connects_to ──► WhiteboardNode (shape)
    │
    └── groupIds[] ──► Other WhiteboardNodes in same group
```

### Space Relationship

```
Space
    │
    └── contains ──► WhiteboardNode[]
                         │
                         └── excalidraw_element.frameId ──► WhiteboardNode (frame)
```

---

## Validation Rules

### Node Validation
- `title`: Required, max 255 characters
- `node_details.excalidraw_element.id`: Required, unique within space
- `node_details.excalidraw_element.type`: Must be valid ExcalidrawElementType
- `node_details.whiteboard_meta.space_slug`: Must match request context

### Connector Validation
- `attribute_value.source_element_id`: Must reference existing node
- `attribute_value.target_element_id`: Must reference existing node
- Source and target cannot be the same element

### Size Limits
- `node_details` JSON: Max 100KB
- `content` field: Max 50,000 characters
- Images: Max 5MB per image, stored as base64 in files

---

## State Transitions

### Element Lifecycle

```
Created → Active → Modified → Active → Deleted
                      ↑          │
                      └──────────┘
```

### Sync States

```
Local Only → Saving → Synced → Modified → Saving → Synced
                                  ↓
                             Save Failed → Retry
```

---

## Indexes (Backend Consideration)

For efficient whiteboard queries, consider these indexes:

```sql
-- Find all whiteboard elements in a space
CREATE INDEX idx_nodes_whiteboard_space ON nodes
  USING GIN ((node_details->'whiteboard_meta'->>'space_slug'));

-- Find element by Excalidraw ID
CREATE INDEX idx_nodes_excalidraw_id ON nodes
  USING BTREE ((node_details->'excalidraw_element'->>'id'));

-- Find elements by subtype
CREATE INDEX idx_nodes_element_subtype ON nodes
  USING BTREE ((node_details->>'element_subtype'));
```

---

## Migration Notes

### From React Flow to Excalidraw

If migrating existing React Flow nodes:
1. Export React Flow node positions
2. Create equivalent Excalidraw elements
3. Map React Flow edges to Excalidraw arrows with bindings
4. Preserve node IDs for relationship continuity

### Backwards Compatibility

The existing Node API remains unchanged. Whiteboard elements are distinguished by:
- Presence of `node_details.element_subtype`
- Presence of `node_details.excalidraw_element`

Non-whiteboard nodes continue to work as before.
