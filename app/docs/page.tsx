'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, ChevronDown, Book, Rocket, Layout, Code, Layers, Shield } from 'lucide-react';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { SwaggerEmbed } from '@/components/docs/SwaggerEmbed';
import { cn } from '@/lib/utils';

// Documentation content organized by sections
const docsContent: Record<string, string> = {
  // Introduction
  'introduction': `# Mujarrad Developer Documentation

Welcome to the Mujarrad Backend documentation. This guide covers everything you need to know to develop, deploy, and integrate with the Mujarrad platform.

## What is Mujarrad?

Mujarrad is a **knowledge graph platform** that enables applications to store, connect, and query information as a graph of nodes and relationships. It follows the principle of **"Node Supremacy"** - everything is a node, and relationships define the architecture.

## Key Features

- **Multi-tenant Spaces** - Isolated data containers for different projects/users
- **Flexible Schema** - CONSUMER mode for flexibility, BACKEND mode for schema enforcement
- **Graph Relationships** - Rich attribute system connecting nodes
- **Version History** - Track changes to nodes over time
- **Multiple Auth Methods** - JWT, API Keys, OAuth2

## Technology Stack

| Layer | Technology |
|-------|------------|
| Language | Java 21 (OpenJDK) |
| Framework | Spring Boot 3.4.1 |
| Database | PostgreSQL 17.6 |
| Migrations | Flyway |
| Auth | JWT (jjwt 0.12.5), BCrypt, OAuth2 |
| API Docs | SpringDoc OpenAPI 2.7.0 |
| Mapping | MapStruct 1.5.5 |
| Caching | Caffeine 3.1.8 |
| Deployment | Docker, Render |

## Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/your-org/mujarrad-backend.git
cd mujarrad-backend

# Start PostgreSQL (Docker)
docker-compose up -d postgres

# Run the application
cd Backend
./gradlew bootRun

# Access Swagger UI
open https://mujarrad.onrender.com/swagger-ui/index.html
\`\`\`
`,

  // Getting Started - Prerequisites
  'prerequisites': `# Prerequisites

Before setting up the Mujarrad Backend, ensure you have the following installed on your system.

## Required Software

### Java 21 (OpenJDK)

Mujarrad requires Java 21 or later.

**macOS (Homebrew):**
\`\`\`bash
brew install openjdk@21

# Add to PATH
echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify installation
java -version
# Expected: openjdk version "21.x.x"
\`\`\`

**Ubuntu/Debian:**
\`\`\`bash
sudo apt update
sudo apt install openjdk-21-jdk

# Verify
java -version
\`\`\`

**Windows:**
Download from [Adoptium](https://adoptium.net/) and install Eclipse Temurin 21.

### PostgreSQL 14+

**macOS (Homebrew):**
\`\`\`bash
brew install postgresql@15
brew services start postgresql@15
\`\`\`

**Docker (Recommended):**
\`\`\`bash
docker run -d \\
  --name mujarrad-postgres \\
  -e POSTGRES_USER=mujarrad \\
  -e POSTGRES_PASSWORD=mujarrad123 \\
  -e POSTGRES_DB=mujarrad \\
  -p 5432:5432 \\
  postgres:15
\`\`\`

### Docker (Optional but Recommended)

Docker simplifies running PostgreSQL and the full application stack.

**macOS:**
\`\`\`bash
brew install --cask docker
# Then launch Docker Desktop
\`\`\`

### Git

\`\`\`bash
brew install git   # macOS
sudo apt install git  # Ubuntu
\`\`\`

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 4 GB | 8+ GB |
| CPU | 2 cores | 4+ cores |
| Disk | 2 GB free | 10+ GB free |
| OS | macOS 12+, Ubuntu 20.04+, Windows 10+ | Latest LTS |
`,

  // Getting Started - Local Setup
  'local-setup': `# Local Setup

This guide walks you through setting up the Mujarrad Backend for local development.

## 1. Clone the Repository

\`\`\`bash
git clone https://github.com/your-org/mujarrad-backend.git
cd mujarrad-backend
\`\`\`

## 2. Start PostgreSQL

### Option A: Docker (Recommended)

\`\`\`bash
# Start PostgreSQL container
docker run -d \\
  --name mujarrad-postgres \\
  -e POSTGRES_USER=mujarrad \\
  -e POSTGRES_PASSWORD=mujarrad123 \\
  -e POSTGRES_DB=mujarrad \\
  -p 5432:5432 \\
  postgres:15

# Verify it's running
docker ps | grep mujarrad-postgres
\`\`\`

### Option B: Docker Compose

\`\`\`bash
docker-compose up -d postgres
docker-compose ps
\`\`\`

## 3. Configure Environment Variables

Create a \`.env\` file in the project root:

\`\`\`bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mujarrad
DB_USER=mujarrad
DB_PASSWORD=mujarrad123

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-256-bits
JWT_EXPIRATION=86400000

# Server
SERVER_PORT=3000
\`\`\`

## 4. Build the Application

\`\`\`bash
cd Backend

# Set JAVA_HOME if needed (macOS example)
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home

# Build (skip tests for faster startup)
./gradlew build -x test

# Or full build with tests
./gradlew build
\`\`\`

## 5. Run the Application

\`\`\`bash
cd Backend
./gradlew bootRun
\`\`\`

## 6. Verify the Setup

### Health Check

\`\`\`bash
curl https://mujarrad.onrender.com/api/health
\`\`\`

Expected response:
\`\`\`json
{
  "status": "UP",
  "database": "Connected"
}
\`\`\`

### Swagger UI

Open in browser: https://mujarrad.onrender.com/swagger-ui/index.html

### Register a Test User

\`\`\`bash
curl -X POST https://mujarrad.onrender.com/api/users/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPassword123!"
  }'
\`\`\`
`,

  // Getting Started - Environment Variables
  'environment-variables': `# Environment Variables

This document covers all environment variables used by the Mujarrad Backend.

## Quick Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| \`DB_HOST\` | Yes | - | PostgreSQL hostname |
| \`DB_PORT\` | No | 5432 | PostgreSQL port |
| \`DB_NAME\` | Yes | - | Database name |
| \`DB_USER\` | Yes | - | Database username |
| \`DB_PASSWORD\` | Yes | - | Database password |
| \`JWT_SECRET\` | Yes | - | JWT signing key (min 256 bits) |
| \`JWT_EXPIRATION\` | No | 86400000 | Token validity (ms) |
| \`SERVER_PORT\` | No | 8080 | Application port |

## Database Configuration

\`\`\`bash
# PostgreSQL connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mujarrad
DB_USER=mujarrad
DB_PASSWORD=your-secure-password
\`\`\`

## Authentication

### JWT Configuration

\`\`\`bash
# JWT signing secret (REQUIRED - minimum 256 bits / 32 characters)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-256-bits

# Token expiration in milliseconds (default: 24 hours)
JWT_EXPIRATION=86400000
\`\`\`

**Important:** The JWT secret must be at least 32 characters long for HMAC-SHA256 signing.

### Google OAuth2 (Optional)

\`\`\`bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
\`\`\`

## Rate Limiting

\`\`\`bash
# Rate limit window (milliseconds)
RATE_LIMIT_WINDOW=60000

# Requests per window (JWT auth)
RATE_LIMIT_JWT_MAX=10

# Requests per window (API key auth)
RATE_LIMIT_APIKEY_MAX=1000
\`\`\`

## Generating Secrets

### JWT Secret

\`\`\`bash
# Generate a secure 256-bit key
openssl rand -base64 32
\`\`\`

### Database Password

\`\`\`bash
# Generate a secure password
openssl rand -base64 24
\`\`\`
`,

  // Getting Started - First API Call
  'first-api-call': `# First API Call

This guide walks you through making your first API calls to verify your setup is working correctly.

## 1. Health Check

Verify the application is running:

\`\`\`bash
curl https://mujarrad.onrender.com/api/health
\`\`\`

Expected response:
\`\`\`json
{
  "status": "UP",
  "database": "Connected",
  "timestamp": "2025-02-12T10:00:00Z"
}
\`\`\`

## 2. Register a User

Create a new user account:

\`\`\`bash
curl -X POST https://mujarrad.onrender.com/api/users/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "developer@example.com",
    "username": "developer",
    "password": "SecurePassword123!"
  }'
\`\`\`

## 3. Login and Get JWT Token

\`\`\`bash
curl -X POST https://mujarrad.onrender.com/api/users/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "developer@example.com",
    "password": "SecurePassword123!"
  }'
\`\`\`

**Save the token** for subsequent requests:
\`\`\`bash
export TOKEN="eyJhbGciOiJIUzI1NiJ9..."
\`\`\`

## 4. Create a Space

\`\`\`bash
curl -X POST https://mujarrad.onrender.com/api/spaces \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $TOKEN" \\
  -d '{
    "name": "My First Space",
    "description": "A test space for development"
  }'
\`\`\`

## 5. Create a Node

\`\`\`bash
export SPACE_SLUG="my-first-space"

curl -X POST "https://mujarrad.onrender.com/api/spaces/$SPACE_SLUG/nodes" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $TOKEN" \\
  -d '{
    "title": "My First Node",
    "content": "This is the content of my first node.",
    "nodeType": "REGULAR",
    "nodeDetails": {
      "customField": "custom value"
    }
  }'
\`\`\`

## 6. List Nodes

\`\`\`bash
curl "https://mujarrad.onrender.com/api/spaces/$SPACE_SLUG/nodes" \\
  -H "Authorization: Bearer $TOKEN"
\`\`\`

## 7. View Swagger Documentation

Open your browser and navigate to:

\`\`\`
https://mujarrad.onrender.com/swagger-ui/index.html
\`\`\`

This provides interactive API documentation where you can:
- Explore all endpoints
- Try API calls directly
- View request/response schemas

> **Note:** All API examples in this documentation use the production URL \`https://mujarrad.onrender.com\`. For local development, replace with \`https://mujarrad.onrender.com\`.
`,

  // Architecture Overview
  'architecture': `# Architecture Overview

Mujarrad is a knowledge graph platform built on Spring Boot that enables applications to store, connect, and query information as a graph of nodes and relationships.

## High-Level Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                         Clients                                  │
│   (Web App, Mobile App, CLI, External Services)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────────────────────┐ │
│  │ CORS Filter │ │ Trace Filter │ │ Rate Limit Interceptor    │ │
│  └─────────────┘ └──────────────┘ └───────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Authentication Layer                           │
│  ┌─────────────┐ ┌─────────────────┐ ┌───────────────────────┐  │
│  │ JWT Filter  │ │ API Key Filter  │ │ OAuth2 (Google)       │  │
│  └─────────────┘ └─────────────────┘ └───────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL                                  │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐   │
│  │ spaces   │ │ nodes    │ │ attributes│ │ context_types    │   │
│  └──────────┘ └──────────┘ └───────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

## Key Architectural Decisions

### 1. Node Supremacy

Everything is stored in a single \`nodes\` table with a \`node_type\` discriminator:
- Simplifies queries and relationships
- Single source of truth for all content
- JSONB \`node_details\` for flexible schema

### 2. Multi-Tenancy via Spaces

- Each space is an isolated data container
- Spaces have owners and optional collaborators
- All queries are scoped to a space

### 3. Dual Project Types

- **CONSUMER**: No restrictions, flexible schema
- **BACKEND**: Schema governance with modes:
  - CONFIGURATION: Edit schema (developers)
  - PRODUCTION: Schema locked (end-users)

### 4. Attribute-Based Relationships

- Relationships are first-class entities (not just foreign keys)
- Support for typed and schemaless relationships
- Rich metadata via JSONB properties

### 5. Stateless Authentication

- JWT for session-based auth (24-hour validity)
- API Keys for B2B/programmatic access
- OAuth2 for social login (Google)
- No server-side sessions

## Technology Choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Language | Java 21 | Modern features, performance, ecosystem |
| Framework | Spring Boot 3.4 | Mature, well-documented, extensive ecosystem |
| Database | PostgreSQL | JSONB support, reliability, performance |
| Auth | JWT + BCrypt | Stateless, secure, industry standard |
| Migrations | Flyway | Version control for schema, repeatable |
| Mapping | MapStruct | Compile-time safety, performance |
`,

  // Core Concepts - Spaces
  'spaces': `# Spaces

Spaces are the fundamental multi-tenancy unit in Mujarrad. Each space is an isolated container for nodes, attributes, and configurations.

## Overview

A space is like a project or workspace that contains:
- Nodes (content)
- Attributes (relationships)
- Context Types (schema definitions, for BACKEND spaces)
- Members (collaborators)

## Space Properties

| Property | Description |
|----------|-------------|
| \`id\` | Unique identifier (UUID) |
| \`name\` | Display name |
| \`slug\` | URL-friendly identifier (auto-generated) |
| \`description\` | Optional description |
| \`owner\` | User who created the space |
| \`projectType\` | CONSUMER or BACKEND |
| \`mode\` | CONFIGURATION or PRODUCTION (BACKEND only) |

## Project Types

### CONSUMER (Default)

For personal use, note-taking, knowledge bases:

- No schema restrictions
- Full flexibility to create any nodes/relationships
- Ideal for end-users

\`\`\`bash
curl -X POST https://mujarrad.onrender.com/api/spaces \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My Notes",
    "projectType": "CONSUMER"
  }'
\`\`\`

### BACKEND

For applications using Mujarrad as their backend:

- Requires space modes (CONFIGURATION/PRODUCTION)
- Schema governance via Context Types
- Ideal for developers building on Mujarrad

\`\`\`bash
curl -X POST https://mujarrad.onrender.com/api/spaces \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My App",
    "projectType": "BACKEND"
  }'
\`\`\`

## Space Modes (BACKEND only)

### CONFIGURATION Mode

**Who uses it:** Developers, administrators

- Create, update, delete Context Types
- Define attribute schemas
- All CRUD operations on nodes/attributes

### PRODUCTION Mode

**Who uses it:** End-users of applications

- Create nodes following defined schemas
- Schema-defined relationships get cardinality validation
- Cannot create/modify/delete Context Types

## Switching Modes

### Switch to PRODUCTION (Lock Schema)

\`\`\`bash
curl -X PATCH "https://mujarrad.onrender.com/api/spaces/{spaceId}" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "mode": "PRODUCTION"
  }'
\`\`\`

### Switch to CONFIGURATION (Unlock Schema)

\`\`\`bash
curl -X PATCH "https://mujarrad.onrender.com/api/spaces/{spaceId}" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "mode": "CONFIGURATION"
  }'
\`\`\`

### Response

\`\`\`json
{
  "id": "uuid",
  "name": "My App",
  "projectType": "BACKEND",
  "mode": "PRODUCTION",
  "updatedAt": "2025-02-12T12:00:00Z"
}
\`\`\`

> **Note:** Only the space owner can switch modes.

## Space Membership

| Role | Read | Write | Admin | Manage Members |
|------|------|-------|-------|----------------|
| OWNER | ✓ | ✓ | ✓ | ✓ |
| ADMIN | ✓ | ✓ | ✓ | ✓ |
| EDITOR | ✓ | ✓ | ✗ | ✗ |
| VIEWER | ✓ | ✗ | ✗ | ✗ |
`,

  // Core Concepts - Nodes
  'nodes': `# Nodes

Nodes are the fundamental building blocks of Mujarrad. Following the **Node Supremacy** principle, everything is stored as a node.

## Overview

A node represents any piece of content or concept:
- Documents, notes, ideas
- Categories, tags, contexts
- Assumptions, hypotheses
- Promoted relationships

## Node Properties

| Property | Type | Description |
|----------|------|-------------|
| \`id\` | UUID | Unique identifier |
| \`spaceId\` | UUID | Parent space |
| \`title\` | String | Display title (max 500 chars) |
| \`slug\` | String | URL-friendly identifier |
| \`content\` | String | Main text content |
| \`nodeType\` | Enum | REGULAR, CONTEXT, ASSUMPTION, ATTRIBUTE |
| \`nodeDetails\` | JSONB | Flexible custom properties |
| \`contextTypeId\` | UUID | Schema reference (BACKEND spaces) |
| \`visibility\` | Enum | VISIBLE, INTERNAL, HIDDEN |
| \`currentVersion\` | Integer | Current version number |

## Node Types

### REGULAR

Standard content nodes:

\`\`\`bash
curl -X POST "https://mujarrad.onrender.com/api/spaces/{spaceSlug}/nodes" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "My Document",
    "content": "This is the content of my document.",
    "nodeType": "REGULAR"
  }'
\`\`\`

### CONTEXT

Category or grouping nodes:

\`\`\`bash
curl -X POST "https://mujarrad.onrender.com/api/spaces/{spaceSlug}/nodes" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Projects",
    "nodeType": "CONTEXT"
  }'
\`\`\`

### ASSUMPTION

Hypothesis or assumption nodes:

\`\`\`bash
curl -X POST "https://mujarrad.onrender.com/api/spaces/{spaceSlug}/nodes" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Users prefer dark mode",
    "content": "Based on user feedback...",
    "nodeType": "ASSUMPTION"
  }'
\`\`\`

### ATTRIBUTE

Promoted relationship nodes (cannot be created directly, use attribute promotion).

## Using nodeDetails

The \`nodeDetails\` JSONB field allows flexible custom properties:

\`\`\`bash
curl -X POST "https://mujarrad.onrender.com/api/spaces/{spaceSlug}/nodes" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Project Alpha",
    "nodeType": "REGULAR",
    "nodeDetails": {
      "status": "in-progress",
      "priority": "high",
      "tags": ["urgent", "client-facing"],
      "dueDate": "2025-03-15"
    }
  }'
\`\`\`

## Version History

Each update creates a version:

\`\`\`bash
curl "https://mujarrad.onrender.com/api/nodes/{nodeId}/versions" \\
  -H "Authorization: Bearer $TOKEN"
\`\`\`
`,

  // Core Concepts - Attributes
  'attributes': `# Attributes

Attributes define relationships between nodes. They are the "wiring" that creates the graph structure.

## Overview

An attribute connects a **source node** to a **target node** with a typed relationship.

\`\`\`
┌──────────────┐                    ┌──────────────┐
│  Source Node │───── attribute ───▶│  Target Node │
│  (Document)  │    (REFERENCES)    │   (Link)     │
└──────────────┘                    └──────────────┘
\`\`\`

## Attribute Properties

| Property | Type | Description |
|----------|------|-------------|
| \`id\` | UUID | Unique identifier |
| \`sourceNodeId\` | UUID | Source node |
| \`targetNodeId\` | UUID | Target node |
| \`attributeName\` | String | Display name |
| \`attributeType\` | Enum | CONTAINS, REFERENCES, DEPENDS_ON, etc. |
| \`attributeValue\` | JSONB | Value data |
| \`properties\` | JSONB | Custom metadata |

## Attribute Types

### CONTAINS

Hierarchical containment (parent-child). Creates a DAG (Directed Acyclic Graph). Cycles are prevented.

\`\`\`bash
curl -X POST "https://mujarrad.onrender.com/api/nodes/{documentId}/attributes" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "targetNodeId": "'$SECTION_ID'",
    "attributeName": "contains",
    "attributeType": "CONTAINS"
  }'
\`\`\`

### REFERENCES

Soft link or citation:

\`\`\`bash
curl -X POST "https://mujarrad.onrender.com/api/nodes/{nodeId}/attributes" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "targetNodeId": "'$TARGET_ID'",
    "attributeName": "references",
    "attributeType": "REFERENCES"
  }'
\`\`\`

### DEPENDS_ON

Dependency relationship for tasks or prerequisites.

### RELATES_TO

Generic connection between nodes.

## Attribute Values

Attributes can store values:

\`\`\`bash
curl -X POST "https://mujarrad.onrender.com/api/nodes/{nodeId}/attributes" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "targetNodeId": "'$TARGET_ID'",
    "attributeName": "weight",
    "attributeType": "RELATES_TO",
    "attributeDataType": "NUMBER",
    "attributeValue": {
      "value": 0.85
    }
  }'
\`\`\`

### Data Types

| Type | Example Value |
|------|---------------|
| TEXT | \`{"value": "description"}\` |
| NUMBER | \`{"value": 42}\` |
| BOOLEAN | \`{"value": true}\` |
| DATE | \`{"value": "2025-02-12"}\` |

## Attribute Promotion

Attributes can be "promoted" to become first-class nodes:

\`\`\`bash
curl -X POST "https://mujarrad.onrender.com/api/spaces/{spaceSlug}/attributes/{attributeId}/promote" \\
  -H "Authorization: Bearer $TOKEN"
\`\`\`

The promoted node:
- Has \`nodeType: ATTRIBUTE\`
- Can participate in graph traversal
- Can have its own attributes
`,

  // Core Concepts - Context Types
  'context-types': `# Context Types

Context Types define schemas for nodes in BACKEND spaces. They enable structured data with validation.

## Overview

A Context Type specifies:
- **Attribute Schema**: Required and optional fields with types
- **Schema Relationships**: Official relationship types with cardinality

## When to Use

Context Types are only available for **BACKEND** project type spaces and are typically created in **CONFIGURATION** mode.

## Creating a Context Type

\`\`\`bash
curl -X POST "https://mujarrad.onrender.com/api/spaces/{spaceId}/context-types" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Task",
    "attributeSchema": {
      "title": {
        "type": "STRING",
        "required": true,
        "maxLength": 200
      },
      "dueDate": {
        "type": "DATE",
        "required": false
      },
      "priority": {
        "type": "ENUM",
        "required": false,
        "values": ["LOW", "MEDIUM", "HIGH"]
      },
      "completed": {
        "type": "BOOLEAN",
        "required": false,
        "default": false
      }
    },
    "schemaRelationships": [
      {
        "type": "DEPENDS_ON",
        "targetContextType": "task",
        "cardinality": "MANY_TO_MANY"
      }
    ]
  }'
\`\`\`

## Supported Types

| Type | Description | Options |
|------|-------------|---------|
| \`STRING\` | Text value | \`minLength\`, \`maxLength\` |
| \`NUMBER\` | Numeric value | \`min\`, \`max\` |
| \`BOOLEAN\` | True/false | \`default\` |
| \`DATE\` | Date (ISO 8601) | - |
| \`DATETIME\` | Date and time | - |
| \`ENUM\` | Predefined values | \`values\` (array) |
| \`ARRAY\` | Array of values | \`itemType\` |
| \`JSON\` | Arbitrary JSON | - |

## Cardinality Options

| Cardinality | Description | Example |
|-------------|-------------|---------|
| \`ONE_TO_ONE\` | One source, one target | Task ↔ Owner |
| \`ONE_TO_MANY\` | One source, many targets | Project → Tasks |
| \`MANY_TO_ONE\` | Many sources, one target | Tasks → Assignee |
| \`MANY_TO_MANY\` | Many to many | Tasks ↔ Tags |

## Built-in REGULAR Type

Every BACKEND space has a built-in \`REGULAR\` context type that cannot be modified or deleted. It serves as an escape hatch for unstructured content.
`,

  // Authentication Overview
  'auth-overview': `# Authentication Overview

Mujarrad supports three authentication mechanisms to accommodate different use cases.

## Authentication Methods

| Method | Use Case | Header Format |
|--------|----------|---------------|
| JWT | Web/Mobile apps, user sessions | \`Authorization: Bearer <token>\` |
| API Key | B2B integrations, scripts, automation | \`X-API-Key: <public>\` + \`X-API-Secret: <secret>\` |
| OAuth2 | Social login (Google) | Handled via \`/api/auth/oauth/google\` |

## Quick Comparison

| Feature | JWT | API Key | OAuth2 |
|---------|-----|---------|--------|
| Expiration | 24 hours (default) | Configurable or never | N/A (returns JWT) |
| Rate Limit | 10 batch/min | 1000 req/min | N/A |
| Use Case | Human users | Automated systems | Social login |

## JWT Authentication

\`\`\`bash
# 1. Login
curl -X POST https://mujarrad.onrender.com/api/users/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# 2. Use token
curl -X GET https://mujarrad.onrender.com/api/spaces \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
\`\`\`

## API Key Authentication

\`\`\`bash
curl -X GET https://mujarrad.onrender.com/api/spaces \\
  -H "X-API-Key: pk_live_abc123..." \\
  -H "X-API-Secret: sk_live_xyz789..."
\`\`\`

## Public Endpoints

These endpoints do not require authentication:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| \`/api/health\` | GET | Health check |
| \`/api/users/register\` | POST | User registration |
| \`/api/users/login\` | POST | Login (get JWT) |
| \`/api/auth/oauth/google\` | POST | Google OAuth |
| \`/swagger-ui.html\` | GET | API documentation |

## Error Responses

### 401 Unauthorized

\`\`\`json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or missing authentication"
}
\`\`\`

Causes:
- Missing Authorization header
- Expired JWT token
- Invalid or revoked API key
`,

  // API Keys
  'api-keys': `# API Key Authentication

API keys provide programmatic access for B2B integrations, automation scripts, and CI/CD pipelines.

## Overview

- **Format**: Stripe-style keys (\`pk_live_...\` / \`sk_live_...\`)
- **Security**: BCrypt-hashed secrets
- **Rate Limit**: 1000 requests/minute (vs. 10 for JWT)
- **Scope**: User-level or space-scoped

## Key Format

| Key Type | Prefix | Length | Example |
|----------|--------|--------|---------|
| Public | \`pk_live_\` | 40 chars | \`pk_live_abc123def456ghi789jkl012mno345\` |
| Secret | \`sk_live_\` | 72 chars | \`sk_live_...\` |

## Creating an API Key

Requires JWT authentication:

\`\`\`bash
curl -X POST https://mujarrad.onrender.com/api/api-keys \\
  -H "Authorization: Bearer $JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Production API Key",
    "description": "For B2B integration with Partner X",
    "spaceId": null,
    "expiresAt": null
  }'
\`\`\`

Response:
\`\`\`json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Production API Key",
  "publicKey": "pk_live_abc123def456ghi789jkl012mno345pqr",
  "secretKey": "sk_live_xyz789...",
  "expiresAt": null,
  "createdAt": "2025-02-12T10:00:00Z"
}
\`\`\`

> **Important:** The \`secretKey\` is only returned once. Store it securely immediately.

## Using API Keys

### Option 1: Separate Headers (Recommended)

\`\`\`bash
curl -X GET https://mujarrad.onrender.com/api/spaces \\
  -H "X-API-Key: pk_live_abc123def456ghi789jkl012mno345pqr" \\
  -H "X-API-Secret: sk_live_xyz789..."
\`\`\`

### Option 2: Combined Authorization Header

\`\`\`bash
curl -X GET https://mujarrad.onrender.com/api/spaces \\
  -H "Authorization: ApiKey pk_live_abc123...:sk_live_xyz789..."
\`\`\`

## Managing API Keys

### List Keys

\`\`\`bash
curl -X GET https://mujarrad.onrender.com/api/api-keys \\
  -H "Authorization: Bearer $JWT_TOKEN"
\`\`\`

### Rotate Secret Key

Zero-downtime rotation:

\`\`\`bash
curl -X POST https://mujarrad.onrender.com/api/api-keys/{keyId}/rotate \\
  -H "Authorization: Bearer $JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "currentSecretKey": "sk_live_old..."
  }'
\`\`\`

### Revoke Key

\`\`\`bash
curl -X DELETE https://mujarrad.onrender.com/api/api-keys/{keyId} \\
  -H "Authorization: Bearer $JWT_TOKEN"
\`\`\`

## Space-Scoped Keys

API keys can be scoped to a specific space:

\`\`\`bash
curl -X POST https://mujarrad.onrender.com/api/api-keys \\
  -H "Authorization: Bearer $JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Partner Integration",
    "spaceId": "770e8400-e29b-41d4-a716-446655440002"
  }'
\`\`\`

## Rate Limiting

| Auth Method | Rate Limit | Window |
|-------------|------------|--------|
| API Key | 1000 requests | 1 minute |
| JWT | 10 requests | 1 minute (batch endpoints) |

## Limits

| Limit | Value |
|-------|-------|
| Keys per user | 10 maximum |
| Public key length | 40 characters |
| Secret key length | 72 characters |

## Security Best Practices

1. **Never commit keys**: Use environment variables
2. **Rotate regularly**: Schedule rotation (e.g., quarterly)
3. **Scope minimally**: Use space-scoped keys when possible
4. **Set expiration**: For temporary access, use expiring keys
5. **Monitor usage**: Check \`lastUsedAt\` for anomalies
`,

  // API Reference Overview
  'api-reference': `# API Reference Overview

This section provides comprehensive documentation for the Mujarrad REST API.

## Base URL

| Environment | URL |
|-------------|-----|
| Production | \`https://mujarrad.onrender.com/api\` |
| Local Dev | \`http://localhost:3000/api\` |

## Authentication

All endpoints (except public ones) require authentication via one of:

| Method | Header |
|--------|--------|
| JWT | \`Authorization: Bearer <token>\` |
| API Key | \`X-API-Key: <public>\` + \`X-API-Secret: <secret>\` |

## Content Type

All requests should use:
\`\`\`
Content-Type: application/json
\`\`\`

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (auth required) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 409 | Conflict (duplicate, cycle) |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Error Codes

| Code | Description |
|------|-------------|
| \`VALIDATION_ERROR\` | Request validation failed |
| \`RESOURCE_NOT_FOUND\` | Entity not found |
| \`DUPLICATE_RESOURCE\` | Unique constraint violation |
| \`UNAUTHORIZED\` | Authentication required/failed |
| \`FORBIDDEN\` | Insufficient permissions |
| \`MODE_RESTRICTION\` | Operation blocked by space mode |
| \`CYCLIC_DEPENDENCY\` | Would create a cycle |
| \`TOO_MANY_REQUESTS\` | Rate limit exceeded |

## Pagination

Most list endpoints support pagination:

| Parameter | Default | Description |
|-----------|---------|-------------|
| \`page\` | 0 | Page number (0-indexed) |
| \`size\` | 20 | Items per page (max 100) |
| \`sort\` | varies | Sort field |
| \`direction\` | ASC | ASC or DESC |

Example:
\`\`\`bash
curl "https://mujarrad.onrender.com/api/spaces/my-space/nodes?page=1&size=50&sort=createdAt&direction=DESC"
\`\`\`

## Rate Limiting

| Auth Type | Limit | Window |
|-----------|-------|--------|
| JWT | 10 requests | 1 minute (batch) |
| API Key | 1000 requests | 1 minute |

Rate limit headers:
\`\`\`
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1739536800
\`\`\`

## API Endpoints Summary

### Spaces
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | \`/spaces\` | Create space |
| GET | \`/spaces\` | List spaces |
| GET | \`/spaces/{id}\` | Get space by ID |
| GET | \`/spaces/slug/{slug}\` | Get space by slug |
| PATCH | \`/spaces/{id}\` | Update space |
| DELETE | \`/spaces/{id}\` | Delete space |

### Nodes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | \`/spaces/{slug}/nodes\` | Create node |
| GET | \`/spaces/{slug}/nodes\` | List nodes |
| GET | \`/spaces/{slug}/nodes/{id}\` | Get node |
| PUT | \`/spaces/{slug}/nodes/{id}\` | Update node |
| DELETE | \`/spaces/{slug}/nodes/{id}\` | Delete node |

### Attributes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | \`/nodes/{id}/attributes\` | Create attribute |
| GET | \`/nodes/{id}/attributes\` | List attributes |
| PUT | \`/nodes/{id}/attributes/{attrId}\` | Update attribute |
| DELETE | \`/nodes/{id}/attributes/{attrId}\` | Delete attribute |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | \`/users/register\` | Register user |
| POST | \`/users/login\` | Login (get JWT) |
| POST | \`/auth/oauth/google\` | Google OAuth |

### API Keys
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | \`/api-keys\` | Create API key |
| GET | \`/api-keys\` | List API keys |
| DELETE | \`/api-keys/{id}\` | Revoke API key |
| POST | \`/api-keys/{id}/rotate\` | Rotate secret |

## Interactive Documentation

Swagger UI is available at:
\`\`\`
https://mujarrad.onrender.com/swagger-ui/index.html
\`\`\`
`,
};

// Swagger tags mapping for each documentation section
const swaggerTags: Record<string, { tag: string; title: string }[]> = {
  'spaces': [{ tag: 'space', title: 'Space' }],
  'nodes': [{ tag: 'node', title: 'Node' }],
  'attributes': [{ tag: 'attribute', title: 'Attribute' }],
  'auth-overview': [
    { tag: 'authentication', title: 'Authentication' },
    { tag: 'oauth', title: 'OAuth2' },
  ],
  'api-keys': [{ tag: 'api-key', title: 'API Key' }],
  'api-reference': [
    { tag: 'space', title: 'Space' },
    { tag: 'node', title: 'Node' },
    { tag: 'attribute', title: 'Attribute' },
    { tag: 'authentication', title: 'Authentication' },
    { tag: 'api-key', title: 'API Key' },
    { tag: 'health', title: 'Health' },
    { tag: 'template', title: 'Templates' },
  ],
};

// Navigation structure
const navSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Rocket,
    items: [
      { id: 'introduction', title: 'Introduction' },
      { id: 'prerequisites', title: 'Prerequisites' },
      { id: 'local-setup', title: 'Local Setup' },
      { id: 'environment-variables', title: 'Environment Variables' },
      { id: 'first-api-call', title: 'First API Call' },
    ],
  },
  {
    id: 'architecture',
    title: 'Architecture',
    icon: Layout,
    items: [
      { id: 'architecture', title: 'Overview' },
    ],
  },
  {
    id: 'core-concepts',
    title: 'Core Concepts',
    icon: Layers,
    items: [
      { id: 'spaces', title: 'Spaces' },
      { id: 'nodes', title: 'Nodes' },
      { id: 'attributes', title: 'Attributes' },
      { id: 'context-types', title: 'Context Types' },
    ],
  },
  {
    id: 'authentication',
    title: 'Authentication',
    icon: Shield,
    items: [
      { id: 'auth-overview', title: 'Overview' },
      { id: 'api-keys', title: 'API Keys' },
    ],
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: Code,
    items: [
      { id: 'api-reference', title: 'Overview' },
    ],
  },
];

export default function DocsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('introduction');
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleNavClick = (itemId: string, sectionId: string) => {
    setActiveSection(itemId);
    if (!expandedSections.includes(sectionId)) {
      setExpandedSections([...expandedSections, sectionId]);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar Navigation */}
      <aside className="w-[280px] border-r border-[#e5e5e5] h-screen sticky top-0 overflow-y-auto bg-[#fafafa]">
        <div className="p-4 border-b border-[#e5e5e5]">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[13px] text-[#828282] hover:text-[#4f4f4f] transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <Book className="size-5 text-[#4f4f4f]" />
            <span className="font-['Roboto:Medium',sans-serif] font-medium text-[15px] text-[#333]">
              Documentation
            </span>
          </div>

          <nav className="space-y-1">
            {navSections.map((section) => {
              const IconComponent = section.icon;
              const isExpanded = expandedSections.includes(section.id);
              const hasActiveItem = section.items.some((item) => item.id === activeSection);

              return (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors",
                      hasActiveItem ? "bg-[#f0f0f0]" : "hover:bg-[#f5f5f5]"
                    )}
                  >
                    <IconComponent className="size-4 text-[#828282]" />
                    <span className="flex-1 font-['Roboto:Medium',sans-serif] font-medium text-[13px] text-[#4f4f4f]">
                      {section.title}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="size-4 text-[#828282]" />
                    ) : (
                      <ChevronRight className="size-4 text-[#828282]" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-0.5">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id, section.id)}
                          className={cn(
                            "w-full text-left px-3 py-1.5 rounded-md text-[13px] transition-colors",
                            activeSection === item.id
                              ? "bg-[#333] text-white"
                              : "text-[#828282] hover:text-[#4f4f4f] hover:bg-[#f5f5f5]"
                          )}
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        <div className="max-w-[850px] mx-auto px-8 py-10">
          <MarkdownRenderer
            content={docsContent[activeSection] || '# Page not found\n\nThis documentation page does not exist.'}
            className="docs-content"
          />

          {/* Live API Documentation from Swagger */}
          {swaggerTags[activeSection] && (
            <div className="mt-10 space-y-4">
              <h2 className="text-xl font-semibold text-[#333] border-b border-[#e5e5e5] pb-2">
                Live API Reference
              </h2>
              <p className="text-sm text-[#828282] mb-4">
                Interactive API endpoints fetched from the live Swagger documentation.
              </p>
              {swaggerTags[activeSection].map((swagger) => (
                <SwaggerEmbed
                  key={swagger.tag}
                  tag={swagger.tag}
                  title={swagger.title}
                  className="mb-4"
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
