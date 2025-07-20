import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMockQueryClient } from './test-utils'

// Wrapper for testing React Query hooks
export const createQueryWrapper = (queryClient?: QueryClient) => {
  const testQueryClient = queryClient || createMockQueryClient()
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  )
}

// Helper to render hooks with React Query context
export const renderHookWithQuery = <TResult, TProps>(
  hook: (props: TProps) => TResult,
  options: {
    initialProps?: TProps
    queryClient?: QueryClient
  } = {}
) => {
  const { queryClient, ...renderOptions } = options
  const wrapper = createQueryWrapper(queryClient)
  
  return renderHook(hook, {
    wrapper,
    ...renderOptions,
  })
}

// Test utilities for React Query states
export const waitForQueryToSucceed = async (result: any) => {
  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true)
  })
}

export const waitForQueryToFail = async (result: any) => {
  await waitFor(() => {
    expect(result.current.isError).toBe(true)
  })
}

export const waitForQueryToLoad = async (result: any) => {
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false)
  })
}

// Helper to test mutation states
export const waitForMutationToSucceed = async (result: any) => {
  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true)
  })
}

export const waitForMutationToFail = async (result: any) => {
  await waitFor(() => {
    expect(result.current.isError).toBe(true)
  })
}

// Mock query key utilities for testing cache invalidation
export const createMockQueryKeys = {
  auth: {
    all: ['auth'] as const,
    currentUser: () => ['auth', 'currentUser'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    user: () => ['dashboard', 'user'] as const,
    therapist: () => ['dashboard', 'therapist'] as const,
    admin: () => ['dashboard', 'admin'] as const,
  },
  therapists: {
    all: ['therapists'] as const,
    recommendations: (params?: any) => ['therapists', 'recommendations', params] as const,
    profile: (id: string) => ['therapists', 'profile', id] as const,
  },
  booking: {
    all: ['booking'] as const,
    meetings: {
      all: ['booking', 'meetings'] as const,
      list: (params?: any) => ['booking', 'meetings', 'list', params] as const,
      my: () => ['booking', 'meetings', 'my'] as const,
      byId: (id: string) => ['booking', 'meetings', id] as const,
    },
    availability: {
      all: ['booking', 'availability'] as const,
      slots: (therapistId: string, date: string) => 
        ['booking', 'availability', 'slots', therapistId, date] as const,
    },
  },
}

// Helper to verify cache invalidation
export const expectCacheInvalidation = (queryClient: QueryClient, queryKey: readonly unknown[]) => {
  const queryCache = queryClient.getQueryCache()
  const query = queryCache.find({ queryKey })
  expect(query?.isInvalidated()).toBe(true)
}

// Helper to verify optimistic updates
export const expectOptimisticUpdate = (queryClient: QueryClient, queryKey: readonly unknown[], expectedData: any) => {
  const queryCache = queryClient.getQueryCache()
  const query = queryCache.find({ queryKey })
  expect(query?.state.data).toEqual(expectedData)
}