import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { CommunityAccessGuard } from './community-access.guard';
import { PrismaService } from '../../providers/prisma-client.provider';
import {
  SecurityGuardTestUtils,
  CommunityAccessGuardTestUtils,
  TEST_USER_IDS,
  TEST_COMMUNITY_IDS,
  TEST_ROOM_IDS,
  TEST_POST_IDS,
  TEST_COMMENT_IDS,
} from '../../test-utils/auth-testing-helpers';

describe('CommunityAccessGuard', () => {
  let guard: CommunityAccessGuard;
  let prismaService: PrismaService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityAccessGuard,
        {
          provide: PrismaService,
          useValue: SecurityGuardTestUtils.createMockPrismaWithCommunityData(),
        },
        {
          provide: Reflector,
          useValue: SecurityGuardTestUtils.createMockReflector(),
        },
      ],
    }).compile();

    guard = module.get<CommunityAccessGuard>(CommunityAccessGuard);
    prismaService = module.get<PrismaService>(PrismaService);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when no metadata is set', async () => {
      // Arrange
      const request = SecurityGuardTestUtils.createMockRequestWithCommunityContext(TEST_USER_IDS.CLIENT);
      const context = SecurityGuardTestUtils.createMockExecutionContext(request);

      reflector.getAllAndOverride = jest.fn().mockReturnValue(false);

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user is not authenticated', async () => {
      // Arrange
      const request = { userId: null };
      const context = SecurityGuardTestUtils.createMockExecutionContext(request);

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Community Membership Validation', () => {
    it('should allow access for valid community member', async () => {
      // Arrange
      const testScenarios = SecurityGuardTestUtils.createAccessControlTestScenarios();
      const testSuite = CommunityAccessGuardTestUtils.createGuardTestSuite();

      // Act & Assert
      await testSuite.testCommunityMembership(guard, testScenarios.clientMemberAccess);
    });

    it('should deny access for non-member', async () => {
      // Arrange
      const testScenarios = SecurityGuardTestUtils.createAccessControlTestScenarios();
      const testSuite = CommunityAccessGuardTestUtils.createGuardTestSuite();

      // Act & Assert
      await testSuite.testCommunityMembership(guard, testScenarios.nonMemberAccess);
    });

    it('should validate community membership from different request contexts', async () => {
      // Test extracting community ID from different places
      const testCases = [
        {
          name: 'from params.communityId',
          request: SecurityGuardTestUtils.createMockRequestWithCommunityContext(TEST_USER_IDS.CLIENT, {
            communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
          }),
        },
        {
          name: 'from body.communityId',
          request: SecurityGuardTestUtils.createMockRequestWithCommunityContext(TEST_USER_IDS.CLIENT, {
            body: { communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT },
          }),
        },
        {
          name: 'from roomId lookup',
          request: SecurityGuardTestUtils.createMockRequestWithCommunityContext(TEST_USER_IDS.CLIENT, {
            roomId: TEST_ROOM_IDS.ANXIETY_CHAT,
          }),
        },
      ];

      for (const testCase of testCases) {
        const context = SecurityGuardTestUtils.createMockExecutionContext(testCase.request);
        reflector.getAllAndOverride = jest.fn().mockReturnValue(true);

        await expect(guard.canActivate(context)).resolves.toBe(true);
      }
    });
  });

  describe('Room Access Validation', () => {
    it('should allow room access for community member', async () => {
      // Arrange
      const testScenarios = SecurityGuardTestUtils.createAccessControlTestScenarios();
      const testSuite = CommunityAccessGuardTestUtils.createGuardTestSuite();

      // Act & Assert
      await testSuite.testRoomAccess(guard, testScenarios.clientMemberAccess);
    });

    it('should deny room access for non-member', async () => {
      // Arrange
      const testScenarios = SecurityGuardTestUtils.createAccessControlTestScenarios();
      const testSuite = CommunityAccessGuardTestUtils.createGuardTestSuite();

      // Act & Assert
      await testSuite.testRoomAccess(guard, testScenarios.nonMemberAccess);
    });

    it('should throw NotFoundException for non-existent room', async () => {
      // Arrange
      const request = SecurityGuardTestUtils.createMockRequestWithCommunityContext(TEST_USER_IDS.CLIENT, {
        roomId: 'non-existent-room',
      });
      const context = SecurityGuardTestUtils.createMockExecutionContext(request);

      reflector.getAllAndOverride = jest.fn().mockReturnValue(true);
      
      // Mock prisma to return null for non-existent room
      prismaService.room.findUnique = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Posting Permission Validation', () => {
    it('should allow posting for member in member room', async () => {
      // Arrange
      const testScenarios = SecurityGuardTestUtils.createAccessControlTestScenarios();
      const testSuite = CommunityAccessGuardTestUtils.createGuardTestSuite();

      // Act & Assert
      await testSuite.testPostingPermission(guard, testScenarios.clientMemberAccess);
    });

    it('should deny posting for member in moderator room', async () => {
      // Arrange
      const testScenarios = SecurityGuardTestUtils.createAccessControlTestScenarios();
      const testSuite = CommunityAccessGuardTestUtils.createGuardTestSuite();

      // Act & Assert
      await testSuite.testPostingPermission(guard, testScenarios.memberInModeratorRoom);
    });

    it('should allow posting for moderator in moderator room', async () => {
      // Arrange
      const testScenarios = SecurityGuardTestUtils.createAccessControlTestScenarios();
      const testSuite = CommunityAccessGuardTestUtils.createGuardTestSuite();

      // Act & Assert
      await testSuite.testPostingPermission(guard, testScenarios.therapistModeratorAccess);
    });

    it('should allow posting for admin in any room', async () => {
      // Arrange
      const testScenarios = SecurityGuardTestUtils.createAccessControlTestScenarios();
      const testSuite = CommunityAccessGuardTestUtils.createGuardTestSuite();

      // Act & Assert
      await testSuite.testPostingPermission(guard, testScenarios.adminFullAccess);
    });

    it('should test role hierarchy correctly', async () => {
      // Test that role hierarchy works: admin > moderator > member
      const roomWithModeratorPosting = {
        id: TEST_ROOM_IDS.ANXIETY_RESOURCES,
        postingRole: 'moderator',
        roomGroup: {
          community: {
            id: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
            memberships: [],
          },
        },
      };

      const testRoles = [
        { userId: TEST_USER_IDS.CLIENT, role: 'member', canPost: false },
        { userId: TEST_USER_IDS.THERAPIST, role: 'moderator', canPost: true },
        { userId: TEST_USER_IDS.ADMIN, role: 'admin', canPost: true },
      ];

      for (const testRole of testRoles) {
        // Set up membership (role determined by user's global role and moderator assignment)
        roomWithModeratorPosting.roomGroup.community.memberships = [
          { userId: testRole.userId },
        ];

        // Mock user's global role
        prismaService.user.findUnique = jest.fn().mockResolvedValue({
          role: testRole.role === 'admin' ? 'admin' : testRole.role === 'moderator' ? 'moderator' : 'client',
        });

        // Mock moderator assignment if needed
        prismaService.moderatorCommunity.findFirst = jest.fn().mockResolvedValue(
          testRole.role === 'moderator' ? { moderatorId: testRole.userId } : null
        );

        prismaService.room.findUnique = jest.fn().mockResolvedValue(roomWithModeratorPosting);

        const request = SecurityGuardTestUtils.createMockRequestWithCommunityContext(testRole.userId, {
          roomId: TEST_ROOM_IDS.ANXIETY_RESOURCES,
          method: 'POST',
        });
        const context = SecurityGuardTestUtils.createMockExecutionContext(request);

        reflector.getAllAndOverride = jest.fn().mockReturnValue(true);

        if (testRole.canPost) {
          await expect(guard.canActivate(context)).resolves.toBe(true);
        } else {
          await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
        }
      }
    });
  });

  describe('Moderator Permission Validation', () => {
    it('should allow moderator access for moderator user', async () => {
      // Arrange
      const testScenarios = SecurityGuardTestUtils.createAccessControlTestScenarios();
      const testSuite = CommunityAccessGuardTestUtils.createGuardTestSuite();

      // Act & Assert
      await testSuite.testModeratorPermission(guard, testScenarios.therapistModeratorAccess);
    });

    it('should allow admin access for admin user', async () => {
      // Arrange
      const testScenarios = SecurityGuardTestUtils.createAccessControlTestScenarios();
      const testSuite = CommunityAccessGuardTestUtils.createGuardTestSuite();

      // Act & Assert
      await testSuite.testModeratorPermission(guard, testScenarios.adminFullAccess);
    });

    it('should deny moderator access for regular member', async () => {
      // Arrange
      const testScenarios = SecurityGuardTestUtils.createAccessControlTestScenarios();
      const testSuite = CommunityAccessGuardTestUtils.createGuardTestSuite();

      // Act & Assert
      await testSuite.testModeratorPermission(guard, testScenarios.clientMemberAccess);
    });
  });

  describe('Context Extraction', () => {
    it('should extract community ID from post context', async () => {
      // Arrange
      const request = SecurityGuardTestUtils.createMockRequestWithCommunityContext(TEST_USER_IDS.CLIENT, {
        postId: TEST_POST_IDS.ANXIETY_POST,
        path: '/posts/some-endpoint',
      });
      const context = SecurityGuardTestUtils.createMockExecutionContext(request);

      reflector.getAllAndOverride = jest.fn().mockReturnValue(true);

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(prismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: TEST_POST_IDS.ANXIETY_POST },
        include: {
          room: {
            include: {
              roomGroup: {
                include: {
                  community: true,
                },
              },
            },
          },
        },
      });
    });

    it('should extract room ID from comment context', async () => {
      // Arrange
      const request = SecurityGuardTestUtils.createMockRequestWithCommunityContext(TEST_USER_IDS.CLIENT, {
        commentId: TEST_COMMENT_IDS.ANXIETY_COMMENT,
        path: '/comments/some-endpoint',
      });
      const context = SecurityGuardTestUtils.createMockExecutionContext(request);

      reflector.getAllAndOverride = jest.fn().mockReturnValue(true);

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(prismaService.comment.findUnique).toHaveBeenCalledWith({
        where: { id: TEST_COMMENT_IDS.ANXIETY_COMMENT },
        include: {
          post: {
            select: { roomId: true },
          },
        },
      });
    });

    it('should handle missing context gracefully', async () => {
      // Arrange
      const request = SecurityGuardTestUtils.createMockRequestWithCommunityContext(TEST_USER_IDS.CLIENT, {
        // No community, room, post, or comment context
      });
      const context = SecurityGuardTestUtils.createMockExecutionContext(request);

      reflector.getAllAndOverride = jest.fn().mockReturnValue(true);

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true); // Should pass when no context to validate
    });
  });

  describe('Helper Methods', () => {
    it('should get user community role correctly', async () => {
      // Arrange
      const mockMembership = {
        userId: TEST_USER_IDS.THERAPIST,
        communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
      };
      const mockUser = {
        role: 'moderator',
      };
      const mockModeratorCommunity = {
        moderatorId: TEST_USER_IDS.THERAPIST,
        communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
      };

      prismaService.membership.findFirst = jest.fn().mockResolvedValue(mockMembership);
      prismaService.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      prismaService.moderatorCommunity.findFirst = jest.fn().mockResolvedValue(mockModeratorCommunity);

      // Act
      const role = await guard.getUserCommunityRole(TEST_USER_IDS.THERAPIST, TEST_COMMUNITY_IDS.ANXIETY_SUPPORT);

      // Assert
      expect(role).toBe('moderator');
      expect(prismaService.membership.findFirst).toHaveBeenCalledWith({
        where: {
          userId: TEST_USER_IDS.THERAPIST,
          communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
        },
      });
    });

    it('should check moderation capabilities correctly', async () => {
      // Arrange
      const mockUser = {
        role: 'moderator',
      };
      prismaService.membership.findFirst = jest.fn().mockResolvedValue(mockMembership);

      // Act
      const canModerate = await guard.canModerate(TEST_USER_IDS.THERAPIST, TEST_COMMUNITY_IDS.ANXIETY_SUPPORT);

      // Assert
      expect(canModerate).toBe(true);
    });

    it('should return false for non-moderator in canModerate', async () => {
      // Arrange
      prismaService.membership.findFirst = jest.fn().mockResolvedValue(null);

      // Act
      const canModerate = await guard.canModerate(TEST_USER_IDS.CLIENT, TEST_COMMUNITY_IDS.ANXIETY_SUPPORT);

      // Assert
      expect(canModerate).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      const request = SecurityGuardTestUtils.createMockRequestWithCommunityContext(TEST_USER_IDS.CLIENT, {
        communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
      });
      const context = SecurityGuardTestUtils.createMockExecutionContext(request);

      reflector.getAllAndOverride = jest.fn().mockReturnValue(true);
      prismaService.membership.findFirst = jest.fn().mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow('Database error');
    });

    it('should handle network timeouts', async () => {
      // Arrange
      const request = SecurityGuardTestUtils.createMockRequestWithCommunityContext(TEST_USER_IDS.CLIENT, {
        roomId: TEST_ROOM_IDS.ANXIETY_CHAT,
      });
      const context = SecurityGuardTestUtils.createMockExecutionContext(request);

      reflector.getAllAndOverride = jest.fn().mockReturnValue(true);
      prismaService.room.findUnique = jest.fn().mockRejectedValue(new Error('Connection timeout'));

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow('Connection timeout');
    });
  });

  describe('Multiple Guard Conditions', () => {
    it('should handle multiple guard conditions simultaneously', async () => {
      // Arrange
      const request = SecurityGuardTestUtils.createMockRequestWithCommunityContext(TEST_USER_IDS.CLIENT, {
        communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
        roomId: TEST_ROOM_IDS.ANXIETY_CHAT,
      });
      const context = SecurityGuardTestUtils.createMockExecutionContext(request);

      reflector.getAllAndOverride = jest.fn().mockImplementation((key) => {
        return key === 'require_community_membership' || key === 'require_room_access';
      });

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should fail if any guard condition fails', async () => {
      // Arrange - User who is not a community member
      const request = SecurityGuardTestUtils.createMockRequestWithCommunityContext('non-member-user', {
        communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
        roomId: TEST_ROOM_IDS.ANXIETY_CHAT,
      });
      const context = SecurityGuardTestUtils.createMockExecutionContext(request);

      reflector.getAllAndOverride = jest.fn().mockImplementation((key) => {
        return key === 'require_community_membership' || key === 'require_room_access';
      });

      // Mock no membership found
      prismaService.membership.findFirst = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Performance Tests', () => {
    it('should complete validation within acceptable time', async () => {
      // Arrange
      const request = SecurityGuardTestUtils.createMockRequestWithCommunityContext(TEST_USER_IDS.CLIENT, {
        communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
      });
      const context = SecurityGuardTestUtils.createMockExecutionContext(request);

      reflector.getAllAndOverride = jest.fn().mockReturnValue(true);

      // Act
      const startTime = Date.now();
      await guard.canActivate(context);
      const endTime = Date.now();

      // Assert
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });
  });
});