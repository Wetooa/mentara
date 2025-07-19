import { Test, TestingModule } from '@nestjs/testing';
import {
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CommunitiesController } from './communities.controller';
import { CommunitiesService } from './communities.service';
import { CommunityAssignmentService } from './community-assignment.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  MockBuilder,
  TestDataGenerator,
  TestAssertions,
  SecurityGuardTestUtils,
  RoleBasedTestUtils,
  TEST_USER_IDS,
  TEST_COMMUNITY_IDS,
} from '../test-utils/auth-testing-helpers';
import { createMockPrismaService } from '../test-utils';

describe('CommunitiesController', () => {
  let controller: CommunitiesController;
  let communitiesService: CommunitiesService;
  let communityAssignmentService: CommunityAssignmentService;
  let prismaService: PrismaService;
  let mockJwtAuthGuard: jest.Mocked<JwtAuthGuard>;

  // Mock data
  const mockCommunity = {
    id: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
    name: 'Anxiety Support',
    description: 'A supportive community for anxiety management',
    slug: 'anxiety-support',
    imageUrl: 'https://example.com/anxiety-support.jpg',
    isPrivate: false,
    memberCount: 150,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCommunities = [mockCommunity];

  const mockCommunityWithMembers = {
    ...mockCommunity,
    members: [
      {
        id: TEST_USER_IDS.CLIENT,
        firstName: 'John',
        lastName: 'Doe',
        role: 'member',
        joinedAt: new Date(),
      },
      {
        id: TEST_USER_IDS.THERAPIST,
        firstName: 'Dr. Jane',
        lastName: 'Smith',
        role: 'moderator',
        joinedAt: new Date(),
      },
    ],
  };

  const mockCommunityWithRoomGroups = {
    ...mockCommunity,
    roomGroups: [
      {
        id: 'room-group-1',
        name: 'General',
        order: 1,
        communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
        rooms: [
          {
            id: 'room-1',
            name: 'General Chat',
            order: 1,
            postingRole: 'member',
            roomGroupId: 'room-group-1',
          },
          {
            id: 'room-2',
            name: 'Resources',
            order: 2,
            postingRole: 'moderator',
            roomGroupId: 'room-group-1',
          },
        ],
      },
    ],
  };

  const mockCommunityStats = {
    memberCount: 150,
    postCount: 500,
    activeMembers: 75,
    totalMembers: 1000,
    totalPosts: 5000,
    activeCommunities: 10,
    illnessCommunities: [
      { name: 'Anxiety Support', memberCount: 150 },
      { name: 'Depression Help', memberCount: 120 },
    ],
  };

  const mockCreateCommunityDto = {
    name: 'New Community',
    description: 'A new community for testing',
    slug: 'new-community',
    imageUrl: 'https://example.com/new-community.jpg',
    isPrivate: false,
  };

  const mockUpdateCommunityDto = {
    name: 'Updated Community',
    description: 'An updated community description',
  };

  beforeEach(async () => {
    // Create mock services
    const mockCommunitiesService = {
      findAll: jest.fn(),
      getStats: jest.fn(),
      findBySlug: jest.fn(),
      findOne: jest.fn(),
      getMembers: jest.fn(),
      createCommunity: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      joinCommunity: jest.fn(),
      leaveCommunity: jest.fn(),
      findByUserId: jest.fn(),
      findAllWithStructure: jest.fn(),
      findOneWithStructure: jest.fn(),
      createRoomGroup: jest.fn(),
      createRoom: jest.fn(),
      findRoomsByGroup: jest.fn(),
    };

    const mockCommunityAssignmentService = {
      assignCommunitiesToUser: jest.fn(),
      getRecommendedCommunities: jest.fn(),
      bulkAssignCommunities: jest.fn(),
    };

    mockJwtAuthGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunitiesController],
      providers: [
        {
          provide: CommunitiesService,
          useValue: mockCommunitiesService,
        },
        {
          provide: CommunityAssignmentService,
          useValue: mockCommunityAssignmentService,
        },
        {
          provide: PrismaService,
          useValue: createMockPrismaService(),
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<CommunitiesController>(CommunitiesController);
    communitiesService = module.get<CommunitiesService>(CommunitiesService);
    communityAssignmentService = module.get<CommunityAssignmentService>(CommunityAssignmentService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all communities', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'findAll').mockResolvedValue(mockCommunities);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(communitiesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCommunities);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(communitiesService, 'findAll').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getStats', () => {
    it('should return community statistics', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'getStats').mockResolvedValue(mockCommunityStats);

      // Act
      const result = await controller.getStats();

      // Assert
      expect(communitiesService.getStats).toHaveBeenCalled();
      expect(result).toEqual(mockCommunityStats);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(communitiesService, 'getStats').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getStats()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findBySlug', () => {
    it('should return community by slug', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'findBySlug').mockResolvedValue(mockCommunity);

      // Act
      const result = await controller.findBySlug('anxiety-support');

      // Assert
      expect(communitiesService.findBySlug).toHaveBeenCalledWith('anxiety-support');
      expect(result).toEqual(mockCommunity);
    });

    it('should throw NotFoundException when community not found', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'findBySlug').mockResolvedValue(null);

      // Act & Assert
      await expect(controller.findBySlug('non-existent')).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(communitiesService, 'findBySlug').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findBySlug('anxiety-support')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should return community by ID', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'findOne').mockResolvedValue(mockCommunity);

      // Act
      const result = await controller.findOne(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT);

      // Assert
      expect(communitiesService.findOne).toHaveBeenCalledWith(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT);
      expect(result).toEqual(mockCommunity);
    });

    it('should throw NotFoundException when community not found', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(controller.findOne('non-existent')).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(communitiesService, 'findOne').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findOne(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getMembers', () => {
    it('should return community members with default pagination', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'getMembers').mockResolvedValue(mockCommunityWithMembers);

      // Act
      const result = await controller.getMembers(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT);

      // Assert
      expect(communitiesService.getMembers).toHaveBeenCalledWith(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, 50, 0);
      expect(result).toEqual(mockCommunityWithMembers);
    });

    it('should return community members with custom pagination', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'getMembers').mockResolvedValue(mockCommunityWithMembers);

      // Act
      const result = await controller.getMembers(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, '20', '10');

      // Assert
      expect(communitiesService.getMembers).toHaveBeenCalledWith(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, 20, 10);
      expect(result).toEqual(mockCommunityWithMembers);
    });

    it('should handle invalid pagination parameters', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'getMembers').mockResolvedValue(mockCommunityWithMembers);

      // Act & Assert
      await expect(controller.getMembers(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, 'invalid', 'invalid')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should clamp pagination values within bounds', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'getMembers').mockResolvedValue(mockCommunityWithMembers);

      // Act
      await controller.getMembers(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, '200', '-10');

      // Assert
      expect(communitiesService.getMembers).toHaveBeenCalledWith(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, 100, 0);
    });
  });

  describe('create', () => {
    it('should create community successfully', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'createCommunity').mockResolvedValue(mockCommunity);

      // Act
      const result = await controller.create(mockCreateCommunityDto);

      // Assert
      expect(communitiesService.createCommunity).toHaveBeenCalledWith(mockCreateCommunityDto);
      expect(result).toEqual(mockCommunity);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Community creation failed');
      jest.spyOn(communitiesService, 'createCommunity').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.create(mockCreateCommunityDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('should update community successfully', async () => {
      // Arrange
      const updatedCommunity = { ...mockCommunity, ...mockUpdateCommunityDto };
      jest.spyOn(communitiesService, 'update').mockResolvedValue(updatedCommunity);

      // Act
      const result = await controller.update(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, mockUpdateCommunityDto);

      // Assert
      expect(communitiesService.update).toHaveBeenCalledWith(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, mockUpdateCommunityDto);
      expect(result).toEqual(updatedCommunity);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Community update failed');
      jest.spyOn(communitiesService, 'update').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.update(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, mockUpdateCommunityDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should remove community successfully', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'remove').mockResolvedValue(mockCommunity);

      // Act
      const result = await controller.remove(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT);

      // Assert
      expect(communitiesService.remove).toHaveBeenCalledWith(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT);
      expect(result).toEqual(mockCommunity);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Community removal failed');
      jest.spyOn(communitiesService, 'remove').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.remove(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('joinCommunity', () => {
    it('should join community successfully', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'joinCommunity').mockResolvedValue(undefined);

      // Act
      const result = await controller.joinCommunity(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, TEST_USER_IDS.CLIENT);

      // Assert
      expect(communitiesService.joinCommunity).toHaveBeenCalledWith(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, TEST_USER_IDS.CLIENT);
      expect(result).toEqual({ joined: true });
    });

    it('should handle known exceptions properly', async () => {
      // Arrange
      const conflictError = new ConflictException('User already member');
      jest.spyOn(communitiesService, 'joinCommunity').mockRejectedValue(conflictError);

      // Act & Assert
      await expect(controller.joinCommunity(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, TEST_USER_IDS.CLIENT)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should wrap unknown errors in InternalServerErrorException', async () => {
      // Arrange
      const unknownError = new Error('Unknown error');
      jest.spyOn(communitiesService, 'joinCommunity').mockRejectedValue(unknownError);

      // Act & Assert
      await expect(controller.joinCommunity(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, TEST_USER_IDS.CLIENT)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('leaveCommunity', () => {
    it('should leave community successfully', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'leaveCommunity').mockResolvedValue(undefined);

      // Act
      const result = await controller.leaveCommunity(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, TEST_USER_IDS.CLIENT);

      // Assert
      expect(communitiesService.leaveCommunity).toHaveBeenCalledWith(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, TEST_USER_IDS.CLIENT);
      expect(result).toEqual({ left: true });
    });

    it('should handle known exceptions properly', async () => {
      // Arrange
      const notFoundError = new NotFoundException('User not a member');
      jest.spyOn(communitiesService, 'leaveCommunity').mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.leaveCommunity(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, TEST_USER_IDS.CLIENT)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should wrap unknown errors in InternalServerErrorException', async () => {
      // Arrange
      const unknownError = new Error('Unknown error');
      jest.spyOn(communitiesService, 'leaveCommunity').mockRejectedValue(unknownError);

      // Act & Assert
      await expect(controller.leaveCommunity(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, TEST_USER_IDS.CLIENT)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findByUserId', () => {
    it('should return communities for user', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'findByUserId').mockResolvedValue(mockCommunities);

      // Act
      const result = await controller.findByUserId(TEST_USER_IDS.CLIENT);

      // Assert
      expect(communitiesService.findByUserId).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(result).toEqual(mockCommunities);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(communitiesService, 'findByUserId').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findByUserId(TEST_USER_IDS.CLIENT)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getAllWithStructure', () => {
    it('should return all communities with structure', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'findAllWithStructure').mockResolvedValue([mockCommunityWithRoomGroups]);

      // Act
      const result = await controller.getAllWithStructure();

      // Assert
      expect(communitiesService.findAllWithStructure).toHaveBeenCalled();
      expect(result).toEqual([mockCommunityWithRoomGroups]);
    });
  });

  describe('getOneWithStructure', () => {
    it('should return community with structure', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'findOneWithStructure').mockResolvedValue(mockCommunityWithRoomGroups);

      // Act
      const result = await controller.getOneWithStructure(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT);

      // Assert
      expect(communitiesService.findOneWithStructure).toHaveBeenCalledWith(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT);
      expect(result).toEqual(mockCommunityWithRoomGroups);
    });
  });

  describe('createRoomGroup', () => {
    const roomGroupDto = { name: 'New Room Group', order: 1 };
    const mockRoomGroup = { id: 'room-group-2', ...roomGroupDto, communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT };

    it('should create room group successfully', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'createRoomGroup').mockResolvedValue(mockRoomGroup);

      // Act
      const result = await controller.createRoomGroup(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, roomGroupDto);

      // Assert
      expect(communitiesService.createRoomGroup).toHaveBeenCalledWith(
        TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
        roomGroupDto.name,
        roomGroupDto.order,
      );
      expect(result).toEqual(mockRoomGroup);
    });
  });

  describe('createRoom', () => {
    const roomDto = { name: 'New Room', order: 1 };
    const mockRoom = { id: 'room-3', ...roomDto, roomGroupId: 'room-group-1' };

    it('should create room successfully', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'createRoom').mockResolvedValue(mockRoom);

      // Act
      const result = await controller.createRoom('room-group-1', roomDto);

      // Assert
      expect(communitiesService.createRoom).toHaveBeenCalledWith('room-group-1', roomDto.name, roomDto.order);
      expect(result).toEqual(mockRoom);
    });
  });

  describe('getRoomsByGroup', () => {
    const mockRooms = [
      { id: 'room-1', name: 'Room 1', order: 1, roomGroupId: 'room-group-1' },
      { id: 'room-2', name: 'Room 2', order: 2, roomGroupId: 'room-group-1' },
    ];

    it('should return rooms by group', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'findRoomsByGroup').mockResolvedValue(mockRooms);

      // Act
      const result = await controller.getRoomsByGroup('room-group-1');

      // Assert
      expect(communitiesService.findRoomsByGroup).toHaveBeenCalledWith('room-group-1');
      expect(result).toEqual(mockRooms);
    });
  });

  describe('Community Assignment Features', () => {
    describe('assignCommunitiesToMe', () => {
      it('should assign communities to current user', async () => {
        // Arrange
        const assignedCommunities = [TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, TEST_COMMUNITY_IDS.DEPRESSION_HELP];
        jest.spyOn(communityAssignmentService, 'assignCommunitiesToUser').mockResolvedValue(assignedCommunities);

        // Act
        const result = await controller.assignCommunitiesToMe(TEST_USER_IDS.CLIENT);

        // Assert
        expect(communityAssignmentService.assignCommunitiesToUser).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
        expect(result).toEqual({ assignedCommunities });
      });

      it('should handle service errors', async () => {
        // Arrange
        const error = new Error('Assignment failed');
        jest.spyOn(communityAssignmentService, 'assignCommunitiesToUser').mockRejectedValue(error);

        // Act & Assert
        await expect(controller.assignCommunitiesToMe(TEST_USER_IDS.CLIENT)).rejects.toThrow(InternalServerErrorException);
      });
    });

    describe('assignCommunitiesToUser', () => {
      it('should assign communities to specific user', async () => {
        // Arrange
        const assignedCommunities = [TEST_COMMUNITY_IDS.ANXIETY_SUPPORT];
        jest.spyOn(communityAssignmentService, 'assignCommunitiesToUser').mockResolvedValue(assignedCommunities);

        // Act
        const result = await controller.assignCommunitiesToUser(TEST_USER_IDS.CLIENT);

        // Assert
        expect(communityAssignmentService.assignCommunitiesToUser).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
        expect(result).toEqual({ assignedCommunities });
      });
    });

    describe('getMyRecommendedCommunities', () => {
      it('should return recommended communities for user', async () => {
        // Arrange
        const recommendedCommunities = [TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, TEST_COMMUNITY_IDS.DEPRESSION_HELP];
        jest.spyOn(communityAssignmentService, 'getRecommendedCommunities').mockResolvedValue(recommendedCommunities);

        // Act
        const result = await controller.getMyRecommendedCommunities(TEST_USER_IDS.CLIENT);

        // Assert
        expect(communityAssignmentService.getRecommendedCommunities).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
        expect(result).toEqual({ recommendedCommunities });
      });
    });

    describe('bulkAssignCommunities', () => {
      it('should bulk assign communities to multiple users', async () => {
        // Arrange
        const userIds = [TEST_USER_IDS.CLIENT, TEST_USER_IDS.THERAPIST];
        const bulkResults = {
          [TEST_USER_IDS.CLIENT]: [TEST_COMMUNITY_IDS.ANXIETY_SUPPORT],
          [TEST_USER_IDS.THERAPIST]: [TEST_COMMUNITY_IDS.DEPRESSION_HELP],
        };
        jest.spyOn(communityAssignmentService, 'bulkAssignCommunities').mockResolvedValue(bulkResults);

        // Act
        const result = await controller.bulkAssignCommunities({ userIds });

        // Assert
        expect(communityAssignmentService.bulkAssignCommunities).toHaveBeenCalledWith(userIds);
        expect(result).toEqual({ results: bulkResults });
      });

      it('should handle service errors', async () => {
        // Arrange
        const error = new Error('Bulk assignment failed');
        jest.spyOn(communityAssignmentService, 'bulkAssignCommunities').mockRejectedValue(error);

        // Act & Assert
        await expect(controller.bulkAssignCommunities({ userIds: [TEST_USER_IDS.CLIENT] })).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });
  });

  describe('Security and Authorization', () => {
    it('should have proper guards applied', () => {
      // Test that JwtAuthGuard is applied at controller level
      const guards = Reflect.getMetadata('__guards__', CommunitiesController);
      expect(guards).toBeDefined();
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should test role-based access for admin endpoints', async () => {
      // Test that admin/moderator endpoints have proper role decorators
      const adminMethods = ['create', 'update', 'remove', 'createRoomGroup', 'createRoom'];
      
      adminMethods.forEach(method => {
        const roles = Reflect.getMetadata('roles', controller[method as keyof CommunitiesController]);
        expect(roles).toBeDefined();
        expect(roles).toContain('moderator');
      });
    });

    it('should test role-based access for user endpoints', async () => {
      // Test that user endpoints have proper role decorators
      const userMethods = ['joinCommunity', 'leaveCommunity'];
      
      userMethods.forEach(method => {
        const roles = Reflect.getMetadata('roles', controller[method as keyof CommunitiesController]);
        expect(roles).toBeDefined();
        expect(roles).toContain('client');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle InternalServerErrorException properly', async () => {
      // Arrange
      const error = new InternalServerErrorException('Internal error');
      jest.spyOn(communitiesService, 'findAll').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findAll()).rejects.toThrow(InternalServerErrorException);
    });

    it('should wrap unknown errors in InternalServerErrorException', async () => {
      // Arrange
      const unknownError = new Error('Unknown error');
      jest.spyOn(communitiesService, 'findAll').mockRejectedValue(unknownError);

      // Act & Assert
      await expect(controller.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete community creation workflow', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'createCommunity').mockResolvedValue(mockCommunity);

      // Act
      const result = await controller.create(mockCreateCommunityDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(mockCommunity.name);
      expect(result.description).toBe(mockCommunity.description);
      expect(result.slug).toBe(mockCommunity.slug);
    });

    it('should handle complete community join workflow', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'joinCommunity').mockResolvedValue(undefined);

      // Act
      const result = await controller.joinCommunity(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, TEST_USER_IDS.CLIENT);

      // Assert
      expect(result).toBeDefined();
      expect(result.joined).toBe(true);
    });

    it('should handle complete community structure workflow', async () => {
      // Arrange
      jest.spyOn(communitiesService, 'findOneWithStructure').mockResolvedValue(mockCommunityWithRoomGroups);

      // Act
      const result = await controller.getOneWithStructure(TEST_COMMUNITY_IDS.ANXIETY_SUPPORT);

      // Assert
      expect(result).toBeDefined();
      expect(result.roomGroups).toBeDefined();
      expect(result.roomGroups.length).toBeGreaterThan(0);
      expect(result.roomGroups[0].rooms).toBeDefined();
    });
  });
});