// Test utilities exports
export * from './test-utils'
export * from './api-mocks'
export * from './query-testing'
export * from './component-templates'

// Re-export commonly used testing library functions
export {
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
  within,
} from '@testing-library/react'

export { default as userEvent } from '@testing-library/user-event'

// Jest utilities
export { jest, expect, describe, it, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals'