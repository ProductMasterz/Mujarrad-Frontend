# UI Components Demo

This directory contains the demo page showcasing the Hierarchy Navigator and Markdown Renderer components.

## Files

- `app/demo/` - Demo Next.js page
- `test-demo-automated.sh` - Automated test suite (14 tests)
- `DEMO_VERIFICATION.md` - Complete verification report
- `test-interactions.js` - Puppeteer interaction tests
- `test-interactions-playwright.js` - Playwright interaction tests

## Running the Demo

1. Start the dev server: `npm run dev`
2. Open http://localhost:3002/demo
3. Click nodes in the hierarchy to see content update

## Features Demonstrated

- Interactive hierarchy navigation with expand/collapse
- Rich markdown rendering (H1-H4, tables, code blocks, lists, etc.)
- Wiki-link resolution and styling
- External hyperlinks
- Task lists, emojis, blockquotes

## Testing

Run automated tests:
```bash
./demos/ui-components-demo/test-demo-automated.sh
```

All 14 tests should pass ✅
