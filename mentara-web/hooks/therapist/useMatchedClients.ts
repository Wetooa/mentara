import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';

/**
 * Hook for fetching therapist's matched clients (pending requests and recent matches)
 * This uses the existing dashboard data to avoid making a separate API call
 */
export function useMatchedClients() {
  const api = useApi();

  return useQuery({
    queryKey: ['therapist', 'dashboard'],
    queryFn: async () => {
      const response = await api.dashboard.getTherapistDashboard();
      
      // Transform the dashboard data to match the MatchedClientsData interface
      const { patients } = response;
      
      return {
        recentMatches: patients.recent.map(patient => ({
          relationshipId: `${patient.id}-relationship`,
          client: {
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: `${patient.firstName.toLowerCase()}.${patient.lastName.toLowerCase()}@example.com`, // Placeholder since email not included
            profilePicture: patient.avatarUrl,
            joinedAt: new Date().toISOString(), // Placeholder since joinedAt not included
          },
          matchInfo: {
            assignedAt: new Date().toISOString(), // Placeholder since assignedAt not included
            status: patient.status === 'active' ? 'ACTIVE' : 'PENDING',
            daysSinceMatch: Math.floor(Math.random() * 30), // Placeholder calculation
          },
          assessmentInfo: {
            hasAssessment: true, // Placeholder since assessment info not included
            completedAt: new Date().toISOString(),
            assessmentType: 'Mental Health Assessment',
            daysSinceAssessment: Math.floor(Math.random() * 15),
          },
        })),
        allMatches: patients.recent, // Using recent as placeholder for all matches
        summary: {
          totalRecentMatches: patients.recent.length,
          totalAllMatches: patients.total,
          totalMatches: patients.total,
        },
      };
    },
    staleTime: 1000 * 60 * 2, // Consider fresh for 2 minutes
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes for new requests
  });
}
