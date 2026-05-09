module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!**/node_modules/**'],
  testMatch: ['**/__test__/**/*.test.ts', '**/__test__/**/*.test.js'],
  setupFilesAfterEnv: ['./__test__/setup.js'],
  verbose: true,
  testTimeout: 30000,
};
