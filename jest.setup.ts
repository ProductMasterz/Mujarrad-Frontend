import '@testing-library/jest-dom';

// MSW setup moved to individual test files to allow isolated server instances
// Contract tests: Create own server with `setupServer()`
// Integration tests: Import and use `server` from './tests/mocks/server'