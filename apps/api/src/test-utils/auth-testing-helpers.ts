/**
 * Authentication Testing Helpers for Security Guards
 * Specialized utilities for testing the new CommunityAccessGuard and role-based access control
 */

import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createMockPrismaService, TEST_USER_IDS } from './index';
import { MockBuilder } from './enhanced-test-helpers';

// Community and Room Test Data
export const TEST_COMMUNITY_IDS = {
  ANXIETY_SUPPORT: 'community-anxiety-123',
  DEPRESSION_HELP: 'community-depression-456',
  GENERAL_WELLNESS: 'community-wellness-789',
  PRIVATE_THERAPY: 'community-private-101',
};

export const TEST_ROOM_GROUP_IDS = {
  ANXIETY_GENERAL: 'room-group-anxiety-general-123',
  DEPRESSION_GENERAL: 'room-group-depression-general-456',
  WELLNESS_GENERAL: 'room-group-wellness-general-789',
  PRIVATE_SESSIONS: 'room-group-private-sessions-101',
};

export const TEST_ROOM_IDS = {
  ANXIETY_CHAT: 'room-anxiety-chat-123',
  ANXIETY_RESOURCES: 'room-anxiety-resources-456',
  DEPRESSION_CHAT: 'room-depression-chat-789',
  DEPRESSION_MODS_ONLY: 'room-depression-mods-101',
  WELLNESS_GENERAL: 'room-wellness-general-112',
  PRIVATE_ROOM: 'room-private-113',
};

export const TEST_POST_IDS = {
  ANXIETY_POST: 'post-anxiety-123',
  DEPRESSION_POST: 'post-depression-456',
  WELLNESS_POST: 'post-wellness-789',
  PRIVATE_POST: 'post-private-101',
};

export const TEST_COMMENT_IDS = {
  ANXIETY_COMMENT: 'comment-anxiety-123',
  DEPRESSION_COMMENT: 'comment-depression-456',
  WELLNESS_COMMENT: 'comment-wellness-789',
  PRIVATE_COMMENT: 'comment-private-101',
};

/**
 * Security Guard Testing Utilities
 */
class SecurityGuardTestUtils {
  /**
   * Creates a mock ExecutionContext for guard testing
   */
  static createMockExecutionContext(
    request: any,
    handler: any = {},
    controllerClass: any = {},
  ): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({} as any),
        getNext: () => jest.fn() as any,
      }),
      getHandler: () => handler,
      getClass: () => controllerClass,
      getArgs: () => [request, {}, jest.fn()] as any,
      getArgByIndex: (index: number) => [request, {}, jest.fn()][index] as any,
      switchToRpc: () => ({
        getContext: () => ({} as any),
        getData: () => ({} as any),
      }),
      switchToWs: () => ({
        getClient: () => ({} as any),
        getData: () => ({} as any),
        getPattern: () => ({} as any),
      }),
      getType: () => 'http' as any,
    };
  }

  /**
   * Creates a mock Reflector for metadata testing
   */
  static createMockReflector(metadata: Record<string, any> = {}): Reflector {
    const reflector = new Reflector();
    reflector.getAllAndOverride = jest.fn((key, targets) => {
      return metadata[key as string] || false;
    });
    return reflector;
  }

  /**
   * Creates a mock request with community/room context
   */
  static createMockRequestWithCommunityContext(
    userId: string,
    options: {
      communityId?: string;
      roomId?: string;
      postId?: string;
      commentId?: string;
      path?: string;
      method?: string;
      body?: any;
      params?: any;
    } = {},
  ) {
    const {
      communityId,
      roomId,
      postId,
      commentId,
      path = '/test',
      method = 'GET',
      body = {},
      params = {},
    } = options;

    return {
      userId,
      user: { userId },
      method,
      path,
      body: {
        ...body,
        ...(communityId && { communityId }),
        ...(roomId && { roomId }),
        ...(postId && { postId }),
      },
      params: {
        ...params,
        ...(communityId && { communityId }),
        ...(roomId && { roomId }),
        ...(postId && { id: postId }),
        ...(commentId && { id: commentId }),
      },
    };
  }

  /**
   * Creates comprehensive mock data for community hierarchy
   */
  static createMockCommunityData() {
    return {
      // Community with members
      community: {
        id: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
        name: 'Anxiety Support',
        description: 'Community for anxiety support',
        slug: 'anxiety-support',
        isPrivate: false,
        roomGroups: [
          {
            id: TEST_ROOM_GROUP_IDS.ANXIETY_GENERAL,
            name: 'General',
            order: 1,
            communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
            rooms: [
              {
                id: TEST_ROOM_IDS.ANXIETY_CHAT,
                name: 'General Chat',
                order: 1,
                postingRole: 'member',
                roomGroupId: TEST_ROOM_GROUP_IDS.ANXIETY_GENERAL,
              },
              {
                id: TEST_ROOM_IDS.ANXIETY_RESOURCES,
                name: 'Resources',
                order: 2,
                postingRole: 'moderator',
                roomGroupId: TEST_ROOM_GROUP_IDS.ANXIETY_GENERAL,
              },
            ],
          },
        ],
        memberships: [
          {
            id: 'membership-1',
            userId: TEST_USER_IDS.CLIENT,
            communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
            role: 'member',
            joinedAt: new Date(),
          },
          {
            id: 'membership-2',
            userId: TEST_USER_IDS.THERAPIST,
            communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
            role: 'moderator',
            joinedAt: new Date(),
          },
          {
            id: 'membership-3',
            userId: TEST_USER_IDS.ADMIN,
            communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
            role: 'admin',
            joinedAt: new Date(),
          },
        ],
      },

      // Room data
      room: {
        id: TEST_ROOM_IDS.ANXIETY_CHAT,
        name: 'General Chat',
        postingRole: 'member',
        roomGroup: {
          id: TEST_ROOM_GROUP_IDS.ANXIETY_GENERAL,
          community: {
            id: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
            memberships: [
              {
                userId: TEST_USER_IDS.CLIENT,
                role: 'member',
              },
            ],
          },
        },
      },

      // Post data
      post: {
        id: TEST_POST_IDS.ANXIETY_POST,
        title: 'Test Post',
        content: 'Test content',
        roomId: TEST_ROOM_IDS.ANXIETY_CHAT,
        room: {
          id: TEST_ROOM_IDS.ANXIETY_CHAT,
          postingRole: 'member',
          roomGroup: {
            community: {
              id: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
              memberships: [
                {
                  userId: TEST_USER_IDS.CLIENT,
                  role: 'member',
                },
              ],
            },
          },
        },
      },

      // Comment data
      comment: {
        id: TEST_COMMENT_IDS.ANXIETY_COMMENT,
        content: 'Test comment',
        post: {
          roomId: TEST_ROOM_IDS.ANXIETY_CHAT,
        },
      },

      // Memberships
      membership: {
        id: 'membership-client',
        userId: TEST_USER_IDS.CLIENT,
        communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
        role: 'member',
      },

      membershipModerator: {
        id: 'membership-moderator',
        userId: TEST_USER_IDS.THERAPIST,
        communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
        role: 'moderator',
      },

      membershipAdmin: {
        id: 'membership-admin',
        userId: TEST_USER_IDS.ADMIN,
        communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
        role: 'admin',
      },
    };
  }

  /**
   * Creates a mock Prisma service with community access control data
   */
  static createMockPrismaWithCommunityData() {
    const prismaService = createMockPrismaService();
    // Add missing room model to the mock
    (prismaService as any).room = {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const mockData = this.createMockCommunityData();

    // Setup community findUnique mock
    prismaService.community.findUnique.mockImplementation(({ where }) => {
      if (where.id === TEST_COMMUNITY_IDS.ANXIETY_SUPPORT) {
        return Promise.resolve(mockData.community);
      }
      return Promise.resolve(null);
    });

    // Setup room findUnique mock
    (prismaService as any).room.findUnique.mockImplementation(({ where, include }) => {
      if (where.id === TEST_ROOM_IDS.ANXIETY_CHAT) {
        return Promise.resolve(mockData.room);
      }
      return Promise.resolve(null);
    });

    // Setup post findUnique mock
    prismaService.post.findUnique.mockImplementation(({ where, include }) => {
      if (where.id === TEST_POST_IDS.ANXIETY_POST) {
        return Promise.resolve(mockData.post);
      }
      return Promise.resolve(null);
    });

    // Setup comment findUnique mock
    prismaService.comment.findUnique.mockImplementation(({ where, include }) => {
      if (where.id === TEST_COMMENT_IDS.ANXIETY_COMMENT) {
        return Promise.resolve(mockData.comment);
      }
      return Promise.resolve(null);
    });

    // Setup membership findFirst mock
    prismaService.membership.findFirst.mockImplementation(({ where }) => {
      if (where.userId === TEST_USER_IDS.CLIENT && where.communityId === TEST_COMMUNITY_IDS.ANXIETY_SUPPORT) {
        return Promise.resolve(mockData.membership);
      }
      if (where.userId === TEST_USER_IDS.THERAPIST && where.communityId === TEST_COMMUNITY_IDS.ANXIETY_SUPPORT) {
        return Promise.resolve(mockData.membershipModerator);
      }
      if (where.userId === TEST_USER_IDS.ADMIN && where.communityId === TEST_COMMUNITY_IDS.ANXIETY_SUPPORT) {
        return Promise.resolve(mockData.membershipAdmin);
      }
      return Promise.resolve(null);
    });

    return prismaService;
  }

  /**
   * Creates test scenarios for various access control situations
   */
  static createAccessControlTestScenarios() {
    return {
      // Valid access scenarios
      clientMemberAccess: {
        userId: TEST_USER_IDS.CLIENT,
        communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
        roomId: TEST_ROOM_IDS.ANXIETY_CHAT,
        expectedRole: 'member',
        shouldHaveAccess: true,
        canPost: true, // Member can post in member room
      },

      therapistModeratorAccess: {
        userId: TEST_USER_IDS.THERAPIST,
        communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
        roomId: TEST_ROOM_IDS.ANXIETY_RESOURCES,
        expectedRole: 'moderator',
        shouldHaveAccess: true,
        canPost: true, // Moderator can post in moderator room
      },

      adminFullAccess: {
        userId: TEST_USER_IDS.ADMIN,
        communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
        roomId: TEST_ROOM_IDS.ANXIETY_RESOURCES,
        expectedRole: 'admin',
        shouldHaveAccess: true,
        canPost: true, // Admin can post anywhere
      },

      // Invalid access scenarios
      nonMemberAccess: {
        userId: 'non-member-user-123',
        communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
        roomId: TEST_ROOM_IDS.ANXIETY_CHAT,
        expectedRole: null,
        shouldHaveAccess: false,
        canPost: false,
      },

      memberInModeratorRoom: {
        userId: TEST_USER_IDS.CLIENT,
        communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
        roomId: TEST_ROOM_IDS.ANXIETY_RESOURCES,
        expectedRole: 'member',
        shouldHaveAccess: true, // Can access to read
        canPost: false, // But cannot post in moderator room
      },
    };
  }

  /**
   * Creates a mock request for testing specific guard scenarios
   */
  static createGuardTestRequest(
    scenario: ReturnType<typeof SecurityGuardTestUtils.createAccessControlTestScenarios>[keyof ReturnType<typeof SecurityGuardTestUtils.createAccessControlTestScenarios>],
    options: {
      method?: string;
      path?: string;
      postId?: string;
      commentId?: string;
    } = {},
  ) {
    const { method = 'GET', path = '/test', postId, commentId } = options;

    return this.createMockRequestWithCommunityContext(scenario.userId, {
      communityId: scenario.communityId,
      roomId: scenario.roomId,
      postId,
      commentId,
      method,
      path,
    });
  }
}

/**
 * Role-based Testing Utilities
 */
class RoleBasedTestUtils {
  /**
   * Tests a function with different user roles
   */
  static async testWithRoles(
    testFunction: (userId: string, role: string) => Promise<any>,
    expectedResults: Record<string, any>,
  ) {
    const roles = [
      { userId: TEST_USER_IDS.CLIENT, role: 'client' },
      { userId: TEST_USER_IDS.THERAPIST, role: 'therapist' },
      { userId: TEST_USER_IDS.ADMIN, role: 'admin' },
      { userId: TEST_USER_IDS.MODERATOR, role: 'moderator' },
    ];

    for (const { userId, role } of roles) {
      const result = await testFunction(userId, role);
      const expected = expectedResults[role];
      
      if (expected !== undefined) {
        expect(result).toEqual(expected);
      }
    }
  }

  /**
   * Tests authorization with different permission levels
   */
  static async testAuthorizationLevels(
    testFunction: (userId: string, role: string) => Promise<boolean>,
    minimumRole: 'member' | 'moderator' | 'admin',
  ) {
    const roleHierarchy = {
      member: 0,
      moderator: 1,
      admin: 2,
    };

    const tests = [
      { userId: TEST_USER_IDS.CLIENT, role: 'member', level: 0 },
      { userId: TEST_USER_IDS.THERAPIST, role: 'moderator', level: 1 },
      { userId: TEST_USER_IDS.ADMIN, role: 'admin', level: 2 },
    ];

    const minimumLevel = roleHierarchy[minimumRole];

    for (const { userId, role, level } of tests) {
      const result = await testFunction(userId, role);
      const shouldHaveAccess = level >= minimumLevel;
      
      expect(result).toBe(shouldHaveAccess);
    }
  }

  /**
   * Creates mock authentication contexts for different roles
   */
  static createRoleAuthContexts() {
    return {
      client: MockBuilder.createAuthContext('client', TEST_USER_IDS.CLIENT),
      therapist: MockBuilder.createAuthContext('therapist', TEST_USER_IDS.THERAPIST),
      admin: MockBuilder.createAuthContext('admin', TEST_USER_IDS.ADMIN),
      moderator: MockBuilder.createAuthContext('moderator', TEST_USER_IDS.MODERATOR),
    };
  }
}

/**
 * Community Access Guard Test Utilities
 */
class CommunityAccessGuardTestUtils {
  /**
   * Creates a comprehensive test suite for the CommunityAccessGuard
   */
  static createGuardTestSuite() {
    return {
      // Test community membership validation
      testCommunityMembership: async (guard: any, scenario: any) => {
        const request = SecurityGuardTestUtils.createGuardTestRequest(scenario);
        const context = SecurityGuardTestUtils.createMockExecutionContext(request);
        const reflector = SecurityGuardTestUtils.createMockReflector({
          require_community_membership: true,
        });

        guard.reflector = reflector;
        guard.prisma = SecurityGuardTestUtils.createMockPrismaWithCommunityData();

        if (scenario.shouldHaveAccess) {
          await expect(guard.canActivate(context)).resolves.toBe(true);
        } else {
          await expect(guard.canActivate(context)).rejects.toThrow();
        }
      },

      // Test room access validation
      testRoomAccess: async (guard: any, scenario: any) => {
        const request = SecurityGuardTestUtils.createGuardTestRequest(scenario);
        const context = SecurityGuardTestUtils.createMockExecutionContext(request);
        const reflector = SecurityGuardTestUtils.createMockReflector({
          require_room_access: true,
        });

        guard.reflector = reflector;
        guard.prisma = SecurityGuardTestUtils.createMockPrismaWithCommunityData();

        if (scenario.shouldHaveAccess) {
          await expect(guard.canActivate(context)).resolves.toBe(true);
        } else {
          await expect(guard.canActivate(context)).rejects.toThrow();
        }
      },

      // Test posting permission validation
      testPostingPermission: async (guard: any, scenario: any) => {
        const request = SecurityGuardTestUtils.createGuardTestRequest(scenario, {
          method: 'POST',
          path: '/posts',
        });
        const context = SecurityGuardTestUtils.createMockExecutionContext(request);
        const reflector = SecurityGuardTestUtils.createMockReflector({
          require_posting_role: true,
        });

        guard.reflector = reflector;
        guard.prisma = SecurityGuardTestUtils.createMockPrismaWithCommunityData();

        if (scenario.canPost) {
          await expect(guard.canActivate(context)).resolves.toBe(true);
        } else {
          await expect(guard.canActivate(context)).rejects.toThrow();
        }
      },

      // Test moderator permission validation
      testModeratorPermission: async (guard: any, scenario: any) => {
        const request = SecurityGuardTestUtils.createGuardTestRequest(scenario);
        const context = SecurityGuardTestUtils.createMockExecutionContext(request);
        const reflector = SecurityGuardTestUtils.createMockReflector({
          require_community_moderator: true,
        });

        guard.reflector = reflector;
        guard.prisma = SecurityGuardTestUtils.createMockPrismaWithCommunityData();

        const isModerator = scenario.expectedRole === 'moderator' || scenario.expectedRole === 'admin';
        
        if (isModerator) {
          await expect(guard.canActivate(context)).resolves.toBe(true);
        } else {
          await expect(guard.canActivate(context)).rejects.toThrow();
        }
      },
    };
  }
}

// Export all utilities
export {
  MockBuilder,
  SecurityGuardTestUtils,
  RoleBasedTestUtils,
  CommunityAccessGuardTestUtils,
};