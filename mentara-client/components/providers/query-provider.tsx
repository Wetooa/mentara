"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryConfig } from "../../lib/config/api";
import { MentaraApiError } from "../../lib/api/errorHandler";

// Enhanced QueryClient configuration
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Use configuration from api config
        staleTime: queryConfig.staleTime,
        gcTime: queryConfig.gcTime, // v5 renamed cacheTime to gcTime
        refetchOnWindowFocus: queryConfig.refetchOnWindowFocus,
        refetchOnReconnect: queryConfig.refetchOnReconnect,
        retry: (failureCount: number, error: any) => {
          // Don't retry on authentication errors
          if (error instanceof MentaraApiError && error.status === 401) {
            return false;
          }
          
          // Don't retry on 4xx errors except 408 (timeout) and 429 (rate limit)
          if (error instanceof MentaraApiError && error.status >= 400 && error.status < 500) {
            return [408, 429].includes(error.status) && failureCount < 3;
          }
          
          // Retry on network errors and 5xx server errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Generally don't retry mutations as they might have side effects
        retry: (failureCount: number, error: any) => {
          // Only retry mutations on network errors or 5xx errors
          if (error instanceof MentaraApiError) {
            // Don't retry client errors (4xx)
            if (error.status >= 400 && error.status < 500) {
              return false;
            }
            // Retry server errors but limit attempts
            return error.status >= 500 && failureCount < 2;
          }
          
          // Retry network errors
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      },
    },
  });
};

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show dev tools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom-right"
          toggleButtonProps={{
            style: {
              marginLeft: '5px',
              transform: undefined,
              zIndex: 99999,
            },
          }}
        />
      )}
    </QueryClientProvider>
  );
}
