# Testing Guide for Mujarrad Frontend

## Overview

This project uses a comprehensive testing strategy with three types of tests:

- **E2E Tests**: End-to-end tests using Playwright
- **Unit Tests**: Testing utility functions and business logic with Jest
- **Component Tests**: Testing React components with React Testing Library and Jest

## Test Structure

```
tests/
├── e2e/                    # Playwright E2E tests
│   ├── auth.spec.ts        # Authentication flows
│   ├── workspaces.spec.ts  # Workspace management
│   ├── nodes.spec.ts       # Node CRUD operations
│   ├── search.spec.ts      # Search functionality
│   └── graph.spec.ts       # Graph visualization
├── integration/            # Integration tests (future)
└── unit/                   # Additional unit tests (future)

src/
├── lib/__tests__/          # Unit tests for utilities
│   ├── utils.test.ts       # Utility functions
│   └── errors.test.ts      # Error handling
└── components/
    └── ui/__tests__/       # Component tests
        ├── button.test.tsx
        └── input.test.tsx
```

## Running Tests

### Unit Tests (Jest)

```bash
# Run all unit tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI (visual test runner)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run tests with specific browser
npx playwright test --project=chromium
```

### Run All Tests

```bash
# Run both unit and E2E tests
npm run test:all
```

## Test Requirements

### Before Running E2E Tests

1. **Backend API must be running**:
   ```bash
   # Ensure the API is running on localhost:8080
   ```

2. **Test database should be seeded with**:
   - Test user (test@example.com / Password123)
   - Test workspace (slug: test-workspace)
   - Sample nodes for testing

3. **Environment Variables**:
   Create `.env.test` in the project root:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   ```

### Frontend Server

The E2E tests automatically start the Next.js development server on port 3000. You don't need to start it manually.

## Writing Tests

### E2E Test Pattern (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup - navigate to page, login if needed
    await page.goto('/your-page');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const button = page.getByRole('button', { name: 'Click me' });

    // Act
    await button.click();

    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup if needed
  });
});
```

### Unit Test Pattern (Jest)

```typescript
import { describe, it, expect } from '@jest/globals';
import { yourFunction } from '../yourModule';

describe('yourFunction', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = yourFunction(input);

    // Assert
    expect(result).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(yourFunction('')).toBe('default');
    expect(yourFunction(null)).toBe('default');
  });
});
```

### Component Test Pattern (React Testing Library)

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { YourComponent } from '../YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<YourComponent onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Best Practices

### E2E Tests

1. **Use semantic selectors**: Prefer `getByRole()` over CSS selectors
2. **Wait for elements**: Use Playwright's auto-waiting features
3. **Test user flows**: Test complete user journeys, not just individual actions
4. **Avoid hardcoded waits**: Use `waitForSelector()` or `waitForLoadState()` instead of `waitForTimeout()`
5. **Isolate tests**: Each test should be independent and not rely on other tests

### Unit Tests

1. **Test edge cases**: Include null, undefined, empty strings, etc.
2. **Keep tests simple**: One assertion per test when possible
3. **Use descriptive names**: Test names should describe what is being tested
4. **Mock external dependencies**: Don't rely on API calls or external services
5. **Test error cases**: Verify error handling and edge cases

### Component Tests

1. **Test user behavior**: Focus on how users interact with components
2. **Avoid implementation details**: Don't test internal state or methods
3. **Use semantic queries**: Prefer queries that match how users find elements
4. **Test accessibility**: Verify ARIA attributes and keyboard navigation
5. **Mock complex dependencies**: Mock API calls, contexts, and external libraries

## Test Coverage

### Current Coverage

```bash
# Generate and view coverage report
npm run test:coverage

# Open HTML coverage report
open coverage/lcov-report/index.html
```

### Coverage Goals

- **Utilities**: 100% coverage (pure functions are easy to test)
- **Components**: 80%+ coverage (focus on user interactions)
- **E2E**: Critical user paths (auth, CRUD operations, navigation)

## Debugging Tests

### Debug E2E Tests

```bash
# Run with browser visible
npm run test:e2e:headed

# Run with Playwright Inspector
npx playwright test --debug

# Run specific test with debug
npx playwright test tests/e2e/auth.spec.ts --debug

# Generate and view trace
npx playwright test --trace on
npx playwright show-trace trace.zip
```

### Debug Unit/Component Tests

```bash
# Run tests in watch mode
npm run test:watch

# Debug with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Use VS Code debugger
# Add breakpoint in test file and run "Jest: Debug" command
```

## Continuous Integration

### GitHub Actions

Tests should run on every push and pull request:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

## Common Issues

### Issue: E2E tests fail with "waiting for locator" timeout

**Solution**: Ensure the backend API is running and seeded with test data.

### Issue: Unit tests fail with "Cannot find module '@/...'"

**Solution**: Check that `jest.config.ts` has the correct `moduleNameMapper` configuration.

### Issue: Component tests fail with "window is not defined"

**Solution**: Ensure `jest.setup.ts` imports `@testing-library/jest-dom` and `testEnvironment: 'jsdom'` is set.

### Issue: E2E tests are slow

**Solution**:
- Run tests in parallel (default)
- Use `fullyParallel: true` in playwright.config.ts
- Optimize test setup/teardown

### Issue: Tests pass locally but fail in CI

**Solution**:
- Check environment variables
- Ensure all dependencies are installed
- Verify browser versions match

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://testingjavascript.com/)

## Contributing

When adding new features:

1. Write tests FIRST (TDD approach recommended)
2. Ensure all tests pass before committing
3. Maintain or improve test coverage
4. Add E2E tests for critical user flows
5. Document complex test scenarios

## Test Checklist

Before merging code:

- [ ] All unit tests pass
- [ ] All component tests pass
- [ ] All E2E tests pass
- [ ] Coverage meets minimum threshold
- [ ] New features have tests
- [ ] Bug fixes have regression tests
- [ ] Tests are documented if complex
