# Quickstart: Excalidraw Whiteboard Integration

**Feature**: 007-excalidraw-whiteboard-integration
**Date**: 2025-11-22

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Access to Mujarrad backend API (https://mujarrad.onrender.com)
- [ ] Valid test credentials (test2@example.com / TestPass123)
- [ ] Git repository cloned and on branch `007-excalidraw-whiteboard-integration`

## Setup Instructions

### 1. Install Dependencies

```bash
# Install Excalidraw package
npm install @excalidraw/excalidraw

# Verify installation
npm list @excalidraw/excalidraw
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Access Whiteboard

1. Navigate to http://localhost:3000
2. Log in with test credentials
3. Select or create a space
4. Navigate to `/spaces/{slug}/whiteboard`

---

## Test Scenarios

### Scenario 1: Basic Canvas Load
**User Story**: As a user, I can see an empty whiteboard canvas when I navigate to the whiteboard view.

**Steps**:
1. Log in to Mujarrad
2. Navigate to a space
3. Click on "Whiteboard" tab/link

**Expected**:
- [ ] Excalidraw canvas loads within 3 seconds
- [ ] Canvas shows default tools (shapes, text, drawing, etc.)
- [ ] No errors in browser console

---

### Scenario 2: Create Shape Element
**User Story**: As a user, I can create shapes on the canvas that persist to the database.

**Steps**:
1. Open whiteboard view
2. Select rectangle tool from toolbar
3. Draw a rectangle on canvas
4. Wait 2+ seconds (auto-save debounce)
5. Refresh the page

**Expected**:
- [ ] Rectangle appears on canvas after drawing
- [ ] After refresh, rectangle is restored in same position
- [ ] Network tab shows POST/PUT request to nodes API
- [ ] Database contains node with `element_subtype: "shape_rectangle"`

---

### Scenario 3: Create Text Element
**User Story**: As a user, I can add text that becomes searchable in my space.

**Steps**:
1. Open whiteboard view
2. Select text tool
3. Click on canvas and type "Test Note"
4. Click outside text box to deselect
5. Wait for auto-save

**Expected**:
- [ ] Text element created on canvas
- [ ] Node created with title "Test Note"
- [ ] `node_details.excalidraw_element.text` = "Test Note"

---

### Scenario 4: Create Connector/Arrow
**User Story**: As a user, I can draw arrows between elements that create relationships.

**Steps**:
1. Create two rectangle shapes
2. Select arrow tool
3. Click on first rectangle's edge
4. Drag to second rectangle's edge
5. Wait for auto-save

**Expected**:
- [ ] Arrow connects the two shapes
- [ ] Attribute created with `attribute_key: "connects_to"`
- [ ] Arrow has `startBinding` and `endBinding` referencing shape IDs
- [ ] Relationship appears in database

---

### Scenario 5: Modify Element
**User Story**: As a user, changes I make to elements are saved.

**Steps**:
1. Load whiteboard with existing elements
2. Select an element
3. Change its color using toolbar
4. Move it to a different position
5. Wait for auto-save
6. Refresh page

**Expected**:
- [ ] Element retains new color after refresh
- [ ] Element retains new position after refresh
- [ ] Only one node update request (debounced)

---

### Scenario 6: Delete Element
**User Story**: As a user, I can delete elements and they are removed from database.

**Steps**:
1. Load whiteboard with existing elements
2. Select an element
3. Press Delete key or use toolbar delete
4. Wait for auto-save
5. Refresh page

**Expected**:
- [ ] Element removed from canvas
- [ ] DELETE request sent to nodes API
- [ ] Element does not reappear after refresh

---

### Scenario 7: Persistence Across Sessions
**User Story**: As a user, my whiteboard state is preserved when I leave and return.

**Steps**:
1. Create multiple elements (shapes, text, arrows)
2. Arrange them in a specific layout
3. Log out
4. Log back in
5. Navigate to same whiteboard

**Expected**:
- [ ] All elements restored
- [ ] Positions match exactly
- [ ] Colors and styles match
- [ ] Connections/arrows intact

---

### Scenario 8: Error Handling
**User Story**: As a user, I see clear feedback when saves fail.

**Steps**:
1. Open whiteboard
2. Create an element
3. Disable network (DevTools > Network > Offline)
4. Modify the element
5. Wait for save attempt

**Expected**:
- [ ] Toast/notification indicates save failed
- [ ] Local changes are not lost
- [ ] Re-enable network triggers retry
- [ ] Eventually saves successfully

---

## Validation Checklist

### Functional Validation
- [ ] Canvas loads with Excalidraw UI
- [ ] All standard tools work (shapes, text, drawing, arrows)
- [ ] Elements persist to database
- [ ] Elements load from database
- [ ] Modifications update existing nodes
- [ ] Deletions remove nodes
- [ ] Arrows create attribute relationships

### Performance Validation
- [ ] Initial load < 3 seconds
- [ ] No UI freezing during save
- [ ] Debounce prevents excessive API calls
- [ ] Smooth interaction during editing

### Error Handling Validation
- [ ] Network errors show user feedback
- [ ] Invalid data doesn't crash canvas
- [ ] Permission errors handled gracefully

### Integration Validation
- [ ] Whiteboard scoped to correct space
- [ ] Navigation between views works
- [ ] React Query cache updates correctly

---

## Troubleshooting

### Canvas Doesn't Load
1. Check browser console for errors
2. Verify @excalidraw/excalidraw installed
3. Check CSS import: `import '@excalidraw/excalidraw/index.css'`

### Elements Don't Save
1. Check Network tab for API errors
2. Verify authentication token valid
3. Check debounce is working (should wait 2 sec)
4. Verify space slug is correct

### Elements Don't Load
1. Check API response in Network tab
2. Verify nodes have `element_subtype` field
3. Check element mapper is converting correctly
4. Look for JSON parse errors

### Infinite Loop / Crash
1. Ensure Excalidraw component wrapped in useMemo
2. Don't call setState directly in onChange
3. Use refs for Excalidraw API access

---

## Development Tips

### Debug Mode
```typescript
// Add to WhiteboardCanvas.tsx for debugging
onChange={(elements, appState) => {
  console.log('Elements:', elements.length);
  console.log('Changed:', elements.filter(e => e.updated));
  debouncedSave(elements, appState);
}}
```

### Skip Save During Development
```typescript
const SKIP_SAVE = process.env.NODE_ENV === 'development' && false;

const debouncedSave = useMemo(
  () => debounce((elements) => {
    if (SKIP_SAVE) return;
    saveToBackend(elements);
  }, 2000),
  []
);
```

### View Raw Node Data
```bash
# Fetch whiteboard nodes for a space
curl -H "Authorization: Bearer $TOKEN" \
  "https://mujarrad.onrender.com/api/spaces/my-space/nodes?element_subtype=not_null"
```

---

## Next Steps After Validation

1. Run `/tasks` to generate implementation tasks
2. Begin implementation following task order
3. Write unit tests for element mapper
4. Write integration tests for save/load
5. Manual testing with various element combinations
