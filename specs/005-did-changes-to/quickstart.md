# Quickstart: Backend API Synchronization Verification

**Feature**: 005-did-changes-to
**Purpose**: Manual verification that frontend successfully communicates with the new space-based backend endpoints
**Duration**: ~10 minutes

## Prerequisites

- [ ] Frontend server running (`npm run dev` on http://localhost:3000)
- [ ] Backend API accessible (https://mujarrad.onrender.com)
- [ ] Valid test credentials or ability to register new user
- [ ] Browser dev tools open (Network & Console tabs)

## Verification Flow

### 1. Authentication (No Changes - Verify Still Works)

**Objective**: Confirm auth endpoints unchanged

**Steps**:
1. Navigate to http://localhost:3000/register
2. Register new test user:
   - Username: `testuser-{timestamp}`
   - Email: `test{timestamp}@example.com`
   - Password: `Test@1234`
3. Verify successful registration and automatic login
4. Check Network tab: `POST /api/auth/register` returned 201
5. Verify JWT token stored (check localStorage or cookies)
6. Refresh page - should remain logged in
7. Navigate to profile page
8. Check Network tab: `GET /api/auth/me` returned 200
9. Logout and login again
10. Check Network tab: `POST /api/auth/login` returned 200

**Expected Results**:
- ✅ Registration succeeds
- ✅ Login succeeds
- ✅ Profile fetch succeeds
- ✅ No console errors
- ✅ Network requests show `/api/auth/*` paths (NOT `/api/users/*`)

**Fail Criteria**:
- ❌ 404 on any auth endpoint
- ❌ Console errors about auth
- ❌ Unable to login/register

---

### 2. Space Management (Core Changes - Critical Test)

**Objective**: Verify space endpoints migrated successfully

**Steps**:
1. Navigate to spaces list page (e.g., `/spaces` or dashboard)
2. Check Network tab: `GET /api/spaces` returned 200
3. Verify spaces list rendered (may be empty for new user)
4. Click "Create Space" button
5. Enter space details:
   - Name: `Test Space {timestamp}`
   - Slug: `test-space-{timestamp}` (or auto-generated)
6. Submit form
7. Check Network tab: `POST /api/spaces` returned 201
8. Verify new space appears in list
9. Click on the created space
10. Check URL contains space slug: `/space/test-space-{timestamp}/`
11. Check Network tab: `GET /api/spaces/slug/{slug}` returned 200

**Expected Results**:
- ✅ Spaces list loads successfully
- ✅ Space creation succeeds
- ✅ New space appears immediately (cache updated)
- ✅ Navigation to space uses slug in URL
- ✅ Network requests show `/api/spaces` paths (NOT `/api/workspaces`)
- ✅ No 404 errors

**Fail Criteria**:
- ❌ 404 on `/api/spaces` (means workspace service not updated)
- ❌ 404 on space creation
- ❌ Console errors about missing workspaceId parameter
- ❌ TypeScript errors in console

---

### 3. Node Operations (Space-Scoped - Critical Test)

**Objective**: Verify node endpoints now use space slugs

**Prerequisites**: Must be inside a space from Step 2

**Steps**:
1. Within space view, check Network tab: `GET /api/spaces/{spaceSlug}/nodes` returned 200
2. Verify nodes list (may be empty)
3. Click "Create Node" button
4. Enter node details:
   - Title: `Test Node {timestamp}`
   - Type: `REGULAR`
   - Content: `This is test content`
5. Submit form
6. Check Network tab: `POST /api/spaces/{spaceSlug}/nodes` returned 201
7. Verify new node appears in list
8. Click on the node
9. Check URL: `/space/{slug}/nodes/{nodeId}`
10. Check Network tab: `GET /api/spaces/{spaceSlug}/nodes/{nodeId}` returned 200
11. Edit the node title
12. Save changes
13. Check Network tab: `PUT /api/spaces/{spaceSlug}/nodes/{nodeId}` returned 200
14. Delete the node
15. Check Network tab: `DELETE /api/spaces/{spaceSlug}/nodes/{nodeId}` returned 200

**Expected Results**:
- ✅ Node list fetches using space slug
- ✅ Node creation uses space slug in URL
- ✅ Node fetch uses both space slug and node ID
- ✅ Node update succeeds
- ✅ Node deletion succeeds
- ✅ All endpoints include `/api/spaces/{spaceSlug}/` prefix
- ✅ No console errors

**Fail Criteria**:
- ❌ 404 on any node endpoint (means node service not updated)
- ❌ 400 error about missing spaceSlug
- ❌ Request uses `/api/nodes/{id}` (old pattern)
- ❌ Request uses `/api/workspaces/{id}/nodes` (old pattern)

---

### 4. Attribute Operations (No Changes - Verify Still Works)

**Objective**: Confirm attribute endpoints unchanged

**Prerequisites**: Must have at least 2 nodes created

**Steps**:
1. Select first node
2. Click "Create Relationship" or "Add Attribute"
3. Select second node as target
4. Choose relationship type (e.g., "contains", "references")
5. Submit form
6. Check Network tab: `POST /api/nodes/{sourceNodeId}/attributes` returned 201
7. Verify relationship shown in graph or list
8. View node details
9. Check Network tab: `GET /api/nodes/{nodeId}/attributes` returned 200
10. Delete the relationship
11. Check Network tab: `DELETE /api/attributes/{attributeId}` returned 200

**Expected Results**:
- ✅ Attribute creation succeeds
- ✅ Attribute fetch succeeds
- ✅ Attribute deletion succeeds
- ✅ Endpoints use `/api/nodes/{id}/attributes` (NOT `/api/spaces/...`)
- ✅ No console errors

**Fail Criteria**:
- ❌ 404 on any attribute endpoint
- ❌ Attempts to use space-scoped attribute endpoint (incorrect)

---

### 5. Graph Visualization (Integration Test)

**Objective**: Verify full workflow with graph visualization

**Steps**:
1. Create space: "Graph Test Space"
2. Create 3 nodes:
   - Node A: "Parent Context" (type: CONTEXT)
   - Node B: "Child 1" (type: REGULAR)
   - Node C: "Child 2" (type: REGULAR)
3. Create relationships:
   - A contains B
   - A contains C
   - B references C
4. View graph visualization
5. Verify all nodes visible
6. Verify all edges visible
7. Click on Node B
8. Verify navigation works
9. Check console for errors

**Expected Results**:
- ✅ All operations succeed
- ✅ Graph renders correctly
- ✅ Navigation works
- ✅ No console errors
- ✅ All network requests use correct endpoints

**Fail Criteria**:
- ❌ Graph fails to render
- ❌ Any API errors
- ❌ Navigation broken

---

## Success Criteria

All sections must pass:
- [x] Section 1: Authentication verified working
- [x] Section 2: Space operations succeed
- [x] Section 3: Node operations use space slugs
- [x] Section 4: Attribute operations unchanged
- [x] Section 5: Full integration verified

**Additional Checks**:
- [ ] No TypeScript compile errors (`npm run build`)
- [ ] All contract tests pass (`npm test`)
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] No console warnings/errors during manual testing
- [ ] Performance acceptable (no noticeable slowdown)

## Troubleshooting

### Issue: 404 on `/api/spaces`
**Cause**: Space service not created or not imported
**Fix**: Verify `src/services/api/space.service.ts` exists and exported

### Issue: 404 on `/api/spaces/{slug}/nodes`
**Cause**: Node service still using old endpoints
**Fix**: Verify `node.service.ts` updated to use space-scoped endpoints

### Issue: TypeScript error: "Property 'workspaceId' does not exist"
**Cause**: Component not updated to use space slug
**Fix**: Update component to use `spaceSlug` instead of `workspaceId`

### Issue: "Cannot find module '@/services/api/workspace.service'"
**Cause**: Import not updated after service rename
**Fix**: Update import to use `space.service` instead

### Issue: React Query cache not updating
**Cause**: Query keys not updated for space scoping
**Fix**: Verify query keys use `spaceSlug` in key array

---

## Completion

**Date Completed**: __________
**Tested By**: __________
**Result**: [ ] PASS / [ ] FAIL
**Notes**:


---

**Status**: Ready for Manual Testing
**Next**: Run `/tasks` to generate implementation task list
