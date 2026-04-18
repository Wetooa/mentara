export default {
  displayName: 'mentara-web',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/*.spec.ts', '**/*.spec.tsx'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^api-client$': '<rootDir>/test/stubs/api-client.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup-tests.ts'],
};
