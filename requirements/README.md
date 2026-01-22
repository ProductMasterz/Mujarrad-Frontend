# Requirements Documentation

This folder contains requirements documentation for the Mujarrad Frontend application.

## Contents

### Story Mapping
- `story-mapping.csv` - User stories organized by Journey > Step > Story format (67 stories)

### Activity Diagrams
- `activity-diagrams/` - Mermaid activity diagrams for each user journey (9 files, 60+ diagrams)

## Activity Diagrams Index

| File | Journey | Diagrams |
|------|---------|----------|
| `01-authentication.md` | Authentication | Register, Login, Logout, Protected Routes |
| `02-space-management.md` | Space Management | View, Create (Modal & Quick), Rename, Delete, Navigate |
| `03-node-management.md` | Node Management | View, Create, Navigate, Edit, Delete, Clear Space |
| `04-content-editing.md` | Content Editing | Block Editor, Slash Commands, All Block Types, Drag & Drop |
| `05-navigation.md` | Navigation | Breadcrumb, Sidebar, Tabs, Back/Home, Context Menu Nav |
| `06-collaboration.md` | Collaboration | Share Modal, Invites, Permissions, Visibility, Link Sharing |
| `07-whiteboard.md` | Whiteboard | Canvas, Draw, Shapes, Text, Node Linking, Auto-save |
| `08-search.md` | Search | Modal, Query, Filter, Results, Keyboard Nav, Navigate |
| `09-context-menus.md` | Context Menus | Card Menu, Add Menu, More Menu, Help, Notifications, User |

## User Journeys

### 1. Authentication Journey
- User Registration (Email/Password and OAuth)
- User Login (Email/Password and OAuth)
- Session Management
- Logout

### 2. Space Management Journey
- View Spaces Dashboard
- Create New Space (Modal and Quick Create)
- Navigate into Space
- Rename Space
- Delete Space
- Share Space with Collaborators

### 3. Node/Content Management Journey
- View Nodes in Space
- Create New Node/Context
- Navigate to Node Editor
- Edit Node Title
- Edit Node Content (Block Editor)
- Delete Node
- Rename Node

### 4. Content Editing Journey
- Open Block Editor
- Add Blocks via Slash Commands
- Edit Block Content
- Reorder Blocks (Drag & Drop)
- Delete Blocks
- Auto-save Changes

### 5. Navigation Journey
- Breadcrumb Navigation
- Sidebar Navigation
- Tab Management
- Back/Home Navigation
- Search & Navigate

### 6. Collaboration Journey
- Open Share Modal
- Invite Collaborators by Email
- Set Permission Levels
- Manage Visibility Settings
- Remove Collaborators
- Copy Share Link

### 7. Whiteboard Journey
- Access Whiteboard Canvas
- Draw and Add Shapes
- Add Text Elements
- Link Elements to Nodes
- Save Whiteboard State

### 8. Search Journey
- Open Search Modal
- Enter Search Query
- Filter by Type
- View Results
- Navigate to Result

## Story Priorities

| Priority | Description |
|----------|-------------|
| Must Have | Critical functionality, MVP requirement |
| Should Have | Important but not critical for launch |
| Could Have | Nice to have, can be deferred |
| Won't Have | Out of scope for current phase |

## Story Status

| Status | Description |
|--------|-------------|
| Implemented | Fully functional |
| Partial | Partially implemented or needs work |
| Planned | Designed but not yet implemented |
| Backlog | Not yet designed |
