/**
 * TypeScript types for Excalidraw Whiteboard Integration
 * Based on data-model.md specifications
 */

// =============================================================================
// Excalidraw Element Types
// =============================================================================

export type ExcalidrawElementType =
  | 'rectangle'
  | 'ellipse'
  | 'diamond'
  | 'text'
  | 'arrow'
  | 'line'
  | 'freedraw'
  | 'image'
  | 'frame';

export type FillStyle = 'hachure' | 'cross-hatch' | 'solid';
export type StrokeStyle = 'solid' | 'dashed' | 'dotted';
export type TextAlign = 'left' | 'center' | 'right';
export type VerticalAlign = 'top' | 'middle' | 'bottom';
export type Arrowhead = 'arrow' | 'bar' | 'dot' | 'triangle' | null;
export type Point = [number, number];

export interface Binding {
  elementId: string;
  focus: number;
  gap: number;
}

export interface BoundElement {
  id: string;
  type: 'arrow' | 'text';
}

export interface ExcalidrawElement {
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

  // Container binding (for text inside shapes)
  containerId?: string | null;

  // Type-specific properties
  text?: string;
  fontSize?: number;
  fontFamily?: number;
  textAlign?: TextAlign;
  verticalAlign?: VerticalAlign;
  points?: Point[];
  startBinding?: Binding | null;
  endBinding?: Binding | null;
  startArrowhead?: Arrowhead;
  endArrowhead?: Arrowhead;
}

// =============================================================================
// Whiteboard Node Types
// =============================================================================

export type WhiteboardElementSubtype =
  | 'shape_rectangle'
  | 'shape_ellipse'
  | 'shape_diamond'
  | 'text'
  | 'drawing'
  | 'image'
  | 'frame';

export interface WhiteboardMeta {
  space_slug: string;
  created_at: string;
  last_modified: string;
  z_index: number;
}

// Metadata for the whiteboard context node (represents the canvas itself)
export interface WhiteboardContextMeta {
  context_type: 'whiteboard';
  app_state?: Partial<WhiteboardAppState>;
  created_at: string;
  last_modified: string;
}

export interface WhiteboardContextDetails {
  whiteboard_context: WhiteboardContextMeta;
}

// Element entry in whiteboard content - links node_id to rendering data
export interface WhiteboardElementEntry {
  node_id: string;
  excalidraw_element: ExcalidrawElement;
}

// Content structure for whiteboard context node
export interface WhiteboardContextContent {
  elements: WhiteboardElementEntry[];
  app_state?: Partial<WhiteboardAppState>;
  files?: Record<string, BinaryFileData>;
}

export interface WhiteboardNodeDetails {
  element_subtype: WhiteboardElementSubtype;
  excalidraw_element: ExcalidrawElement;
  whiteboard_meta: WhiteboardMeta;
}

export interface WhiteboardNode {
  id: string;
  title: string;
  content?: string;
  nodeType: 'CONTEXT' | 'REGULAR' | 'TEMPLATE' | 'ASSUMPTION';
  nodeDetails: WhiteboardNodeDetails;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// =============================================================================
// Connector Types (Attributes)
// =============================================================================

export interface ConnectorMeta {
  source_element_id: string;
  target_element_id: string;
  bidirectional: boolean;
  label?: string;
}

export interface WhiteboardConnectorValue {
  excalidraw_element: ExcalidrawElement;
  connector_meta: ConnectorMeta;
}

export interface WhiteboardConnector {
  id: string;
  source_node_id: string;
  attribute_key: 'connects_to';
  attribute_value: WhiteboardConnectorValue;
}

// =============================================================================
// API DTOs
// =============================================================================

export interface CreateWhiteboardNodeDTO {
  title: string;
  nodeType: 'REGULAR';
  content?: string;
  nodeDetails: WhiteboardNodeDetails;
}

export interface UpdateWhiteboardNodeDTO {
  id: string;
  title?: string;
  content?: string;
  nodeDetails: WhiteboardNodeDetails;
}

export interface CreateConnectorDTO {
  target_node_id: string;
  attribute_key: 'connects_to';
  attribute_value: WhiteboardConnectorValue;
}

// =============================================================================
// Whiteboard State
// =============================================================================

export interface WhiteboardAppState {
  viewBackgroundColor: string;
  zoom: { value: number };
  scrollX: number;
  scrollY: number;
}

export interface BinaryFileData {
  mimeType: string;
  id: string;
  dataURL: string;
  created: number;
}

export interface WhiteboardStateDTO {
  space_slug: string;
  elements: ExcalidrawElement[];
  app_state: Partial<WhiteboardAppState>;
  files: Record<string, BinaryFileData>;
  version: number;
  last_modified: string;
}

// =============================================================================
// Element Type Configuration
// =============================================================================

export type TitleSource = 'text' | 'auto' | 'custom';

export interface ElementTypeConfig {
  excalidraw_type: ExcalidrawElementType;
  mujarrad_node_type: 'CONTEXT' | 'REGULAR' | 'TEMPLATE' | 'ASSUMPTION';
  element_subtype: WhiteboardElementSubtype;
  title_source: TitleSource;
  title_prefix?: string;
  supports_content: boolean;
  supports_connections: boolean;
  is_connector: boolean;
}

// =============================================================================
// Store Types
// =============================================================================

export interface WhiteboardStoreState {
  elements: ExcalidrawElement[];
  appState: Partial<WhiteboardAppState>;
  files: Record<string, BinaryFileData>;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
}

export interface WhiteboardStoreActions {
  setElements: (elements: ExcalidrawElement[]) => void;
  setAppState: (appState: Partial<WhiteboardAppState>) => void;
  setFiles: (files: Record<string, BinaryFileData>) => void;
  markDirty: () => void;
  markSaved: () => void;
  setSaving: (isSaving: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type WhiteboardStore = WhiteboardStoreState & WhiteboardStoreActions;

// =============================================================================
// Component Props
// =============================================================================

export interface WhiteboardCanvasProps {
  spaceSlug: string;
  initialElements?: ExcalidrawElement[];
  initialAppState?: Partial<WhiteboardAppState>;
  initialFiles?: Record<string, BinaryFileData>;
  initialNodeMap?: Map<string, string>; // excalidraw element ID -> node ID
  initialContextNodeId?: string | null; // whiteboard context node ID
  onSave?: (elements: ExcalidrawElement[], appState: WhiteboardAppState) => void;
  onError?: (error: Error) => void;
  readOnly?: boolean;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface WhiteboardNodesResponse {
  content: WhiteboardNode[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface WhiteboardConnectorsResponse {
  content: WhiteboardConnector[];
}
