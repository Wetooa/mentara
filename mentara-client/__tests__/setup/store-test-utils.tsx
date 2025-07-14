import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook as originalRenderHook, RenderHookOptions } from '@testing-library/react'

/**
 * Test utilities for Zustand store testing with React Query integration
 */

// Create test query client with optimal settings for testing
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

// Enhanced wrapper that includes QueryClient
interface TestWrapperProps {
  children: React.ReactNode
  queryClient?: QueryClient
}

export const TestWrapper: React.FC<TestWrapperProps> = ({ 
  children, 
  queryClient = createTestQueryClient() 
}) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

// Custom render hook that includes QueryClient wrapper
export function renderHookWithQueryClient<TResult, TProps>(
  hook: (initialProps: TProps) => TResult,
  options?: RenderHookOptions<TProps> & { queryClient?: QueryClient }
) {
  const { queryClient, ...restOptions } = options || {}
  
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestWrapper queryClient={queryClient}>
      {children}
    </TestWrapper>
  )

  return {
    ...originalRenderHook(hook, { wrapper, ...restOptions }),
    queryClient: queryClient || createTestQueryClient(),
  }
}

/**
 * Store testing utilities
 */

// Mock localStorage for testing persistence
export const createMockLocalStorage = () => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get size() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] || null,
    getAll: () => ({ ...store }),
  }
}

// Setup localStorage mock for tests
export const setupLocalStorageMock = () => {
  const mockLocalStorage = createMockLocalStorage()
  
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  })
  
  return mockLocalStorage
}

/**
 * Store state assertion utilities
 */

// Type-safe state matcher for Zustand stores
export const expectStoreState = <T extends Record<string, any>>(
  store: T,
  expectedPartialState: Partial<T>
) => {
  Object.entries(expectedPartialState).forEach(([key, expectedValue]) => {
    expect(store[key]).toEqual(expectedValue)
  })
}

// Deep state comparison utility
export const expectDeepStoreState = <T extends Record<string, any>>(
  store: T,
  expectedState: Partial<T>
) => {
  expect(store).toMatchObject(expectedState)
}

/**
 * Mock data generators for store testing
 */

export const mockStoreData = {
  // Therapist form mock data
  therapistForm: {
    basic: {
      firstName: 'Dr. John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '+1234567890',
    },
    education: {
      degree: 'PhD in Clinical Psychology',
      university: 'Harvard University',
      graduationYear: '2018',
      gpa: '3.9',
    },
    experience: {
      years: '5',
      specialties: ['anxiety', 'depression', 'trauma'],
      previousRoles: 'Senior Therapist at Community Health Center',
    },
    licenses: {
      prc: 'PRC123456',
      state: 'CA98765',
      expiration: '2025-12-31',
    },
    documents: {
      prcLicense: [new File(['license'], 'prc-license.pdf', { type: 'application/pdf' })],
      resumeCV: [new File(['resume'], 'resume.pdf', { type: 'application/pdf' })],
    },
  },

  // Assessment mock data
  assessment: {
    basic: {
      userId: 'user-123',
      responses: {
        anxiety: 4,
        depression: 3,
        stress: 5,
      },
      score: 12,
      category: 'moderate',
    },
    complex: {
      userId: 'user-456',
      responses: {
        anxiety: { level: 4, symptoms: ['worry', 'restlessness'] },
        depression: { level: 3, symptoms: ['sadness', 'fatigue'] },
        stress: { level: 5, symptoms: ['tension', 'overwhelm'] },
        trauma: { level: 2, symptoms: ['flashbacks', 'avoidance'] },
      },
      metadata: {
        timestamp: new Date().toISOString(),
        duration: 180,
        userAgent: 'test-agent',
        version: '2.0',
      },
      score: 14,
      category: 'moderate-high',
      recommendations: ['therapy', 'exercise', 'mindfulness', 'medication-consultation'],
    },
  },

  // Moderator mock data
  moderator: {
    contentFilters: {
      pending: {
        status: 'pending',
        limit: 20,
        offset: 0,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      approved: {
        status: 'approved',
        limit: 50,
        offset: 0,
        sortBy: 'updatedAt',
        sortOrder: 'asc',
      },
    },
    contentList: [
      { id: 'content-1', status: 'pending', title: 'Post 1', authorId: 'user-1', createdAt: '2024-01-15' },
      { id: 'content-2', status: 'pending', title: 'Post 2', authorId: 'user-2', createdAt: '2024-01-14' },
      { id: 'content-3', status: 'approved', title: 'Post 3', authorId: 'user-3', createdAt: '2024-01-13' },
    ],
    userFilters: {
      role: 'client',
      status: 'active',
      limit: 25,
      offset: 0,
    },
    auditFilters: {
      action: 'user_banned',
      dateFrom: new Date('2024-01-01'),
      dateTo: new Date('2024-01-31'),
      userId: 'user-123',
      limit: 50,
      offset: 0,
    },
  },
}

/**
 * Test scenario helpers
 */

// Simulate rapid store updates
export const simulateRapidUpdates = async (
  updateFn: (index: number) => void,
  count: number = 10,
  delay: number = 10
) => {
  for (let i = 0; i < count; i++) {
    updateFn(i)
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// Simulate localStorage corruption
export const simulateLocalStorageCorruption = (key: string) => {
  localStorage.setItem(key, 'invalid-json-data{')
}

// Simulate localStorage quota exceeded
export const simulateLocalStorageQuotaExceeded = () => {
  const originalSetItem = localStorage.setItem
  localStorage.setItem = jest.fn().mockImplementation(() => {
    throw new Error('QuotaExceededError')
  })
  
  return () => {
    localStorage.setItem = originalSetItem
  }
}

/**
 * Performance testing utilities
 */

// Measure store update performance
export const measureStorePerformance = async <T>(
  operation: () => T,
  label: string = 'Store Operation'
): Promise<{ result: T; duration: number }> => {
  const start = performance.now()
  const result = await operation()
  const end = performance.now()
  const duration = end - start
  
  console.log(`${label} took ${duration.toFixed(2)}ms`)
  
  return { result, duration }
}

// Stress test store with concurrent operations
export const stressTestStore = async (
  operations: Array<() => void>,
  iterations: number = 100
) => {
  const promises = []
  
  for (let i = 0; i < iterations; i++) {
    operations.forEach(operation => {
      promises.push(Promise.resolve().then(operation))
    })
  }
  
  await Promise.all(promises)
}

/**
 * Store subscription testing utilities
 */

// Track store state changes
export const createStoreChangeTracker = <T extends Record<string, any>>(
  useStore: () => T,
  propertiesToTrack: Array<keyof T> = []
) => {
  const changes: Array<{ timestamp: number; property: keyof T; oldValue: any; newValue: any }> = []
  
  return {
    changes,
    trackChanges: (store: T) => {
      const trackedProps = propertiesToTrack.length > 0 ? propertiesToTrack : Object.keys(store) as Array<keyof T>
      
      return trackedProps.map(prop => {
        const oldValue = store[prop]
        
        return {
          property: prop,
          oldValue,
          checkChange: (newStore: T) => {
            const newValue = newStore[prop]
            if (oldValue !== newValue) {
              changes.push({
                timestamp: Date.now(),
                property: prop,
                oldValue,
                newValue,
              })
            }
          },
        }
      })
    },
    getChangeCount: () => changes.length,
    getChangesFor: (property: keyof T) => changes.filter(change => change.property === property),
    reset: () => changes.splice(0, changes.length),
  }
}

export default {
  createTestQueryClient,
  TestWrapper,
  renderHookWithQueryClient,
  setupLocalStorageMock,
  expectStoreState,
  expectDeepStoreState,
  mockStoreData,
  simulateRapidUpdates,
  measureStorePerformance,
  stressTestStore,
  createStoreChangeTracker,
}