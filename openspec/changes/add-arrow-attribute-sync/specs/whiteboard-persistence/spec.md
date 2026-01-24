## ADDED Requirements

### Requirement: Arrow-to-Attribute Sync
The system SHALL create a `connects_to` attribute between backend nodes when an arrow element connects two shapes on the whiteboard canvas, keeping the attribute lifecycle in sync with arrow creation, deletion, and rebinding.

#### Scenario: Arrow drawn between two unlinked shapes
- **GIVEN** two shapes on the canvas without `customData.nodeId` (no backend nodes)
- **WHEN** the user draws an arrow connecting shape A (start) to shape B (end)
- **AND** the debounced save triggers
- **THEN** the system creates a REGULAR node for shape A and stores its ID in `customData.nodeId`
- **AND** creates a REGULAR node for shape B and stores its ID in `customData.nodeId`
- **AND** creates a `connects_to` attribute from node A to node B
- **AND** the attribute's `attributeValue` contains the arrow's connector metadata

#### Scenario: Arrow drawn between two already-linked shapes
- **GIVEN** two shapes that already have `customData.nodeId` (existing backend nodes)
- **WHEN** the user draws an arrow connecting shape A (start) to shape B (end)
- **AND** the debounced save triggers
- **THEN** the system creates a `connects_to` attribute from node A to node B
- **AND** does NOT create duplicate nodes

#### Scenario: Arrow deleted
- **GIVEN** an arrow that has a corresponding `connects_to` attribute in the backend
- **WHEN** the user deletes the arrow from the canvas
- **AND** the debounced save triggers
- **THEN** the system deletes the corresponding `connects_to` attribute
- **AND** does NOT delete the nodes at either end

#### Scenario: Arrow endpoint moved to a different shape
- **GIVEN** an arrow connected from shape A to shape B with a synced attribute
- **WHEN** the user moves the arrow's end binding from shape B to shape C
- **AND** the debounced save triggers
- **THEN** the system deletes the old `connects_to` attribute (A → B)
- **AND** creates a new `connects_to` attribute (A → C)
- **AND** auto-promotes shape C if it has no backend node

#### Scenario: Arrow with only one end bound
- **GIVEN** an arrow with only `startBinding` set (end is floating)
- **WHEN** the debounced save triggers
- **THEN** the system does NOT create any attribute for this arrow
- **AND** does NOT auto-promote the single bound shape

#### Scenario: Attribute sync fails partially
- **GIVEN** multiple arrows need sync (creates and deletes)
- **WHEN** some attribute operations fail (network error)
- **THEN** successfully synced arrows are tracked in the synced state
- **AND** failed arrows are retried on the next save cycle
- **AND** the content save (PUT) is NOT affected by attribute sync failures

### Requirement: Auto-Promotion on Arrow Binding
The system SHALL automatically create backend REGULAR nodes for shapes that are connected by an arrow but do not yet have `customData.nodeId`, storing the created node ID back in the element's custom data.

#### Scenario: Shape auto-promoted when arrow connects it
- **GIVEN** a rectangle shape with no `customData.nodeId`
- **WHEN** an arrow is drawn to it and the save triggers
- **THEN** the system creates a REGULAR node with title derived from the shape (e.g., text content or "Rectangle 1")
- **AND** sets the node's `customData.nodeId` on the element
- **AND** persists the updated element in the next content save

#### Scenario: Text shape auto-promoted uses text content as title
- **GIVEN** a text element containing "Ahmed" with no backend node
- **WHEN** it is connected by an arrow and save triggers
- **THEN** the created REGULAR node has title "Ahmed"

#### Scenario: Shape already promoted is not duplicated
- **GIVEN** a shape with `customData.nodeId = "existing-node-123"`
- **WHEN** a new arrow connects to it
- **THEN** the system uses the existing node ID for the attribute
- **AND** does NOT create a new node

### Requirement: Arrow Directionality Preservation
The system SHALL preserve arrow directionality in the `connects_to` attribute, using the arrow's start binding as the source node and end binding as the target node.

#### Scenario: Directed arrow creates directed attribute
- **GIVEN** an arrow from shape A (startBinding) to shape B (endBinding)
- **WHEN** the attribute is created
- **THEN** the attribute's `sourceNodeId` is shape A's node ID
- **AND** the attribute's `targetNodeId` is shape B's node ID

#### Scenario: Connector metadata stored in attribute value
- **GIVEN** an arrow connecting two shapes
- **WHEN** the `connects_to` attribute is created
- **THEN** `attributeValue` contains the arrow's Excalidraw element data
- **AND** `attributeValue.connector_meta` includes `source_element_id`, `target_element_id`, and `bidirectional` flag
