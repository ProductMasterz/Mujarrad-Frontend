const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/tests/e2e/', // E2E tests run with Playwright
  ],
}

// Export async function to override Next.js's transformIgnorePatterns
module.exports = async () => {
  const nextJestConfig = await createJestConfig(config)()

  // Override the transformIgnorePatterns to allow MSW v2 ESM modules
  nextJestConfig.transformIgnorePatterns = [
    '/node_modules/(?!(msw|@mswjs|@bundled-es-modules|until-async)/)',
  ]

  return nextJestConfig
}
