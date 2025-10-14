# Mujarrad Technology - Database Schema Documentation
## Version 4: Production-Ready Enterprise ERD

**Document Version:** 1.0  
**Last Updated:** October 2025  
**Database:** PostgreSQL 14+  
**Application:** Obsidian-like Knowledge Management System

---

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Database Schema](#database-schema)
4. [Table Definitions](#table-definitions)
5. [Indexes and Constraints](#indexes-and-constraints)
6. [Automated Triggers](#automated-triggers)
7. [Query Examples](#query-examples)
8. [Performance Considerations](#performance-considerations)
9. [Maintenance Guidelines](#maintenance-guidelines)

---

## Overview

### Purpose
This database schema is designed to support a flexible, graph-based knowledge management system similar to Obsidian. It enables users to create interconnected nodes of content with various relationship types, version history, audit trails, and full-text search capabilities.

### Key Features
- ✅ **Flexible Node Types**: Basic nodes, attributes (relationships), mappings (collections), and conditionals (logic)
- ✅ **Version Control**: Complete history of all content changes
- ✅ **Audit Trail**: Full tracking of all operations with before/after values
- ✅ **Full-Text Search**: Optimized search infrastructure with PostgreSQL tsvector
- ✅ **Performance**: Strategic indexes for common query patterns
- ✅ **Data Integrity**: Comprehensive constraints and validation rules
- ✅ **Scalability**: Designed to handle millions of records efficiently

### Architecture Principles

#### 1. **"Everything is a Node" Architecture**
The schema implements a unified node-based design where contexts, templates, and organizational structures are nodes, not separate entities:

**Contexts ARE Nodes:**
- Contexts are nodes with `node_type = 'context'`
- No separate `contexts` table needed
- Containment expressed via `attributes` table with `attribute_type = 'contains'`
- Context hierarchy = nested containment relationships
- "Super position" (multi-context membership) = multiple `contains` relationships pointing to same node

**Templates ARE Nodes:**
- Templates are context nodes marked with `is_template = true` in `node_details`
- Template creation = duplicate context node → clean content → mark flag
- Template application = duplicate template node → customize
- No separate `templates` table needed

**Example Queries:**
```sql
-- Find all contexts
SELECT * FROM nodes WHERE node_type = 'context';

-- Find nodes in a specific context
SELECT n.* FROM nodes n
JOIN attributes a ON a.target_node_id = n.id
WHERE a.source_node_id = :context_id AND a.attribute_type = 'contains';

-- Find all parent contexts of a node (super position)
SELECT c.* FROM nodes c
JOIN attributes a ON a.source_node_id = c.id
WHERE a.target_node_id = :node_id AND a.attribute_type = 'contains';

-- Find all templates
SELECT n.* FROM nodes n
JOIN node_details nd ON nd.node_id = n.id
WHERE nd.is_template = true;
```

#### 2. **Normalized Design**
Separate tables for specialized entity types (attributes, mappings, conditionals)

#### 3. **Type Safety**
Database-level validation for all enums and business rules

#### 4. **Automation**
Triggers for timestamps, auditing, and search indexing

#### 5. **Extensibility**
JSONB fields for flexible metadata without schema changes

#### 6. **Performance First**
Comprehensive indexing strategy for all access patterns

---

## Entity Relationship Diagram

 erDiagram
    %% Core Tables
    USERS {
        uuid id PK
        string email UK "Unique email address"
        string name "NOT NULL"
        string role "CHECK(developer, editor, viewer)"
        timestamp created_at
        timestamp updated_at
        boolean is_active "DEFAULT true"
    }
    
    SPACES {
        uuid id PK
        string name "NOT NULL"
        string slug UK "Unique space slug"
        timestamp created_at
        timestamp updated_at
    }

    SPACE_USERS {
        uuid id PK
        uuid space_id FK
        uuid user_id FK
        string role "CHECK(OWNER, ADMIN, MEMBER, VIEWER)"
        timestamp joined_at
    }

    NODES {
        uuid id PK
        uuid space_id FK
        string node_type "CHECK(REGULAR, CONTEXT, ASSUMPTION)"
        string title "NOT NULL"
        string slug "Space-scoped unique"
        text description
        text markdown_content
        jsonb node_details "GIN indexed for tags/metadata"
        uuid creator_id FK
        uuid current_version_id FK "Points to one version in NODE_VERSIONS"
        integer version "For optimistic locking"
        timestamp created_at
        timestamp updated_at
    }
    
    NODE_VERSIONS {
        uuid id PK
        uuid node_id FK
        integer version_number "NOT NULL"
        text markdown_content
        jsonb metadata
        uuid created_by FK
        timestamp created_at
    }
    
    %% ATTRIBUTES defines a relationship (edge) between two nodes
    ATTRIBUTES {
        uuid id PK
        uuid source_node_id FK "The origin node of the attribute"
        uuid target_node_id FK "The destination node of the attribute"
        string attribute_type "CHECK(contains, depends_on, references)"
        boolean is_bidirectional "DEFAULT false"
        decimal strength_weight "CHECK between 0.0 and 1.0"
        jsonb properties
        timestamp created_at
        timestamp updated_at
    }
    
    %% MAPPINGS defines the properties of a node that acts as a container
    MAPPINGS {
        uuid id PK
        uuid node_id FK "UNIQUE, one mapping per node"
        string ordering_strategy "CHECK(manual, alphabetical, chronological)"
        boolean allow_duplicates "DEFAULT false"
        jsonb configuration
        timestamp created_at
        timestamp updated_at
    }
    
    %% NODE_MAPPINGS is the join table for a MAPPING node and the nodes it contains
    NODE_MAPPINGS {
        uuid id PK
        uuid mapping_node_id FK "The node that is the container"
        uuid contained_node_id FK "The node that is contained"
        integer sort_order "NOT NULL, must be > 0"
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
    
    %% CONDITIONALS defines the branching logic for a node
    CONDITIONALS {
        uuid id PK
        uuid node_id FK "UNIQUE, one conditional per node"
        uuid preceding_node_id FK "The node that leads to this conditional choice"
        uuid default_target_id FK "The node to go to if no conditions match"
        text evaluation_logic
        timestamp created_at
        timestamp updated_at
    }
    
    %% CONDITIONAL_TARGETS defines the possible outcomes of a conditional node
    CONDITIONAL_TARGETS {
        uuid id PK
        uuid conditional_node_id FK "The node with the conditional logic"
        uuid target_node_id FK "A possible target node"
        jsonb conditions "The rules for choosing this target"
        integer priority "DEFAULT 0"
        timestamp created_at
    }
    
    AUDIT_LOG {
        uuid id PK
        uuid entity_id "NOT NULL"
        string entity_type "NOT NULL"
        string operation "CHECK(CREATE, UPDATE, DELETE)"
        uuid performed_by FK
        jsonb before_value
        jsonb after_value
        timestamp created_at
    }
    
    SEARCH_INDEX {
        uuid id PK
        uuid node_id FK "UNIQUE, one index record per node"
        tsvector search_vector "GIN indexed"
        text[] keywords
        jsonb metadata
        timestamp last_indexed
    }

    %% Relationships
    
    %% Space and User Management
    SPACES ||--o{ SPACE_USERS : "has"
    USERS ||--o{ SPACE_USERS : "is in"
    SPACES ||--o{ NODES : "contains"
    
    %% User Actions
    USERS }o--|| NODES : "creates"
    USERS }o--|| NODE_VERSIONS : "creates"
    USERS }o--|| AUDIT_LOG : "performs"

    %% Node Structure
    NODES ||--o{ NODE_VERSIONS : "has versions"
    NODES }o--|| NODE_VERSIONS : "has current version"
    NODES ||--o| SEARCH_INDEX : "is indexed in"

    %% Node-to-Node Relationships (Attributes)
    NODES }o--|{ ATTRIBUTES : "is source of"
    NODES }o--|{ ATTRIBUTES : "is target of"

    %% Node as a Container (Mapping)
    NODES ||--o| MAPPINGS : "can have a mapping"
    NODES }o--|{ NODE_MAPPINGS : "acts as container"
    NODES }o--|{ NODE_MAPPINGS : "is contained in"
    
    %% Node as a Branch (Conditional)
    NODES ||--o| CONDITIONALS : "can have a conditional"
    NODES }o..|| CONDITIONALS : "can precede"
    NODES }o..|| CONDITIONALS : "has default target"
    NODES }o--|{ CONDITIONAL_TARGETS : "is conditional for"
    NODES }o--|{ CONDITIONAL_TARGETS : "is target of"

---

## Database Schema

### Complete SQL DDL

```sql
-- =====================================================
-- MUJARRAD TECHNOLOGY DATABASE SCHEMA
-- Version: 4.0 (Production-Ready)
-- Database: PostgreSQL 14+
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLE: USERS
-- Purpose: User authentication and profile management
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    name VARCHAR(255) NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
    role VARCHAR(50) NOT NULL DEFAULT 'viewer' 
        CHECK (role IN ('developer', 'editor', 'viewer', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with role-based access control';
COMMENT ON COLUMN users.email IS 'Unique email address, validated format';
COMMENT ON COLUMN users.role IS 'User role: developer, editor, viewer, or admin';
COMMENT ON COLUMN users.is_active IS 'Soft delete flag for user accounts';

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- =====================================================
-- TABLE: SPACES
-- Purpose: Multi-tenant space isolation
-- =====================================================
CREATE TABLE spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE
        CHECK (slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE spaces IS 'Multi-tenant space containers - conceptually super-contexts in node graph';
COMMENT ON COLUMN spaces.slug IS 'URL-friendly space identifier used in routing';

CREATE INDEX idx_spaces_slug ON spaces(slug);

-- =====================================================
-- TABLE: SPACE_USERS
-- Purpose: Space membership and role-based access
-- =====================================================
CREATE TABLE space_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')),
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(space_id, user_id)
);

COMMENT ON TABLE space_users IS 'Junction table for space membership with roles';
COMMENT ON COLUMN space_users.role IS 'Space-level role: OWNER, ADMIN, MEMBER, or VIEWER';

CREATE INDEX idx_space_users_space ON space_users(space_id);
CREATE INDEX idx_space_users_user ON space_users(user_id);

-- =====================================================
-- TABLE: NODES
-- Purpose: Base table for all content nodes
-- =====================================================
CREATE TABLE nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    node_type VARCHAR(50) NOT NULL DEFAULT 'REGULAR'
        CHECK (node_type IN ('REGULAR', 'CONTEXT', 'ASSUMPTION')),
    title VARCHAR(500) NOT NULL CHECK (LENGTH(TRIM(title)) > 0),
    slug VARCHAR(500) NOT NULL
        CHECK (slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    description TEXT,
    markdown_content TEXT,
    node_details JSONB DEFAULT '{}'::jsonb,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    current_version_id UUID,
    version INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(space_id, slug)
);

COMMENT ON TABLE nodes IS 'Base content nodes supporting REGULAR, CONTEXT, and ASSUMPTION types';
COMMENT ON COLUMN nodes.space_id IS 'Multi-tenant space scoping';
COMMENT ON COLUMN nodes.node_type IS 'Discriminator: REGULAR, CONTEXT, or ASSUMPTION';
COMMENT ON COLUMN nodes.slug IS 'URL-friendly identifier unique per space';
COMMENT ON COLUMN nodes.node_details IS 'JSONB for flexible schema-less data (tags, metadata, is_template, etc.)';
COMMENT ON COLUMN nodes.version IS 'Optimistic locking version number';
COMMENT ON COLUMN nodes.current_version_id IS 'Reference to active version in node_versions';

-- Indexes
CREATE INDEX idx_nodes_space ON nodes(space_id);
CREATE INDEX idx_nodes_type ON nodes(node_type);
CREATE INDEX idx_nodes_creator ON nodes(creator_id);
CREATE INDEX idx_nodes_slug ON nodes(space_id, slug);
CREATE INDEX idx_nodes_created_at ON nodes(created_at DESC);
CREATE INDEX idx_nodes_type_created ON nodes(node_type, created_at DESC);
CREATE INDEX idx_nodes_details ON nodes USING GIN (node_details);

-- =====================================================
-- TABLE: NODE_VERSIONS
-- Purpose: Complete version history for all nodes
-- =====================================================
CREATE TABLE node_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL CHECK (version_number > 0),
    markdown_content TEXT,
    metadata JSONB,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(node_id, version_number)
);

COMMENT ON TABLE node_versions IS 'Version history for content tracking and rollback';
COMMENT ON COLUMN node_versions.version_number IS 'Sequential version number per node';
COMMENT ON COLUMN node_versions.metadata IS 'Snapshot of node metadata at version creation';

-- Indexes
CREATE INDEX idx_node_versions_node ON node_versions(node_id, version_number DESC);
CREATE INDEX idx_node_versions_created_by ON node_versions(created_by);
CREATE INDEX idx_node_versions_created_at ON node_versions(created_at DESC);

-- Add foreign key constraint for current_version_id after node_versions exists
ALTER TABLE nodes 
ADD CONSTRAINT fk_nodes_current_version 
FOREIGN KEY (current_version_id) REFERENCES node_versions(id) ON DELETE SET NULL;

-- =====================================================
-- TABLE: ATTRIBUTES
-- Purpose: Relationships/connections between nodes
-- =====================================================
CREATE TABLE attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID UNIQUE NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    source_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    attribute_type VARCHAR(100) NOT NULL 
        CHECK (attribute_type IN ('contains', 'depends_on', 'references', 'parent_of', 'relates_to')),
    is_bidirectional BOOLEAN DEFAULT false,
    strength_weight DECIMAL(3,2) CHECK (strength_weight BETWEEN 0.0 AND 1.0),
    properties JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (source_node_id != target_node_id)
);

COMMENT ON TABLE attributes IS 'Directed relationships between nodes with type and properties';
COMMENT ON COLUMN attributes.attribute_type IS 'Type of relationship: contains, depends_on, references, parent_of, relates_to';
COMMENT ON COLUMN attributes.is_bidirectional IS 'If true, relationship applies in both directions';
COMMENT ON COLUMN attributes.strength_weight IS 'Relationship strength from 0.0 to 1.0';

-- Indexes
CREATE INDEX idx_attributes_source ON attributes(source_node_id);
CREATE INDEX idx_attributes_target ON attributes(target_node_id);
CREATE INDEX idx_attributes_type ON attributes(attribute_type);
CREATE INDEX idx_attributes_bidirectional ON attributes(is_bidirectional) WHERE is_bidirectional = true;
CREATE INDEX idx_attributes_properties ON attributes USING GIN(properties);
CREATE INDEX idx_attributes_source_target ON attributes(source_node_id, target_node_id);

-- =====================================================
-- TABLE: MAPPINGS
-- Purpose: Collection/grouping configuration
-- =====================================================
CREATE TABLE mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID UNIQUE NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    ordering_strategy VARCHAR(50) DEFAULT 'manual' 
        CHECK (ordering_strategy IN ('manual', 'alphabetical', 'chronological', 'custom')),
    allow_duplicates BOOLEAN DEFAULT false,
    configuration JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE mappings IS 'Configuration for collection/list nodes';
COMMENT ON COLUMN mappings.ordering_strategy IS 'How items are ordered: manual, alphabetical, chronological, or custom';
COMMENT ON COLUMN mappings.allow_duplicates IS 'Whether same node can appear multiple times';

-- Indexes
CREATE INDEX idx_mappings_node ON mappings(node_id);
CREATE INDEX idx_mappings_strategy ON mappings(ordering_strategy);

-- =====================================================
-- TABLE: NODE_MAPPINGS
-- Purpose: Items contained within mapping collections
-- =====================================================
CREATE TABLE node_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mapping_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    contained_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL CHECK (sort_order > 0),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mapping_node_id, contained_node_id)
);

COMMENT ON TABLE node_mappings IS 'Junction table linking mappings to their contained nodes';
COMMENT ON COLUMN node_mappings.sort_order IS 'Display order within the mapping (must be positive)';

-- Indexes
CREATE INDEX idx_node_mappings_mapping ON node_mappings(mapping_node_id, sort_order);
CREATE INDEX idx_node_mappings_contained ON node_mappings(contained_node_id);
CREATE INDEX idx_node_mappings_metadata ON node_mappings USING GIN(metadata);

-- =====================================================
-- TABLE: CONDITIONALS
-- Purpose: Conditional logic/routing configuration
-- =====================================================
CREATE TABLE conditionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID UNIQUE NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    preceding_node_id UUID REFERENCES nodes(id) ON DELETE SET NULL,
    default_target_id UUID REFERENCES nodes(id) ON DELETE SET NULL,
    evaluation_logic TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE conditionals IS 'Conditional logic for routing/workflow nodes';
COMMENT ON COLUMN conditionals.preceding_node_id IS 'Node that triggers this conditional';
COMMENT ON COLUMN conditionals.default_target_id IS 'Fallback target if no conditions match';
COMMENT ON COLUMN conditionals.evaluation_logic IS 'Custom logic for condition evaluation';

-- Indexes
CREATE INDEX idx_conditionals_node ON conditionals(node_id);
CREATE INDEX idx_conditionals_preceding ON conditionals(preceding_node_id);
CREATE INDEX idx_conditionals_default ON conditionals(default_target_id);

-- =====================================================
-- TABLE: CONDITIONAL_TARGETS
-- Purpose: Possible routing outcomes for conditionals
-- =====================================================
CREATE TABLE conditional_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conditional_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    conditions JSONB,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conditional_node_id, target_node_id)
);

COMMENT ON TABLE conditional_targets IS 'Target nodes for conditional routing with conditions';
COMMENT ON COLUMN conditional_targets.conditions IS 'JSON-encoded conditions for this target';
COMMENT ON COLUMN conditional_targets.priority IS 'Evaluation priority (higher = evaluated first)';

-- Indexes
CREATE INDEX idx_conditional_targets_conditional ON conditional_targets(conditional_node_id, priority DESC);
CREATE INDEX idx_conditional_targets_target ON conditional_targets(target_node_id);
CREATE INDEX idx_conditional_targets_conditions ON conditional_targets USING GIN(conditions);

-- =====================================================
-- TABLE: AUDIT_LOG
-- Purpose: Complete audit trail for all operations
-- =====================================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL 
        CHECK (entity_type IN ('node', 'attribute', 'mapping', 'conditional', 'user')),
    operation VARCHAR(20) NOT NULL 
        CHECK (operation IN ('CREATE', 'UPDATE', 'DELETE', 'RESTORE')),
    performed_by UUID NOT NULL REFERENCES users(id),
    before_value JSONB,
    after_value JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE audit_log IS 'Complete audit trail with before/after values for compliance';
COMMENT ON COLUMN audit_log.entity_type IS 'Type of entity being audited';
COMMENT ON COLUMN audit_log.operation IS 'Operation performed: CREATE, UPDATE, DELETE, or RESTORE';
COMMENT ON COLUMN audit_log.before_value IS 'Entity state before operation (NULL for CREATE)';
COMMENT ON COLUMN audit_log.after_value IS 'Entity state after operation (NULL for DELETE)';

-- Indexes
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_performed_by ON audit_log(performed_by);
CREATE INDEX idx_audit_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_operation ON audit_log(operation);
CREATE INDEX idx_audit_entity_created ON audit_log(entity_type, entity_id, created_at DESC);

-- =====================================================
-- TABLE: SEARCH_INDEX
-- Purpose: Optimized full-text search infrastructure
-- =====================================================
CREATE TABLE search_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID UNIQUE NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    search_vector TSVECTOR NOT NULL,
    keywords TEXT[],
    metadata JSONB,
    last_indexed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE search_index IS 'Full-text search index with PostgreSQL tsvector';
COMMENT ON COLUMN search_index.search_vector IS 'PostgreSQL full-text search vector';
COMMENT ON COLUMN search_index.keywords IS 'Extracted keywords for search ranking';
COMMENT ON COLUMN search_index.last_indexed IS 'Timestamp of last index update';

-- Indexes
CREATE INDEX idx_search_vector ON search_index USING GIN(search_vector);
CREATE INDEX idx_search_keywords ON search_index USING GIN(keywords);
CREATE INDEX idx_search_last_indexed ON search_index(last_indexed DESC);
CREATE INDEX idx_search_node ON search_index(node_id);

-- =====================================================
-- AUTOMATED TRIGGERS
-- =====================================================

-- Trigger Function: Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updated_at timestamp on row modification';

-- Apply timestamp trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nodes_updated_at BEFORE UPDATE ON nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_node_details_updated_at BEFORE UPDATE ON node_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attributes_updated_at BEFORE UPDATE ON attributes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mappings_updated_at BEFORE UPDATE ON mappings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_node_mappings_updated_at BEFORE UPDATE ON node_mappings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conditionals_updated_at BEFORE UPDATE ON conditionals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger Function: Audit trail automation
CREATE OR REPLACE FUNCTION audit_trail_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (entity_id, entity_type, operation, performed_by, after_value)
        VALUES (NEW.id, TG_TABLE_NAME, 'CREATE', NEW.creator_id, row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (entity_id, entity_type, operation, performed_by, before_value, after_value)
        VALUES (NEW.id, TG_TABLE_NAME, 'UPDATE', NEW.creator_id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (entity_id, entity_type, operation, performed_by, before_value)
        VALUES (OLD.id, TG_TABLE_NAME, 'DELETE', OLD.creator_id, row_to_json(OLD));
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE 'plpgsql';

COMMENT ON FUNCTION audit_trail_trigger() IS 'Automatically logs all CREATE, UPDATE, DELETE operations to audit_log';

-- Apply audit trigger to nodes table
CREATE TRIGGER nodes_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON nodes
    FOR EACH ROW EXECUTE FUNCTION audit_trail_trigger();

-- Trigger Function: Search index maintenance
CREATE OR REPLACE FUNCTION maintain_search_index()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO search_index (node_id, search_vector, keywords)
    VALUES (
        NEW.id,
        to_tsvector('english', 
            COALESCE(NEW.title, '') || ' ' || 
            COALESCE(NEW.description, '') || ' ' || 
            COALESCE(NEW.markdown_content, '')
        ),
        string_to_array(
            LOWER(COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, '')), 
            ' '
        )
    )
    ON CONFLICT (node_id) DO UPDATE
    SET 
        search_vector = to_tsvector('english', 
            COALESCE(NEW.title, '') || ' ' || 
            COALESCE(NEW.description, '') || ' ' || 
            COALESCE(NEW.markdown_content, '')
        ),
        keywords = string_to_array(
            LOWER(COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, '')), 
            ' '
        ),
        last_indexed = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

COMMENT ON FUNCTION maintain_search_index() IS 'Automatically maintains search index on node creation/update';

-- Apply search index trigger to nodes
CREATE TRIGGER maintain_node_search_index AFTER INSERT OR UPDATE ON nodes
    FOR EACH ROW EXECUTE FUNCTION maintain_search_index();

-- =====================================================
-- UTILITY VIEWS
-- =====================================================

-- View: All nodes with their current version details
CREATE OR REPLACE VIEW nodes_with_versions AS
SELECT 
    n.id,
    n.node_type,
    n.title,
    n.slug,
    n.description,
    nv.markdown_content,
    nv.version_number as current_version,
    u.name as creator_name,
    u.email as creator_email,
    n.created_at,
    n.updated_at
FROM nodes n
LEFT JOIN node_versions nv ON n.current_version_id = nv.id
LEFT JOIN users u ON n.creator_id = u.id;

COMMENT ON VIEW nodes_with_versions IS 'Denormalized view of nodes with current version content';

-- View: All relationships with source/target details
CREATE OR REPLACE VIEW relationships_detailed AS
SELECT 
    a.id,
    a.attribute_type,
    a.is_bidirectional,
    a.strength_weight,
    sn.title as source_title,
    sn.slug as source_slug,
    tn.title as target_title,
    tn.slug as target_slug,
    a.created_at
FROM attributes a
JOIN nodes sn ON a.source_node_id = sn.id
JOIN nodes tn ON a.target_node_id = tn.id;

COMMENT ON VIEW relationships_detailed IS 'Relationships with source and target node details';

-- =====================================================
-- SAMPLE DATA INSERTION (Optional)
-- =====================================================

-- Create a default admin user
INSERT INTO users (email, name, role) 
VALUES ('admin@mujarrad.tech', 'System Administrator', 'admin')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- SCHEMA VALIDATION QUERIES
-- =====================================================

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check all indexes exist
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Check all triggers exist
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- END OF SCHEMA DEFINITION
-- =====================================================
```

---

## Table Definitions

### Core Tables

#### 1. USERS
**Purpose:** User authentication and role-based access control

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| email | VARCHAR(255) | UK, NOT NULL, CHECK | Valid email format |
| name | VARCHAR(255) | NOT NULL, CHECK | Non-empty user name |
| role | VARCHAR(50) | NOT NULL, CHECK | developer, editor, viewer, admin |
| created_at | TIMESTAMP | DEFAULT NOW | Account creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update time |
| is_active | BOOLEAN | DEFAULT TRUE | Soft delete flag |

#### 2. NODES
**Purpose:** Base table for all content types

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| node_type | VARCHAR(50) | NOT NULL, CHECK | node, attribute, mapping, conditional |
| title | VARCHAR(500) | NOT NULL, CHECK | Node title (non-empty) |
| slug | VARCHAR(500) | UK, NOT NULL, CHECK | URL-friendly identifier |
| description | TEXT | | Optional description |
| markdown_content | TEXT | | Main content in Markdown |
| creator_id | UUID | FK → users, NOT NULL | Node creator |
| current_version_id | UUID | FK → node_versions | Active version |
| version | INTEGER | DEFAULT 1 | Optimistic locking version |
| created_at | TIMESTAMP | DEFAULT NOW | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update time |

#### 3. NODE_DETAILS
**Purpose:** Extended metadata for content nodes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| node_id | UUID | FK → nodes, UK | Associated node |
| tags | TEXT[] | | Array of tag strings |
| is_template | BOOLEAN | DEFAULT FALSE | Template flag |
| template_id | UUID | FK → nodes | Source template |
| metadata | JSONB | | Custom properties |
| created_at | TIMESTAMP | DEFAULT NOW | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update time |

#### 4. NODE_VERSIONS
**Purpose:** Complete version history

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| node_id | UUID | FK → nodes | Associated node |
| version_number | INTEGER | NOT NULL, CHECK > 0 | Sequential version |
| markdown_content | TEXT | | Content snapshot |
| metadata | JSONB | | Metadata snapshot |
| created_by | UUID | FK → users | Version creator |
| created_at | TIMESTAMP | DEFAULT NOW | Version creation time |

**Unique Constraint:** (node_id, version_number)

### Relationship Tables

#### 5. ATTRIBUTES
**Purpose:** Directed relationships between nodes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| node_id | UUID | FK → nodes, UK | Attribute node itself |
| source_node_id | UUID | FK → nodes | Source node |
| target_node_id | UUID | FK → nodes | Target node |
| attribute_type | VARCHAR(100) | NOT NULL, CHECK | Relationship type |
| is_bidirectional | BOOLEAN | DEFAULT FALSE | Bidirectional flag |
| strength_weight | DECIMAL(3,2) | CHECK 0.0-1.0 | Relationship strength |
| properties | JSONB | | Additional properties |
| created_at | TIMESTAMP | DEFAULT NOW | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update time |

**Check Constraint:** source_node_id ≠ target_node_id  
**Attribute Types:** contains, depends_on, references, parent_of, relates_to

### Collection Tables

#### 6. MAPPINGS
**Purpose:** Collection/list configuration

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| node_id | UUID | FK → nodes, UK | Mapping node |
| ordering_strategy | VARCHAR(50) | CHECK | manual, alphabetical, chronological, custom |
| allow_duplicates | BOOLEAN | DEFAULT FALSE | Duplicate flag |
| configuration | JSONB | | Custom configuration |
| created_at | TIMESTAMP | DEFAULT NOW | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update time |

#### 7. NODE_MAPPINGS
**Purpose:** Items within mappings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| mapping_node_id | UUID | FK → nodes | Parent mapping |
| contained_node_id | UUID | FK → nodes | Contained node |
| sort_order | INTEGER | NOT NULL, CHECK > 0 | Display order |
| metadata | JSONB | | Item metadata |
| created_at | TIMESTAMP | DEFAULT NOW | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update time |

**Unique Constraint:** (mapping_node_id, contained_node_id)

### Conditional Tables

#### 8. CONDITIONALS
**Purpose:** Conditional logic configuration

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| node_id | UUID | FK → nodes, UK | Conditional node |
| preceding_node_id | UUID | FK → nodes | Trigger node |
| default_target_id | UUID | FK → nodes | Default route |
| evaluation_logic | TEXT | | Logic description |
| created_at | TIMESTAMP | DEFAULT NOW | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update time |

#### 9. CONDITIONAL_TARGETS
**Purpose:** Conditional routing targets

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| conditional_node_id | UUID | FK → nodes | Parent conditional |
| target_node_id | UUID | FK → nodes | Target node |
| conditions | JSONB | | Conditions JSON |
| priority | INTEGER | DEFAULT 0 | Evaluation priority |
| created_at | TIMESTAMP | DEFAULT NOW | Creation time |

**Unique Constraint:** (conditional_node_id, target_node_id)

### System Tables

#### 10. AUDIT_LOG
**Purpose:** Complete operation audit trail

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| entity_id | UUID | NOT NULL | Affected entity |
| entity_type | VARCHAR(50) | NOT NULL, CHECK | Entity type |
| operation | VARCHAR(20) | NOT NULL, CHECK | CREATE, UPDATE, DELETE, RESTORE |
| performed_by | UUID | FK → users | User who performed |
| before_value | JSONB | | State before (NULL for CREATE) |
| after_value | JSONB | | State after (NULL for DELETE) |
| created_at | TIMESTAMP | DEFAULT NOW | Operation time |

#### 11. SEARCH_INDEX
**Purpose:** Full-text search optimization

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| node_id | UUID | FK → nodes, UK | Indexed node |
| search_vector | TSVECTOR | NOT NULL | Full-text search vector |
| keywords | TEXT[] | | Extracted keywords |
| metadata | JSONB | | Search metadata |
| last_indexed | TIMESTAMP | DEFAULT NOW | Index update time |

---

## Indexes and Constraints

### Index Strategy

#### B-tree Indexes (Standard Lookups)
```sql
-- Primary lookups
idx_users_email              ON users(email)
idx_nodes_slug               ON nodes(slug)
idx_nodes_creator            ON nodes(creator_id)

-- Temporal queries
idx_nodes_created_at         ON nodes(created_at DESC)
idx_audit_created_at         ON audit_log(created_at DESC)

-- Relationships
idx_attributes_source        ON attributes(source_node_id)
idx_attributes_target        ON attributes(target_node_id)
idx_node_mappings_mapping    ON node_mappings(mapping_node_id, sort_order)
```

#### GIN Indexes (Array/JSONB/Full-Text)
```sql
-- Array searching
idx_node_details_tags        ON node_details USING GIN(tags)
idx_search_keywords          ON search_index USING GIN(keywords)

-- JSONB searching
idx_node_details_metadata    ON node_details USING GIN(metadata)
idx_attributes_properties    ON attributes USING GIN(properties)

-- Full-text search
idx_search_vector            ON search_index USING GIN(search_vector)
```

#### Partial Indexes (Filtered Queries)
```sql
-- Active users only
idx_users_active             ON users(is_active) WHERE is_active = true

-- Templates only
idx_node_details_template    ON node_details(is_template) WHERE is_template = true

-- Bidirectional attributes only
idx_attributes_bidirectional ON attributes(is_bidirectional) WHERE is_bidirectional = true
```

#### Composite Indexes (Multi-Column Queries)
```sql
-- Common combinations
idx_nodes_type_created       ON nodes(node_type, created_at DESC)
idx_attributes_source_target ON attributes(source_node_id, target_node_id)
idx_audit_entity_created     ON audit_log(entity_type, entity_id, created_at DESC)
```

### Constraint Types

#### Primary Keys
- All tables use UUID primary keys
- Generated via `gen_random_uuid()`
- Ensures global uniqueness

#### Foreign Keys
**Cascade Rules:**
- `ON DELETE CASCADE`: Child records deleted automatically (node_details, node_versions, etc.)
- `ON DELETE RESTRICT`: Prevents deletion if referenced (users → nodes)
- `ON DELETE SET NULL`: Optional references cleared (template_id, default_target_id)

#### Check Constraints
```sql
-- Email validation
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')

-- Slug validation (lowercase-with-dashes)
CHECK (slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$')

-- Enum validation
CHECK (role IN ('developer', 'editor', 'viewer', 'admin'))
CHECK (node_type IN ('node', 'attribute', 'mapping', 'conditional'))

-- Business rules
CHECK (source_node_id != target_node_id)  -- No self-references
CHECK (sort_order > 0)                     -- Positive ordering
CHECK (strength_weight BETWEEN 0.0 AND 1.0) -- Valid weight range
```

#### Unique Constraints
```sql
-- Single column
UNIQUE (email)
UNIQUE (slug)
UNIQUE (node_id) -- in node_details, attributes, mappings, conditionals

-- Composite
UNIQUE (node_id, version_number)           -- node_versions
UNIQUE (mapping_node_id, contained_node_id) -- node_mappings
UNIQUE (conditional_node_id, target_node_id) -- conditional_targets
```

---

## Automated Triggers

### 1. Timestamp Auto-Update

**Function:** `update_updated_at_column()`

**Purpose:** Automatically updates `updated_at` on any row modification

**Applied to:**
- users
- nodes
- node_details
- attributes
- mappings
- node_mappings
- conditionals

**Example:**
```sql
CREATE TRIGGER update_nodes_updated_at 
BEFORE UPDATE ON nodes
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
```

### 2. Audit Trail Logging

**Function:** `audit_trail_trigger()`

**Purpose:** Automatically logs all CREATE, UPDATE, DELETE operations

**Behavior:**
- **INSERT:** Logs operation with `after_value`
- **UPDATE:** Logs operation with `before_value` and `after_value`
- **DELETE:** Logs operation with `before_value`

**Applied to:**
- nodes (can be extended to other tables)

**Audit Log Entry Example:**
```json
{
  "entity_id": "123e4567-e89b-12d3-a456-426614174000",
  "entity_type": "node",
  "operation": "UPDATE",
  "performed_by": "user-uuid",
  "before_value": {"title": "Old Title", ...},
  "after_value": {"title": "New Title", ...},
  "created_at": "2025-10-03T12:00:00Z"
}
```

### 3. Search Index Maintenance

**Function:** `maintain_search_index()`

**Purpose:** Automatically maintains full-text search index

**Behavior:**
- Extracts text from title, description, and markdown_content
- Creates PostgreSQL tsvector for full-text search
- Extracts keywords for search ranking
- Updates on INSERT or UPDATE of nodes

**Search Vector Creation:**
```sql
to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(markdown_content, '')
)
```

---

## Query Examples

### Basic Operations

#### Create a New Node
```sql
-- Insert node
INSERT INTO nodes (node_type, title, slug, description, markdown_content, creator_id)
VALUES (
    'node',
    'Getting Started Guide',
    'getting-started-guide',
    'A comprehensive guide for new users',
    '# Welcome\n\nThis guide will help you...',
    'user-uuid-here'
)
RETURNING id;

-- Insert node details
INSERT INTO node_details (node_id, tags, metadata)
VALUES (
    'node-uuid-here',
    ARRAY['tutorial', 'documentation', 'beginner'],
    '{"category": "guides", "difficulty": "easy"}'::jsonb
);

-- Create first version
INSERT INTO node_versions (node_id, version_number, markdown_content, created_by)
VALUES (
    'node-uuid-here',
    1,
    '# Welcome\n\nThis guide will help you...',
    'user-uuid-here'
)
RETURNING id;

-- Update node with current version
UPDATE nodes 
SET current_version_id = 'version-uuid-here'
WHERE id = 'node-uuid-here';
```

#### Create a Relationship (Attribute)
```sql
-- Create attribute node
INSERT INTO nodes (node_type, title, slug, markdown_content, creator_id)
VALUES (
    'attribute',
    'Guide Contains Chapter 1',
    'guide-contains-chapter-1',
    'This relationship indicates that the guide contains chapter 1 as a primary component.',
    'user-uuid-here'
)
RETURNING id;

-- Create attribute details
INSERT INTO attributes (
    node_id,
    source_node_id,
    target_node_id,
    attribute_type,
    is_bidirectional,
    strength_weight,
    properties
)
VALUES (
    'attribute-node-uuid',
    'guide-uuid',
    'chapter1-uuid',
    'contains',
    false,
    0.9,
    '{"section": "introduction", "order": 1}'::jsonb
);
```

#### Create a Mapping (Collection)
```sql
-- Create mapping node
INSERT INTO nodes (node_type, title, slug, creator_id)
VALUES (
    'mapping',
    'Chapter Sequence',
    'chapter-sequence',
    'user-uuid-here'
)
RETURNING id;

-- Configure mapping
INSERT INTO mappings (node_id, ordering_strategy, allow_duplicates, configuration)
VALUES (
    'mapping-uuid-here',
    'manual',
    false,
    '{"display_mode": "numbered"}'::jsonb
);

-- Add items to mapping
INSERT INTO node_mappings (mapping_node_id, contained_node_id, sort_order)
VALUES 
    ('mapping-uuid', 'chapter1-uuid', 1),
    ('mapping-uuid', 'chapter2-uuid', 2),
    ('mapping-uuid', 'chapter3-uuid', 3);
```

### Query Patterns

#### Find All Outgoing Relationships
```sql
SELECT 
    a.attribute_type,
    a.strength_weight,
    n.title as target_title,
    n.slug as target_slug,
    a.properties
FROM attributes a
JOIN nodes n ON a.target_node_id = n.id
WHERE a.source_node_id = 'source-node-uuid'
ORDER BY a.strength_weight DESC;
```

#### Find All Incoming Relationships
```sql
SELECT 
    a.attribute_type,
    a.strength_weight,
    n.title as source_title,
    n.slug as source_slug,
    a.properties
FROM attributes a
JOIN nodes n ON a.source_node_id = n.id
WHERE a.target_node_id = 'target-node-uuid'
ORDER BY a.created_at DESC;
```

#### Get Mapping Contents in Order
```sql
SELECT 
    nm.sort_order,
    n.title,
    n.slug,
    n.node_type,
    nm.metadata
FROM node_mappings nm
JOIN nodes n ON nm.contained_node_id = n.id
WHERE nm.mapping_node_id = 'mapping-uuid'
ORDER BY nm.sort_order;
```

#### Full-Text Search
```sql
-- Simple search
SELECT 
    n.id,
    n.title,
    n.slug,
    ts_rank(si.search_vector, query) as rank
FROM nodes n
JOIN search_index si ON n.id = si.node_id,
     to_tsquery('english', 'guide & getting & started') as query
WHERE si.search_vector @@ query
ORDER BY rank DESC
LIMIT 10;

-- Search with phrase
SELECT 
    n.id,
    n.title,
    n.slug,
    ts_rank(si.search_vector, query) as rank,
    ts_headline('english', n.markdown_content, query) as snippet
FROM nodes n
JOIN search_index si ON n.id = si.node_id,
     phraseto_tsquery('english', 'getting started') as query
WHERE si.search_vector @@ query
ORDER BY rank DESC
LIMIT 10;
```

#### Get Node with Full Version History
```sql
SELECT 
    n.id,
    n.title,
    n.slug,
    n.node_type,
    json_agg(
        json_build_object(
            'version', nv.version_number,
            'content', nv.markdown_content,
            'created_by', u.name,
            'created_at', nv.created_at
        ) ORDER BY nv.version_number DESC
    ) as versions
FROM nodes n
LEFT JOIN node_versions nv ON n.id = nv.node_id
LEFT JOIN users u ON nv.created_by = u.id
WHERE n.id = 'node-uuid'
GROUP BY n.id, n.title, n.slug, n.node_type;
```

#### Find Nodes by Tag
```sql
SELECT 
    n.id,
    n.title,
    n.slug,
    nd.tags
FROM nodes n
JOIN node_details nd ON n.id = nd.node_id
WHERE 'tutorial' = ANY(nd.tags)
ORDER BY n.created_at DESC;
```

#### Get Audit Trail for Node
```sql
SELECT 
    al.operation,
    u.name as performed_by,
    al.created_at,
    al.before_value->>'title' as old_title,
    al.after_value->>'title' as new_title
FROM audit_log al
JOIN users u ON al.performed_by = u.id
WHERE al.entity_type = 'node' 
  AND al.entity_id = 'node-uuid'
ORDER BY al.created_at DESC;
```

#### Complex Graph Query: Find All Connected Nodes (2 levels deep)
```sql
WITH RECURSIVE node_graph AS (
    -- Base case: direct connections
    SELECT 
        a.source_node_id as from_node,
        a.target_node_id as to_node,
        a.attribute_type,
        1 as depth
    FROM attributes a
    WHERE a.source_node_id = 'starting-node-uuid'
    
    UNION
    
    -- Recursive case: connections of connections
    SELECT 
        a.source_node_id,
        a.target_node_id,
        a.attribute_type,
        ng.depth + 1
    FROM attributes a
    JOIN node_graph ng ON a.source_node_id = ng.to_node
    WHERE ng.depth < 2
)
SELECT DISTINCT
    ng.to_node,
    n.title,
    n.slug,
    ng.attribute_type,
    ng.depth
FROM node_graph ng
JOIN nodes n ON ng.to_node = n.id
ORDER BY ng.depth, n.title;
```

---

## Performance Considerations

### Query Optimization

#### 1. Use Appropriate Indexes
```sql
-- Good: Uses idx_attributes_source
SELECT * FROM attributes WHERE source_node_id = 'uuid';

-- Good: Uses idx_search_vector (GIN)
SELECT * FROM search_index WHERE search_vector @@ to_tsquery('text');

-- Good: Uses idx_nodes_type_created (composite)
SELECT * FROM nodes WHERE node_type = 'node' ORDER BY created_at DESC;
```

#### 2. Avoid Full Table Scans
```sql
-- Bad: No index on description
SELECT * FROM nodes WHERE description LIKE '%keyword%';

-- Good: Use full-text search
SELECT * FROM search_index WHERE search_vector @@ to_tsquery('keyword');
```

#### 3. Use EXPLAIN ANALYZE
```sql
EXPLAIN ANALYZE
SELECT n.*, nd.tags
FROM nodes n
JOIN node_details nd ON n.id = nd.node_id
WHERE 'tutorial' = ANY(nd.tags);
```

### Scaling Strategies

#### 1. Partitioning Large Tables
```sql
-- Partition audit_log by month
CREATE TABLE audit_log_2025_10 PARTITION OF audit_log
FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
```

#### 2. Connection Pooling
- Use PgBouncer or similar
- Recommended pool size: 20-50 connections
- Max connections per pool: 100

#### 3. Read Replicas
- Use for search queries
- Route read traffic to replicas
- Keep primary for writes only

#### 4. Caching Strategy
- Cache frequent queries (e.g., node by slug)
- Cache duration: 5-15 minutes
- Invalidate on updates

### Monitoring Queries

#### Find Slow Queries
```sql
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

#### Check Index Usage
```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

#### Monitor Table Sizes
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Maintenance Guidelines

### Regular Maintenance Tasks

#### Daily
```sql
-- Update table statistics
ANALYZE;

-- Check for dead tuples
SELECT 
    schemaname,
    tablename,
    n_dead_tup,
    n_live_tup,
    round(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_ratio
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY dead_ratio DESC;
```

#### Weekly
```sql
-- Vacuum tables
VACUUM ANALYZE;

-- Reindex if needed
REINDEX TABLE nodes;
REINDEX TABLE attributes;
```

#### Monthly
```sql
-- Full vacuum (during maintenance window)
VACUUM FULL ANALYZE;

-- Check for index bloat
SELECT 
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Backup Strategy

#### Full Backup (Daily)
```bash
pg_dump -Fc -f mujarrad_backup_$(date +%Y%m%d).dump mujarrad_db
```

#### Incremental Backup (Hourly)
```bash
# Enable WAL archiving in postgresql.conf
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'
```

#### Point-in-Time Recovery
```bash
pg_basebackup -D /backup/base -Ft -z -P
```

### Data Retention

#### Audit Log Cleanup (Keep 1 year)
```sql
DELETE FROM audit_log 
WHERE created_at < NOW() - INTERVAL '1 year';
```

#### Old Version Cleanup (Keep last 10 versions)
```sql
DELETE FROM node_versions nv
WHERE nv.version_number < (
    SELECT MAX(version_number) - 10
    FROM node_versions
    WHERE node_id = nv.node_id
);
```

### Security Recommendations

#### 1. User Permissions
```sql
-- Create read-only role
CREATE ROLE readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;

-- Create application role
CREATE ROLE app_user WITH LOGIN PASSWORD 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
```

#### 2. Row-Level Security (Optional)
```sql
-- Enable RLS on nodes
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own nodes
CREATE POLICY user_nodes ON nodes
    FOR SELECT
    USING (creator_id = current_user_id());
```

#### 3. Audit Sensitive Operations
```sql
-- Already implemented via audit_trail_trigger
-- Review audit_log regularly for suspicious activity
SELECT 
    entity_type,
    operation,
    u.email,
    COUNT(*) as operation_count
FROM audit_log al
JOIN users u ON al.performed_by = u.id
WHERE al.created_at > NOW() - INTERVAL '24 hours'
GROUP BY entity_type, operation, u.email
ORDER BY operation_count DESC;
```

---

## Appendix

### Glossary

- **Node**: Base content entity that can be of type node, attribute, mapping, or conditional
- **Attribute**: Directed relationship between two nodes with type and properties
- **Mapping**: Collection/list of nodes with ordering configuration
- **Conditional**: Logic node that routes to different targets based on conditions
- **Slug**: URL-friendly unique identifier (lowercase-with-dashes format)
- **tsvector**: PostgreSQL data type for full-text search indexing
- **JSONB**: PostgreSQL binary JSON format for efficient storage and querying

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Oct 2025 | Initial production-ready schema |

### Support & Contact

For questions or issues with this schema:
- Review the Query Examples section
- Check Performance Considerations for optimization
- Consult PostgreSQL documentation for advanced features

### License

This schema documentation is provided as-is for use with the Mujarrad Technology platform.

---

**End of Document**