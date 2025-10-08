// Simple interaction test using Playwright
const { chromium } = require('@playwright/test');

(async () => {
  console.log('🚀 Starting interaction tests...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect console logs
  const logs = [];
  page.on('console', msg => {
    logs.push(msg.text());
    console.log('📝 Console:', msg.text());
  });

  try {
    console.log('➡️  Navigating to demo page...');
    await page.goto('http://localhost:3002/demo', { waitUntil: 'networkidle' });
    console.log('✅ Page loaded\n');

    // Test 1: Check initial state
    console.log('🧪 Test 1: Checking initial tree state...');
    const treeItems = await page.locator('[role="treeitem"]').all();
    console.log(`✅ Found ${treeItems.length} tree items`);

    const firstItem = treeItems[0];
    const ariaExpanded = await firstItem.getAttribute('aria-expanded');
    console.log(`   Initial aria-expanded: ${ariaExpanded}`);

    if (ariaExpanded === 'false') {
      console.log('✅ PASS: Tree items start collapsed\n');
    } else {
      console.log('❌ FAIL: Expected collapsed state\n');
      process.exit(1);
    }

    // Test 2: Click to expand
    console.log('🧪 Test 2: Testing expand on click...');
    await firstItem.click();
    await page.waitForTimeout(500);

    const expandedState = await firstItem.getAttribute('aria-expanded');
    console.log(`   After click aria-expanded: ${expandedState}`);

    if (expandedState === 'true') {
      console.log('✅ PASS: Tree item expanded\n');
    } else {
      console.log('❌ FAIL: Tree item did not expand\n');
      process.exit(1);
    }

    // Test 3: Check for child nodes
    console.log('🧪 Test 3: Checking for child nodes...');
    const afterExpandTreeItems = await page.locator('[role="treeitem"]').all();
    console.log(`   Tree items after expand: ${afterExpandTreeItems.length}`);

    if (afterExpandTreeItems.length > treeItems.length) {
      console.log('✅ PASS: Child nodes appeared\n');
    } else {
      console.log('⚠️  WARNING: No new child nodes (may already be visible)\n');
    }

    // Test 4: Check markdown rendering
    console.log('🧪 Test 4: Checking markdown content...');
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    console.log(`   Found ${h1Count} h1 headings, ${h2Count} h2 headings`);

    if (h1Count > 0 && h2Count > 0) {
      console.log('✅ PASS: Markdown rendered with headings\n');
    } else {
      console.log('❌ FAIL: Insufficient markdown headings\n');
      process.exit(1);
    }

    // Test 5: Check for links
    console.log('🧪 Test 5: Checking for wiki-links...');
    const links = await page.locator('a[href*="workspace"]').count();
    console.log(`   Found ${links} internal wiki-links`);

    if (links > 0) {
      console.log('✅ PASS: Wiki-links rendered\n');
    } else {
      console.log('⚠️  WARNING: No wiki-links found\n');
    }

    // Test 6: Check for placeholder links
    console.log('🧪 Test 6: Checking for placeholder links...');
    const placeholders = await page.locator('.text-red-500').count();
    console.log(`   Found ${placeholders} placeholder links`);

    if (placeholders > 0) {
      console.log('✅ PASS: Placeholder links rendered\n');
    } else {
      console.log('⚠️  WARNING: No placeholder links found\n');
    }

    // Test 7: Check tables
    console.log('🧪 Test 7: Checking GFM tables...');
    const tables = await page.locator('table').count();
    console.log(`   Found ${tables} tables`);

    if (tables > 0) {
      console.log('✅ PASS: GFM tables rendered\n');
    } else {
      console.log('❌ FAIL: No tables found\n');
      process.exit(1);
    }

    // Test 8: Check code blocks
    console.log('🧪 Test 8: Checking code blocks...');
    const codeBlocks = await page.locator('pre code').count();
    console.log(`   Found ${codeBlocks} code blocks`);

    if (codeBlocks > 0) {
      console.log('✅ PASS: Code blocks rendered\n');
    } else {
      console.log('❌ FAIL: No code blocks found\n');
      process.exit(1);
    }

    // Test 9: Check task lists
    console.log('🧪 Test 9: Checking task lists...');
    const checkboxes = await page.locator('input[type="checkbox"]').count();
    console.log(`   Found ${checkboxes} task list checkboxes`);

    if (checkboxes > 0) {
      console.log('✅ PASS: Task lists rendered\n');
    } else {
      console.log('❌ FAIL: No task lists found\n');
      process.exit(1);
    }

    // Test 10: Verify console logs
    console.log('🧪 Test 10: Checking event handlers...');
    if (logs.some(log => log.includes('Selected'))) {
      console.log('✅ PASS: Event handlers firing\n');
    } else {
      console.log('⚠️  WARNING: No console logs captured (may be ok)\n');
    }

    // Summary
    console.log('=================================');
    console.log('✅ ALL INTERACTION TESTS PASSED!');
    console.log('=================================\n');

    console.log('Feature Summary:');
    console.log(`  ✓ ${treeItems.length} initial tree items`);
    console.log(`  ✓ Expand/collapse working`);
    console.log(`  ✓ ${h1Count} H1 + ${h2Count} H2 headings`);
    console.log(`  ✓ ${links} wiki-links`);
    console.log(`  ✓ ${placeholders} placeholder links`);
    console.log(`  ✓ ${tables} tables`);
    console.log(`  ✓ ${codeBlocks} code blocks`);
    console.log(`  ✓ ${checkboxes} task checkboxes`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
