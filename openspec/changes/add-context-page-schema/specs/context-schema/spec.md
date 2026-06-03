# Spec: Context Schema View

**Capability:** Context Page Schema Management
**Change ID:** `add-context-page-schema`

---

## ADDED Requirements

### Requirement: Schema Section in Context Page

The system SHALL display a schema section within the context page when the space `projectType` is `BACKEND`. The schema section renders each field from the associated `ContextType.attributeSchema` as an individual visual item. The existing context page content (blocks, markdown, descriptions) SHALL remain unchanged and visible alongside the schema section.

#### Scenario: Schema section visible in backend space
```gherkin
Given I am viewing a context page in a space with projectType "BACKEND"
And the context has a ContextType with attributeSchema fields: "status" (STRING, required), "priority" (NUMBER), "assignee" (NODE_REF)
When the context page loads
Then I see the existing context page content
And I see a "Schema" section displaying three field items
And each field item shows: field name, type, required flag, and description
And the fields are displayed in their defined order
```

#### Scenario: Schema section hidden in consumer space
```gherkin
Given I am viewing a context page in a space with projectType "CONSUMER"
When the context page loads
Then I see the existing context page content
And I do not see any schema section
```

#### Scenario: Context with no ContextType
```gherkin
Given I am viewing a context page in a BACKEND space
And the context has no associated ContextType
When the context page loads
Then I see the existing context page content
And the schema section shows an empty state with option to define a schema
```

---

### Requirement: Schema Field Item Rendering

Each field in `attributeSchema` SHALL be rendered as a distinct visual item showing its properties. Supported field types are: STRING, NUMBER, BOOLEAN, DATE, NODE_REF, LIST.

#### Scenario: Field item displays all properties
```gherkin
Given a schema field "status" with type "STRING", required true, description "Current task status", default "TODO"
When the field is rendered in the schema section
Then the item shows the field name "status"
And shows the type badge "STRING"
And shows a required indicator
And shows the description "Current task status"
And shows the default value "TODO"
```

#### Scenario: Optional field without default
```gherkin
Given a schema field "notes" with type "STRING", required false, no description, no default
When the field is rendered
Then the item shows the field name "notes"
And shows the type badge "STRING"
And does not show a required indicator
And does not show a description or default value
```

---

### Requirement: Schema Locking via Space Mode

The system SHALL control schema locking through the space's operational mode, not by a per-entity boolean. When a BACKEND space is in `PRODUCTION` mode, all schemas are locked. When in `CONFIGURATION` mode, schemas are editable. The frontend toggles this via `PATCH /api/spaces/{id}` with `{"mode": "PRODUCTION"}` or `{"mode": "CONFIGURATION"}`. The backend derives lock state and reports it via `lockSource: "schema"` on node responses. CONTEXT nodes become `CONTENT_LOCKED` and their block children become `FULLY_LOCKED` in PRODUCTION mode. REGULAR nodes remain `UNLOCKED`.

#### Scenario: Schema locked in PRODUCTION mode
```gherkin
Given I am viewing a context page in a BACKEND space
And the space mode is "PRODUCTION"
When the context page loads
Then all schema field items display a locked indicator
And the schema fields are read-only (no edit, add, remove, or reorder)
And the node response shows lockSource: "schema"
```

#### Scenario: Schema editable in CONFIGURATION mode
```gherkin
Given I am viewing a context page in a BACKEND space
And the space mode is "CONFIGURATION"
When the context page loads
Then the schema field items are editable
And no locked indicators are shown on schema fields
```

#### Scenario: Toggle space mode to lock/unlock schemas
```gherkin
Given I am in a BACKEND space in "CONFIGURATION" mode
When I switch the space to "PRODUCTION" mode
Then all context schemas across the space become locked
And all context pages show locked schema indicators
When I switch back to "CONFIGURATION" mode
Then all context schemas become editable again
```

#### Scenario: Locking schema does not affect regular node content
```gherkin
Given a BACKEND space is in "PRODUCTION" mode
When I view a REGULAR node (not a CONTEXT)
Then the node content remains editable
And the node lockLevel remains "UNLOCKED"
```

#### Scenario: Schema lock not applicable to CONSUMER spaces
```gherkin
Given I am in a CONSUMER space
Then the space mode toggle for PRODUCTION/CONFIGURATION is not visible
And no schema locking UI is shown
```

---

### Requirement: Multi-Parent Node Containment (Superposition)

The system SHALL allow a node to be contained by multiple contexts and multiple parent nodes simultaneously. Each containment is an independent `Attribute` with `attributeKey: 'contains'`. A node contained by multiple parents appears in each parent's view — it is the same node, not a copy.

#### Scenario: Node belongs to two contexts
```gherkin
Given Context A and Context B exist in the same space
And Node 1 exists in the space
When I add Node 1 as a child of Context A
And I add Node 1 as a child of Context B
Then Node 1 appears in Context A's view
And Node 1 appears in Context B's view
And both views reference the same node (same ID)
And editing Node 1 in either view updates it everywhere
```

#### Scenario: Node belongs to multiple parent nodes
```gherkin
Given Node X and Node Y exist in the same space
And Node Z exists in the space
When I make Node Z a child of Node X
And I make Node Z a child of Node Y
Then Node Z appears in Node X's children
And Node Z appears in Node Y's children
And Node Z is the same entity in both places
```

---

### Requirement: Context-to-Context Containment

The system SHALL allow a context to contain another context via `CONTAINS` attribute. A contained context appears both in the flat space-level context view and inside the parent context's view.

#### Scenario: Context contains another context
```gherkin
Given Context A and Context B exist in the same space
When I make Context B a child of Context A
Then Context B appears in the flat space-level context list
And Context B also appears inside Context A's context view as a child
```

#### Scenario: Context contained by multiple contexts
```gherkin
Given Context A, Context B, and Context C exist in the same space
When I make Context C a child of Context A
And I make Context C a child of Context B
Then Context C appears in the flat space view
And Context C appears inside Context A's view
And Context C appears inside Context B's view
```

---

### Requirement: Bidirectional Context Containment

The system SHALL allow two contexts to contain each other simultaneously. Context A can be parent of Context B, and Context B can be parent of Context A at the same time. This is implemented as two separate `Attribute` rows with swapped source/target. The UI MUST handle this without infinite recursion.

#### Scenario: Mutual containment between two contexts
```gherkin
Given Context A and Context B exist in the same space
When I make Context B a child of Context A
And I make Context A a child of Context B
Then viewing Context A shows Context B as a child
And viewing Context B shows Context A as a child
And no infinite rendering loop occurs
```

#### Scenario: Cycle detection in rendering
```gherkin
Given Context A contains Context B
And Context B contains Context A
When I expand Context A's children in the view
And I see Context B as a child
And I expand Context B within that view
Then I see Context A listed but marked as "already in view" or collapsed
And the UI does not recurse infinitely
```

---

### Requirement: Containment Rules Enforcement

The system SHALL enforce the following containment rules: a context can only be a child of another context (not of a regular node). A node can be a child of a context or another node. A node MUST NOT contain a context.

#### Scenario: Prevent node from containing a context
```gherkin
Given Node X (nodeType: REGULAR) exists
And Context A (nodeType: CONTEXT) exists
When I attempt to make Context A a child of Node X
Then the operation is rejected
And an error message indicates "A context cannot be a child of a regular node"
```

#### Scenario: Allow context to contain context
```gherkin
Given Context A and Context B exist
When I make Context B a child of Context A
Then the operation succeeds
And a CONTAINS attribute is created from Context A to Context B
```

#### Scenario: Allow node to be child of node
```gherkin
Given Node X and Node Y exist
When I make Node Y a child of Node X
Then the operation succeeds
And a CONTAINS attribute is created from Node X to Node Y
```

---

### Requirement: Replace Move To with Make a Child Of

The system SHALL remove "Move To" from the node right-click context menu and replace it with "Make a Child Of". For nodes, the picker allows selecting any context or any node as the new parent. For contexts, the picker allows selecting only another context as the new parent. "Make a Child Of" adds a new containment relationship without removing existing ones.

#### Scenario: Node context menu shows Make a Child Of
```gherkin
Given I right-click on a node in the space view
Then I see "Make a Child Of" in the context menu
And I do not see "Move To"
When I click "Make a Child Of"
Then a picker appears showing available contexts and nodes
When I select Context A
Then a CONTAINS attribute is created from Context A to this node
And the node's existing parent relationships are preserved
```

#### Scenario: Context context menu shows Make a Child Of
```gherkin
Given I right-click on a context in the space view
Then I see "Make a Child Of" in the context menu
When I click "Make a Child Of"
Then a picker appears showing available contexts only (no regular nodes)
When I select Context B
Then a CONTAINS attribute is created from Context B to this context
And the context's existing parent relationships are preserved
```

#### Scenario: Make a Child Of is additive
```gherkin
Given Node 1 is already a child of Context A
When I use "Make a Child Of" to also add Node 1 as a child of Context B
Then Node 1 is a child of both Context A and Context B
And Node 1 was not removed from Context A
```

---

### Requirement: Remove from Context

The system SHALL provide a "Remove from Context" action in the node's right-click context menu when the node is viewed within a context. This calls `DELETE /api/spaces/{slug}/contexts/{ctx}/nodes/{nodeId}` to remove the CONTAINS relationship without deleting the node. The node remains in any other contexts it belongs to. The backend handles fallback to Context-Less (Blank) if removed from the last context.

#### Scenario: Remove node from one of multiple contexts
```gherkin
Given Node 1 is a child of Context A and Context B
When I right-click Node 1 within Context A's view
And I click "Remove from Context A"
Then the CONTAINS relationship from Context A to Node 1 is deleted
And Node 1 no longer appears in Context A's view
And Node 1 still appears in Context B's view
And Node 1 is not deleted
```

#### Scenario: Remove node from its only context
```gherkin
Given Node 1 is a child of Context A only
When I right-click Node 1 within Context A's view
And I click "Remove from Context A"
Then the CONTAINS relationship is deleted
And Node 1 no longer appears in Context A's view
And Node 1 falls back to Context-Less (Blank) status
And Node 1 is not deleted
```

#### Scenario: Remove from Context not shown outside context view
```gherkin
Given I right-click Node 1 in the flat space node list (not within a context)
Then I do not see "Remove from Context" in the context menu
```

---

## Related Capabilities

- Node locking: `lockLevel`, `effectiveLockLevel`, `lockSource: 'schema'` on Node entity — schema lock derived from space mode (PRODUCTION/CONFIGURATION)
- ContextType: `attributeSchema` and `FieldSchema` types, linked to CONTEXT nodes via `context_type_id` FK
- Space: `projectType` (BACKEND/CONSUMER) controls schema visibility; `mode` (PRODUCTION/CONFIGURATION) controls schema locking
- Context page: Existing block/content rendering preserved alongside schema section
- Attributes: `AttributeKey.CONTAINS` for all containment relationships; backend prevents duplicate CONTAINS (409)
- Node types: `NodeType.CONTEXT` and `NodeType.REGULAR` determine containment rules
- Backend endpoint: `DELETE /api/spaces/{slug}/contexts/{ctx}/nodes/{nodeId}` removes CONTAINS relationship
