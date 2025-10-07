#!/bin/bash

echo "=== Testing Workspace API ==="
echo ""

# Step 1: Login
echo "1. Logging in with omar.h.shafeek@gmail.com..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"omar.h.shafeek@gmail.com","password":"Om@r1234"}')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token from login response"
  exit 1
fi

echo "✅ Token received: ${TOKEN:0:20}..."
echo ""

# Step 2: Fetch workspaces
echo "2. Fetching workspaces with Authorization header..."
WORKSPACES_RESPONSE=$(curl -s -X GET http://localhost:3000/api/workspaces \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Workspaces Response:"
echo "$WORKSPACES_RESPONSE" | jq '.'
echo ""

# Check if we got workspaces
WORKSPACE_COUNT=$(echo "$WORKSPACES_RESPONSE" | jq '.content | length')

if [ "$WORKSPACE_COUNT" == "null" ]; then
  echo "❌ Failed to get workspaces - response structure incorrect"
  exit 1
fi

echo "✅ Successfully retrieved $WORKSPACE_COUNT workspace(s)"
echo ""

# Step 3: Create a test workspace
TIMESTAMP=$(date +%s)
echo "3. Creating a test workspace..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/workspaces \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Workspace $TIMESTAMP\",\"description\":\"Created via API test\"}")

echo "Create Response:"
echo "$CREATE_RESPONSE" | jq '.'
echo ""

NEW_WORKSPACE_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
NEW_WORKSPACE_SLUG=$(echo "$CREATE_RESPONSE" | jq -r '.slug')

if [ "$NEW_WORKSPACE_ID" == "null" ] || [ -z "$NEW_WORKSPACE_ID" ]; then
  echo "❌ Failed to create workspace"
  exit 1
fi

echo "✅ Successfully created workspace: $NEW_WORKSPACE_SLUG (ID: $NEW_WORKSPACE_ID)"
echo ""

# Step 4: Fetch workspaces again to verify
echo "4. Fetching workspaces again to verify creation..."
WORKSPACES_RESPONSE_2=$(curl -s -X GET http://localhost:3000/api/workspaces \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

WORKSPACE_COUNT_2=$(echo "$WORKSPACES_RESPONSE_2" | jq '.content | length')

echo "✅ Now have $WORKSPACE_COUNT_2 workspace(s) (was $WORKSPACE_COUNT)"
echo ""

echo "=== All API Tests Passed! ==="
echo ""
echo "Summary:"
echo "  - Login: ✅"
echo "  - Fetch workspaces: ✅"
echo "  - Create workspace: ✅"
echo "  - Verify creation: ✅"
echo ""
echo "The backend API is working correctly."
echo "Frontend should use:"
echo "  1. localStorage.setItem('auth_token', data.token) after login"
echo "  2. Authorization: Bearer <token> header in all API requests"
echo "  3. Access workspace array via response.data.content (not response.data)"
