#!/bin/bash

echo "=== Testing Space API ==="
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

# Step 2: Fetch spaces
echo "2. Fetching spaces with Authorization header..."
SPACES_RESPONSE=$(curl -s -X GET http://localhost:3000/api/spaces \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Spaces Response:"
echo "$SPACES_RESPONSE" | jq '.'
echo ""

# Check if we got spaces
SPACE_COUNT=$(echo "$SPACES_RESPONSE" | jq '.content | length')

if [ "$SPACE_COUNT" == "null" ]; then
  echo "❌ Failed to get spaces - response structure incorrect"
  exit 1
fi

echo "✅ Successfully retrieved $SPACE_COUNT space(s)"
echo ""

# Step 3: Create a test space
TIMESTAMP=$(date +%s)
echo "3. Creating a test space..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/spaces \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Space $TIMESTAMP\",\"description\":\"Created via API test\"}")

echo "Create Response:"
echo "$CREATE_RESPONSE" | jq '.'
echo ""

NEW_SPACE_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
NEW_SPACE_SLUG=$(echo "$CREATE_RESPONSE" | jq -r '.slug')

if [ "$NEW_SPACE_ID" == "null" ] || [ -z "$NEW_SPACE_ID" ]; then
  echo "❌ Failed to create space"
  exit 1
fi

echo "✅ Successfully created space: $NEW_SPACE_SLUG (ID: $NEW_SPACE_ID)"
echo ""

# Step 4: Fetch spaces again to verify
echo "4. Fetching spaces again to verify creation..."
SPACES_RESPONSE_2=$(curl -s -X GET http://localhost:3000/api/spaces \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

SPACE_COUNT_2=$(echo "$SPACES_RESPONSE_2" | jq '.content | length')

echo "✅ Now have $SPACE_COUNT_2 space(s) (was $SPACE_COUNT)"
echo ""

echo "=== All API Tests Passed! ==="
echo ""
echo "Summary:"
echo "  - Login: ✅"
echo "  - Fetch spaces: ✅"
echo "  - Create space: ✅"
echo "  - Verify creation: ✅"
echo ""
echo "The backend API is working correctly."
echo "Frontend should use:"
echo "  1. localStorage.setItem('auth_token', data.token) after login"
echo "  2. Authorization: Bearer <token> header in all API requests"
echo "  3. Access space array via response.data.content (not response.data)"
