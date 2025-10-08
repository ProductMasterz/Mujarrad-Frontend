#!/bin/bash

# Automated test loop for demo page functionality
# Tests HTTP status, key content, and interactive elements

BASE_URL="http://localhost:3002"
PAGE="/demo"
FULL_URL="${BASE_URL}${PAGE}"

echo "==================================="
echo "Demo Page Automated Test Suite"
echo "==================================="
echo ""

# Test 1: HTTP Status
echo "[Test 1] Checking HTTP status..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FULL_URL)
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ PASS: HTTP 200 OK"
else
    echo "❌ FAIL: Expected 200, got $HTTP_STATUS"
    exit 1
fi
echo ""

# Test 2: Page title
echo "[Test 2] Checking page title..."
CONTENT=$(curl -s $FULL_URL)
if echo "$CONTENT" | grep -q "UI Components Demo"; then
    echo "✅ PASS: Page title found"
else
    echo "❌ FAIL: Page title not found"
    exit 1
fi
echo ""

# Test 3: Hierarchy Navigator section
echo "[Test 3] Checking Hierarchy Navigator..."
if echo "$CONTENT" | grep -q "Hierarchy Navigator"; then
    echo "✅ PASS: Hierarchy Navigator section found"
else
    echo "❌ FAIL: Hierarchy Navigator section not found"
    exit 1
fi
echo ""

# Test 4: Root nodes present
echo "[Test 4] Checking root nodes..."
if echo "$CONTENT" | grep -q "Product Requirements"; then
    echo "✅ PASS: Product Requirements node found"
else
    echo "❌ FAIL: Product Requirements node not found"
    exit 1
fi

if echo "$CONTENT" | grep -q "Technical Specs"; then
    echo "✅ PASS: Technical Specs node found"
else
    echo "❌ FAIL: Technical Specs node not found"
    exit 1
fi
echo ""

# Test 5: Markdown Renderer section
echo "[Test 5] Checking Markdown Renderer..."
if echo "$CONTENT" | grep -q "Markdown Renderer"; then
    echo "✅ PASS: Markdown Renderer section found"
else
    echo "❌ FAIL: Markdown Renderer section not found"
    exit 1
fi
echo ""

# Test 6: Markdown content
echo "[Test 6] Checking markdown content..."
if echo "$CONTENT" | grep -q "Authorization\|Role-Based"; then
    echo "✅ PASS: Node content rendering"
else
    echo "❌ FAIL: Node content not found"
    exit 1
fi
echo ""

# Test 7: Tree role attribute
echo "[Test 7] Checking ARIA tree role..."
if echo "$CONTENT" | grep -q 'role="tree"'; then
    echo "✅ PASS: Tree role found"
else
    echo "❌ FAIL: Tree role not found"
    exit 1
fi
echo ""

# Test 8: Treeitem role attributes
echo "[Test 8] Checking ARIA treeitem roles..."
if echo "$CONTENT" | grep -q 'role="treeitem"'; then
    echo "✅ PASS: Treeitem roles found"
else
    echo "❌ FAIL: Treeitem roles not found"
    exit 1
fi
echo ""

# Test 9: aria-expanded attributes
echo "[Test 9] Checking aria-expanded attributes..."
if echo "$CONTENT" | grep -q 'aria-expanded='; then
    echo "✅ PASS: aria-expanded attributes found"
else
    echo "❌ FAIL: aria-expanded attributes not found"
    exit 1
fi
echo ""

# Test 10: Folder and document icons
echo "[Test 10] Checking node icons (SVG)..."
if echo "$CONTENT" | grep -q '<svg'; then
    echo "✅ PASS: SVG icons found"
else
    echo "❌ FAIL: SVG icons not found"
    exit 1
fi
echo ""

# Test 11: Prose class (markdown styling)
echo "[Test 11] Checking markdown prose styling..."
if echo "$CONTENT" | grep -q 'class="prose'; then
    echo "✅ PASS: Prose class found"
else
    echo "❌ FAIL: Prose class not found"
    exit 1
fi
echo ""

# Test 12: Code blocks
echo "[Test 12] Checking code blocks..."
if echo "$CONTENT" | grep -q '<pre'; then
    echo "✅ PASS: Code block found"
else
    echo "❌ FAIL: Code block not found"
    exit 1
fi
echo ""

# Test 13: Tables (GFM)
echo "[Test 13] Checking GFM tables..."
if echo "$CONTENT" | grep -q '<table'; then
    echo "✅ PASS: Table found"
else
    echo "❌ FAIL: Table not found"
    exit 1
fi
echo ""

# Test 14: Task lists
echo "[Test 14] Checking task lists..."
if echo "$CONTENT" | grep -q 'type="checkbox"'; then
    echo "✅ PASS: Task list checkboxes found"
else
    echo "❌ FAIL: Task list checkboxes not found"
    exit 1
fi
echo ""

# Summary
echo "==================================="
echo "✅ ALL TESTS PASSED!"
echo "==================================="
echo ""
echo "Demo page is fully functional at:"
echo "$FULL_URL"
echo ""
echo "Features verified:"
echo "  ✓ HTTP 200 response"
echo "  ✓ Page structure and headers"
echo "  ✓ Hierarchy Navigator with tree ARIA roles"
echo "  ✓ Root nodes (Product Requirements, Technical Specs)"
echo "  ✓ Markdown Renderer with prose styling"
echo "  ✓ GFM features (tables, code blocks, task lists)"
echo "  ✓ ARIA accessibility attributes"
echo "  ✓ SVG icons for nodes"
echo ""
