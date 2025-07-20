import { useCommunities } from '@/hooks/useCommunities';
import { useCommunityMembers, useCommunityMemberships } from '@/hooks/community/useCommunityMembers';
import { useCommunityRooms } from '@/hooks/community/useCommunityRooms';
import { useCommunityStats } from '@/hooks/community/useCommunityStats';
import { useCommunityAssignment } from '@/hooks/community/useCommunityAssignment';

/**
 * Comprehensive hook that provides a complete overview of community functionality
 * This is the main entry point for community features
 */
export function useCommunityOverview(communityId?: string) {
  // Core community data and operations
  const {
    userCommunities,
    allCommunities,
    isLoading: isLoadingCommunities,
    error: communitiesError,
    joinCommunity,
    leaveCommunity,
    isJoining,
    isLeaving,
  } = useCommunities();

  // Community membership data
  const {
    memberships,
    isLoading: isLoadingMemberships,
    error: membershipsError,
  } = useCommunityMemberships();

  // Community members (if specific community selected)
  const {
    members,
    total: totalMembers,
    isLoading: isLoadingMembers,
    error: membersError,
  } = useCommunityMembers(communityId || '', 50, 0);

  // Community structure (rooms and room groups)
  const {
    communityWithStructure,
    roomGroups,
    isLoading: isLoadingRooms,
    error: roomsError,
    createRoomGroup,
    createRoom,
    isCreatingRoomGroup,
    isCreatingRoom,
  } = useCommunityRooms(communityId);

  // Community statistics
  const {
    stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useCommunityStats();

  // Community assignment and recommendations
  const {
    recommendedCommunities,
    isLoadingRecommendations,
    recommendationsError,
    assignToMe,
    isAssigningToMe,
  } = useCommunityAssignment();

  // Derived data
  const selectedCommunity = communityId 
    ? allCommunities.find(c => c.id === communityId) || communityWithStructure
    : null;

  const isUserMember = communityId 
    ? userCommunities.some(c => c.id === communityId)
    : false;

  // Aggregate loading states
  const isLoading = isLoadingCommunities || 
    isLoadingMemberships || 
    (communityId && isLoadingMembers) ||
    (communityId && isLoadingRooms) ||
    isLoadingStats ||
    isLoadingRecommendations;

  // Aggregate errors
  const errors = [
    communitiesError,
    membershipsError,
    membersError,
    roomsError,
    statsError,
    recommendationsError,
  ].filter(Boolean);

  const hasErrors = errors.length > 0;

  return {
    // Core data
    userCommunities,
    allCommunities,
    selectedCommunity,
    memberships,
    
    // Community-specific data (when communityId provided)
    members: communityId ? members : [],
    totalMembers: communityId ? totalMembers : 0,
    roomGroups: communityId ? roomGroups : [],
    communityWithStructure: communityId ? communityWithStructure : null,
    
    // Statistics and recommendations
    stats,
    recommendedCommunities,
    
    // State indicators
    isUserMember,
    isLoading,
    hasErrors,
    errors,
    
    // Community operations
    joinCommunity,
    leaveCommunity,
    assignToMe,
    
    // Room/structure operations (admin features)
    createRoomGroup: communityId ? createRoomGroup : undefined,
    createRoom: communityId ? createRoom : undefined,
    
    // Loading states for operations
    isJoining,
    isLeaving,
    isAssigningToMe,
    isCreatingRoomGroup: communityId ? isCreatingRoomGroup : false,
    isCreatingRoom: communityId ? isCreatingRoom : false,
    
    // Individual loading states (for granular control)
    loadingStates: {
      communities: isLoadingCommunities,
      memberships: isLoadingMemberships,
      members: isLoadingMembers,
      rooms: isLoadingRooms,
      stats: isLoadingStats,
      recommendations: isLoadingRecommendations,
    },
    
    // Individual errors (for granular error handling)
    errorStates: {
      communities: communitiesError,
      memberships: membershipsError,
      members: membersError,
      rooms: roomsError,
      stats: statsError,
      recommendations: recommendationsError,
    },
  };
}