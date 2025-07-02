import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { AttachmentEntityType, AttachmentPurpose } from '@prisma/client';
import { createMockPrismaService, TEST_USER_IDS } from '../test-utils';

describe('CommentsService', () => {
  let service: CommentsService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: TEST_USER_IDS.CLIENT,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findUserById(TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: TEST_USER_IDS.CLIENT },
      });
    });

    it('should return null when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findUserById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should re-throw NotFoundException', async () => {
      prismaService.user.findUnique.mockRejectedValue(new NotFoundException('User not found'));

      await expect(service.findUserById(TEST_USER_IDS.CLIENT)).rejects.toThrow(NotFoundException);
    });

    it('should wrap database errors in InternalServerErrorException', async () => {
      prismaService.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(service.findUserById(TEST_USER_IDS.CLIENT)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    const mockComments = [
      {
        id: 'comment-1',
        content: 'First comment',
        userId: TEST_USER_IDS.CLIENT,
        postId: 'post-1',
        user: {
          id: TEST_USER_IDS.CLIENT,
          firstName: 'John',
          lastName: 'Doe',
          avatarUrl: 'avatar.jpg',
        },
        post: {
          id: 'post-1',
          title: 'Test Post',
        },
        replies: [],
        hearts: [],
        _count: {
          replies: 0,
          hearts: 2,
        },
      },
    ];

    it('should return all comments without user hearts when no userId provided', async () => {
      prismaService.comment.findMany.mockResolvedValue(mockComments);

      const result = await service.findAll();

      expect(result).toEqual(mockComments);
      expect(prismaService.comment.findMany).toHaveBeenCalledWith({
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
            },
          },
          replies: {
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
            orderBy: {
              createdAt: 'asc',
            },
          },
          hearts: false,
          _count: {
            select: {
              replies: true,
              hearts: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return comments with user hearts when userId provided', async () => {
      prismaService.comment.findMany.mockResolvedValue(mockComments);

      const result = await service.findAll(TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockComments);
      expect(prismaService.comment.findMany).toHaveBeenCalledWith({
        include: expect.objectContaining({
          hearts: {
            where: {
              userId: TEST_USER_IDS.CLIENT,
            },
          },
        }),
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should handle database errors', async () => {
      prismaService.comment.findMany.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    const mockComment = {
      id: 'comment-1',
      content: 'Test comment',
      userId: TEST_USER_IDS.CLIENT,
      user: {
        id: TEST_USER_IDS.CLIENT,
        firstName: 'John',
        lastName: 'Doe',
      },
      replies: [],
      hearts: [
        { id: 'heart-1', userId: TEST_USER_IDS.CLIENT },
        { id: 'heart-2', userId: 'user-2' },
      ],
    };

    it('should return comment with hearts count and files', async () => {
      const mockFiles = [
        {
          id: 'attachment-1',
          commentId: 'comment-1',
          url: '/api/files/file-1',
          type: 'image/jpeg',
        },
      ];

      prismaService.comment.findUnique.mockResolvedValue(mockComment);
      jest.spyOn(service, 'getCommentAttachments').mockResolvedValue(mockFiles);

      const result = await service.findOne('comment-1');

      expect(result).toEqual({
        ...mockComment,
        hearts: 2, // Count instead of array
        files: mockFiles,
      });
      expect(service.getCommentAttachments).toHaveBeenCalledWith('comment-1');
    });

    it('should throw NotFoundException when comment not found', async () => {
      prismaService.comment.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('should handle database errors', async () => {
      prismaService.comment.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(service.findOne('comment-1')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findByPostId', () => {
    const mockComments = [
      {
        id: 'comment-1',
        content: 'Comment on post',
        postId: 'post-1',
        user: { firstName: 'John', lastName: 'Doe' },
        replies: [],
        hearts: [],
        _count: { replies: 0, hearts: 1 },
      },
    ];

    it('should return comments for specific post', async () => {
      prismaService.comment.findMany.mockResolvedValue(mockComments);

      const result = await service.findByPostId('post-1');

      expect(result).toEqual(mockComments);
      expect(prismaService.comment.findMany).toHaveBeenCalledWith({
        where: { postId: 'post-1' },
        include: expect.objectContaining({
          hearts: false,
        }),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should include user hearts when userId provided', async () => {
      prismaService.comment.findMany.mockResolvedValue(mockComments);

      await service.findByPostId('post-1', TEST_USER_IDS.CLIENT);

      expect(prismaService.comment.findMany).toHaveBeenCalledWith({
        where: { postId: 'post-1' },
        include: expect.objectContaining({
          hearts: {
            where: { userId: TEST_USER_IDS.CLIENT },
          },
        }),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('create', () => {
    const mockCommentData = {
      postId: 'post-1',
      content: 'New comment',
    };

    const mockCreatedComment = {
      id: 'comment-1',
      content: 'New comment',
      userId: TEST_USER_IDS.CLIENT,
      postId: 'post-1',
      user: {
        id: TEST_USER_IDS.CLIENT,
        firstName: 'John',
        lastName: 'Doe',
      },
      hearts: [],
    };

    it('should create comment successfully', async () => {
      const mockFiles = [];

      prismaService.comment.create.mockResolvedValue(mockCreatedComment);
      jest.spyOn(service, 'getCommentAttachments').mockResolvedValue(mockFiles);

      const result = await service.create(mockCommentData, TEST_USER_IDS.CLIENT);

      expect(result).toEqual({
        ...mockCreatedComment,
        hearts: 0, // Count instead of array
        files: mockFiles,
      });
      expect(prismaService.comment.create).toHaveBeenCalledWith({
        data: {
          userId: TEST_USER_IDS.CLIENT,
          postId: 'post-1',
          content: 'New comment',
        },
        include: {
          user: true,
          hearts: true,
        },
      });
    });

    it('should handle creation errors', async () => {
      prismaService.comment.create.mockRejectedValue(new Error('Creation failed'));

      await expect(service.create(mockCommentData, TEST_USER_IDS.CLIENT)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    const mockUpdateData = {
      content: 'Updated comment',
    };

    const mockComment = {
      id: 'comment-1',
      userId: TEST_USER_IDS.CLIENT,
    };

    const mockUpdatedComment = {
      id: 'comment-1',
      content: 'Updated comment',
      userId: TEST_USER_IDS.CLIENT,
      user: {
        id: TEST_USER_IDS.CLIENT,
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'avatar.jpg',
      },
      hearts: [],
    };

    it('should update comment successfully', async () => {
      const mockFiles = [];

      prismaService.comment.findUnique.mockResolvedValue(mockComment);
      prismaService.comment.update.mockResolvedValue(mockUpdatedComment);
      jest.spyOn(service, 'getCommentAttachments').mockResolvedValue(mockFiles);

      const result = await service.update('comment-1', mockUpdateData, TEST_USER_IDS.CLIENT);

      expect(result).toEqual({
        ...mockUpdatedComment,
        hearts: 0,
        files: mockFiles,
      });
      expect(prismaService.comment.update).toHaveBeenCalledWith({
        where: { id: 'comment-1', userId: TEST_USER_IDS.CLIENT },
        data: { content: 'Updated comment' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          hearts: true,
        },
      });
    });

    it('should throw NotFoundException when comment not found', async () => {
      prismaService.comment.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', mockUpdateData, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not comment owner', async () => {
      const otherUserComment = {
        id: 'comment-1',
        userId: 'other-user-id',
      };

      prismaService.comment.findUnique.mockResolvedValue(otherUserComment);

      await expect(
        service.update('comment-1', mockUpdateData, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    const mockComment = {
      id: 'comment-1',
      userId: TEST_USER_IDS.CLIENT,
    };

    const mockDeletedComment = {
      id: 'comment-1',
      content: 'Deleted comment',
      userId: TEST_USER_IDS.CLIENT,
    };

    it('should delete comment successfully', async () => {
      prismaService.comment.findUnique.mockResolvedValue(mockComment);
      prismaService.comment.delete.mockResolvedValue(mockDeletedComment);

      const result = await service.remove('comment-1', TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockDeletedComment);
      expect(prismaService.comment.delete).toHaveBeenCalledWith({
        where: { id: 'comment-1' },
      });
    });

    it('should throw NotFoundException when comment not found', async () => {
      prismaService.comment.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id', TEST_USER_IDS.CLIENT)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user is not comment owner', async () => {
      const otherUserComment = {
        id: 'comment-1',
        userId: 'other-user-id',
      };

      prismaService.comment.findUnique.mockResolvedValue(otherUserComment);

      await expect(service.remove('comment-1', TEST_USER_IDS.CLIENT)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findByUserId', () => {
    const mockUserComments = [
      {
        id: 'comment-1',
        content: 'User comment',
        userId: TEST_USER_IDS.CLIENT,
        user: { firstName: 'John', lastName: 'Doe' },
        post: { id: 'post-1', title: 'Test Post' },
        replies: [],
        _count: { replies: 0, hearts: 1 },
      },
    ];

    it('should return comments by user ID', async () => {
      prismaService.comment.findMany.mockResolvedValue(mockUserComments);

      const result = await service.findByUserId(TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockUserComments);
      expect(prismaService.comment.findMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER_IDS.CLIENT },
        include: expect.objectContaining({
          user: { select: expect.any(Object) },
          post: { select: expect.any(Object) },
          replies: { include: expect.any(Object) },
          _count: { select: expect.any(Object) },
        }),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('Heart functionality', () => {
    describe('heartComment', () => {
      it('should add heart when not already hearted', async () => {
        prismaService.commentHeart.findUnique.mockResolvedValue(null);
        prismaService.commentHeart.create.mockResolvedValue({
          id: 'heart-1',
          commentId: 'comment-1',
          userId: TEST_USER_IDS.CLIENT,
        });

        const result = await service.heartComment('comment-1', TEST_USER_IDS.CLIENT);

        expect(result).toEqual({ hearted: true });
        expect(prismaService.commentHeart.create).toHaveBeenCalledWith({
          data: {
            commentId: 'comment-1',
            userId: TEST_USER_IDS.CLIENT,
          },
        });
      });

      it('should remove heart when already hearted', async () => {
        const existingHeart = {
          id: 'heart-1',
          commentId: 'comment-1',
          userId: TEST_USER_IDS.CLIENT,
        };

        prismaService.commentHeart.findUnique.mockResolvedValue(existingHeart);
        prismaService.commentHeart.delete.mockResolvedValue(existingHeart);

        const result = await service.heartComment('comment-1', TEST_USER_IDS.CLIENT);

        expect(result).toEqual({ hearted: false });
        expect(prismaService.commentHeart.delete).toHaveBeenCalledWith({
          where: {
            commentId_userId: {
              commentId: 'comment-1',
              userId: TEST_USER_IDS.CLIENT,
            },
          },
        });
      });

      it('should handle database errors', async () => {
        prismaService.commentHeart.findUnique.mockRejectedValue(new Error('Database error'));

        await expect(service.heartComment('comment-1', TEST_USER_IDS.CLIENT)).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });

    describe('isCommentHeartedByUser', () => {
      it('should return true when comment is hearted', async () => {
        const existingHeart = {
          id: 'heart-1',
          commentId: 'comment-1',
          userId: TEST_USER_IDS.CLIENT,
        };

        prismaService.commentHeart.findUnique.mockResolvedValue(existingHeart);

        const result = await service.isCommentHeartedByUser('comment-1', TEST_USER_IDS.CLIENT);

        expect(result).toBe(true);
      });

      it('should return false when comment is not hearted', async () => {
        prismaService.commentHeart.findUnique.mockResolvedValue(null);

        const result = await service.isCommentHeartedByUser('comment-1', TEST_USER_IDS.CLIENT);

        expect(result).toBe(false);
      });
    });
  });

  describe('Reply functionality', () => {
    describe('createReply', () => {
      const mockReplyData = {
        content: 'Test reply',
        userId: TEST_USER_IDS.CLIENT,
        commentId: 'comment-1',
      };

      const mockCreatedReply = {
        id: 'reply-1',
        content: 'Test reply',
        userId: TEST_USER_IDS.CLIENT,
        commentId: 'comment-1',
        user: {
          id: TEST_USER_IDS.CLIENT,
          firstName: 'John',
          lastName: 'Doe',
          avatarUrl: 'avatar.jpg',
        },
        comment: {
          id: 'comment-1',
          content: 'Original comment',
        },
        hearts: [],
      };

      it('should create reply successfully', async () => {
        prismaService.reply.create.mockResolvedValue(mockCreatedReply);

        const result = await service.createReply(mockReplyData);

        expect(result).toEqual(mockCreatedReply);
        expect(prismaService.reply.create).toHaveBeenCalledWith({
          data: mockReplyData,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
            comment: true,
            hearts: true,
          },
        });
      });

      it('should handle creation errors', async () => {
        prismaService.reply.create.mockRejectedValue(new Error('Creation failed'));

        await expect(service.createReply(mockReplyData)).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });

    describe('findRepliesByCommentId', () => {
      const mockReplies = [
        {
          id: 'reply-1',
          content: 'First reply',
          commentId: 'comment-1',
          user: { firstName: 'John', lastName: 'Doe' },
          hearts: [],
          _count: { hearts: 0 },
        },
      ];

      it('should return replies without user hearts when no userId provided', async () => {
        prismaService.reply.findMany.mockResolvedValue(mockReplies);

        const result = await service.findRepliesByCommentId('comment-1');

        expect(result).toEqual(mockReplies);
        expect(prismaService.reply.findMany).toHaveBeenCalledWith({
          where: { commentId: 'comment-1' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
            hearts: true,
            _count: {
              select: { hearts: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        });
      });

      it('should return replies with user hearts when userId provided', async () => {
        prismaService.reply.findMany.mockResolvedValue(mockReplies);

        await service.findRepliesByCommentId('comment-1', TEST_USER_IDS.CLIENT);

        expect(prismaService.reply.findMany).toHaveBeenCalledWith({
          where: { commentId: 'comment-1' },
          include: expect.objectContaining({
            hearts: {
              where: { userId: TEST_USER_IDS.CLIENT },
            },
          }),
          orderBy: { createdAt: 'asc' },
        });
      });
    });

    describe('heartReply', () => {
      it('should add heart to reply when not already hearted', async () => {
        prismaService.replyHeart.findUnique.mockResolvedValue(null);
        prismaService.replyHeart.create.mockResolvedValue({
          id: 'heart-1',
          replyId: 'reply-1',
          userId: TEST_USER_IDS.CLIENT,
        });

        const result = await service.heartReply('reply-1', TEST_USER_IDS.CLIENT);

        expect(result).toEqual({ hearted: true });
        expect(prismaService.replyHeart.create).toHaveBeenCalledWith({
          data: {
            replyId: 'reply-1',
            userId: TEST_USER_IDS.CLIENT,
          },
        });
      });

      it('should remove heart from reply when already hearted', async () => {
        const existingHeart = {
          id: 'heart-1',
          replyId: 'reply-1',
          userId: TEST_USER_IDS.CLIENT,
        };

        prismaService.replyHeart.findUnique.mockResolvedValue(existingHeart);
        prismaService.replyHeart.delete.mockResolvedValue(existingHeart);

        const result = await service.heartReply('reply-1', TEST_USER_IDS.CLIENT);

        expect(result).toEqual({ hearted: false });
        expect(prismaService.replyHeart.delete).toHaveBeenCalledWith({
          where: {
            replyId_userId: {
              replyId: 'reply-1',
              userId: TEST_USER_IDS.CLIENT,
            },
          },
        });
      });
    });

    describe('isReplyHeartedByUser', () => {
      it('should return true when reply is hearted', async () => {
        const existingHeart = {
          id: 'heart-1',
          replyId: 'reply-1',
          userId: TEST_USER_IDS.CLIENT,
        };

        prismaService.replyHeart.findUnique.mockResolvedValue(existingHeart);

        const result = await service.isReplyHeartedByUser('reply-1', TEST_USER_IDS.CLIENT);

        expect(result).toBe(true);
      });

      it('should return false when reply is not hearted', async () => {
        prismaService.replyHeart.findUnique.mockResolvedValue(null);

        const result = await service.isReplyHeartedByUser('reply-1', TEST_USER_IDS.CLIENT);

        expect(result).toBe(false);
      });
    });
  });

  describe('File attachment functionality', () => {
    describe('Comment attachments', () => {
      describe('attachFilesToComment', () => {
        it('should attach files to comment with default purpose', async () => {
          const fileIds = ['file-1', 'file-2'];
          const expectedData = [
            {
              fileId: 'file-1',
              entityType: AttachmentEntityType.COMMENT,
              entityId: 'comment-1',
              purpose: AttachmentPurpose.MEDIA,
              order: 0,
            },
            {
              fileId: 'file-2',
              entityType: AttachmentEntityType.COMMENT,
              entityId: 'comment-1',
              purpose: AttachmentPurpose.MEDIA,
              order: 1,
            },
          ];

          prismaService.fileAttachment.createMany.mockResolvedValue({ count: 2 });

          const result = await service.attachFilesToComment('comment-1', fileIds);

          expect(result).toEqual({ count: 2 });
          expect(prismaService.fileAttachment.createMany).toHaveBeenCalledWith({
            data: expectedData,
          });
        });

        it('should attach files with custom purpose', async () => {
          const fileIds = ['file-1'];

          await service.attachFilesToComment('comment-1', fileIds, AttachmentPurpose.DOCUMENT);

          expect(prismaService.fileAttachment.createMany).toHaveBeenCalledWith({
            data: [
              expect.objectContaining({
                purpose: AttachmentPurpose.DOCUMENT,
              }),
            ],
          });
        });
      });

      describe('getCommentAttachments', () => {
        it('should return formatted comment attachments', async () => {
          const mockAttachments = [
            {
              id: 'attachment-1',
              entityId: 'comment-1',
              file: {
                id: 'file-1',
                storageUrl: 'https://storage.com/file-1.jpg',
                mimeType: 'image/jpeg',
              },
            },
            {
              id: 'attachment-2',
              entityId: 'comment-1',
              file: {
                id: 'file-2',
                storageUrl: null,
                mimeType: 'image/png',
              },
            },
          ];

          prismaService.fileAttachment.findMany.mockResolvedValue(mockAttachments);

          const result = await service.getCommentAttachments('comment-1');

          expect(result).toEqual([
            {
              id: 'attachment-1',
              commentId: 'comment-1',
              url: 'https://storage.com/file-1.jpg',
              type: 'image/jpeg',
            },
            {
              id: 'attachment-2',
              commentId: 'comment-1',
              url: '/api/files/file-2',
              type: 'image/png',
            },
          ]);

          expect(prismaService.fileAttachment.findMany).toHaveBeenCalledWith({
            where: {
              entityType: AttachmentEntityType.COMMENT,
              entityId: 'comment-1',
            },
            include: {
              file: true,
            },
            orderBy: { order: 'asc' },
          });
        });
      });

      describe('removeCommentAttachment', () => {
        it('should remove comment attachment', async () => {
          prismaService.fileAttachment.deleteMany.mockResolvedValue({ count: 1 });

          const result = await service.removeCommentAttachment('comment-1', 'file-1');

          expect(result).toEqual({ count: 1 });
          expect(prismaService.fileAttachment.deleteMany).toHaveBeenCalledWith({
            where: {
              entityType: AttachmentEntityType.COMMENT,
              entityId: 'comment-1',
              fileId: 'file-1',
            },
          });
        });
      });
    });

    describe('Reply attachments', () => {
      describe('attachFilesToReply', () => {
        it('should attach files to reply', async () => {
          const fileIds = ['file-1'];
          const expectedData = [
            {
              fileId: 'file-1',
              entityType: AttachmentEntityType.REPLY,
              entityId: 'reply-1',
              purpose: AttachmentPurpose.MEDIA,
              order: 0,
            },
          ];

          prismaService.fileAttachment.createMany.mockResolvedValue({ count: 1 });

          const result = await service.attachFilesToReply('reply-1', fileIds);

          expect(result).toEqual({ count: 1 });
          expect(prismaService.fileAttachment.createMany).toHaveBeenCalledWith({
            data: expectedData,
          });
        });
      });

      describe('getReplyAttachments', () => {
        it('should return reply attachments', async () => {
          const mockAttachments = [
            {
              id: 'attachment-1',
              entityId: 'reply-1',
              file: {
                id: 'file-1',
                storageUrl: 'storage-url',
                mimeType: 'image/jpeg',
              },
            },
          ];

          prismaService.fileAttachment.findMany.mockResolvedValue(mockAttachments);

          const result = await service.getReplyAttachments('reply-1');

          expect(result).toEqual(mockAttachments);
          expect(prismaService.fileAttachment.findMany).toHaveBeenCalledWith({
            where: {
              entityType: AttachmentEntityType.REPLY,
              entityId: 'reply-1',
            },
            include: {
              file: true,
            },
            orderBy: { order: 'asc' },
          });
        });
      });

      describe('removeReplyAttachment', () => {
        it('should remove reply attachment', async () => {
          prismaService.fileAttachment.deleteMany.mockResolvedValue({ count: 1 });

          const result = await service.removeReplyAttachment('reply-1', 'file-1');

          expect(result).toEqual({ count: 1 });
          expect(prismaService.fileAttachment.deleteMany).toHaveBeenCalledWith({
            where: {
              entityType: AttachmentEntityType.REPLY,
              entityId: 'reply-1',
              fileId: 'file-1',
            },
          });
        });
      });
    });
  });

  describe('Error handling', () => {
    it('should handle non-Error objects in catch blocks', async () => {
      prismaService.comment.findMany.mockRejectedValue('String error');

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
    });

    it('should re-throw ForbiddenException from database operations', async () => {
      prismaService.comment.findMany.mockRejectedValue(new ForbiddenException('Access denied'));

      await expect(service.findAll()).rejects.toThrow(ForbiddenException);
    });

    it('should handle complex database operations errors', async () => {
      prismaService.reply.create.mockRejectedValue(new Error('Complex database error'));

      await expect(
        service.createReply({
          content: 'Test',
          userId: TEST_USER_IDS.CLIENT,
          commentId: 'comment-1',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});