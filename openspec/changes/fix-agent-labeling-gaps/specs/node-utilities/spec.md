# Node Utilities

Centralize duplicated node detail parsing and classification functions into a single utility module.

## ADDED Requirements

### Requirement: Centralized parseNodeDetails

A single canonical `parseNodeDetails` function MUST exist in `src/lib/node-utils.ts`. All 4 duplicate implementations (in entity-types.ts, NodeCard.tsx, NodeGrid.tsx, ChatPanel.tsx) MUST be removed and replaced with imports from this module.

**Signature:** `parseNodeDetails(node?: Node | null): Record<string, unknown>`
**Return:** Always `{}` on empty/null, never `undefined`.

#### Scenario: NodeCard uses centralized parser
Given NodeCard.tsx previously had its own parseNodeDetails
When the centralization is complete
Then NodeCard imports parseNodeDetails from `@/lib/node-utils`
And the local function definition is removed

#### Scenario: Consistent return type
Given a node with `nodeDetails: null`
When parseNodeDetails is called
Then it returns `{}` (empty object)
And never returns `undefined`

#### Scenario: String nodeDetails are parsed
Given a node with `nodeDetails: '{"createdFrom":"agent"}'` (JSON string)
When parseNodeDetails is called
Then it returns `{ createdFrom: "agent" }`

### Requirement: Centralized isAiCreatedNode

The `isAiCreatedNode()` function MUST be in `src/lib/node-utils.ts`, not embedded in NodeCard.tsx. It checks: `createdFrom === 'agent'`, `generatedBy === 'agent'`, `source === 'agent'`, `chatNodeType === 'entity'`, `semanticTypeSource === 'agent'`.

#### Scenario: Graph CustomNode can detect AI nodes
Given CustomNode.tsx needs to show an AI badge
When it imports isAiCreatedNode from `@/lib/node-utils`
Then it correctly identifies agent-created nodes using the same logic as NodeCard

### Requirement: Centralized getSemanticTypeFromNode

The `getSemanticTypeFromNode()` function MUST be in `src/lib/node-utils.ts`. Resolution chain: fallback > node.semanticType > node.entityType > details.semanticType > details.entityType > details.nodeType > "unknown".

#### Scenario: Consistent semantic type resolution
Given a node with `semanticType: null` but `nodeDetails.entityType: "person"`
When getSemanticTypeFromNode is called
Then it returns "person"
