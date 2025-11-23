// API configuration settings
export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  timeout: 10000,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
  maxRetries: 3,
} as const;

// Default query configurations for React Query
export const queryConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (v5 renamed cacheTime)
  refetchOnWindowFocus: false, // Reduce unnecessary refetches
  refetchOnReconnect: "always" as const,
  retry: (failureCount: number, error: { response?: { status?: number } }) => {
    // Don't retry on 4xx errors except 408, 429
    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      return [408, 429].includes(error.response.status) && failureCount < 3;
    }
    return failureCount < 3;
  },
} as const;
