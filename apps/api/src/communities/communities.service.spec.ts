import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { createMockPrismaService, TEST_USER_IDS } from '../test-utils';

// Mock data for comprehensive testing
const mockCommunity = {
  id: 'community-1',
  name: 'Anxiety Support Group',
  description: 'A supportive community for people dealing with anxiety',
  slug: 'anxiety-support-group',
  imageUrl: 'https://example.com/anxiety-community.jpg',
  isPrivate: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
};

const mockCommunityWithStructure = {
  ...mockCommunity,
  roomGroups: [
    {
      id: 'roomgroup-1',
      name: 'General Discussion',
      order: 1,
      communityId: 'community-1',
      rooms: [
        {
          id: 'room-1',
          name: 'Welcome',
          order: 1,
          postingRole: 'member',
          roomGroupId: 'roomgroup-1',
        },
        {
          id: 'room-2',
          name: 'Daily Check-ins',
          order: 2,
          postingRole: 'member',
          roomGroupId: 'roomgroup-1',
        },
      ],
    },
    {
      id: 'roomgroup-2',
      name: 'Resources',
      order: 2,
      communityId: 'community-1',
      rooms: [
        {
          id: 'room-3',
          name: 'Helpful Articles',
          order: 1,
          postingRole: 'moderator',
          roomGroupId: 'roomgroup-2',
        },
      ],
    },
  ],
};

const mockRoomGroup = {
  id: 'roomgroup-1',
  name: 'General Discussion',
  order: 1,
  communityId: 'community-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRoom = {
  id: 'room-1',
  name: 'Welcome',
  order: 1,
  postingRole: 'member',
  roomGroupId: 'roomgroup-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMembership = {
  id: 'membership-1',
  userId: TEST_USER_IDS.CLIENT,
  communityId: 'community-1',
  role: 'member',
  joinedAt: new Date(),
  user: {
    id: TEST_USER_IDS.CLIENT,
    firstName: 'John',
    lastName: 'Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
  },
  community: mockCommunity,
};

const mockCommunityWithMembers = {
  ...mockCommunity,
  memberships: [mockMembership],
  members: [mockMembership],
};

describe('CommunitiesService', () => {
  let service: CommunitiesService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunitiesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<CommunitiesService>(CommunitiesService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllWithStructure', () => {
    it('should return all communities with room structure', async () => {
      prismaService.community.findMany.mockResolvedValue([mockCommunityWithStructure]);

      const result = await service.findAllWithStructure();

      expect(prismaService.community.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: {
          roomGroups: {
            include: {
              rooms: true,
            },
          },
        },
      });
      expect(result).toEqual([mockCommunityWithStructure]);
    });

    it('should return empty array when no communities exist', async () => {
      prismaService.community.findMany.mockResolvedValue([]);

      const result = await service.findAllWithStructure();

      expect(result).toEqual([]);
    });

    it('should handle communities with no room groups', async () => {
      const communityWithoutRooms = {
        ...mockCommunity,
        roomGroups: [],
      };
      prismaService.community.findMany.mockResolvedValue([communityWithoutRooms]);

      const result = await service.findAllWithStructure();

      expect(result).toEqual([communityWithoutRooms]);
    });

    it('should order communities by creation date descending', async () => {
      const olderCommunity = {
        ...mockCommunity,
        id: 'community-2',
        createdAt: new Date('2023-12-01'),
        roomGroups: [],
      };
      const newerCommunity = {
        ...mockCommunity,
        id: 'community-3',
        createdAt: new Date('2024-02-01'),
        roomGroups: [],
      };

      prismaService.community.findMany.mockResolvedValue([newerCommunity, olderCommunity]);

      const result = await service.findAllWithStructure();

      expect(result[0].createdAt).toEqual(new Date('2024-02-01'));
      expect(result[1].createdAt).toEqual(new Date('2023-12-01'));
    });
  });

  describe('findOneWithStructure', () => {
    it('should return community with structure by ID', async () => {
      prismaService.community.findUniqueOrThrow.mockResolvedValue(mockCommunityWithStructure);

      const result = await service.findOneWithStructure('community-1');

      expect(prismaService.community.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'community-1' },
        include: {
          roomGroups: {
            include: {
              rooms: true,
            },
          },
        },
      });
      expect(result).toEqual(mockCommunityWithStructure);
    });

    it('should throw error when community not found', async () => {
      prismaService.community.findUniqueOrThrow.mockRejectedValue(
        new NotFoundException('Community not found')
      );

      await expect(service.findOneWithStructure('nonexistent-id')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should include nested room structure', async () => {
      await service.findOneWithStructure('community-1');

      expect(prismaService.community.findUniqueOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            roomGroups: {
              include: {
                rooms: true,
              },
            },
          },
        })
      );
    });
  });

  describe('createRoomGroup', () => {
    it('should create a new room group successfully', async () => {
      prismaService.roomGroup.create.mockResolvedValue(mockRoomGroup);

      const result = await service.createRoomGroup('community-1', 'General Discussion', 1);

      expect(prismaService.roomGroup.create).toHaveBeenCalledWith({
        data: {
          name: 'General Discussion',
          order: 1,
          community: {
            connect: {
              id: 'community-1',
            },
          },
        },
      });
      expect(result).toEqual(mockRoomGroup);
    });

    it('should handle creation conflicts', async () => {
      const dbError = new Error('Duplicate room group name');
      prismaService.roomGroup.create.mockRejectedValue(dbError);

      await expect(
        service.createRoomGroup('community-1', 'Duplicate Name', 1)
      ).rejects.toThrow(ConflictException);
    });

    it('should handle non-Error objects in catch block', async () => {
      prismaService.roomGroup.create.mockRejectedValue('String error');

      await expect(
        service.createRoomGroup('community-1', 'Test', 1)
      ).rejects.toThrow(ConflictException);
    });

    it('should create room groups with different orders', async () => {
      const roomGroup1 = { ...mockRoomGroup, order: 1 };
      const roomGroup2 = { ...mockRoomGroup, id: 'roomgroup-2', order: 2 };

      prismaService.roomGroup.create
        .mockResolvedValueOnce(roomGroup1)
        .mockResolvedValueOnce(roomGroup2);

      const result1 = await service.createRoomGroup('community-1', 'First Group', 1);
      const result2 = await service.createRoomGroup('community-1', 'Second Group', 2);

      expect(result1.order).toBe(1);
      expect(result2.order).toBe(2);
    });
  });

  describe('createRoom', () => {
    it('should create a new room successfully', async () => {
      prismaService.room.create.mockResolvedValue(mockRoom);

      const result = await service.createRoom('roomgroup-1', 'Welcome', 1);

      expect(prismaService.room.create).toHaveBeenCalledWith({
        data: {
          name: 'Welcome',
          order: 1,
          roomGroupId: 'roomgroup-1',
        },
      });
      expect(result).toEqual(mockRoom);
    });

    it('should create room with default posting role', async () => {
      const roomWithDefaultRole = {
        ...mockRoom,
        postingRole: 'member',
      };
      prismaService.room.create.mockResolvedValue(roomWithDefaultRole);

      const result = await service.createRoom('roomgroup-1', 'General Chat', 2);

      expect(result.postingRole).toBe('member');
    });

    it('should handle room creation errors', async () => {
      const dbError = new Error('Database connection failed');
      prismaService.room.create.mockRejectedValue(dbError);

      await expect(
        service.createRoom('invalid-roomgroup', 'Test Room', 1)
      ).rejects.toThrow('Database connection failed');
    });

    it('should create multiple rooms in same group with different orders', async () => {
      const room1 = { ...mockRoom, order: 1, name: 'Room 1' };
      const room2 = { ...mockRoom, id: 'room-2', order: 2, name: 'Room 2' };

      prismaService.room.create
        .mockResolvedValueOnce(room1)
        .mockResolvedValueOnce(room2);

      const result1 = await service.createRoom('roomgroup-1', 'Room 1', 1);
      const result2 = await service.createRoom('roomgroup-1', 'Room 2', 2);

      expect(result1.order).toBe(1);
      expect(result2.order).toBe(2);
    });
  });

  describe('findRoomsByGroup', () => {
    it('should return rooms ordered by order ascending', async () => {
      const rooms = [
        { ...mockRoom, order: 1, name: 'First Room' },
        { ...mockRoom, id: 'room-2', order: 2, name: 'Second Room' },
        { ...mockRoom, id: 'room-3', order: 3, name: 'Third Room' },
      ];
      prismaService.room.findMany.mockResolvedValue(rooms);

      const result = await service.findRoomsByGroup('roomgroup-1');

      expect(prismaService.room.findMany).toHaveBeenCalledWith({
        where: { roomGroupId: 'roomgroup-1' },
        orderBy: { order: 'asc' },
      });
      expect(result).toEqual(rooms);
      expect(result[0].order).toBe(1);
      expect(result[1].order).toBe(2);
      expect(result[2].order).toBe(3);
    });

    it('should return empty array when no rooms exist', async () => {
      prismaService.room.findMany.mockResolvedValue([]);

      const result = await service.findRoomsByGroup('empty-roomgroup');

      expect(result).toEqual([]);
    });

    it('should filter by room group ID correctly', async () => {
      await service.findRoomsByGroup('specific-roomgroup');

      expect(prismaService.room.findMany).toHaveBeenCalledWith({
        where: { roomGroupId: 'specific-roomgroup' },
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('findAll', () => {
    it('should return all communities without structure', async () => {
      const communities = [mockCommunity, { ...mockCommunity, id: 'community-2' }];
      prismaService.community.findMany.mockResolvedValue(communities);

      const result = await service.findAll();

      expect(prismaService.community.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(communities);
    });

    it('should order communities by creation date descending', async () => {
      await service.findAll();

      expect(prismaService.community.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle empty result gracefully', async () => {
      prismaService.community.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return community by ID', async () => {
      prismaService.community.findUnique.mockResolvedValue(mockCommunity);

      const result = await service.findOne('community-1');

      expect(prismaService.community.findUnique).toHaveBeenCalledWith({
        where: { id: 'community-1' },
      });
      expect(result).toEqual(mockCommunity);
    });

    it('should return null when community not found', async () => {
      prismaService.community.findUnique.mockResolvedValue(null);

      const result = await service.findOne('nonexistent-id');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      prismaService.community.findUnique.mockRejectedValue(dbError);

      await expect(service.findOne('community-1')).rejects.toThrow('Database connection failed');
    });
  });

  describe('findBySlug', () => {
    it('should return community by slug', async () => {
      prismaService.community.findUnique.mockResolvedValue(mockCommunity);

      const result = await service.findBySlug('anxiety-support-group');

      expect(prismaService.community.findUnique).toHaveBeenCalledWith({
        where: { slug: 'anxiety-support-group' },
      });
      expect(result).toEqual(mockCommunity);
    });

    it('should return null when community with slug not found', async () => {
      prismaService.community.findUnique.mockResolvedValue(null);

      const result = await service.findBySlug('nonexistent-slug');

      expect(result).toBeNull();
    });

    it('should handle special characters in slug', async () => {
      const slugWithSpecialChars = 'anxiety-&-depression-support';
      await service.findBySlug(slugWithSpecialChars);

      expect(prismaService.community.findUnique).toHaveBeenCalledWith({
        where: { slug: slugWithSpecialChars },
      });
    });
  });

  describe('createCommunity', () => {
    it('should create community with all fields', async () => {
      const createData = {
        name: 'Depression Support',
        description: 'A community for depression support',
        slug: 'depression-support',
        imageUrl: 'https://example.com/depression.jpg',
      };
      const createdCommunity = {
        ...mockCommunity,
        ...createData,
        id: 'new-community-id',
      };

      prismaService.community.create.mockResolvedValue(createdCommunity);

      const result = await service.createCommunity(createData);

      expect(prismaService.community.create).toHaveBeenCalledWith({
        data: {
          name: 'Depression Support',
          slug: 'depression-support',
          description: 'A community for depression support',
          imageUrl: 'https://example.com/depression.jpg',
        },
      });
      expect(result).toEqual(createdCommunity);
    });

    it('should auto-generate slug from name when not provided', async () => {
      const createData = {
        name: 'PTSD Recovery Community',
        description: 'Community for PTSD recovery',
      };
      const createdCommunity = {
        ...mockCommunity,
        name: createData.name,
        description: createData.description,
        slug: 'ptsd-recovery-community',
      };

      prismaService.community.create.mockResolvedValue(createdCommunity);

      const result = await service.createCommunity(createData);

      expect(prismaService.community.create).toHaveBeenCalledWith({
        data: {
          name: 'PTSD Recovery Community',
          slug: 'ptsd-recovery-community',
          description: 'Community for PTSD recovery',
          imageUrl: null,
        },
      });
      expect(result.slug).toBe('ptsd-recovery-community');
    });

    it('should handle missing name with default slug', async () => {
      const createData = {
        description: 'Community with no name',
      };
      const createdCommunity = {
        ...mockCommunity,
        name: undefined,
        description: createData.description,
        slug: 'untitled',
      };

      prismaService.community.create.mockResolvedValue(createdCommunity);

      await service.createCommunity(createData);

      expect(prismaService.community.create).toHaveBeenCalledWith({
        data: {
          name: undefined,
          slug: 'untitled',
          description: 'Community with no name',
          imageUrl: null,
        },
      });
    });

    it('should handle creation with minimal data', async () => {
      const createData = {
        name: 'Simple Community',
        description: 'Simple description',
      };

      await service.createCommunity(createData);

      expect(prismaService.community.create).toHaveBeenCalledWith({
        data: {
          name: 'Simple Community',
          slug: 'simple-community',
          description: 'Simple description',
          imageUrl: null,
        },
      });
    });

    it('should handle database creation errors', async () => {
      const createData = {
        name: 'Test Community',
        description: 'Test description',
      };
      const dbError = new Error('Unique constraint violation');
      prismaService.community.create.mockRejectedValue(dbError);

      await expect(service.createCommunity(createData)).rejects.toThrow(
        'Unique constraint violation'
      );
    });
  });

  describe('update', () => {
    it('should update community with all fields', async () => {
      const updateData = {
        name: 'Updated Community Name',
        description: 'Updated description',
        slug: 'updated-slug',
        imageUrl: 'https://example.com/updated.jpg',
      };
      const updatedCommunity = {
        ...mockCommunity,
        ...updateData,
      };

      prismaService.community.update.mockResolvedValue(updatedCommunity);

      const result = await service.update('community-1', updateData);

      expect(prismaService.community.update).toHaveBeenCalledWith({
        where: { id: 'community-1' },
        data: {
          name: 'Updated Community Name',
          slug: 'updated-slug',
          description: 'Updated description',
          imageUrl: 'https://example.com/updated.jpg',
        },
      });
      expect(result).toEqual(updatedCommunity);
    });

    it('should auto-generate slug from updated name', async () => {
      const updateData = {
        name: 'New Community Name With Spaces',
        description: 'Updated description',
      };

      await service.update('community-1', updateData);

      expect(prismaService.community.update).toHaveBeenCalledWith({
        where: { id: 'community-1' },
        data: {
          name: 'New Community Name With Spaces',
          slug: 'new-community-name-with-spaces',
          description: 'Updated description',
          imageUrl: null,
        },
      });
    });

    it('should handle partial updates', async () => {
      const updateData = {
        description: 'Only updating description',
      };

      await service.update('community-1', updateData);

      expect(prismaService.community.update).toHaveBeenCalledWith({
        where: { id: 'community-1' },
        data: {
          name: undefined,
          slug: 'untitled',
          description: 'Only updating description',
          imageUrl: null,
        },
      });
    });

    it('should handle update errors', async () => {
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
      };
      const dbError = new Error('Community not found');
      prismaService.community.update.mockRejectedValue(dbError);

      await expect(service.update('nonexistent-id', updateData)).rejects.toThrow(
        'Community not found'
      );
    });
  });

  describe('remove', () => {
    it('should delete community successfully', async () => {
      prismaService.community.delete.mockResolvedValue(mockCommunity);

      const result = await service.remove('community-1');

      expect(prismaService.community.delete).toHaveBeenCalledWith({
        where: { id: 'community-1' },
      });
      expect(result).toEqual(mockCommunity);
    });

    it('should handle deletion of non-existent community', async () => {
      const dbError = new Error('Community not found');
      prismaService.community.delete.mockRejectedValue(dbError);

      await expect(service.remove('nonexistent-id')).rejects.toThrow('Community not found');
    });

    it('should handle cascade deletion errors', async () => {
      const dbError = new Error('Foreign key constraint violation');
      prismaService.community.delete.mockRejectedValue(dbError);

      await expect(service.remove('community-with-dependencies')).rejects.toThrow(
        'Foreign key constraint violation'
      );
    });
  });

  describe('findByUserId', () => {
    it('should return communities for user', async () => {
      const memberships = [
        mockMembership,
        {
          ...mockMembership,
          id: 'membership-2',
          communityId: 'community-2',
          community: { ...mockCommunity, id: 'community-2', name: 'Depression Support' },
        },
      ];
      prismaService.membership.findMany.mockResolvedValue(memberships);

      const result = await service.findByUserId(TEST_USER_IDS.CLIENT);

      expect(prismaService.membership.findMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER_IDS.CLIENT },
        include: {
          community: true,
        },
      });
      expect(result).toEqual([
        mockCommunity,
        { ...mockCommunity, id: 'community-2', name: 'Depression Support' },
      ]);
    });

    it('should return empty array for user with no memberships', async () => {
      prismaService.membership.findMany.mockResolvedValue([]);

      const result = await service.findByUserId('user-with-no-communities');

      expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('User not found');
      prismaService.membership.findMany.mockRejectedValue(dbError);

      await expect(service.findByUserId('invalid-user')).rejects.toThrow('User not found');
    });
  });

  describe('joinCommunity', () => {
    it('should allow user to join community', async () => {
      prismaService.membership.findFirst.mockResolvedValue(null);
      prismaService.membership.create.mockResolvedValue(mockMembership);

      await service.joinCommunity('community-1', TEST_USER_IDS.CLIENT);

      expect(prismaService.membership.findFirst).toHaveBeenCalledWith({
        where: {
          communityId: 'community-1',
          userId: TEST_USER_IDS.CLIENT,
        },
      });
      expect(prismaService.membership.create).toHaveBeenCalledWith({
        data: {
          userId: TEST_USER_IDS.CLIENT,
          communityId: 'community-1',
          role: 'member',
        },
      });
    });

    it('should allow joining with custom role', async () => {
      prismaService.membership.findFirst.mockResolvedValue(null);
      prismaService.membership.create.mockResolvedValue({
        ...mockMembership,
        role: 'moderator',
      });

      await service.joinCommunity('community-1', TEST_USER_IDS.CLIENT, 'moderator');

      expect(prismaService.membership.create).toHaveBeenCalledWith({
        data: {
          userId: TEST_USER_IDS.CLIENT,
          communityId: 'community-1',
          role: 'moderator',
        },
      });
    });

    it('should throw error if user already a member', async () => {
      prismaService.membership.findFirst.mockResolvedValue(mockMembership);

      await expect(
        service.joinCommunity('community-1', TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(ConflictException);
      expect(prismaService.membership.create).not.toHaveBeenCalled();
    });

    it('should handle database errors during join', async () => {
      prismaService.membership.findFirst.mockResolvedValue(null);
      const dbError = new Error('Database connection failed');
      prismaService.membership.create.mockRejectedValue(dbError);

      await expect(
        service.joinCommunity('community-1', TEST_USER_IDS.CLIENT)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('leaveCommunity', () => {
    it('should allow user to leave community', async () => {
      prismaService.membership.findFirstOrThrow.mockResolvedValue(mockMembership);
      prismaService.membership.delete.mockResolvedValue(mockMembership);

      await service.leaveCommunity('community-1', TEST_USER_IDS.CLIENT);

      expect(prismaService.membership.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          communityId: 'community-1',
          userId: TEST_USER_IDS.CLIENT,
        },
      });
      expect(prismaService.membership.delete).toHaveBeenCalledWith({
        where: { id: 'membership-1' },
      });
    });

    it('should throw error if membership not found', async () => {
      const dbError = new Error('Membership not found');
      prismaService.membership.findFirstOrThrow.mockRejectedValue(dbError);

      await expect(
        service.leaveCommunity('community-1', 'nonexistent-user')
      ).rejects.toThrow('Membership not found');
      expect(prismaService.membership.delete).not.toHaveBeenCalled();
    });

    it('should handle deletion errors', async () => {
      prismaService.membership.findFirstOrThrow.mockResolvedValue(mockMembership);
      const dbError = new Error('Foreign key constraint violation');
      prismaService.membership.delete.mockRejectedValue(dbError);

      await expect(
        service.leaveCommunity('community-1', TEST_USER_IDS.CLIENT)
      ).rejects.toThrow('Foreign key constraint violation');
    });
  });

  describe('getMembers', () => {
    it('should return community with members using default pagination', async () => {
      prismaService.community.findUnique.mockResolvedValue(mockCommunityWithMembers);

      const result = await service.getMembers('community-1');

      expect(prismaService.community.findUnique).toHaveBeenCalledWith({
        where: { id: 'community-1' },
        include: {
          memberships: {
            skip: 0,
            take: 50,
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
            orderBy: { joinedAt: 'desc' },
          },
        },
      });
      expect(result.members).toEqual([mockMembership]);
    });

    it('should handle custom pagination parameters', async () => {
      prismaService.community.findUnique.mockResolvedValue(mockCommunityWithMembers);

      await service.getMembers('community-1', 20, 10);

      expect(prismaService.community.findUnique).toHaveBeenCalledWith({
        where: { id: 'community-1' },
        include: {
          memberships: {
            skip: 10,
            take: 20,
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
            orderBy: { joinedAt: 'desc' },
          },
        },
      });
    });

    it('should throw NotFoundException when community not found', async () => {
      prismaService.community.findUnique.mockResolvedValue(null);

      await expect(service.getMembers('nonexistent-community')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should filter out memberships with null users', async () => {
      const communityWithNullUsers = {
        ...mockCommunityWithMembers,
        memberships: [
          mockMembership,
          {
            ...mockMembership,
            id: 'membership-2',
            userId: null,
            user: null,
          },
          {
            ...mockMembership,
            id: 'membership-3',
            userId: TEST_USER_IDS.THERAPIST,
            user: {
              id: TEST_USER_IDS.THERAPIST,
              firstName: 'Jane',
              lastName: 'Smith',
              avatarUrl: null,
            },
          },
        ],
      };
      prismaService.community.findUnique.mockResolvedValue(communityWithNullUsers);

      const result = await service.getMembers('community-1');

      expect(result.members).toHaveLength(2);
      expect(result.members[0].userId).toBe(TEST_USER_IDS.CLIENT);
      expect(result.members[1].userId).toBe(TEST_USER_IDS.THERAPIST);
    });

    it('should order members by join date descending', async () => {
      const recentMember = {
        ...mockMembership,
        id: 'membership-recent',
        joinedAt: new Date('2024-02-01'),
        user: { ...mockMembership.user, firstName: 'Recent' },
      };
      const olderMember = {
        ...mockMembership,
        id: 'membership-older',
        joinedAt: new Date('2024-01-01'),
        user: { ...mockMembership.user, firstName: 'Older' },
      };

      const communityWithOrderedMembers = {
        ...mockCommunityWithMembers,
        memberships: [recentMember, olderMember],
      };
      prismaService.community.findUnique.mockResolvedValue(communityWithOrderedMembers);

      const result = await service.getMembers('community-1');

      expect(result.members[0].user.firstName).toBe('Recent');
      expect(result.members[1].user.firstName).toBe('Older');
    });
  });

  describe('getStats', () => {
    it('should return community statistics', async () => {
      prismaService.membership.count.mockResolvedValue(150);
      prismaService.post.count.mockResolvedValue(500);
      prismaService.community.count.mockResolvedValue(25);

      const result = await service.getStats();

      expect(prismaService.membership.count).toHaveBeenCalled();
      expect(prismaService.post.count).toHaveBeenCalled();
      expect(prismaService.community.count).toHaveBeenCalled();
      expect(result).toEqual({
        totalMembers: 150,
        totalPosts: 500,
        activeCommunities: 25,
        illnessCommunities: [],
      });
    });

    it('should handle zero counts gracefully', async () => {
      prismaService.membership.count.mockResolvedValue(0);
      prismaService.post.count.mockResolvedValue(0);
      prismaService.community.count.mockResolvedValue(0);

      const result = await service.getStats();

      expect(result).toEqual({
        totalMembers: 0,
        totalPosts: 0,
        activeCommunities: 0,
        illnessCommunities: [],
      });
    });

    it('should handle database errors in stats collection', async () => {
      const dbError = new Error('Database connection failed');
      prismaService.membership.count.mockRejectedValue(dbError);

      await expect(service.getStats()).rejects.toThrow('Database connection failed');
    });

    it('should execute all count queries in parallel', async () => {
      prismaService.membership.count.mockResolvedValue(100);
      prismaService.post.count.mockResolvedValue(200);
      prismaService.community.count.mockResolvedValue(10);

      await service.getStats();

      // All three count operations should be called
      expect(prismaService.membership.count).toHaveBeenCalledTimes(1);
      expect(prismaService.post.count).toHaveBeenCalledTimes(1);
      expect(prismaService.community.count).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete community lifecycle', async () => {
      // Create community
      const createData = {
        name: 'Test Integration Community',
        description: 'Integration test community',
      };
      const createdCommunity = {
        ...mockCommunity,
        name: createData.name,
        description: createData.description,
        slug: 'test-integration-community',
      };
      prismaService.community.create.mockResolvedValue(createdCommunity);

      const community = await service.createCommunity(createData);
      expect(community.name).toBe('Test Integration Community');

      // Update community
      const updateData = {
        name: 'Updated Integration Community',
        description: 'Updated description',
      };
      const updatedCommunity = {
        ...createdCommunity,
        ...updateData,
        slug: 'updated-integration-community',
      };
      prismaService.community.update.mockResolvedValue(updatedCommunity);

      const updated = await service.update(community.id, updateData);
      expect(updated.name).toBe('Updated Integration Community');

      // User joins community
      prismaService.membership.findFirst.mockResolvedValue(null);
      prismaService.membership.create.mockResolvedValue(mockMembership);

      await service.joinCommunity(community.id, TEST_USER_IDS.CLIENT);

      // Get community with members
      prismaService.community.findUnique.mockResolvedValue(mockCommunityWithMembers);
      const withMembers = await service.getMembers(community.id);
      expect(withMembers.members).toHaveLength(1);

      // User leaves community
      prismaService.membership.findFirstOrThrow.mockResolvedValue(mockMembership);
      prismaService.membership.delete.mockResolvedValue(mockMembership);

      await service.leaveCommunity(community.id, TEST_USER_IDS.CLIENT);

      // Delete community
      prismaService.community.delete.mockResolvedValue(updatedCommunity);
      const deleted = await service.remove(community.id);
      expect(deleted.id).toBe(community.id);
    });

    it('should handle room group and room creation workflow', async () => {
      // Create room group
      prismaService.roomGroup.create.mockResolvedValue(mockRoomGroup);
      const roomGroup = await service.createRoomGroup('community-1', 'General Discussion', 1);
      expect(roomGroup.name).toBe('General Discussion');

      // Create rooms in the group
      const room1 = { ...mockRoom, name: 'Welcome' };
      const room2 = { ...mockRoom, id: 'room-2', name: 'General Chat' };
      prismaService.room.create
        .mockResolvedValueOnce(room1)
        .mockResolvedValueOnce(room2);

      const welcomeRoom = await service.createRoom(roomGroup.id, 'Welcome', 1);
      const chatRoom = await service.createRoom(roomGroup.id, 'General Chat', 2);

      expect(welcomeRoom.name).toBe('Welcome');
      expect(chatRoom.name).toBe('General Chat');

      // Find rooms by group
      prismaService.room.findMany.mockResolvedValue([room1, room2]);
      const rooms = await service.findRoomsByGroup(roomGroup.id);
      expect(rooms).toHaveLength(2);
    });

    it('should handle complex membership scenarios', async () => {
      // Multiple users joining same community
      const users = [TEST_USER_IDS.CLIENT, TEST_USER_IDS.THERAPIST, TEST_USER_IDS.ADMIN];
      
      for (const userId of users) {
        prismaService.membership.findFirst.mockResolvedValue(null);
        prismaService.membership.create.mockResolvedValue({
          ...mockMembership,
          userId,
        });

        await service.joinCommunity('community-1', userId);
      }

      // Get all user communities
      const userMemberships = [
        { ...mockMembership, community: mockCommunity },
        { ...mockMembership, community: { ...mockCommunity, id: 'community-2' } },
      ];
      prismaService.membership.findMany.mockResolvedValue(userMemberships);

      const userCommunities = await service.findByUserId(TEST_USER_IDS.CLIENT);
      expect(userCommunities).toHaveLength(2);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle concurrent join requests gracefully', async () => {
      // First request succeeds
      prismaService.membership.findFirst.mockResolvedValueOnce(null);
      prismaService.membership.create.mockResolvedValueOnce(mockMembership);

      // Second request finds existing membership
      prismaService.membership.findFirst.mockResolvedValueOnce(mockMembership);

      const promise1 = service.joinCommunity('community-1', TEST_USER_IDS.CLIENT);
      const promise2 = service.joinCommunity('community-1', TEST_USER_IDS.CLIENT);

      await expect(promise1).resolves.not.toThrow();
      await expect(promise2).rejects.toThrow(ConflictException);
    });

    it('should handle database transaction failures', async () => {
      const transactionError = new Error('Transaction rolled back');
      prismaService.community.create.mockRejectedValue(transactionError);

      await expect(
        service.createCommunity({
          name: 'Test Community',
          description: 'Test description',
        })
      ).rejects.toThrow('Transaction rolled back');
    });

    it('should handle malformed slug generation', async () => {
      const weirdNameData = {
        name: '!!!@@@###$$$',
        description: 'Community with weird characters',
      };

      await service.createCommunity(weirdNameData);

      expect(prismaService.community.create).toHaveBeenCalledWith({
        data: {
          name: '!!!@@@###$$$',
          slug: '!!!@@@###$$$',
          description: 'Community with weird characters',
          imageUrl: null,
        },
      });
    });

    it('should handle pagination edge cases', async () => {
      // Test with very large limit
      await service.getMembers('community-1', 1000, 0);

      expect(prismaService.community.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            memberships: expect.objectContaining({
              take: 1000,
              skip: 0,
            }),
          },
        })
      );

      // Test with negative offset (should still work)
      await service.getMembers('community-1', 10, -5);

      expect(prismaService.community.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            memberships: expect.objectContaining({
              take: 10,
              skip: -5,
            }),
          },
        })
      );
    });
  });
});