# Mujarrad Spring Boot - Complete Architecture Documentation

## 🏗️ Architecture Overview

This architecture follows **Clean Architecture** principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│           Controllers (REST API)                │
│  ┌────────────────────────────────────────┐    │
│  │  @RestController - HTTP Endpoints      │    │
│  └────────────────────────────────────────┘    │
└────────────────┬────────────────────────────────┘
                 │ Uses
┌────────────────▼────────────────────────────────┐
│              Services (Business Logic)          │
│  ┌────────────────────────────────────────┐    │
│  │  @Service - Transactions & Logic       │    │
│  └────────────────────────────────────────┘    │
└────────────────┬────────────────────────────────┘
                 │ Uses
┌────────────────▼────────────────────────────────┐
│            Repositories (Data Access)           │
│  ┌────────────────────────────────────────┐    │
│  │  @Repository - JPA Queries             │    │
│  └────────────────────────────────────────┘    │
└────────────────┬────────────────────────────────┘
                 │ Manages
┌────────────────▼────────────────────────────────┐
│            Entities (Domain Model)              │
│  ┌────────────────────────────────────────┐    │
│  │  @Entity - Database Tables             │    │
│  └────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘

           ┌──────────────────┐
           │  DTOs (Transfer)  │  ←─ Mappers transform
           └──────────────────┘
```

---

## 📦 Layer Breakdown

### **1. Entity Layer (Domain Model)**

**Purpose:** Maps to database tables (your ERD Version 4)

**Key Characteristics:**
- JPA annotations (`@Entity`, `@Table`, `@Column`)
- Lombok annotations (`@Getter`, `@Setter`, `@NoArgsConstructor`)
- Relationship mappings (`@OneToMany`, `@ManyToOne`, `@OneToOne`)
- Bean validation (`@NotNull`, `@Size`, `@Pattern`)

**Example: Node Entity**
```java
@Entity
@Table(name = "nodes")
@Getter @Setter @NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Node {
    @Id
    @GeneratedValue
    private UUID id;
    
    @Column(name = "node_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private NodeType nodeType; // REGULAR, CONTEXT, ASSUMPTION (not NODE/ATTRIBUTE/MAPPING)
    
    @Column(nullable = false, length = 500)
    @NotBlank(message = "Title is required")
    private String title;
    
    @Column(unique = true, nullable = false)
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Invalid slug format")
    private String slug;
    
    @Column(columnDefinition = "TEXT")
    private String markdownContent;

    @Type(JsonBinaryType.class)
    @Column(name = "node_details", columnDefinition = "jsonb")
    private Map<String, Object> nodeDetails; // JSONB column, not separate entity

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;
    
    @OneToMany(mappedBy = "node", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NodeVersion> versions = new ArrayList<>();
    
    @Version
    private Integer version; // Optimistic locking
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Helper methods
    public void addVersion(NodeVersion version) {
        versions.add(version);
        version.setNode(this);
    }
}
```

**All Entities:**
- ✅ User - User accounts
- ✅ Node - Base content entity
- ✅ NodeDetail - Extended node metadata
- ✅ NodeVersion - Version history
- ✅ Attribute - Relationships between nodes
- ✅ Mapping - Collection configurations
- ✅ NodeMapping - Items in collections
- ✅ Conditional - Logic/routing
- ✅ ConditionalTarget - Routing targets
- ✅ AuditLog - Audit trail
- ✅ SearchIndex - Search optimization

---

### **2. Repository Layer (Data Access)**

**Purpose:** Database operations using Spring Data JPA

**Key Characteristics:**
- Extends `JpaRepository<Entity, ID>`
- Query methods (auto-generated from method names)
- Custom queries with `@Query`
- Pagination support with `Pageable`

**Example: NodeRepository**
```java
@Repository
public interface NodeRepository extends JpaRepository<Node, UUID> {
    
    // Simple query methods (Spring generates SQL)
    Optional<Node> findBySlug(String slug);
    
    List<Node> findByNodeType(NodeType nodeType);
    
    Page<Node> findByCreatorId(UUID creatorId, Pageable pageable);
    
    // Custom JPQL query
    @Query("""
        SELECT n FROM Node n 
        WHERE n.nodeType = :type 
        AND n.creator.id = :creatorId
        ORDER BY n.createdAt DESC
    """)
    List<Node> findRecentNodesByTypeAndCreator(
        @Param("type") NodeType type,
        @Param("creatorId") UUID creatorId
    );
    
    // Query with joins (fetch to avoid N+1)
    @Query("""
        SELECT DISTINCT n FROM Node n
        LEFT JOIN FETCH n.versions
        LEFT JOIN FETCH n.creator
        LEFT JOIN FETCH n.details
        WHERE n.id = :id
    """)
    Optional<Node> findByIdWithVersions(@Param("id") UUID id);
    
    // Native SQL for complex queries
    @Query(value = """
        SELECT n.* FROM nodes n
        INNER JOIN node_details nd ON n.id = nd.node_id
        WHERE :tag = ANY(nd.tags)
    """, nativeQuery = true)
    List<Node> findByTag(@Param("tag") String tag);
}
```

**Repository Naming Conventions:**
```java
// Find methods
findBy{Property}                    // findBySlug(String slug)
findBy{Property1}And{Property2}     // findByTitleAndNodeType(...)
findBy{Property}Or{Property}        // findByTitleOrDescription(...)

// Query modifiers
findBy{Property}OrderBy{Property}   // findByTypeOrderByCreatedAt()
findBy{Property}Containing          // findByTitleContaining(String title)
findBy{Property}IgnoreCase          // findByEmailIgnoreCase(String email)

// Existence checks
existsBy{Property}                  // existsBySlug(String slug)

// Count methods
countBy{Property}                   // countByNodeType(NodeType type)

// Delete methods
deleteBy{Property}                  // deleteByCreatorId(UUID id)
```

---

### **3. DTO Layer (Data Transfer Objects)**

**Purpose:** API request/response structures (separate from entities)

**Why DTOs?**
- ✅ Decouple API from database structure
- ✅ Control what data is exposed
- ✅ Add validation without touching entities
- ✅ Prevent over-fetching/under-fetching
- ✅ API versioning flexibility

**Example: Request DTO**
```java
@Getter @Setter
public class NodeCreateRequest {
    
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 500, message = "Title must be between 3 and 500 characters")
    private String title;
    
    @NotBlank(message = "Slug is required")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must be lowercase with hyphens")
    private String slug;
    
    @Size(max = 2000, message = "Description too long")
    private String description;
    
    private String markdownContent;
    
    @NotNull(message = "Node type is required")
    private NodeType nodeType;
    
    private List<@NotBlank String> tags;
    
    // Custom validation
    @AssertTrue(message = "Slug must not contain consecutive hyphens")
    public boolean isValidSlug() {
        return slug == null || !slug.contains("--");
    }
}
```

**Example: Response DTO**
```java
@Getter @Setter
public class NodeResponse {
    private UUID id;
    private NodeType nodeType;
    private String title;
    private String slug;
    private String description;
    private String markdownContent;
    
    // Flattened creator info
    private UUID creatorId;
    private String creatorName;
    
    // Version info
    private Integer currentVersion;
    
    // Additional metadata
    private List<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Computed fields
    private Integer versionCount;
    private Boolean hasUnpublishedChanges;
}
```

**DTO Categories:**

**Request DTOs:**
- `NodeCreateRequest` - Creating new nodes
- `NodeUpdateRequest` - Updating existing nodes
- `AttributeCreateRequest` - Creating relationships
- `MappingCreateRequest` - Creating collections
- `SearchRequest` - Search parameters

**Response DTOs:**
- `NodeResponse` - Basic node info
- `NodeDetailResponse` - Full node with relationships
- `AttributeResponse` - Relationship info
- `PageResponse<T>` - Paginated results
- `ErrorResponse` - Error details

---

### **4. Mapper Layer (DTO ↔ Entity)**

**Purpose:** Transform between DTOs and Entities

**Why Mappers?**
- ✅ Separate transformation logic
- ✅ Type-safe conversions
- ✅ Compile-time generation (MapStruct)
- ✅ Reusable transformations

**Example: NodeMapper**
```java
@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface NodeMapper {
    
    // Request → Entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "creator", ignore = true)
    @Mapping(target = "versions", ignore = true)
    @Mapping(target = "currentVersion", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Node toEntity(NodeCreateRequest request);
    
    // Entity → Response
    @Mapping(source = "creator.id", target = "creatorId")
    @Mapping(source = "creator.name", target = "creatorName")
    @Mapping(source = "details.tags", target = "tags")
    @Mapping(target = "versionCount", expression = "java(node.getVersions().size())")
    NodeResponse toResponse(Node node);
    
    // Entity → Detail Response (with relationships)
    @Mapping(source = "creator", target = "creator")
    @Mapping(source = "versions", target = "recentVersions", qualifiedByName = "limitVersions")
    @Mapping(source = "sourceAttributes", target = "outgoingAttributes")
    @Mapping(source = "targetAttributes", target = "incomingAttributes")
    NodeDetailResponse toDetailResponse(Node node);
    
    // List mapping
    List<NodeResponse> toResponseList(List<Node> nodes);
    
    // Custom mapping
    @Named("limitVersions")
    default List<NodeVersionResponse> limitVersions(List<NodeVersion> versions) {
        return versions.stream()
            .sorted(Comparator.comparing(NodeVersion::getVersionNumber).reversed())
            .limit(5)
            .map(this::toVersionResponse)
            .collect(Collectors.toList());
    }
    
    NodeVersionResponse toVersionResponse(NodeVersion version);
}
```

**MapStruct generates implementation at compile time!**

---

### **5. Service Layer (Business Logic)**

**Purpose:** Business operations and transaction management

**Key Characteristics:**
- `@Service` annotation
- `@Transactional` for database transactions
- Business validation
- Orchestrates multiple repositories
- Calls other services

**Example: NodeService**
```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // Default read-only
@Slf4j
public class NodeService {
    
    private final NodeRepository nodeRepository;
    private final NodeDetailRepository nodeDetailRepository;
    private final NodeVersionRepository nodeVersionRepository;
    private final UserRepository userRepository;
    private final NodeMapper nodeMapper;
    private final SearchService searchService;
    private final AuditService auditService;
    
    @Transactional // Write transaction
    public NodeResponse createNode(NodeCreateRequest request, UUID creatorId) {
        log.info("Creating node with slug: {}", request.getSlug());
        
        // Business validation
        validateSlugUnique(request.getSlug());
        
        // Get creator
        User creator = userRepository.findById(creatorId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Map DTO to Entity
        Node node = nodeMapper.toEntity(request);
        node.setCreator(creator);
        
        // Save node
        node = nodeRepository.save(node);
        
        // Create node details if tags provided
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            NodeDetail details = new NodeDetail();
            details.setNode(node);
            details.setTags(request.getTags());
            nodeDetailRepository.save(details);
        }
        
        // Create initial version
        NodeVersion version = createVersion(node, request.getMarkdownContent(), creatorId);
        node.setCurrentVersion(version);
        
        // Update search index
        searchService.indexNode(node);
        
        // Audit log
        auditService.logCreate(node.getId(), EntityType.NODE, node, creatorId);
        
        log.info("Node created successfully: {}", node.getId());
        return nodeMapper.toResponse(node);
    }
    
    public NodeDetailResponse getNode(UUID id) {
        Node node = nodeRepository.findByIdWithVersions(id)
            .orElseThrow(() -> new ResourceNotFoundException("Node not found: " + id));
        
        return nodeMapper.toDetailResponse(node);
    }
    
    @Transactional
    public NodeResponse updateNode(UUID id, NodeUpdateRequest request, UUID userId) {
        log.info("Updating node: {}", id);
        
        Node node = nodeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Node not found"));
        
        // Store old state for audit
        Node oldNode = cloneNode(node);
        
        // Update fields
        node.setTitle(request.getTitle());
        node.setDescription(request.getDescription());
        node.setMarkdownContent(request.getMarkdownContent());
        
        // Update tags if provided
        if (request.getTags() != null) {
            NodeDetail details = node.getDetails();
            if (details == null) {
                details = new NodeDetail();
                details.setNode(node);
            }
            details.setTags(request.getTags());
        }
        
        // Create new version
        NodeVersion version = createVersion(node, request.getMarkdownContent(), userId);
        node.setCurrentVersion(version);
        
        // Save
        node = nodeRepository.save(node);
        
        // Update search index
        searchService.reindexNode(node.getId());
        
        // Audit log
        auditService.logUpdate(node.getId(), EntityType.NODE, oldNode, node, userId);
        
        return nodeMapper.toResponse(node);
    }
    
    @Transactional
    public void deleteNode(UUID id, UUID userId) {
        Node node = nodeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Node not found"));
        
        // Audit before delete
        auditService.logDelete(id, EntityType.NODE, node, userId);
        
        // Delete search index
        searchService.deleteIndex(id);
        
        // Delete node (cascades to versions, details, etc.)
        nodeRepository.delete(node);
        
        log.info("Node deleted: {}", id);
    }
    
    public Page<NodeResponse> getNodes(NodeType type, Pageable pageable) {
        Page<Node> nodes = type != null 
            ? nodeRepository.findByNodeType(type, pageable)
            : nodeRepository.findAll(pageable);
        
        return nodes.map(nodeMapper::toResponse);
    }
    
    public List<NodeVersionResponse> getNodeVersions(UUID nodeId) {
        List<NodeVersion> versions = nodeVersionRepository
            .findByNodeIdOrderByVersionNumberDesc(nodeId);
        
        return versions.stream()
            .map(nodeMapper::toVersionResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public NodeResponse restoreVersion(UUID nodeId, Integer versionNumber, UUID userId) {
        Node node = nodeRepository.findById(nodeId)
            .orElseThrow(() -> new ResourceNotFoundException("Node not found"));
        
        NodeVersion versionToRestore = nodeVersionRepository
            .findByNodeIdAndVersionNumber(nodeId, versionNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Version not found"));
        
        // Create new version with restored content
        node.setMarkdownContent(versionToRestore.getMarkdownContent());
        NodeVersion newVersion = createVersion(node, versionToRestore.getMarkdownContent(), userId);
        node.setCurrentVersion(newVersion);
        
        node = nodeRepository.save(node);
        searchService.reindexNode(node.getId());
        
        return nodeMapper.toResponse(node);
    }
    
    // Private helper methods
    private NodeVersion createVersion(Node node, String content, UUID userId) {
        Integer nextVersion = nodeVersionRepository
            .findTopByNodeIdOrderByVersionNumberDesc(node.getId())
            .map(v -> v.getVersionNumber() + 1)
            .orElse(1);
        
        NodeVersion version = new NodeVersion();
        version.setNode(node);
        version.setVersionNumber(nextVersion);
        version.setMarkdownContent(content);
        version.setCreatedBy(userId);
        
        return nodeVersionRepository.save(version);
    }
    
    private void validateSlugUnique(String slug) {
        if (nodeRepository.findBySlug(slug).isPresent()) {
            throw new DuplicateResourceException("Slug already exists: " + slug);
        }
    }
    
    private Node cloneNode(Node node) {
        // Clone for audit comparison
        // Implementation details...
        return new Node();
    }
}
```

**Service Best Practices:**
- ✅ Always use `@Transactional` on write operations
- ✅ Keep transactions short (don't call external APIs inside)
- ✅ Validate business rules in services
- ✅ Use constructor injection (Lombok `@RequiredArgsConstructor`)
- ✅ Log important operations
- ✅ Throw meaningful exceptions

---

### **6. Controller Layer (REST API)**

**Purpose:** HTTP endpoints and request/response handling

**Key Characteristics:**
- `@RestController` annotation
- HTTP method mappings (`@GetMapping`, `@PostMapping`, etc.)
- Request validation (`@Valid`)
- Security integration (`@AuthenticationPrincipal`)
- OpenAPI documentation (`@Operation`, `@Tag`)

**Example: NodeController**
```java
@RestController
@RequestMapping("/api/v1/nodes")
@RequiredArgsConstructor
@Tag(name = "Nodes", description = "Node management operations")
@Validated
public class NodeController {
    
    private final NodeService nodeService;
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
        summary = "Create a new node",
        description = "Creates a new content node with the specified properties"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Node created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "409", description = "Slug already exists")
    })
    public NodeResponse createNode(
            @Valid @RequestBody NodeCreateRequest request,
            @AuthenticationPrincipal SecurityUser user) {
        return nodeService.createNode(request, user.getId());
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get node by ID")
    public NodeDetailResponse getNode(@PathVariable UUID id) {
        return nodeService.getNode(id);
    }
    
    @GetMapping
    @Operation(summary = "Get all nodes with pagination and filtering")
    public Page<NodeResponse> getNodes(
            @RequestParam(required = false) 
            @Parameter(description = "Filter by node type")
            NodeType type,
            
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            @Parameter(hidden = true)
            Pageable pageable) {
        return nodeService.getNodes(type, pageable);
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search nodes by title or content")
    public Page<NodeResponse> searchNodes(
            @RequestParam String query,
            @PageableDefault(size = 20)
            Pageable pageable) {
        return nodeService.searchNodes(query, pageable);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update an existing node")
    public NodeResponse updateNode(
            @PathVariable UUID id,
            @Valid @RequestBody NodeUpdateRequest request,
            @AuthenticationPrincipal SecurityUser user) {
        return nodeService.updateNode(id, request, user.getId());
    }
    
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a node")
    public void deleteNode(
            @PathVariable UUID id,
            @AuthenticationPrincipal SecurityUser user) {
        nodeService.deleteNode(id, user.getId());
    }
    
    @GetMapping("/{id}/versions")
    @Operation(summary = "Get version history")
    public List<NodeVersionResponse> getVersions(@PathVariable UUID id) {
        return nodeService.getNodeVersions(id);
    }
    
    @PostMapping("/{id}/versions/{versionNumber}/restore")
    @Operation(summary = "Restore a previous version")
    public NodeResponse restoreVersion(
            @PathVariable UUID id,
            @PathVariable Integer versionNumber,
            @AuthenticationPrincipal SecurityUser user) {
        return nodeService.restoreVersion(id, versionNumber, user.getId());
    }
}
```

**Controller Best Practices:**
- ✅ Keep controllers thin (delegate to services)
- ✅ Use proper HTTP status codes
- ✅ Validate requests with `@Valid`
- ✅ Document with OpenAPI annotations
- ✅ Use DTOs (never expose entities directly)
- ✅ Handle pagination with `Pageable`

---

## 🔄 Request Flow Example

### **Creating a Node - Complete Flow**

```
1. HTTP Request
   POST /api/v1/nodes
   {
     "title": "My Node",
     "slug": "my-node",
     "nodeType": "NODE",
     "markdownContent": "# Hello"
   }
   
2. Controller (NodeController)
   ↓ Receives request
   ↓ Validates @Valid annotations
   ↓ Extracts authenticated user
   ↓ Calls service
   
3. Service (NodeService)
   ↓ Validates business rules (slug unique)
   ↓ Maps DTO → Entity (NodeMapper)
   ↓ Sets creator
   ↓ Saves node (NodeRepository)
   ↓ Creates version (NodeVersionRepository)
   ↓ Updates search index (SearchService)
   ↓ Logs audit (AuditService)
   ↓ Maps Entity → DTO (NodeMapper)
   
4. Response
   201 Created
   {
     "id": "uuid",
     "title": "My Node",
     "slug": "my-node",
     "creatorName": "John Doe",
     "createdAt": "2025-10-04T10:00:00Z"
   }
```

---

## 🎯 Key Design Patterns Used

### **1. Repository Pattern**
```java
// Abstraction over data access
public interface NodeRepository extends JpaRepository<Node, UUID> {
    // Data access methods
}
```

### **2. Service Layer Pattern**
```java
// Business logic separation
@Service
public class NodeService {
    // Business operations
}
```

### **3. DTO Pattern**
```java
// Separate API contracts from domain
public class NodeCreateRequest { }
public class NodeResponse { }
```

### **4. Mapper Pattern**
```java
// Transform between layers
@Mapper
public interface NodeMapper {
    Node toEntity(NodeCreateRequest request);
    NodeResponse toResponse(Node node);
}
```

### **5. Dependency Injection**
```java
// Constructor injection with Lombok
@RequiredArgsConstructor
public class NodeService {
    private final NodeRepository repository;
}
```

---

## 📊 Complete API Endpoints

### **Authentication**
```
POST   /api/v1/auth/login              Login
POST   /api/v1/auth/register           Register
POST   /api/v1/auth/refresh            Refresh token
POST   /api/v1/auth/logout             Logout
```

### **Nodes**
```
POST   /api/v1/nodes                   Create node
GET    /api/v1/nodes/{id}              Get node details
PUT    /api/v1/nodes/{id}              Update node
DELETE /api/v1/nodes/{id}              Delete node
GET    /api/v1/nodes                   List nodes (paginated)
GET    /api/v1/nodes/search            Search nodes
GET    /api/v1/nodes/{id}/versions     Get version history
POST   /api/v1/nodes/{id}/versions/{versionNumber}/restore  Restore version
```

### **Attributes (Relationships)**
```
POST   /api/v1/attributes              Create relationship
GET    /api/v1/attributes/{id}         Get relationship
PUT    /api/v1/attributes/{id}         Update relationship
DELETE /api/v1/attributes/{id}         Delete relationship
GET    /api/v1/nodes/{nodeId}/attributes            All relationships
GET    /api/v1/nodes/{nodeId}/attributes/outgoing   Outgoing relationships
GET    /api/v1/nodes/{nodeId}/attributes/incoming   Incoming relationships
```

### **Mappings (Collections)**
```
POST   /api/v1/mappings                Create mapping
GET    /api/v1/mappings/{id}           Get mapping with items
PUT    /api/v1/mappings/{id}           Update mapping
DELETE /api/v1/mappings/{id}           Delete mapping
POST   /api/v1/mappings/{id}/items     Add item to mapping
DELETE /api/v1/mappings/{id}/items/{itemId}  Remove item
PUT    /api/v1/mappings/{id}/reorder   Reorder items
```

### **Conditionals (Logic)**
```
POST   /api/v1/conditionals            Create conditional
GET    /api/v1/conditionals/{id}       Get conditional
PUT    /api/v1/conditionals/{id}       Update conditional
DELETE /api/v1/conditionals/{id}       Delete conditional
POST   /api/v1/conditionals/{id}/evaluate  Evaluate conditions
```

### **Search**
```
GET    /api/v1/search                  Full-text search
POST   /api/v1/search/reindex          Reindex all
POST   /api/v1/search/reindex/{nodeId} Reindex specific node
```

### **Audit**
```
GET    /api/v1/audit/entity/{entityId} Entity audit log
GET    /api/v1/audit/user/{userId}     User audit log
```

---

## ✅ Summary

This architecture provides:

✅ **Clear Separation** - Each layer has distinct responsibility  
✅ **Type Safety** - Java + MapStruct + Lombok  
✅ **Testability** - Each layer can be tested independently  
✅ **Maintainability** - Easy to modify without breaking other layers  
✅ **Scalability** - Can add features without restructuring  
✅ **Performance** - JPA optimizations, pagination, caching  
✅ **Security** - JWT auth, role-based access  
✅ **Documentation** - OpenAPI/Swagger auto-generated  

**Ready for Production with:**
- Version control
- Audit logging
- Full-text search
- Pagination
- Error handling
- API documentation
- Transaction management

---

## 🚀 Next Steps

Use these prompts to generate code:

**1. Generate all entities:**
```
Based on the class diagram, generate all JPA entities with:
- Lombok annotations
- JPA relationships
- Bean validation
- Audit fields
```

**2. Generate all repositories:**
```
Generate Spring Data JPA repositories for all entities with:
- Custom query methods
- Pagination support
- Complex joins where needed
```

**3. Generate all DTOs:**
```
Generate Request and Response DTOs for:
- Node operations
- Attribute operations
- Mapping operations
- Search operations
```

**4. Generate mappers:**
```
Generate MapStruct mappers for all entities with:
- Entity to Response mapping
- Request to Entity mapping
- List mappings
```

**5. Generate services:**
```
Generate service layer with:
- CRUD operations
- Business validation
- Transaction management
- Audit logging integration
```

**6. Generate controllers:**
```
Generate REST controllers with:
- All CRUD endpoints
- OpenAPI documentation
- Pagination support
- Security integration
```
