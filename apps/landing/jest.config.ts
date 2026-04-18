export default {
  displayName: 'mentara-landing',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          target: 'ES2020',
          esModuleInterop: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@sveltejs/kit$': '<rootDir>/test/stubs/sveltekit.ts',
    '^\\$env/dynamic/private$': '<rootDir>/test/stubs/private-env.ts',
  },
};
