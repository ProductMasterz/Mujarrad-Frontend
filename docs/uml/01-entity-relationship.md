# Entity Relationship Diagram

**Filename:** `docs/uml/01-entity-relationship.md`
**Diagram type:** erDiagram
**Scope:** Full data model — Organization, User, Space, Node subtypes, Attribute edges, VirtualContext, NodeVersion, ContextType.

```mermaid
erDiagram
    Organization {
        string id PK "UUID v4"
        string name
        string slug
        string type "INDIVIDUAL | TEAM"
        string createdAt
        string updatedAt
    }

    User {
        string id PK "UUID v4"
        string username
        string email
        string createdAt
        string updatedAt
    }

    OrganizationMember {
        string userId FK
        string role "OWNER | ADMIN | MEMBER"
        string joinedAt
    }

    Space {
        string id PK "UUID v4"
        string name
        string slug "unique"
        string ownerId FK
        string organizationId FK
        string projectType "CONSUMER | BACKEND"
        string mode "CONFIGURATION | PRODUCTION"
        boolean isLocked
        string createdAt
        string updatedAt
    }

    Node {
        string id PK "UUID v4"
        string spaceId FK
        string nodeType "REGULAR | CONTEXT | ATTRIBUTE"
        string title
        string slug "unique within space"
        string content "markdown, nullable"
        json nodeDetails
        string currentVersionId FK "nullable"
        string parentNodeId FK "nullable — block nodes only"
        string createdBy FK
        string modifiedBy FK
        string lockLevel "UNLOCKED | CONTENT_LOCKED | FULLY_LOCKED"
        boolean isBuiltin
        string createdAt
        string updatedAt
    }

    NodeDetails {
        boolean showInSpaceList "false hides from listings"
        string blockType "text|heading1|heading2|..."
        string semanticType "Person|Place|Topic|..."
        boolean isPage
        string element_subtype "whiteboard element type"
    }

    NodeVersion {
        string id PK "UUID v4 — corrected from number"
        string nodeId FK "UUID v4 — corrected from number"
        int versionNumber "corrected from version"
        string title
        string nodeType
        string content
        json nodeDetailsSnapshot "corrected from nodeDetails"
        string createdAt
        string createdBy "UUID v4 — corrected from number"
    }

    Attribute {
        string id PK "UUID v4"
        string spaceId FK
        string sourceNodeId FK
        string targetNodeId FK
        string attributeName "contains|depends_on|references|parent_of|relates_to"
        string attributeType
        string attributeTypeMode
        json attributeValue
        json properties
        string representativeNodeId "optional"
        boolean isLocked
        string virtualContextId FK "optional"
        string createdBy FK
        string createdAt
    }

    VirtualContext {
        string id PK "UUID v4"
        string name
        string slug
        string description
        string ownerSpaceId FK
        string visibility
        string createdAt
    }

    VirtualContextMember {
        string spaceId FK
        string spaceName
        string role "OWNER | CONTRIBUTOR | READONLY"
        string joinedAt
    }

    ContextType {
        string id PK
        string spaceId FK
        string name
        string slug
        string description
        string createdAt
        string updatedAt
    }

    Organization ||--o{ OrganizationMember : "has members"
    User ||--o{ OrganizationMember : "belongs to"
    Organization ||--o{ Space : "owns"
    User ||--o{ Space : "owns (ownerId)"
    Space ||--o{ Node : "contains"
    Node ||--o| Node : "block child (parentNodeId)"
    Node ||--o{ NodeVersion : "versioned as"
    Node ||--o{ Attribute : "source of"
    Node ||--o{ Attribute : "target of"
    Space ||--o{ VirtualContext : "owner of"
    Space ||--o{ VirtualContextMember : "participates in"
    VirtualContext ||--o{ VirtualContextMember : "has"
    Attribute }o--o| VirtualContext : "scoped to (optional)"
    Space ||--o{ ContextType : "defines"
```

## Notes

- **Node subtypes** are discriminated by `nodeType`. CONTEXT nodes with a non-null `slug` have a canonical layer view at `/spaces/{spaceSlug}/context/{slug}`. REGULAR nodes navigate to `/spaces/{spaceSlug}/node/{id}`. Block nodes are REGULAR nodes with `parentNodeId` set and `nodeDetails.showInSpaceList = false`.
- **Attribute** represents directed edges (relationships) between Nodes and is not the same as `NodeType.ATTRIBUTE`. `NodeType.ATTRIBUTE` is a node subtype; `Attribute` is a separate entity representing named, typed edges.
- **NodeVersion** fields `id`, `nodeId`, `versionNumber`, `nodeDetailsSnapshot`, and `createdBy` are corrected per ADR F-14 — the backend-dtos.ts types at lines 195–205 contain incorrect types that must be fixed.
- **AttributeKey enum** corrected values per ADR F-16: `contains`, `depends_on`, `references`, `parent_of`, `relates_to`. Phantom values `triggers`, `next`, `calls` do not exist in the backend.
