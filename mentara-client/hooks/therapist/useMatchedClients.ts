import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';

/**
 * Hook for fetching therapist's matched clients (pending requests and recent matches)
 */
export function useMatchedClients() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['therapist', 'matched-clients'],
    queryFn: async () => {
      const response = await api.apiClient.get('/therapist/clients/matched');
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // Consider fresh for 2 minutes
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes for new requests
  });
}