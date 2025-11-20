import { useApi } from '@/lib/api';

/**
 * Hook to access pre-assessment service
 */
export function usePreAssessmentService() {
  const api = useApi();
  
  return {
    service: api.preAssessment,
  };
}

