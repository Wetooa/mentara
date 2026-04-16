import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { CommunityAccessGuard } from '../auth/core/guards/community-access.guard';
import { SupabaseStorageService } from '../common/services/supabase-storage.service';
import { Comment } from '@prisma/client';
import {
  MockBuilder,
  TestDataGenerator,
  TestAssertions,
  SecurityGuardTestUtils,
  TEST_USER_IDS,
  TEST_POST_IDS,
  TEST_COMMENT_IDS,
} from '../test-utils/auth-testing-helpers';

describe('CommentsController', () => {
  let controller: CommentsController;
  let commentsService: CommentsService;
  let supabaseStorageService: SupabaseStorageService;
  let mockJwtAuthGuard: jest.Mocked<JwtAuthGuard>;
  let mockCommunityAccessGuard: jest.Mocked<CommunityAccessGuard>;

  // Mock data
  const mockComment: Comment = {
    id: TEST_COMMENT_IDS.ANXIETY_COMMENT,
    content: 'This is a test comment',
    userId: TEST_USER_IDS.CLIENT,
    postId: TEST_POST_IDS.ANXIETY_POST,
    parentId: null,
    attachmentUrls: [],
    attachmentNames: [],
    attachmentSizes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockComments: Comment[] = [mockComment];

  const mockCreateCommentDto = {
    content: 'This is a new comment',
    postId: TEST_POST_IDS.ANXIETY_POST,
    parentId: null,
  };

  const mockUpdateCommentDto = {
    content: 'This is an updated comment',
  };

  const mockFiles = [
    {
      fieldname: 'files',
      originalname: 'comment-image.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 512,
      buffer: Buffer.from('test comment file content'),
    },
  ] as Express.Multer.File[];

  const mockFileResults = [
    {
      url: 'https://example.com/comment-image.jpg',
      filename: 'comment-image.jpg',
      size: 512,
    },
  ];

  beforeEach(async () => {
    // Create mock services
    const mockCommentsService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPostId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      heartComment: jest.fn(),
      isCommentHeartedByUser: jest.fn(),
      reportComment: jest.fn(),
    };

    const mockSupabaseStorageService = {
      validateFile: jest.fn(),
      uploadFiles: jest.fn(),
      getSupportedBuckets: jest.fn(),
    };

    mockJwtAuthGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    } as any;

    mockCommunityAccessGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    } as any;

    // Add static method mock
    SupabaseStorageService.getSupportedBuckets = jest.fn().mockReturnValue({
      POST_ATTACHMENTS: 'post-attachments',
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
        {
          provide: SupabaseStorageService,
          useValue: mockSupabaseStorageService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(CommunityAccessGuard)
      .useValue(mockCommunityAccessGuard)
      .compile();

    controller = module.get<CommentsController>(CommentsController);
    commentsService = module.get<CommentsService>(CommentsService);
    supabaseStorageService = module.get<SupabaseStorageService>(SupabaseStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all comments for authenticated user', async () => {
      // Arrange
      jest.spyOn(commentsService, 'findAll').mockResolvedValue(mockComments);

      // Act
      const result = await controller.findAll(TEST_USER_IDS.CLIENT);

      // Assert
      expect(commentsService.findAll).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(result).toEqual(mockComments);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(commentsService, 'findAll').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findAll(TEST_USER_IDS.CLIENT)).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should return a specific comment when found', async () => {
      // Arrange
      jest.spyOn(commentsService, 'findOne').mockResolvedValue(mockComment);

      // Act
      const result = await controller.findOne(TEST_COMMENT_IDS.ANXIETY_COMMENT);

      // Assert
      expect(commentsService.findOne).toHaveBeenCalledWith(TEST_COMMENT_IDS.ANXIETY_COMMENT);
      expect(result).toEqual(mockComment);
    });

    it('should throw HttpException when comment not found', async () => {
      // Arrange
      jest.spyOn(commentsService, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(controller.findOne(TEST_COMMENT_IDS.ANXIETY_COMMENT)).rejects.toThrow(
        new HttpException('Comment not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(commentsService, 'findOne').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findOne(TEST_COMMENT_IDS.ANXIETY_COMMENT)).rejects.toThrow(HttpException);
    });
  });

  describe('findByPostId', () => {
    it('should return comments for a specific post', async () => {
      // Arrange
      jest.spyOn(commentsService, 'findByPostId').mockResolvedValue(mockComments);

      // Act
      const result = await controller.findByPostId(TEST_POST_IDS.ANXIETY_POST, TEST_USER_IDS.CLIENT);

      // Assert
      expect(commentsService.findByPostId).toHaveBeenCalledWith(TEST_POST_IDS.ANXIETY_POST, TEST_USER_IDS.CLIENT);
      expect(result).toEqual(mockComments);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(commentsService, 'findByPostId').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findByPostId(TEST_POST_IDS.ANXIETY_POST, TEST_USER_IDS.CLIENT)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('create', () => {
    it('should create comment successfully without files', async () => {
      // Arrange
      jest.spyOn(commentsService, 'create').mockResolvedValue(mockComment);

      // Act
      const result = await controller.create(TEST_USER_IDS.CLIENT, mockCreateCommentDto);

      // Assert
      expect(commentsService.create).toHaveBeenCalledWith(
        mockCreateCommentDto,
        TEST_USER_IDS.CLIENT,
        [],
        [],
        [],
      );
      expect(result).toEqual(mockComment);
    });

    it('should create comment successfully with files', async () => {
      // Arrange
      jest.spyOn(commentsService, 'create').mockResolvedValue(mockComment);
      jest.spyOn(supabaseStorageService, 'validateFile').mockReturnValue({ isValid: true });
      jest.spyOn(supabaseStorageService, 'uploadFiles').mockResolvedValue(mockFileResults);

      // Act
      const result = await controller.create(TEST_USER_IDS.CLIENT, mockCreateCommentDto, mockFiles);

      // Assert
      expect(supabaseStorageService.validateFile).toHaveBeenCalledWith(mockFiles[0]);
      expect(supabaseStorageService.uploadFiles).toHaveBeenCalledWith(mockFiles, 'post-attachments');
      expect(commentsService.create).toHaveBeenCalledWith(
        mockCreateCommentDto,
        TEST_USER_IDS.CLIENT,
        ['https://example.com/comment-image.jpg'],
        ['comment-image.jpg'],
        [512],
      );
      expect(result).toEqual(mockComment);
    });

    it('should handle file validation errors', async () => {
      // Arrange
      jest.spyOn(supabaseStorageService, 'validateFile').mockReturnValue({
        isValid: false,
        error: 'Invalid file type',
      });

      // Act & Assert
      await expect(controller.create(TEST_USER_IDS.CLIENT, mockCreateCommentDto, mockFiles)).rejects.toThrow(
        HttpException,
      );
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(commentsService, 'create').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.create(TEST_USER_IDS.CLIENT, mockCreateCommentDto)).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    it('should update comment successfully', async () => {
      // Arrange
      const updatedComment = { ...mockComment, ...mockUpdateCommentDto };
      jest.spyOn(commentsService, 'update').mockResolvedValue(updatedComment);

      // Act
      const result = await controller.update(
        TEST_USER_IDS.CLIENT,
        TEST_COMMENT_IDS.ANXIETY_COMMENT,
        mockUpdateCommentDto,
      );

      // Assert
      expect(commentsService.update).toHaveBeenCalledWith(
        TEST_COMMENT_IDS.ANXIETY_COMMENT,
        mockUpdateCommentDto,
        TEST_USER_IDS.CLIENT,
      );
      expect(result).toEqual(updatedComment);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Comment not found');
      jest.spyOn(commentsService, 'update').mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.update(TEST_USER_IDS.CLIENT, TEST_COMMENT_IDS.ANXIETY_COMMENT, mockUpdateCommentDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('remove', () => {
    it('should delete comment successfully', async () => {
      // Arrange
      jest.spyOn(commentsService, 'remove').mockResolvedValue(mockComment);

      // Act
      const result = await controller.remove(TEST_USER_IDS.CLIENT, TEST_COMMENT_IDS.ANXIETY_COMMENT);

      // Assert
      expect(commentsService.remove).toHaveBeenCalledWith(TEST_COMMENT_IDS.ANXIETY_COMMENT, TEST_USER_IDS.CLIENT);
      expect(result).toEqual(mockComment);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Comment not found');
      jest.spyOn(commentsService, 'remove').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.remove(TEST_USER_IDS.CLIENT, TEST_COMMENT_IDS.ANXIETY_COMMENT)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('heartComment', () => {
    it('should heart comment successfully', async () => {
      // Arrange
      const heartResult = { hearted: true };
      jest.spyOn(commentsService, 'heartComment').mockResolvedValue(heartResult);

      // Act
      const result = await controller.heartComment(TEST_USER_IDS.CLIENT, TEST_COMMENT_IDS.ANXIETY_COMMENT);

      // Assert
      expect(commentsService.heartComment).toHaveBeenCalledWith(
        TEST_COMMENT_IDS.ANXIETY_COMMENT,
        TEST_USER_IDS.CLIENT,
      );
      expect(result).toEqual(heartResult);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Comment not found');
      jest.spyOn(commentsService, 'heartComment').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.heartComment(TEST_USER_IDS.CLIENT, TEST_COMMENT_IDS.ANXIETY_COMMENT)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('isCommentHearted', () => {
    it('should check if comment is hearted successfully', async () => {
      // Arrange
      jest.spyOn(commentsService, 'isCommentHeartedByUser').mockResolvedValue(true);

      // Act
      const result = await controller.isCommentHearted(TEST_USER_IDS.CLIENT, TEST_COMMENT_IDS.ANXIETY_COMMENT);

      // Assert
      expect(commentsService.isCommentHeartedByUser).toHaveBeenCalledWith(
        TEST_COMMENT_IDS.ANXIETY_COMMENT,
        TEST_USER_IDS.CLIENT,
      );
      expect(result).toEqual({ hearted: true });
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(commentsService, 'isCommentHeartedByUser').mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.isCommentHearted(TEST_USER_IDS.CLIENT, TEST_COMMENT_IDS.ANXIETY_COMMENT),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('reportComment', () => {
    const reportData = {
      reason: 'harassment',
      content: 'This comment is inappropriate',
    };

    it('should report comment successfully', async () => {
      // Arrange
      const reportId = 'comment-report-123';
      jest.spyOn(commentsService, 'reportComment').mockResolvedValue(reportId);

      // Act
      const result = await controller.reportComment(
        TEST_USER_IDS.CLIENT,
        TEST_COMMENT_IDS.ANXIETY_COMMENT,
        reportData,
      );

      // Assert
      expect(commentsService.reportComment).toHaveBeenCalledWith(
        TEST_COMMENT_IDS.ANXIETY_COMMENT,
        TEST_USER_IDS.CLIENT,
        reportData.reason,
        reportData.content,
      );
      expect(result).toEqual({ success: true, reportId });
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Comment not found');
      jest.spyOn(commentsService, 'reportComment').mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.reportComment(TEST_USER_IDS.CLIENT, TEST_COMMENT_IDS.ANXIETY_COMMENT, reportData),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('Security Integration', () => {
    it('should have proper guards applied', () => {
      // Test that guards are applied at controller level
      const guards = Reflect.getMetadata('__guards__', CommentsController);
      expect(guards).toBeDefined();
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(CommunityAccessGuard);
    });

    it('should apply RequireRoomAccess decorator to all endpoints', () => {
      // Test that all endpoints have the RequireRoomAccess decorator
      const protectedMethods = [
        'findOne',
        'findByPostId',
        'create',
        'update',
        'remove',
        'heartComment',
        'reportComment',
      ];

      protectedMethods.forEach(method => {
        const metadata = Reflect.getMetadata('require_room_access', controller[method as keyof CommentsController]);
        expect(metadata).toBeTruthy();
      });
    });

    it('should test community access guard integration', async () => {
      // Test that CommunityAccessGuard is called for protected endpoints
      mockCommunityAccessGuard.canActivate.mockReturnValue(true);
      jest.spyOn(commentsService, 'findOne').mockResolvedValue(mockComment);

      // Act
      await controller.findOne(TEST_COMMENT_IDS.ANXIETY_COMMENT);

      // Assert
      expect(mockCommunityAccessGuard.canActivate).toHaveBeenCalled();
    });
  });

  describe('Nested Comments (Parent-Child)', () => {
    it('should create nested comment successfully', async () => {
      // Arrange
      const nestedCommentDto = {
        content: 'This is a reply to another comment',
        postId: TEST_POST_IDS.ANXIETY_POST,
        parentId: TEST_COMMENT_IDS.ANXIETY_COMMENT,
      };

      const nestedComment = {
        ...mockComment,
        id: 'nested-comment-123',
        parentId: TEST_COMMENT_IDS.ANXIETY_COMMENT,
        content: nestedCommentDto.content,
      };

      jest.spyOn(commentsService, 'create').mockResolvedValue(nestedComment);

      // Act
      const result = await controller.create(TEST_USER_IDS.CLIENT, nestedCommentDto);

      // Assert
      expect(commentsService.create).toHaveBeenCalledWith(
        nestedCommentDto,
        TEST_USER_IDS.CLIENT,
        [],
        [],
        [],
      );
      expect(result).toEqual(nestedComment);
    });

    it('should handle nested comment creation errors', async () => {
      // Arrange
      const nestedCommentDto = {
        content: 'This is a reply to another comment',
        postId: TEST_POST_IDS.ANXIETY_POST,
        parentId: 'non-existent-comment',
      };

      const error = new Error('Parent comment not found');
      jest.spyOn(commentsService, 'create').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.create(TEST_USER_IDS.CLIENT, nestedCommentDto)).rejects.toThrow(HttpException);
    });
  });

  describe('File Upload Integration', () => {
    it('should handle multiple file uploads', async () => {
      // Arrange
      const multipleFiles = [
        { ...mockFiles[0], originalname: 'comment1.jpg' },
        { ...mockFiles[0], originalname: 'comment2.jpg' },
      ];
      const multipleFileResults = [
        { url: 'https://example.com/comment1.jpg', filename: 'comment1.jpg', size: 512 },
        { url: 'https://example.com/comment2.jpg', filename: 'comment2.jpg', size: 512 },
      ];

      jest.spyOn(commentsService, 'create').mockResolvedValue(mockComment);
      jest.spyOn(supabaseStorageService, 'validateFile').mockReturnValue({ isValid: true });
      jest.spyOn(supabaseStorageService, 'uploadFiles').mockResolvedValue(multipleFileResults);

      // Act
      const result = await controller.create(TEST_USER_IDS.CLIENT, mockCreateCommentDto, multipleFiles);

      // Assert
      expect(supabaseStorageService.validateFile).toHaveBeenCalledTimes(2);
      expect(supabaseStorageService.uploadFiles).toHaveBeenCalledWith(multipleFiles, 'post-attachments');
      expect(commentsService.create).toHaveBeenCalledWith(
        mockCreateCommentDto,
        TEST_USER_IDS.CLIENT,
        ['https://example.com/comment1.jpg', 'https://example.com/comment2.jpg'],
        ['comment1.jpg', 'comment2.jpg'],
        [512, 512],
      );
      expect(result).toEqual(mockComment);
    });

    it('should handle file upload service errors', async () => {
      // Arrange
      jest.spyOn(supabaseStorageService, 'validateFile').mockReturnValue({ isValid: true });
      jest.spyOn(supabaseStorageService, 'uploadFiles').mockRejectedValue(new Error('Upload failed'));

      // Act & Assert
      await expect(controller.create(TEST_USER_IDS.CLIENT, mockCreateCommentDto, mockFiles)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle HttpException properly', async () => {
      // Arrange
      const httpException = new HttpException('Custom error', HttpStatus.BAD_REQUEST);
      jest.spyOn(commentsService, 'findOne').mockRejectedValue(httpException);

      // Act & Assert
      await expect(controller.findOne(TEST_COMMENT_IDS.ANXIETY_COMMENT)).rejects.toThrow(httpException);
    });

    it('should wrap unknown errors in HttpException', async () => {
      // Arrange
      const unknownError = new Error('Unknown error');
      jest.spyOn(commentsService, 'findAll').mockRejectedValue(unknownError);

      // Act & Assert
      await expect(controller.findAll(TEST_USER_IDS.CLIENT)).rejects.toThrow(HttpException);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete comment creation workflow', async () => {
      // Arrange
      jest.spyOn(commentsService, 'create').mockResolvedValue(mockComment);

      // Act
      const result = await controller.create(TEST_USER_IDS.CLIENT, mockCreateCommentDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.content).toBe(mockComment.content);
      expect(result.userId).toBe(TEST_USER_IDS.CLIENT);
      expect(result.postId).toBe(TEST_POST_IDS.ANXIETY_POST);
    });

    it('should handle complete comment update workflow', async () => {
      // Arrange
      const updatedComment = { ...mockComment, content: 'Updated content' };
      jest.spyOn(commentsService, 'update').mockResolvedValue(updatedComment);

      // Act
      const result = await controller.update(
        TEST_USER_IDS.CLIENT,
        TEST_COMMENT_IDS.ANXIETY_COMMENT,
        { content: 'Updated content' },
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.content).toBe('Updated content');
      expect(result.id).toBe(TEST_COMMENT_IDS.ANXIETY_COMMENT);
    });

    it('should handle complete comment heart workflow', async () => {
      // Arrange
      const heartResult = { hearted: true };
      jest.spyOn(commentsService, 'heartComment').mockResolvedValue(heartResult);

      // Act
      const result = await controller.heartComment(TEST_USER_IDS.CLIENT, TEST_COMMENT_IDS.ANXIETY_COMMENT);

      // Assert
      expect(result).toBeDefined();
      expect(result.hearted).toBe(true);
    });
  });
});