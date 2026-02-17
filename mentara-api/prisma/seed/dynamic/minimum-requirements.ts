/**
 * Minimum Data Requirements for Dynamic Seeding
 *
 * Defines the minimum amount of related data each entity should have
 * for comprehensive frontend testing
 */

export interface MinimumRequirements {
  client: {
    communityMemberships: number;
    posts: number;
    comments: number;
    hearts: number;
    therapistRelationships: number; // 0 or 1 (can have none)
    meetingsIfHasTherapist: number;
    completedAssessments: number;
    worksheetsIfHasTherapist: number;
    conversations: number;
    messagesPerConversation: number;
  };
  therapist: {
    clientRelationships: number;
    communityMemberships: number;
    posts: number;
    comments: number;
    availabilityDays: number; // How many days/week available
    meetings: number;
    worksheetsCreated: number;
    sessionNotesWritten: number;
    reviewsReceived: number;
  };
  community: {
    members: number;
    posts: number;
    moderators: number;
    recentActivityDays: number; // Activity within X days
  };
  moderator: {
    communitiesModerated: number;
    moderationActions: number;
  };
  admin: {
    // No minimum requirements (just needs to exist)
  };
  post: {
    comments: number;
    hearts: number;
  };
  meeting: {
    hasNotesIfCompleted: boolean;
  };
}

/**
 * Default minimum requirements
 * Can be overridden for different testing scenarios
 */
export const DEFAULT_MINIMUM_REQUIREMENTS: MinimumRequirements = {
  client: {
    communityMemberships: 1, // At least in 1 community
    posts: 5, // Active participant
    comments: 10, // Engaged commenter
    hearts: 3, // Shows engagement
    therapistRelationships: 0, // Optional (not all clients have therapists)
    meetingsIfHasTherapist: 3, // If has therapist, at least 3 sessions
    completedAssessments: 2, // Initial + follow-up
    worksheetsIfHasTherapist: 4, // If has therapist, at least 4 worksheets per client
    conversations: 2, // Chats with 2 people
    messagesPerConversation: 5, // 5 messages per chat
  },
  therapist: {
    clientRelationships: 2, // Working with at least 2 clients
    communityMemberships: 1, // Professional involvement
    posts: 2, // Shares knowledge
    comments: 5, // Provides guidance
    availabilityDays: 3, // Available 3 days/week minimum
    meetings: 4, // Has conducted sessions
    worksheetsCreated: 3, // Has therapy materials
    sessionNotesWritten: 2, // Documents sessions
    reviewsReceived: 1, // Has been reviewed
  },
  community: {
    members: 8, // Active community
    posts: 10, // Regular content
    moderators: 1, // At least 1 moderator
    recentActivityDays: 30, // Activity within 30 days
  },
  moderator: {
    communitiesModerated: 1,
    moderationActions: 3,
  },
  admin: {
    // No minimums
  },
  post: {
    comments: 2, // Posts get discussion
    hearts: 1, // Posts get engagement
  },
  meeting: {
    hasNotesIfCompleted: true,
  },
};

/**
 * Get requirements for specific seed mode
 */
export function getRequirementsForMode(
  mode: 'light' | 'medium' | 'heavy',
): MinimumRequirements {
  const base = DEFAULT_MINIMUM_REQUIREMENTS;

  switch (mode) {
    case 'light':
      return {
        ...base,
        client: {
          ...base.client,
          posts: 2,
          comments: 5,
          meetingsIfHasTherapist: 1,
        },
        therapist: {
          ...base.therapist,
          clientRelationships: 1,
          meetings: 2,
        },
        community: {
          ...base.community,
          members: 4,
          posts: 5,
        },
      };

    case 'medium':
      return base; // Use defaults

    case 'heavy':
      return {
        ...base,
        client: {
          ...base.client,
          posts: 10,
          comments: 20,
          meetingsIfHasTherapist: 8,
        },
        therapist: {
          ...base.therapist,
          clientRelationships: 5,
          meetings: 15,
          worksheetsCreated: 8,
        },
        community: {
          ...base.community,
          members: 20,
          posts: 30,
        },
      };
  }
}

/**
 * Entity priorities for seeding order
 * Higher priority = seed first (dependencies)
 */
export const SEEDING_PRIORITY = {
  users: 1, // Must exist first
  therapistAvailability: 2, // Needed for booking
  communities: 3,
  memberships: 4,
  clientTherapistRelationships: 5,
  posts: 6,
  comments: 7,
  meetings: 8,
  worksheets: 9,
  assessments: 10,
  messages: 11,
  reviews: 12,
  notifications: 13,
};
