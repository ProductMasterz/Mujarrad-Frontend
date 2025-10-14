# Architecture Decision Record: Cyclic Graphs for Abstract Logic

**Date**: 2025-10-04
**Status**: APPROVED
**Decision**: Allow cyclic relationships in graph, with type-specific constraints

---

## Context

Mujarrad implements **Abstract Logic** - a data-driven programming paradigm where logic is expressed as node graphs instead of code. Like Mermaid converts data to diagrams, Mujarrad converts node relationships to executable workflows.

**Key Insight**: Programming requires cycles (loops, recursion, goto). A strict DAG prevents expressing fundamental programming constructs in data form.

---

## Decision

**Allow cycles in the graph, with semantic rules based on relationship type.**

### Relationship Type Constraints

| Relationship Type | Cycles Allowed | Rationale |
|------------------|---------------|-----------|
| **`contains`** (Hierarchy) | ❌ NO | UI breadcrumbs/navigation would create infinite loops |
| **`depends_on`** (Dependencies) | ✅ YES | Circular dependencies are valid (A needs B, B needs A) |
| **`triggers`** (Workflow) | ✅ YES | Workflow loops (approval cycle, retry logic) |
| **`references`** (Knowledge) | ✅ YES | Concepts naturally reference each other circularly |
| **`next`** (Sequential flow) | ✅ YES | Loop constructs (while, for, do-while) |
| **`calls`** (Function calls) | ✅ YES | Recursive function calls in abstract logic |

### Programming Constructs as Data

**While Loop**:
```json
{
  "node_type": "CONDITIONAL",
  "title": "While Loop: Process Queue",
  "evaluation_logic": "queue.length > 0",
  "relationships": [
    {"type": "next", "target": "ProcessItemNode"},
    {"type": "loop_back", "target": "SELF"}  // ✅ Cycle
  ]
}
```

**Recursion**:
```json
{
  "node_type": "MAPPING",
  "title": "Factorial Function",
  "base_case": "n == 0",
  "relationships": [
    {"type": "calls", "target": "SELF", "params": "n-1"}  // ✅ Self-reference
  ]
}
```

**Workflow Retry Logic**:
```
StartNode → ProcessNode → ValidationNode
              ↑                    ↓
              └──── (retry) ───────┘  // ✅ Cycle back
```

---

## Implementation Strategy

### 1. Database Layer

**No change to schema** - already supports any relationship pattern.

**Existing constraint** (keep):
```sql
CHECK (source_node_id <> target_node_id)  -- Prevents trivial self-loops
```

**New check** (application layer):
```sql
-- Only for attribute_type = 'contains'
-- Checked in Java before INSERT
```

### 2. Service Layer: Type-Specific Cycle Detection

**GraphService.java**:
```java
@Service
public class GraphService {

    /**
     * Check if creating relationship would create cycle in CONTAINMENT hierarchy.
     * Only applies to attribute_type = 'contains'.
     * Other relationship types allow cycles.
     */
    public boolean hasContainmentCycle(
        UUID sourceNodeId,
        UUID targetNodeId,
        UUID spaceId
    ) {
        // Only check containment relationships
        Set<UUID> visited = new HashSet<>();
        return dfsContainmentOnly(targetNodeId, sourceNodeId, spaceId, visited);
    }

    private boolean dfsContainmentOnly(
        UUID currentNodeId,
        UUID searchNodeId,
        UUID spaceId,
        Set<UUID> visited
    ) {
        if (currentNodeId.equals(searchNodeId)) {
            return true;  // Cycle detected
        }

        if (visited.contains(currentNodeId)) {
            return false;
        }

        visited.add(currentNodeId);

        // CRITICAL: Only traverse 'contains' relationships
        List<Attribute> containmentRelationships = attributeRepository
            .findBySourceNodeIdAndAttributeNameAndSpaceId(
                currentNodeId,
                "contains",  // Only check containment
                spaceId
            );

        for (Attribute attr : containmentRelationships) {
            if (dfsContainmentOnly(attr.getTargetNodeId(), searchNodeId, spaceId, visited)) {
                return true;
            }
        }

        return false;
    }
}
```

**AttributeService.java**:
```java
@Service
public class AttributeService {

    @Autowired
    private GraphService graphService;

    public Attribute createRelationship(
        UUID sourceNodeId,
        UUID targetNodeId,
        String attributeName,
        UUID spaceId
    ) {
        // Only check cycles for containment relationships
        if ("contains".equals(attributeName)) {
            if (graphService.hasContainmentCycle(sourceNodeId, targetNodeId, spaceId)) {
                throw new CircularContainmentException(
                    "Cannot create containment cycle: would break UI navigation hierarchy"
                );
            }
        }

        // For all other relationship types: allow cycles
        // This enables loops, recursion, circular references

        Attribute attribute = new Attribute();
        attribute.setSourceNodeId(sourceNodeId);
        attribute.setTargetNodeId(targetNodeId);
        attribute.setAttributeName(attributeName);
        attribute.setSpaceId(spaceId);

        return attributeRepository.save(attribute);
    }
}
```

### 3. Graph Traversal: Cycle-Safe Algorithms

**All traversal methods use visited sets**:
```java
public List<Node> getAllAncestors(UUID nodeId, UUID spaceId) {
    Set<UUID> visited = new HashSet<>();
    List<Node> ancestors = new ArrayList<>();
    collectAncestors(nodeId, spaceId, visited, ancestors);
    return ancestors;
}

private void collectAncestors(
    UUID nodeId,
    UUID spaceId,
    Set<UUID> visited,
    List<Node> result
) {
    if (visited.contains(nodeId)) {
        return;  // Already processed (cycle detected, safe to stop)
    }

    visited.add(nodeId);

    List<Attribute> parents = attributeRepository
        .findByTargetNodeIdAndSpaceId(nodeId, spaceId);

    for (Attribute attr : parents) {
        Node parent = nodeRepository.findById(attr.getSourceNodeId()).orElse(null);
        if (parent != null) {
            result.add(parent);
            collectAncestors(attr.getSourceNodeId(), spaceId, visited, result);
        }
    }
}
```

### 4. Execution Engine: Cycle Detection for Infinite Loops

**When executing abstract logic**, detect infinite loops:
```java
@Service
public class WorkflowExecutionService {

    private static final int MAX_ITERATIONS = 10000;

    public ExecutionResult executeWorkflow(UUID startNodeId, Map<String, Object> context) {
        Set<UUID> visitedInCurrentExecution = new HashSet<>();
        int iterationCount = 0;

        UUID currentNodeId = startNodeId;

        while (currentNodeId != null) {
            iterationCount++;

            // Prevent infinite loops in execution
            if (iterationCount > MAX_ITERATIONS) {
                throw new InfiniteLoopException(
                    "Workflow exceeded maximum iterations (10,000). Possible infinite loop."
                );
            }

            // Execute current node logic
            Node currentNode = nodeRepository.findById(currentNodeId).orElseThrow();
            ExecutionContext execContext = executeNode(currentNode, context);

            // Determine next node (could cycle back)
            currentNodeId = execContext.getNextNodeId();

            // Track visit count per node (detect tight loops)
            // Allow revisiting nodes (loops), but limit iterations
        }

        return new ExecutionResult(context);
    }
}
```

---

## Benefits

### ✅ Enables Abstract Logic Programming
- **Loops**: Represent while/for loops as cyclic workflows
- **Recursion**: Nodes can reference themselves
- **Goto/Jump**: Arbitrary workflow jumps
- **State Machines**: Cyclic state transitions

### ✅ Real-World Modeling
- **Feedback Loops**: Design → Development → Testing → Design
- **Approval Cycles**: Submit → Review → Revise → Submit
- **Circular Dependencies**: Module A uses B, B uses A
- **Knowledge Graphs**: Concepts referencing each other

### ✅ Maintains Data Integrity
- **Containment hierarchy**: Still acyclic (UI navigation works)
- **Infinite loop protection**: Execution engine has iteration limits
- **Traversal safety**: All algorithms use visited sets

### ✅ Constitutional Compliance
- ✅ **Node Supremacy**: All logic as nodes
- ✅ **Relationship-Driven**: Relationships define behavior
- ✅ **Abstraction Immutability**: Logic stays abstract (data, not code)
- ✅ **Architecture-less Architecture**: Structure emerges from relationships

---

## Risks & Mitigations

### Risk 1: Infinite Loops in Execution
**Mitigation**:
- Execution engine tracks iteration count
- MAX_ITERATIONS limit (default 10,000)
- User-configurable timeout per workflow

### Risk 2: Complex Graph Visualization
**Mitigation**:
- Use cycle-aware layout algorithms (Sugiyama, hierarchical with back-edges)
- Highlight cycles visually (different edge style/color)
- Provide "cycle detection" view mode

### Risk 3: User Confusion
**Mitigation**:
- Clear UI indication when creating cyclic relationships
- Warning for potentially infinite loops
- "Cycle analysis" tool to visualize loops

---

## Validation Queries

**Check containment hierarchy is acyclic**:
```sql
-- Should return empty (no containment cycles)
WITH RECURSIVE cycle_check AS (
  SELECT
    source_node_id,
    target_node_id,
    ARRAY[source_node_id] AS path
  FROM attributes
  WHERE attribute_name = 'contains'

  UNION ALL

  SELECT
    a.source_node_id,
    a.target_node_id,
    cc.path || a.source_node_id
  FROM attributes a
  JOIN cycle_check cc ON a.source_node_id = cc.target_node_id
  WHERE a.attribute_name = 'contains'
    AND NOT (a.source_node_id = ANY(cc.path))
)
SELECT * FROM cycle_check
WHERE source_node_id = ANY(path);
```

**Find all cyclic workflows** (for analysis):
```sql
-- Show all cycles in workflow relationships (valid!)
WITH RECURSIVE cycle_detector AS (
  SELECT
    source_node_id,
    target_node_id,
    attribute_name,
    ARRAY[source_node_id] AS path
  FROM attributes
  WHERE attribute_name IN ('next', 'triggers', 'calls')

  UNION ALL

  SELECT
    a.source_node_id,
    a.target_node_id,
    a.attribute_name,
    cd.path || a.source_node_id
  FROM attributes a
  JOIN cycle_detector cd ON a.source_node_id = cd.target_node_id
  WHERE a.attribute_name IN ('next', 'triggers', 'calls')
    AND NOT (a.source_node_id = ANY(cd.path))
)
SELECT DISTINCT path, attribute_name
FROM cycle_detector
WHERE source_node_id = ANY(path)
ORDER BY array_length(path, 1);
```

---

## Examples

### Example 1: Retry Logic (Workflow Cycle)
```
Node A: "Process Payment"
  └─→ next: Node B "Validate Payment"

Node B: "Validate Payment"
  ├─→ if_success: Node C "Complete Order"
  └─→ if_failure: Node A "Process Payment"  // ✅ Cycle back to retry
```

### Example 2: Recursive Function (Self-Reference)
```
Node: "Traverse Directory Tree"
  ├─ base_case: "if directory is empty, return"
  ├─→ process: "List files in directory"
  └─→ recursive_call: SELF with "subdirectory"  // ✅ Self-reference
```

### Example 3: State Machine (Cyclic States)
```
Idle → Active → Processing → Complete
  ↑                              ↓
  └──────── (reset) ─────────────┘  // ✅ Cycle back to Idle
```

---

## Migration from Current DAG Design

### Phase 1: Update Cycle Detection (T051)
```diff
- // Prevent ALL cycles
- if (graphService.hasCyclePath(sourceNodeId, targetNodeId, spaceId)) {

+ // Only prevent CONTAINMENT cycles
+ if ("contains".equals(attributeName) &&
+     graphService.hasContainmentCycle(sourceNodeId, targetNodeId, spaceId)) {
```

### Phase 2: Update Exception Handling (T059)
```diff
- throw new CircularRelationshipException("No cycles allowed");

+ throw new CircularContainmentException(
+   "Containment cycles break UI navigation. Use different relationship type for cycles."
+ );
```

### Phase 3: Update Tests (T024)
```diff
- // Test: Creating ANY cycle throws exception
+ // Test: Creating CONTAINMENT cycle throws exception
+ // Test: Creating WORKFLOW cycle succeeds (loops allowed)
+ // Test: Creating RECURSIVE call succeeds (self-reference allowed)
```

### Phase 4: Add Execution Engine (New Task)
```
T092: Implement WorkflowExecutionService with infinite loop protection
T093: Add iteration limit configuration (default 10,000)
T094: Implement cycle visualization in graph view
```

---

## References

- Constitutional Principle II: Relationship-Driven Structure
- Constitutional Principle III: Abstraction Immutability
- Constitutional Principle VII: Abstraction Preservation in Interface Design
- spec.md: FR-007 (Updated to allow cycles except containment)
- research.md: Section 2 (Updated cycle detection logic)

---

## Approval

**Architectural Decision**: Allow cycles in all relationship types except `contains` (containment hierarchy).

**Rationale**: Enables Abstract Logic programming paradigm - data-driven workflows with loops, recursion, and arbitrary control flow.

**Implementation**: Type-specific cycle detection in `AttributeService`, cycle-safe traversal algorithms, execution engine with iteration limits.

**Status**: ✅ APPROVED for implementation in Phase 3.3
