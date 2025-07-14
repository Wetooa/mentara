import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClerkProvider } from '@clerk/nextjs'

// Create a custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
  initialClerkState?: any
}

const AllTheProviders = ({ 
  children, 
  queryClient,
  initialClerkState 
}: { 
  children: React.ReactNode
  queryClient?: QueryClient
  initialClerkState?: any
}) => {
  // Use provided queryClient or create a new test one
  const testQueryClient = queryClient || global.createTestQueryClient()

  return (
    <ClerkProvider 
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      {...initialClerkState}
    >
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    </ClerkProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { queryClient, initialClerkState, ...renderOptions } = options

  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders 
        {...props} 
        queryClient={queryClient}
        initialClerkState={initialClerkState}
      />
    ),
    ...renderOptions,
  })
}

// React Query specific test utilities
export const createMockQueryClient = () => {
  return new QueryClient({
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
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Suppress error logs in tests
    },
  })
}

// Helper to wait for queries to settle
export const waitForQueriesToSettle = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries()
  await new Promise(resolve => setTimeout(resolve, 0))
}

// Helper to create mock data
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  role: 'client',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createMockTherapist = (overrides = {}) => ({
  id: 'test-therapist-id',
  firstName: 'Dr. Test',
  lastName: 'Therapist',
  email: 'therapist@example.com',
  bio: 'Test therapist bio',
  specialties: ['anxiety', 'depression'],
  hourlyRate: 150,
  rating: 4.8,
  reviewCount: 25,
  ...overrides,
})

export const createMockDashboardData = (overrides = {}) => ({
  stats: {
    totalSessions: 10,
    upcomingSessions: 2,
    completedAssessments: 5,
    unreadMessages: 3,
  },
  upcomingAppointments: [],
  recentActivity: [],
  notifications: [],
  ...overrides,
})

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { customRender as render }