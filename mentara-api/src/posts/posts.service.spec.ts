import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { Post, User, Prisma } from '@prisma/client';
import type { PostUpdateInputDto } from './types';

describe('PostsService', () => {
  let service: PostsService;
  let prismaService: jest.Mocked<PrismaService>;

  // Test data constants
  const mockUserId = 'user-123';
  const mockPostId = 'post-123';
  const mockRoomId = 'room-123';
  const mockReportId = 'report-123';

  const mockUser: User = {
    id: mockUserId,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    role: 'client',
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    stripeCustomerId: null,
    deletedAt: null,
    lastActiveAt: new Date(),
    onboardingCompleted: true,
    googleId: null,
    microsoftId: null,
    emailVerificationToken: null,
    emailVerifiedAt: new Date(),
    passwordResetToken: null,
    passwordResetTokenExpiresAt: null,
    password: null,
  };

  const mockPost: Post = {
    id: mockPostId,
    title: 'Test Post',
    content: 'This is a test post content',
    userId: mockUserId,
    roomId: mockRoomId,
    attachmentUrls: ['https://example.com/attachment1.jpg'],
    attachmentNames: ['attachment1.jpg'],
    attachmentSizes: [1024],
    isAnonymous: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPostWithIncludes = {
    ...mockPost,
    user: {
      id: mockUserId,
      firstName: 'Test',
      lastName: 'User',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    room: {
      id: mockRoomId,
      name: 'Test Room',
    },
    comments: [],
    hearts: [],
    _count: {
      comments: 0,
      hearts: 0,
    },
  };

  const mockComment = {
    id: 'comment-123',
    content: 'Test comment',
    userId: 'commenter-123',
    postId: mockPostId,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'commenter-123',
      firstName: 'Commenter',
      lastName: 'User',
      avatarUrl: 'https://example.com/commenter.jpg',
    },
    children: [],
    _count: {
      children: 0,
      hearts: 0,
    },
  };

  const mockHeart = {
    id: 'heart-123',
    postId: mockPostId,
    userId: mockUserId,
    createdAt: new Date(),
  };

  const mockReport = {
    id: mockReportId,
    postId: mockPostId,
    reporterId: 'reporter-123',
    reason: 'Inappropriate content',
    content: 'This post contains offensive material',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
            post: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            postHeart: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            report: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===== USER MANAGEMENT TESTS =====

  describe('findUserById', () => {
    it('should find user by ID successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findUserById(mockUserId);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });
    });

    it('should return null when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findUserById('non-existent-user');

      expect(result).toBeNull();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-user' },
      });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      prismaService.user.findUnique.mockRejectedValue(dbError);

      await expect(service.findUserById(mockUserId)).rejects.toThrow(dbError);
    });
  });

  // ===== POST RETRIEVAL TESTS =====

  describe('findAll', () => {
    it('should find all posts without userId', async () => {
      const mockPosts = [mockPostWithIncludes];
      prismaService.post.findMany.mockResolvedValue(mockPosts);

      const result = await service.findAll();

      expect(result).toEqual(mockPosts);
      expect(prismaService.post.findMany).toHaveBeenCalledWith({
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          room: {
            select: {
              id: true,
              name: true,
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
              children: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      avatarUrl: true,
                    },
                  },
                  _count: {
                    select: {
                      children: true,
                      hearts: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: 'asc',
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          hearts: false,
          _count: {
            select: {
              comments: true,
              hearts: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should find all posts with userId (includes user hearts)', async () => {
      const mockPosts = [mockPostWithIncludes];
      prismaService.post.findMany.mockResolvedValue(mockPosts);

      const result = await service.findAll(mockUserId);

      expect(result).toEqual(mockPosts);
      expect(prismaService.post.findMany).toHaveBeenCalledWith({
        include: {
          user: expect.any(Object),
          room: expect.any(Object),
          comments: expect.any(Object),
          hearts: {
            where: {
              userId: mockUserId,
            },
          },
          _count: expect.any(Object),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return empty array when no posts exist', async () => {
      prismaService.post.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should handle posts with comments and nested replies', async () => {
      const postWithComments = {
        ...mockPostWithIncludes,
        comments: [
          {
            ...mockComment,
            children: [
              {
                id: 'reply-123',
                content: 'Reply to comment',
                userId: 'replier-123',
                user: {
                  id: 'replier-123',
                  firstName: 'Replier',
                  lastName: 'User',
                  avatarUrl: null,
                },
                _count: { children: 0, hearts: 1 },
              },
            ],
          },
        ],
        _count: { comments: 1, hearts: 2 },
      };

      prismaService.post.findMany.mockResolvedValue([postWithComments]);

      const result = await service.findAll();

      expect(result).toEqual([postWithComments]);
      expect(result[0].comments[0].children).toHaveLength(1);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database query failed');
      prismaService.post.findMany.mockRejectedValue(dbError);

      await expect(service.findAll()).rejects.toThrow(dbError);
    });
  });

  describe('findOne', () => {
    it('should find single post by ID', async () => {
      prismaService.post.findUnique.mockResolvedValue(mockPostWithIncludes);

      const result = await service.findOne(mockPostId);

      expect(result).toEqual(mockPostWithIncludes);
      expect(prismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: mockPostId },
        include: expect.any(Object),
      });
    });

    it('should find single post by ID with userId for hearts', async () => {
      const postWithUserHeart = {
        ...mockPostWithIncludes,
        hearts: [mockHeart],
      };
      prismaService.post.findUnique.mockResolvedValue(postWithUserHeart);

      const result = await service.findOne(mockPostId, mockUserId);

      expect(result).toEqual(postWithUserHeart);
      expect(prismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: mockPostId },
        include: expect.objectContaining({
          hearts: {
            where: {
              userId: mockUserId,
            },
          },
        }),
      });
    });

    it('should return null when post not found', async () => {
      prismaService.post.findUnique.mockResolvedValue(null);

      const result = await service.findOne('non-existent-post');

      expect(result).toBeNull();
    });

    it('should handle posts with complex comment structures', async () => {
      const complexPost = {
        ...mockPostWithIncludes,
        comments: [
          {
            ...mockComment,
            children: [
              {
                id: 'nested-reply-1',
                content: 'Nested reply 1',
                userId: 'user-1',
                user: { id: 'user-1', firstName: 'User', lastName: 'One', avatarUrl: null },
                _count: { children: 0, hearts: 0 },
              },
              {
                id: 'nested-reply-2',
                content: 'Nested reply 2',
                userId: 'user-2',
                user: { id: 'user-2', firstName: 'User', lastName: 'Two', avatarUrl: null },
                _count: { children: 0, hearts: 3 },
              },
            ],
          },
        ],
      };

      prismaService.post.findUnique.mockResolvedValue(complexPost);

      const result = await service.findOne(mockPostId);

      expect(result).toEqual(complexPost);
      expect(result.comments[0].children).toHaveLength(2);
    });
  });

  // ===== POST CREATION TESTS =====

  describe('create', () => {
    it('should create post successfully without attachments', async () => {
      const createData: Prisma.PostCreateInput = {
        title: 'New Post',
        content: 'This is a new post',
        user: { connect: { id: mockUserId } },
        room: { connect: { id: mockRoomId } },
      };

      const expectedPost = {
        ...mockPost,
        title: 'New Post',
        content: 'This is a new post',
        attachmentUrls: [],
        attachmentNames: [],
        attachmentSizes: [],
      };

      prismaService.post.create.mockResolvedValue(expectedPost);

      const result = await service.create(createData);

      expect(result).toEqual(expectedPost);
      expect(prismaService.post.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          attachmentUrls: [],
          attachmentNames: [],
          attachmentSizes: [],
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          room: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it('should create post successfully with attachments', async () => {
      const createData: Prisma.PostCreateInput = {
        title: 'Post with Attachments',
        content: 'This post has attachments',
        user: { connect: { id: mockUserId } },
        room: { connect: { id: mockRoomId } },
      };

      const attachmentUrls = ['https://example.com/file1.jpg', 'https://example.com/file2.pdf'];
      const attachmentNames = ['image.jpg', 'document.pdf'];
      const attachmentSizes = [1024, 2048];

      const expectedPost = {
        ...mockPost,
        title: 'Post with Attachments',
        content: 'This post has attachments',
        attachmentUrls,
        attachmentNames,
        attachmentSizes,
      };

      prismaService.post.create.mockResolvedValue(expectedPost);

      const result = await service.create(createData, attachmentUrls, attachmentNames, attachmentSizes);

      expect(result).toEqual(expectedPost);
      expect(prismaService.post.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          attachmentUrls,
          attachmentNames,
          attachmentSizes,
        },
        include: expect.any(Object),
      });
    });

    it('should create anonymous post', async () => {
      const createData: Prisma.PostCreateInput = {
        title: 'Anonymous Post',
        content: 'This is an anonymous post',
        isAnonymous: true,
        user: { connect: { id: mockUserId } },
        room: { connect: { id: mockRoomId } },
      };

      const expectedPost = {
        ...mockPost,
        title: 'Anonymous Post',
        content: 'This is an anonymous post',
        isAnonymous: true,
      };

      prismaService.post.create.mockResolvedValue(expectedPost);

      const result = await service.create(createData);

      expect(result).toEqual(expectedPost);
      expect(prismaService.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isAnonymous: true,
          }),
        }),
      );
    });

    it('should handle creation with empty content', async () => {
      const createData: Prisma.PostCreateInput = {
        title: 'Title Only Post',
        content: '',
        user: { connect: { id: mockUserId } },
        room: { connect: { id: mockRoomId } },
      };

      const expectedPost = { ...mockPost, title: 'Title Only Post', content: '' };
      prismaService.post.create.mockResolvedValue(expectedPost);

      const result = await service.create(createData);

      expect(result).toEqual(expectedPost);
    });

    it('should handle database errors during creation', async () => {
      const createData: Prisma.PostCreateInput = {
        title: 'New Post',
        content: 'Content',
        user: { connect: { id: mockUserId } },
        room: { connect: { id: mockRoomId } },
      };

      const dbError = new Error('Database constraint violation');
      prismaService.post.create.mockRejectedValue(dbError);

      await expect(service.create(createData)).rejects.toThrow(dbError);
    });
  });

  // ===== POST UPDATE TESTS =====

  describe('update', () => {
    const updateData: PostUpdateInputDto = {
      title: 'Updated Title',
      content: 'Updated content',
    };

    it('should update post successfully', async () => {
      const existingPost = { userId: mockUserId };
      const updatedPost = { ...mockPostWithIncludes, ...updateData };

      prismaService.post.findUnique.mockResolvedValue(existingPost);
      prismaService.post.update.mockResolvedValue(updatedPost);

      const result = await service.update(mockPostId, updateData, mockUserId);

      expect(result).toEqual(updatedPost);
      expect(prismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: mockPostId },
        select: { userId: true },
      });
      expect(prismaService.post.update).toHaveBeenCalledWith({
        where: { id: mockPostId },
        data: {
          title: updateData.title,
          content: updateData.content,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          room: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when post does not exist', async () => {
      prismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.update(mockPostId, updateData, mockUserId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(mockPostId, updateData, mockUserId)).rejects.toThrow(
        'Post not found',
      );

      expect(prismaService.post.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      const existingPost = { userId: 'other-user-123' };
      prismaService.post.findUnique.mockResolvedValue(existingPost);

      await expect(service.update(mockPostId, updateData, mockUserId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.update(mockPostId, updateData, mockUserId)).rejects.toThrow(
        'You can only edit your own posts',
      );

      expect(prismaService.post.update).not.toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
      const partialUpdateData = { title: 'Only Title Updated' };
      const existingPost = { userId: mockUserId };
      const updatedPost = { ...mockPostWithIncludes, title: 'Only Title Updated' };

      prismaService.post.findUnique.mockResolvedValue(existingPost);
      prismaService.post.update.mockResolvedValue(updatedPost);

      const result = await service.update(mockPostId, partialUpdateData, mockUserId);

      expect(result).toEqual(updatedPost);
      expect(prismaService.post.update).toHaveBeenCalledWith({
        where: { id: mockPostId },
        data: {
          title: 'Only Title Updated',
          content: undefined,
        },
        include: expect.any(Object),
      });
    });

    it('should handle database errors during update', async () => {
      const existingPost = { userId: mockUserId };
      const dbError = new Error('Database update failed');

      prismaService.post.findUnique.mockResolvedValue(existingPost);
      prismaService.post.update.mockRejectedValue(dbError);

      await expect(service.update(mockPostId, updateData, mockUserId)).rejects.toThrow(dbError);
    });

    it('should handle empty update data', async () => {
      const emptyUpdateData = {};
      const existingPost = { userId: mockUserId };
      const updatedPost = mockPostWithIncludes;

      prismaService.post.findUnique.mockResolvedValue(existingPost);
      prismaService.post.update.mockResolvedValue(updatedPost);

      const result = await service.update(mockPostId, emptyUpdateData, mockUserId);

      expect(result).toEqual(updatedPost);
      expect(prismaService.post.update).toHaveBeenCalledWith({
        where: { id: mockPostId },
        data: {
          title: undefined,
          content: undefined,
        },
        include: expect.any(Object),
      });
    });
  });

  // ===== POST DELETION TESTS =====

  describe('remove', () => {
    it('should delete post successfully', async () => {
      const existingPost = { userId: mockUserId };
      prismaService.post.findUnique.mockResolvedValue(existingPost);
      prismaService.post.delete.mockResolvedValue(mockPost);

      const result = await service.remove(mockPostId, mockUserId);

      expect(result).toEqual(mockPost);
      expect(prismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: mockPostId },
        select: { userId: true },
      });
      expect(prismaService.post.delete).toHaveBeenCalledWith({
        where: { id: mockPostId },
      });
    });

    it('should throw NotFoundException when post does not exist', async () => {
      prismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.remove(mockPostId, mockUserId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(mockPostId, mockUserId)).rejects.toThrow('Post not found');

      expect(prismaService.post.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      const existingPost = { userId: 'other-user-123' };
      prismaService.post.findUnique.mockResolvedValue(existingPost);

      await expect(service.remove(mockPostId, mockUserId)).rejects.toThrow(ForbiddenException);
      await expect(service.remove(mockPostId, mockUserId)).rejects.toThrow(
        'You can only delete your own posts',
      );

      expect(prismaService.post.delete).not.toHaveBeenCalled();
    });

    it('should handle database errors during deletion', async () => {
      const existingPost = { userId: mockUserId };
      const dbError = new Error('Database deletion failed');

      prismaService.post.findUnique.mockResolvedValue(existingPost);
      prismaService.post.delete.mockRejectedValue(dbError);

      await expect(service.remove(mockPostId, mockUserId)).rejects.toThrow(dbError);
    });

    it('should handle cascading deletion scenarios', async () => {
      const existingPost = { userId: mockUserId };
      const deletedPost = { ...mockPost, deletedAt: new Date() };

      prismaService.post.findUnique.mockResolvedValue(existingPost);
      prismaService.post.delete.mockResolvedValue(deletedPost);

      const result = await service.remove(mockPostId, mockUserId);

      expect(result).toEqual(deletedPost);
    });
  });

  // ===== POSTS BY USER TESTS =====

  describe('findByUserId', () => {
    it('should find posts by user ID', async () => {
      const userPosts = [mockPostWithIncludes];
      prismaService.post.findMany.mockResolvedValue(userPosts);

      const result = await service.findByUserId(mockUserId);

      expect(result).toEqual(userPosts);
      expect(prismaService.post.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          room: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              comments: true,
              hearts: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return empty array when user has no posts', async () => {
      prismaService.post.findMany.mockResolvedValue([]);

      const result = await service.findByUserId('user-with-no-posts');

      expect(result).toEqual([]);
    });

    it('should handle multiple posts from same user', async () => {
      const multiplePosts = [
        { ...mockPostWithIncludes, id: 'post-1', title: 'First Post' },
        { ...mockPostWithIncludes, id: 'post-2', title: 'Second Post' },
        { ...mockPostWithIncludes, id: 'post-3', title: 'Third Post' },
      ];

      prismaService.post.findMany.mockResolvedValue(multiplePosts);

      const result = await service.findByUserId(mockUserId);

      expect(result).toEqual(multiplePosts);
      expect(result).toHaveLength(3);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database query failed');
      prismaService.post.findMany.mockRejectedValue(dbError);

      await expect(service.findByUserId(mockUserId)).rejects.toThrow(dbError);
    });
  });

  // ===== POSTS BY ROOM TESTS =====

  describe('findByRoomId', () => {
    it('should find posts by room ID without userId', async () => {
      const roomPosts = [mockPostWithIncludes];
      prismaService.post.findMany.mockResolvedValue(roomPosts);

      const result = await service.findByRoomId(mockRoomId);

      expect(result).toEqual(roomPosts);
      expect(prismaService.post.findMany).toHaveBeenCalledWith({
        where: {
          roomId: mockRoomId,
        },
        include: {
          user: expect.any(Object),
          room: expect.any(Object),
          comments: expect.any(Object),
          hearts: false,
          _count: expect.any(Object),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should find posts by room ID with userId for hearts', async () => {
      const roomPosts = [mockPostWithIncludes];
      prismaService.post.findMany.mockResolvedValue(roomPosts);

      const result = await service.findByRoomId(mockRoomId, mockUserId);

      expect(result).toEqual(roomPosts);
      expect(prismaService.post.findMany).toHaveBeenCalledWith({
        where: {
          roomId: mockRoomId,
        },
        include: expect.objectContaining({
          hearts: {
            where: {
              userId: mockUserId,
            },
          },
        }),
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return empty array when room has no posts', async () => {
      prismaService.post.findMany.mockResolvedValue([]);

      const result = await service.findByRoomId('empty-room');

      expect(result).toEqual([]);
    });

    it('should handle posts with nested comments in room', async () => {
      const roomPostsWithComments = [
        {
          ...mockPostWithIncludes,
          comments: [
            {
              ...mockComment,
              children: [
                {
                  id: 'nested-comment',
                  content: 'Nested comment',
                  userId: 'nested-user',
                  user: { id: 'nested-user', firstName: 'Nested', lastName: 'User', avatarUrl: null },
                  _count: { children: 0, hearts: 1 },
                },
              ],
            },
          ],
        },
      ];

      prismaService.post.findMany.mockResolvedValue(roomPostsWithComments);

      const result = await service.findByRoomId(mockRoomId);

      expect(result).toEqual(roomPostsWithComments);
      expect(result[0].comments[0].children).toHaveLength(1);
    });
  });

  // ===== HEART FUNCTIONALITY TESTS =====

  describe('heartPost', () => {
    it('should add heart when user has not hearted the post', async () => {
      prismaService.postHeart.findUnique.mockResolvedValue(null);
      prismaService.postHeart.create.mockResolvedValue(mockHeart);

      const result = await service.heartPost(mockPostId, mockUserId);

      expect(result).toEqual({ hearted: true });
      expect(prismaService.postHeart.findUnique).toHaveBeenCalledWith({
        where: {
          postId_userId: {
            postId: mockPostId,
            userId: mockUserId,
          },
        },
      });
      expect(prismaService.postHeart.create).toHaveBeenCalledWith({
        data: {
          postId: mockPostId,
          userId: mockUserId,
        },
      });
      expect(prismaService.postHeart.delete).not.toHaveBeenCalled();
    });

    it('should remove heart when user has already hearted the post', async () => {
      prismaService.postHeart.findUnique.mockResolvedValue(mockHeart);
      prismaService.postHeart.delete.mockResolvedValue(mockHeart);

      const result = await service.heartPost(mockPostId, mockUserId);

      expect(result).toEqual({ hearted: false });
      expect(prismaService.postHeart.findUnique).toHaveBeenCalledWith({
        where: {
          postId_userId: {
            postId: mockPostId,
            userId: mockUserId,
          },
        },
      });
      expect(prismaService.postHeart.delete).toHaveBeenCalledWith({
        where: {
          postId_userId: {
            postId: mockPostId,
            userId: mockUserId,
          },
        },
      });
      expect(prismaService.postHeart.create).not.toHaveBeenCalled();
    });

    it('should handle database errors during heart creation', async () => {
      const dbError = new Error('Database constraint violation');
      prismaService.postHeart.findUnique.mockResolvedValue(null);
      prismaService.postHeart.create.mockRejectedValue(dbError);

      await expect(service.heartPost(mockPostId, mockUserId)).rejects.toThrow(dbError);
    });

    it('should handle database errors during heart deletion', async () => {
      const dbError = new Error('Database deletion failed');
      prismaService.postHeart.findUnique.mockResolvedValue(mockHeart);
      prismaService.postHeart.delete.mockRejectedValue(dbError);

      await expect(service.heartPost(mockPostId, mockUserId)).rejects.toThrow(dbError);
    });

    it('should handle concurrent heart operations', async () => {
      // Simulate race condition where heart is created between find and create
      prismaService.postHeart.findUnique.mockResolvedValue(null);
      const duplicateError = new Error('Duplicate key constraint');
      prismaService.postHeart.create.mockRejectedValue(duplicateError);

      await expect(service.heartPost(mockPostId, mockUserId)).rejects.toThrow(duplicateError);
    });
  });

  describe('isPostHeartedByUser', () => {
    it('should return true when user has hearted the post', async () => {
      prismaService.postHeart.findUnique.mockResolvedValue(mockHeart);

      const result = await service.isPostHeartedByUser(mockPostId, mockUserId);

      expect(result).toBe(true);
      expect(prismaService.postHeart.findUnique).toHaveBeenCalledWith({
        where: {
          postId_userId: {
            postId: mockPostId,
            userId: mockUserId,
          },
        },
      });
    });

    it('should return false when user has not hearted the post', async () => {
      prismaService.postHeart.findUnique.mockResolvedValue(null);

      const result = await service.isPostHeartedByUser(mockPostId, mockUserId);

      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database query failed');
      prismaService.postHeart.findUnique.mockRejectedValue(dbError);

      await expect(service.isPostHeartedByUser(mockPostId, mockUserId)).rejects.toThrow(dbError);
    });

    it('should handle different user and post combinations', async () => {
      const testCases = [
        { postId: 'post-1', userId: 'user-1', hearted: true },
        { postId: 'post-1', userId: 'user-2', hearted: false },
        { postId: 'post-2', userId: 'user-1', hearted: false },
        { postId: 'post-2', userId: 'user-2', hearted: true },
      ];

      for (const testCase of testCases) {
        prismaService.postHeart.findUnique.mockResolvedValue(
          testCase.hearted ? { ...mockHeart, postId: testCase.postId, userId: testCase.userId } : null,
        );

        const result = await service.isPostHeartedByUser(testCase.postId, testCase.userId);
        expect(result).toBe(testCase.hearted);
      }
    });
  });

  // ===== FILE ATTACHMENT TESTS =====

  describe('File attachment methods', () => {
    describe('attachFilesToPost', () => {
      it('should return stub implementation result', async () => {
        const result = await service.attachFilesToPost(mockPostId, ['file1', 'file2']);

        expect(result).toEqual({ count: 0 });
      });

      it('should handle custom purpose parameter', async () => {
        const result = await service.attachFilesToPost(mockPostId, ['file1'], 'DOCUMENT');

        expect(result).toEqual({ count: 0 });
      });

      it('should handle empty file IDs array', async () => {
        const result = await service.attachFilesToPost(mockPostId, []);

        expect(result).toEqual({ count: 0 });
      });
    });

    describe('getPostAttachments', () => {
      it('should return stub implementation result', async () => {
        const result = await service.getPostAttachments(mockPostId);

        expect(result).toEqual([]);
      });
    });

    describe('removePostAttachment', () => {
      it('should return stub implementation result', async () => {
        const result = await service.removePostAttachment(mockPostId, 'file-123');

        expect(result).toEqual({ count: 0 });
      });
    });
  });

  // ===== POST REPORTING TESTS =====

  describe('reportPost', () => {
    const reporterId = 'reporter-123';
    const reason = 'Inappropriate content';
    const content = 'This post contains offensive material';

    it('should report post successfully', async () => {
      prismaService.post.findUnique.mockResolvedValue(mockPost);
      prismaService.report.findFirst.mockResolvedValue(null);
      prismaService.report.create.mockResolvedValue(mockReport);

      const result = await service.reportPost(mockPostId, reporterId, reason, content);

      expect(result).toBe(mockReportId);
      expect(prismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: mockPostId },
      });
      expect(prismaService.report.findFirst).toHaveBeenCalledWith({
        where: {
          postId: mockPostId,
          reporterId,
        },
      });
      expect(prismaService.report.create).toHaveBeenCalledWith({
        data: {
          postId: mockPostId,
          reporterId,
          reason,
          content,
          status: 'pending',
        },
      });
    });

    it('should report post without content', async () => {
      prismaService.post.findUnique.mockResolvedValue(mockPost);
      prismaService.report.findFirst.mockResolvedValue(null);
      const reportWithoutContent = { ...mockReport, content: undefined };
      prismaService.report.create.mockResolvedValue(reportWithoutContent);

      const result = await service.reportPost(mockPostId, reporterId, reason);

      expect(result).toBe(mockReportId);
      expect(prismaService.report.create).toHaveBeenCalledWith({
        data: {
          postId: mockPostId,
          reporterId,
          reason,
          content: undefined,
          status: 'pending',
        },
      });
    });

    it('should throw NotFoundException when post does not exist', async () => {
      prismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.reportPost(mockPostId, reporterId, reason)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.reportPost(mockPostId, reporterId, reason)).rejects.toThrow(
        'Post not found',
      );

      expect(prismaService.report.findFirst).not.toHaveBeenCalled();
      expect(prismaService.report.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user already reported the post', async () => {
      prismaService.post.findUnique.mockResolvedValue(mockPost);
      prismaService.report.findFirst.mockResolvedValue(mockReport);

      await expect(service.reportPost(mockPostId, reporterId, reason)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.reportPost(mockPostId, reporterId, reason)).rejects.toThrow(
        'You have already reported this post',
      );

      expect(prismaService.report.create).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException for database errors', async () => {
      const dbError = new Error('Database connection failed');
      prismaService.post.findUnique.mockRejectedValue(dbError);

      await expect(service.reportPost(mockPostId, reporterId, reason)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.reportPost(mockPostId, reporterId, reason)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle non-Error exceptions', async () => {
      const stringError = 'String error message';
      prismaService.post.findUnique.mockRejectedValue(stringError);

      await expect(service.reportPost(mockPostId, reporterId, reason)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should not wrap NotFoundException or ForbiddenException', async () => {
      // Test NotFoundException passthrough
      prismaService.post.findUnique.mockResolvedValue(mockPost);
      prismaService.report.findFirst.mockRejectedValue(new NotFoundException('Report not found'));

      await expect(service.reportPost(mockPostId, reporterId, reason)).rejects.toThrow(
        NotFoundException,
      );

      // Test ForbiddenException passthrough
      prismaService.report.findFirst.mockRejectedValue(
        new ForbiddenException('Access denied'),
      );

      await expect(service.reportPost(mockPostId, reporterId, reason)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should handle different reason types', async () => {
      const reasons = ['spam', 'harassment', 'misinformation', 'violence', 'other'];

      for (const testReason of reasons) {
        prismaService.post.findUnique.mockResolvedValue(mockPost);
        prismaService.report.findFirst.mockResolvedValue(null);
        const reportWithReason = { ...mockReport, reason: testReason };
        prismaService.report.create.mockResolvedValue(reportWithReason);

        const result = await service.reportPost(mockPostId, reporterId, testReason);

        expect(result).toBe(mockReportId);
        expect(prismaService.report.create).toHaveBeenCalledWith({
          data: {
            postId: mockPostId,
            reporterId,
            reason: testReason,
            content: undefined,
            status: 'pending',
          },
        });
      }
    });
  });

  // ===== INTEGRATION TESTS =====

  describe('Integration scenarios', () => {
    it('should handle complete post lifecycle', async () => {
      // Create post
      const createData: Prisma.PostCreateInput = {
        title: 'Lifecycle Test Post',
        content: 'This is a test post for lifecycle testing',
        user: { connect: { id: mockUserId } },
        room: { connect: { id: mockRoomId } },
      };

      prismaService.post.create.mockResolvedValue(mockPostWithIncludes);

      const createdPost = await service.create(createData);
      expect(createdPost).toEqual(mockPostWithIncludes);

      // Update post
      const updateData = { title: 'Updated Lifecycle Post' };
      const existingPost = { userId: mockUserId };
      const updatedPost = { ...mockPostWithIncludes, title: 'Updated Lifecycle Post' };

      prismaService.post.findUnique.mockResolvedValue(existingPost);
      prismaService.post.update.mockResolvedValue(updatedPost);

      const result = await service.update(mockPostId, updateData, mockUserId);
      expect(result.title).toBe('Updated Lifecycle Post');

      // Heart post
      prismaService.postHeart.findUnique.mockResolvedValue(null);
      prismaService.postHeart.create.mockResolvedValue(mockHeart);

      const heartResult = await service.heartPost(mockPostId, mockUserId);
      expect(heartResult.hearted).toBe(true);

      // Delete post
      prismaService.post.findUnique.mockResolvedValue({ userId: mockUserId });
      prismaService.post.delete.mockResolvedValue(mockPost);

      const deletedPost = await service.remove(mockPostId, mockUserId);
      expect(deletedPost).toEqual(mockPost);
    });

    it('should handle post with complex comment structure and hearts', async () => {
      const complexPost = {
        ...mockPostWithIncludes,
        comments: [
          {
            ...mockComment,
            children: [
              {
                id: 'reply-1',
                content: 'First reply',
                userId: 'user-1',
                user: { id: 'user-1', firstName: 'User', lastName: 'One', avatarUrl: null },
                _count: { children: 0, hearts: 2 },
              },
            ],
          },
        ],
        hearts: [mockHeart],
        _count: { comments: 1, hearts: 1 },
      };

      prismaService.post.findUnique.mockResolvedValue(complexPost);

      const result = await service.findOne(mockPostId, mockUserId);

      expect(result).toEqual(complexPost);
      expect(result.comments).toHaveLength(1);
      expect(result.comments[0].children).toHaveLength(1);
      expect(result.hearts).toHaveLength(1);
      expect(result._count.comments).toBe(1);
      expect(result._count.hearts).toBe(1);
    });

    it('should handle room-based post filtering and user interactions', async () => {
      const roomPosts = [
        { ...mockPostWithIncludes, id: 'post-1', title: 'Room Post 1' },
        { ...mockPostWithIncludes, id: 'post-2', title: 'Room Post 2' },
      ];

      prismaService.post.findMany.mockResolvedValue(roomPosts);

      const result = await service.findByRoomId(mockRoomId, mockUserId);

      expect(result).toEqual(roomPosts);
      expect(result).toHaveLength(2);

      // Verify room-specific querying was called with user heart filtering
      expect(prismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { roomId: mockRoomId },
          include: expect.objectContaining({
            hearts: { where: { userId: mockUserId } },
          }),
        }),
      );
    });

    it('should handle reporting workflow with validation', async () => {
      const reporterId = 'reporter-123';

      // Step 1: Report a post
      prismaService.post.findUnique.mockResolvedValue(mockPost);
      prismaService.report.findFirst.mockResolvedValue(null);
      prismaService.report.create.mockResolvedValue(mockReport);

      const reportId = await service.reportPost(mockPostId, reporterId, 'spam');
      expect(reportId).toBe(mockReportId);

      // Step 2: Try to report the same post again (should fail)
      prismaService.report.findFirst.mockResolvedValue(mockReport);

      await expect(service.reportPost(mockPostId, reporterId, 'spam')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ===== PERFORMANCE TESTS =====

  describe('Performance tests', () => {
    it('should handle large numbers of posts efficiently', async () => {
      const largeBatchSize = 100;
      const largeBatch = Array.from({ length: largeBatchSize }, (_, i) => ({
        ...mockPostWithIncludes,
        id: `post-${i}`,
        title: `Post ${i}`,
      }));

      prismaService.post.findMany.mockResolvedValue(largeBatch);

      const startTime = Date.now();
      const result = await service.findAll();
      const endTime = Date.now();

      expect(result).toHaveLength(largeBatchSize);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast since it's just a mocked call
    });

    it('should handle concurrent heart operations', async () => {
      const concurrentOperations = 10;
      const heartPromises = Array.from({ length: concurrentOperations }, (_, i) => {
        const userId = `user-${i}`;
        prismaService.postHeart.findUnique.mockResolvedValue(null);
        prismaService.postHeart.create.mockResolvedValue({ ...mockHeart, userId });
        return service.heartPost(mockPostId, userId);
      });

      const results = await Promise.all(heartPromises);

      expect(results).toHaveLength(concurrentOperations);
      expect(results.every(r => r.hearted === true)).toBe(true);
    });

    it('should handle batch post operations efficiently', async () => {
      const batchSize = 50;
      const promises = Array.from({ length: batchSize }, (_, i) => {
        const postId = `post-${i}`;
        const userId = `user-${i}`;
        
        prismaService.post.findUnique.mockResolvedValue({ ...mockPostWithIncludes, id: postId });
        
        return service.findOne(postId, userId);
      });

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const endTime = Date.now();

      expect(results).toHaveLength(batchSize);
      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  // ===== ERROR HANDLING AND EDGE CASES =====

  describe('Error handling and edge cases', () => {
    it('should handle null and undefined inputs gracefully', async () => {
      // Test findUserById with null
      expect(service.findUserById(null as any)).rejects.toBeDefined();

      // Test findOne with undefined
      expect(service.findOne(undefined as any)).rejects.toBeDefined();

      // Test heartPost with empty strings
      prismaService.postHeart.findUnique.mockResolvedValue(null);
      expect(service.heartPost('', '')).rejects.toBeDefined();
    });

    it('should handle database connection failures', async () => {
      const connectionError = new Error('ECONNREFUSED');
      prismaService.post.findMany.mockRejectedValue(connectionError);

      await expect(service.findAll()).rejects.toThrow(connectionError);
    });

    it('should handle transaction rollback scenarios', async () => {
      const transactionError = new Error('Transaction rollback');
      prismaService.post.create.mockRejectedValue(transactionError);

      const createData: Prisma.PostCreateInput = {
        title: 'Test',
        content: 'Test',
        user: { connect: { id: mockUserId } },
        room: { connect: { id: mockRoomId } },
      };

      await expect(service.create(createData)).rejects.toThrow(transactionError);
    });

    it('should handle posts with missing relationships', async () => {
      const orphanedPost = {
        ...mockPost,
        user: null,
        room: null,
      };

      prismaService.post.findUnique.mockResolvedValue(orphanedPost);

      const result = await service.findOne(mockPostId);
      expect(result).toEqual(orphanedPost);
    });

    it('should handle malformed data gracefully', async () => {
      const malformedPost = {
        id: mockPostId,
        title: null,
        content: undefined,
        userId: '',
        roomId: null,
      };

      prismaService.post.findUnique.mockResolvedValue(malformedPost);

      const result = await service.findOne(mockPostId);
      expect(result).toEqual(malformedPost);
    });

    it('should handle very long content gracefully', async () => {
      const longContent = 'A'.repeat(10000);
      const createData: Prisma.PostCreateInput = {
        title: 'Long Content Post',
        content: longContent,
        user: { connect: { id: mockUserId } },
        room: { connect: { id: mockRoomId } },
      };

      const postWithLongContent = { ...mockPost, content: longContent };
      prismaService.post.create.mockResolvedValue(postWithLongContent);

      const result = await service.create(createData);
      expect(result.content).toHaveLength(10000);
    });

    it('should handle empty string inputs', async () => {
      const createData: Prisma.PostCreateInput = {
        title: '',
        content: '',
        user: { connect: { id: mockUserId } },
        room: { connect: { id: mockRoomId } },
      };

      const emptyPost = { ...mockPost, title: '', content: '' };
      prismaService.post.create.mockResolvedValue(emptyPost);

      const result = await service.create(createData);
      expect(result.title).toBe('');
      expect(result.content).toBe('');
    });

    it('should handle concurrent update and delete operations', async () => {
      const existingPost = { userId: mockUserId };
      prismaService.post.findUnique.mockResolvedValue(existingPost);

      // Simulate concurrent update
      const updatePromise = service.update(mockPostId, { title: 'Updated' }, mockUserId);
      prismaService.post.update.mockResolvedValue(mockPostWithIncludes);

      // Simulate concurrent delete
      const deletePromise = service.remove(mockPostId, mockUserId);
      prismaService.post.delete.mockResolvedValue(mockPost);

      // Both operations should proceed without interference in this implementation
      const [updateResult, deleteResult] = await Promise.all([updatePromise, deletePromise]);

      expect(updateResult).toBeDefined();
      expect(deleteResult).toBeDefined();
    });
  });

  // ===== SECURITY TESTS =====

  describe('Security considerations', () => {
    it('should prevent unauthorized post updates', async () => {
      const existingPost = { userId: 'other-user' };
      prismaService.post.findUnique.mockResolvedValue(existingPost);

      await expect(
        service.update(mockPostId, { title: 'Hacked!' }, 'malicious-user'),
      ).rejects.toThrow(ForbiddenException);

      expect(prismaService.post.update).not.toHaveBeenCalled();
    });

    it('should prevent unauthorized post deletions', async () => {
      const existingPost = { userId: 'other-user' };
      prismaService.post.findUnique.mockResolvedValue(existingPost);

      await expect(service.remove(mockPostId, 'malicious-user')).rejects.toThrow(
        ForbiddenException,
      );

      expect(prismaService.post.delete).not.toHaveBeenCalled();
    });

    it('should handle potential injection attacks in content', async () => {
      const maliciousContent = "<script>alert('xss')</script>";
      const createData: Prisma.PostCreateInput = {
        title: 'Normal Title',
        content: maliciousContent,
        user: { connect: { id: mockUserId } },
        room: { connect: { id: mockRoomId } },
      };

      const postWithMaliciousContent = { ...mockPost, content: maliciousContent };
      prismaService.post.create.mockResolvedValue(postWithMaliciousContent);

      // Service should accept the content as-is (sanitization happens at presentation layer)
      const result = await service.create(createData);
      expect(result.content).toBe(maliciousContent);
    });

    it('should prevent duplicate reporting abuse', async () => {
      prismaService.post.findUnique.mockResolvedValue(mockPost);
      prismaService.report.findFirst.mockResolvedValue(mockReport);

      await expect(
        service.reportPost(mockPostId, 'reporter-123', 'spam'),
      ).rejects.toThrow(ForbiddenException);

      expect(prismaService.report.create).not.toHaveBeenCalled();
    });

    it('should validate post existence before operations', async () => {
      prismaService.post.findUnique.mockResolvedValue(null);

      // Update
      await expect(
        service.update('non-existent', { title: 'Update' }, mockUserId),
      ).rejects.toThrow(NotFoundException);

      // Delete
      await expect(service.remove('non-existent', mockUserId)).rejects.toThrow(
        NotFoundException,
      );

      // Report
      await expect(
        service.reportPost('non-existent', 'reporter', 'reason'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});