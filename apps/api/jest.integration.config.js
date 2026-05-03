/**
 * Docker / Testcontainers integration tests only.
 * Run: nx run mentara-api:test-integration
 */
const base = require('./jest.config.js');

module.exports = {
  ...base,
  displayName: 'Integration Tests',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
    '<rootDir>/../mentara-client/',
    '<rootDir>/../ai-patient-evaluation/',
  ],
  testMatch: [
    '<rootDir>/src/**/*.integration.spec.ts',
    '<rootDir>/src/test-utils/integration-tests/**/*.ts',
    '<rootDir>/src/test-utils/external-services.integration.spec.ts',
  ],
  testTimeout: 120000,
};
