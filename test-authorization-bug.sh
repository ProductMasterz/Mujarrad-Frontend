#!/bin/bash

echo "=== Testing Workspace Authorization Bug ==="
echo ""

# Test User 1: omar.h.shafeek@gmail.com
echo "1. Login as User 1 (omar.h.shafeek@gmail.com)..."
USER1_LOGIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"omar.h.shafeek@gmail.com","password":"Om@r1234"}')

USER1_TOKEN=$(echo "$USER1_LOGIN" | jq -r '.token')
USER1_ID=$(echo "$USER1_LOGIN" | jq -r '.userId')

echo "User 1 ID: $USER1_ID"
echo ""

echo "2. Fetch workspaces for User 1..."
USER1_WORKSPACES=$(curl -s -X GET http://localhost:3000/api/workspaces \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json")

echo "User 1 workspaces:"
echo "$USER1_WORKSPACES" | jq -c '.[] | {id: .id, name: .name, ownerId: .ownerId}'
echo ""

# Count workspaces owned by User 1 vs others
USER1_OWN_COUNT=$(echo "$USER1_WORKSPACES" | jq "[.[] | select(.ownerId == \"$USER1_ID\")] | length")
OTHER_OWNER_COUNT=$(echo "$USER1_WORKSPACES" | jq "[.[] | select(.ownerId != \"$USER1_ID\")] | length")

echo "Summary for User 1:"
echo "  - Workspaces owned by User 1: $USER1_OWN_COUNT"
echo "  - Workspaces owned by others: $OTHER_OWNER_COUNT"
echo ""

if [ "$OTHER_OWNER_COUNT" -gt 0 ]; then
  echo "❌ AUTHORIZATION BUG CONFIRMED!"
  echo "   User 1 can see $OTHER_OWNER_COUNT workspace(s) belonging to other users!"
  echo ""
  echo "Other owners found:"
  echo "$USER1_WORKSPACES" | jq -r '[.[] | select(.ownerId != "'$USER1_ID'") | .ownerId] | unique | .[]'
  echo ""
  echo "🔒 SECURITY ISSUE: The backend /api/workspaces endpoint should only return"
  echo "   workspaces where the authenticated user is either:"
  echo "   1. The owner (ownerId matches user ID), OR"
  echo "   2. A collaborator (has been invited to the workspace)"
  echo ""
  echo "Current behavior: Returns ALL workspaces in the database regardless of ownership."
else
  echo "✅ Authorization working correctly - User 1 only sees their own workspaces"
fi
