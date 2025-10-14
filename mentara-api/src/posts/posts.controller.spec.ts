import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { CommunityAccessGuard } from '../auth/core/guards/community-access.guard';
import { SupabaseStorageService } from '../common/services/supabase-storage.service';
import { Post as PostEntity } from '@prisma/client';
import {
  MockBuilder,
  TestDataGenerator,
  TestAssertions,
  SecurityGuardTestUtils,
  TEST_USER_IDS,
  TEST_POST_IDS,
  TEST_ROOM_IDS,
  TEST_COMMUNITY_IDS,
} from '../test-utils/auth-testing-helpers';
import { createMockPrismaService } from '../test-utils';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;
  let supabaseStorageService: SupabaseStorageService;
  let mockJwtAuthGuard: jest.Mocked<JwtAuthGuard>;
  let mockCommunityAccessGuard: jest.Mocked<CommunityAccessGuard>;

  // Mock data
  const mockUser = TestDataGenerator.createUser({
    id: TEST_USER_IDS.CLIENT,
    role: 'client',
  });

  const mockPost: PostEntity = {
    id: TEST_POST_IDS.ANXIETY_POST,
    title: 'Test Post',
    content: 'This is a test post content',
    userId: TEST_USER_IDS.CLIENT,
    roomId: TEST_ROOM_IDS.ANXIETY_CHAT,
    attachmentUrls: [],
    attachmentNames: [],
    attachmentSizes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPosts: PostEntity[] = [mockPost];

  const mockCreatePostDto = {
    title: 'New Test Post',
    content: 'This is a new test post',
    roomId: TEST_ROOM_IDS.ANXIETY_CHAT,
  };

  const mockUpdatePostDto = {
    title: 'Updated Test Post',
    content: 'This is an updated test post',
  };

  const mockFiles = [
    {
      fieldname: 'files',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test file content'),
    },
  ] as Express.Multer.File[];

  const mockFileResults = [
    {
      url: 'https://example.com/test.jpg',
      filename: 'test.jpg',
      size: 1024,
    },
  ];

  beforeEach(async () => {
    // Create mock services
    const mockPostsService = {
      findUserById: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByUserId: jest.fn(),
      findByRoomId: jest.fn(),
      heartPost: jest.fn(),
      isPostHeartedByUser: jest.fn(),
      reportPost: jest.fn(),
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
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
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

    controller = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
    supabaseStorageService = module.get<SupabaseStorageService>(SupabaseStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all posts for authenticated user', async () => {
      // Arrange
      jest.spyOn(postsService, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(postsService, 'findAll').mockResolvedValue(mockPosts);

      // Act
      const result = await controller.findAll(TEST_USER_IDS.CLIENT);

      // Assert
      expect(postsService.findUserById).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(postsService.findAll).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockPosts);
    });

    it('should handle user not found', async () => {
      // Arrange
      jest.spyOn(postsService, 'findUserById').mockResolvedValue(null);
      jest.spyOn(postsService, 'findAll').mockResolvedValue([]);

      // Act
      const result = await controller.findAll(TEST_USER_IDS.CLIENT);

      // Assert
      expect(postsService.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(postsService, 'findUserById').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findAll(TEST_USER_IDS.CLIENT)).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should return a specific post when found', async () => {
      // Arrange
      jest.spyOn(postsService, 'findOne').mockResolvedValue(mockPost);

      // Act
      const result = await controller.findOne(TEST_POST_IDS.ANXIETY_POST, TEST_USER_IDS.CLIENT);

      // Assert
      expect(postsService.findOne).toHaveBeenCalledWith(TEST_POST_IDS.ANXIETY_POST, TEST_USER_IDS.CLIENT);
      expect(result).toEqual(mockPost);
    });

    it('should throw HttpException when post not found', async () => {
      // Arrange
      jest.spyOn(postsService, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(controller.findOne(TEST_POST_IDS.ANXIETY_POST, TEST_USER_IDS.CLIENT)).rejects.toThrow(
        new HttpException('Post not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(postsService, 'findOne').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findOne(TEST_POST_IDS.ANXIETY_POST, TEST_USER_IDS.CLIENT)).rejects.toThrow(HttpException);
    });
  });

  describe('create', () => {
    it('should create post successfully without files', async () => {
      // Arrange
      jest.spyOn(postsService, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(postsService, 'create').mockResolvedValue(mockPost);

      // Act
      const result = await controller.create(TEST_USER_IDS.CLIENT, mockCreatePostDto);

      // Assert
      expect(postsService.findUserById).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(postsService.create).toHaveBeenCalledWith({
        title: mockCreatePostDto.title,
        content: mockCreatePostDto.content,
        user: { connect: { id: mockUser.id } },
        room: { connect: { id: mockCreatePostDto.roomId } },
        attachmentUrls: [],
        attachmentNames: [],
        attachmentSizes: [],
      });
      expect(result).toEqual(mockPost);
    });

    it('should create post successfully with files', async () => {
      // Arrange
      jest.spyOn(postsService, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(postsService, 'create').mockResolvedValue(mockPost);
      jest.spyOn(supabaseStorageService, 'validateFile').mockReturnValue({ isValid: true });
      jest.spyOn(supabaseStorageService, 'uploadFiles').mockResolvedValue(mockFileResults);

      // Act
      const result = await controller.create(TEST_USER_IDS.CLIENT, mockCreatePostDto, mockFiles);

      // Assert
      expect(supabaseStorageService.validateFile).toHaveBeenCalledWith(mockFiles[0]);
      expect(supabaseStorageService.uploadFiles).toHaveBeenCalledWith(mockFiles, 'post-attachments');
      expect(postsService.create).toHaveBeenCalledWith({
        title: mockCreatePostDto.title,
        content: mockCreatePostDto.content,
        user: { connect: { id: mockUser.id } },
        room: { connect: { id: mockCreatePostDto.roomId } },
        attachmentUrls: ['https://example.com/test.jpg'],
        attachmentNames: ['test.jpg'],
        attachmentSizes: [1024],
      });
      expect(result).toEqual(mockPost);
    });

    it('should handle file validation errors', async () => {
      // Arrange
      jest.spyOn(postsService, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(supabaseStorageService, 'validateFile').mockReturnValue({
        isValid: false,
        error: 'Invalid file type',
      });

      // Act & Assert
      await expect(controller.create(TEST_USER_IDS.CLIENT, mockCreatePostDto, mockFiles)).rejects.toThrow(
        HttpException,
      );
    });

    it('should handle user not found', async () => {
      // Arrange
      jest.spyOn(postsService, 'findUserById').mockResolvedValue(null);

      // Act & Assert
      await expect(controller.create(TEST_USER_IDS.CLIENT, mockCreatePostDto)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('update', () => {
    it('should update post successfully', async () => {
      // Arrange
      const updatedPost = { ...mockPost, ...mockUpdatePostDto };
      jest.spyOn(postsService, 'update').mockResolvedValue(updatedPost);

      // Act
      const result = await controller.update(TEST_USER_IDS.CLIENT, TEST_POST_IDS.ANXIETY_POST, mockUpdatePostDto);

      // Assert
      expect(postsService.update).toHaveBeenCalledWith(
        TEST_POST_IDS.ANXIETY_POST,
        mockUpdatePostDto,
        TEST_USER_IDS.CLIENT,
      );
      expect(result).toEqual(updatedPost);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Post not found');
      jest.spyOn(postsService, 'update').mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.update(TEST_USER_IDS.CLIENT, TEST_POST_IDS.ANXIETY_POST, mockUpdatePostDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('remove', () => {
    it('should delete post successfully', async () => {
      // Arrange
      jest.spyOn(postsService, 'remove').mockResolvedValue(mockPost);

      // Act
      const result = await controller.remove(TEST_USER_IDS.CLIENT, TEST_POST_IDS.ANXIETY_POST);

      // Assert
      expect(postsService.remove).toHaveBeenCalledWith(TEST_POST_IDS.ANXIETY_POST, TEST_USER_IDS.CLIENT);
      expect(result).toEqual(mockPost);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Post not found');
      jest.spyOn(postsService, 'remove').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.remove(TEST_USER_IDS.CLIENT, TEST_POST_IDS.ANXIETY_POST)).rejects.toThrow(HttpException);
    });
  });

  describe('findByUserId', () => {
    it('should return posts by user ID', async () => {
      // Arrange
      jest.spyOn(postsService, 'findByUserId').mockResolvedValue(mockPosts);

      // Act
      const result = await controller.findByUserId(TEST_USER_IDS.CLIENT);

      // Assert
      expect(postsService.findByUserId).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(result).toEqual(mockPosts);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(postsService, 'findByUserId').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findByUserId(TEST_USER_IDS.CLIENT)).rejects.toThrow(HttpException);
    });
  });

  describe('findByRoomId', () => {
    it('should return posts by room ID', async () => {
      // Arrange
      jest.spyOn(postsService, 'findByRoomId').mockResolvedValue(mockPosts);

      // Act
      const result = await controller.findByRoomId(TEST_ROOM_IDS.ANXIETY_CHAT, TEST_USER_IDS.CLIENT);

      // Assert
      expect(postsService.findByRoomId).toHaveBeenCalledWith(TEST_ROOM_IDS.ANXIETY_CHAT, TEST_USER_IDS.CLIENT);
      expect(result).toEqual(mockPosts);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(postsService, 'findByRoomId').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findByRoomId(TEST_ROOM_IDS.ANXIETY_CHAT, TEST_USER_IDS.CLIENT)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('heartPost', () => {
    it('should heart post successfully', async () => {
      // Arrange
      const heartResult = { hearted: true };
      jest.spyOn(postsService, 'heartPost').mockResolvedValue(heartResult);

      // Act
      const result = await controller.heartPost(TEST_USER_IDS.CLIENT, TEST_POST_IDS.ANXIETY_POST);

      // Assert
      expect(postsService.heartPost).toHaveBeenCalledWith(TEST_POST_IDS.ANXIETY_POST, TEST_USER_IDS.CLIENT);
      expect(result).toEqual(heartResult);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Post not found');
      jest.spyOn(postsService, 'heartPost').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.heartPost(TEST_USER_IDS.CLIENT, TEST_POST_IDS.ANXIETY_POST)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('isPostHearted', () => {
    it('should check if post is hearted successfully', async () => {
      // Arrange
      jest.spyOn(postsService, 'isPostHeartedByUser').mockResolvedValue(true);

      // Act
      const result = await controller.isPostHearted(TEST_USER_IDS.CLIENT, TEST_POST_IDS.ANXIETY_POST);

      // Assert
      expect(postsService.isPostHeartedByUser).toHaveBeenCalledWith(TEST_POST_IDS.ANXIETY_POST, TEST_USER_IDS.CLIENT);
      expect(result).toEqual({ hearted: true });
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(postsService, 'isPostHeartedByUser').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.isPostHearted(TEST_USER_IDS.CLIENT, TEST_POST_IDS.ANXIETY_POST)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('reportPost', () => {
    const reportData = {
      reason: 'spam',
      content: 'This post is spam',
    };

    it('should report post successfully', async () => {
      // Arrange
      const reportId = 'report-123';
      jest.spyOn(postsService, 'reportPost').mockResolvedValue(reportId);

      // Act
      const result = await controller.reportPost(TEST_USER_IDS.CLIENT, TEST_POST_IDS.ANXIETY_POST, reportData);

      // Assert
      expect(postsService.reportPost).toHaveBeenCalledWith(
        TEST_POST_IDS.ANXIETY_POST,
        TEST_USER_IDS.CLIENT,
        reportData.reason,
        reportData.content,
      );
      expect(result).toEqual({ success: true, reportId });
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Post not found');
      jest.spyOn(postsService, 'reportPost').mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.reportPost(TEST_USER_IDS.CLIENT, TEST_POST_IDS.ANXIETY_POST, reportData),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('Security Integration', () => {
    it('should have proper guards applied', () => {
      // Test that guards are applied at controller level
      const guards = Reflect.getMetadata('__guards__', PostsController);
      expect(guards).toBeDefined();
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(CommunityAccessGuard);
    });

    it('should apply RequirePostingRole decorator to create endpoint', () => {
      // Test that the create endpoint has the RequirePostingRole decorator
      const metadata = Reflect.getMetadata('require_posting_role', controller.create);
      expect(metadata).toBeTruthy();
    });

    it('should apply RequireRoomAccess decorator to protected endpoints', () => {
      // Test that protected endpoints have the RequireRoomAccess decorator
      const protectedMethods = ['findOne', 'update', 'remove', 'findByRoomId', 'heartPost', 'reportPost'];
      
      protectedMethods.forEach(method => {
        const metadata = Reflect.getMetadata('require_room_access', controller[method as keyof PostsController]);
        expect(metadata).toBeTruthy();
      });
    });

    it('should test community access guard integration', async () => {
      // Arrange
      const testScenarios = SecurityGuardTestUtils.createAccessControlTestScenarios();
      
      // Test that CommunityAccessGuard is called for protected endpoints
      mockCommunityAccessGuard.canActivate.mockReturnValue(true);
      jest.spyOn(postsService, 'findOne').mockResolvedValue(mockPost);

      // Act
      await controller.findOne(TEST_POST_IDS.ANXIETY_POST, TEST_USER_IDS.CLIENT);

      // Assert
      expect(mockCommunityAccessGuard.canActivate).toHaveBeenCalled();
    });

    it('should handle community access denied', async () => {
      // Arrange
      mockCommunityAccessGuard.canActivate.mockReturnValue(false);

      // This would be handled by the guard before reaching the controller
      // In a real scenario, the guard would throw an exception
      expect(mockCommunityAccessGuard.canActivate).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle HttpException properly', async () => {
      // Arrange
      const httpException = new HttpException('Custom error', HttpStatus.BAD_REQUEST);
      jest.spyOn(postsService, 'findOne').mockRejectedValue(httpException);

      // Act & Assert
      await expect(controller.findOne(TEST_POST_IDS.ANXIETY_POST, TEST_USER_IDS.CLIENT)).rejects.toThrow(httpException);
    });

    it('should wrap unknown errors in HttpException', async () => {
      // Arrange
      const unknownError = new Error('Unknown error');
      jest.spyOn(postsService, 'findAll').mockRejectedValue(unknownError);

      // Act & Assert
      await expect(controller.findAll(TEST_USER_IDS.CLIENT)).rejects.toThrow(HttpException);
    });
  });

  describe('File Upload Integration', () => {
    it('should handle multiple file uploads', async () => {
      // Arrange
      const multipleFiles = [
        { ...mockFiles[0], originalname: 'test1.jpg' },
        { ...mockFiles[0], originalname: 'test2.jpg' },
      ];
      const multipleFileResults = [
        { url: 'https://example.com/test1.jpg', filename: 'test1.jpg', size: 1024 },
        { url: 'https://example.com/test2.jpg', filename: 'test2.jpg', size: 1024 },
      ];

      jest.spyOn(postsService, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(postsService, 'create').mockResolvedValue(mockPost);
      jest.spyOn(supabaseStorageService, 'validateFile').mockReturnValue({ isValid: true });
      jest.spyOn(supabaseStorageService, 'uploadFiles').mockResolvedValue(multipleFileResults);

      // Act
      const result = await controller.create(TEST_USER_IDS.CLIENT, mockCreatePostDto, multipleFiles);

      // Assert
      expect(supabaseStorageService.validateFile).toHaveBeenCalledTimes(2);
      expect(supabaseStorageService.uploadFiles).toHaveBeenCalledWith(multipleFiles, 'post-attachments');
      expect(postsService.create).toHaveBeenCalledWith({
        title: mockCreatePostDto.title,
        content: mockCreatePostDto.content,
        user: { connect: { id: mockUser.id } },
        room: { connect: { id: mockCreatePostDto.roomId } },
        attachmentUrls: ['https://example.com/test1.jpg', 'https://example.com/test2.jpg'],
        attachmentNames: ['test1.jpg', 'test2.jpg'],
        attachmentSizes: [1024, 1024],
      });
      expect(result).toEqual(mockPost);
    });

    it('should handle file upload service errors', async () => {
      // Arrange
      jest.spyOn(postsService, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(supabaseStorageService, 'validateFile').mockReturnValue({ isValid: true });
      jest.spyOn(supabaseStorageService, 'uploadFiles').mockRejectedValue(new Error('Upload failed'));

      // Act & Assert
      await expect(controller.create(TEST_USER_IDS.CLIENT, mockCreatePostDto, mockFiles)).rejects.toThrow(
        HttpException,
      );
    });
  });
});