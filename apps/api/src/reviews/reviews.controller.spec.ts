/**
 * Comprehensive Test Suite for ReviewsController
 * Tests review and rating functionality with role-based access control
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../test-utils/index';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let reviewsService: ReviewsService;
  let module: TestingModule;

  // Mock ReviewsService
  const mockReviewsService = {
    createReview: jest.fn(),
    updateReview: jest.fn(),
    deleteReview: jest.fn(),
    getReviews: jest.fn(),
    getTherapistReviews: jest.fn(),
    getReviewStats: jest.fn(),
    markReviewHelpful: jest.fn(),
    moderateReview: jest.fn(),
  };

  // Mock JwtAuthGuard
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockReview = {
    id: 'review_123456789',
    meetingId: 'meeting_123456789',
    clientId: TEST_USER_IDS.CLIENT,
    therapistId: TEST_USER_IDS.THERAPIST,
    rating: 5,
    comment: 'Dr. Smith was incredibly helpful and professional. I felt heard and understood throughout our session.',
    categories: {
      communication: 5,
      professionalism: 5,
      effectiveness: 4,
      environment: 5,
    },
    isAnonymous: false,
    helpfulCount: 3,
    status: 'APPROVED',
    createdAt: new Date('2024-02-14T10:00:00Z'),
    updatedAt: new Date('2024-02-14T10:00:00Z'),
    client: {
      id: TEST_USER_IDS.CLIENT,
      firstName: 'John',
      lastName: 'D.',
      avatar: null,
    },
    therapist: {
      id: TEST_USER_IDS.THERAPIST,
      firstName: 'Dr. Sarah',
      lastName: 'Smith',
      specializations: ['anxiety', 'depression'],
    },
  };

  const mockReviewsList = {
    reviews: [
      mockReview,
      {
        ...mockReview,
        id: 'review_987654321',
        rating: 4,
        comment: 'Good session, very helpful.',
        categories: { communication: 4, professionalism: 5, effectiveness: 4, environment: 4 },
        helpfulCount: 1,
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
    summary: {
      totalReviews: 2,
      averageRating: 4.5,
      ratingDistribution: {
        5: 1,
        4: 1,
        3: 0,
        2: 0,
        1: 0,
      },
    },
  };

  const mockReviewStats = {
    totalReviews: 47,
    averageRating: 4.7,
    ratingDistribution: {
      5: 28,
      4: 15,
      3: 3,
      2: 1,
      1: 0,
    },
    categoryAverages: {
      communication: 4.8,
      professionalism: 4.9,
      effectiveness: 4.6,
      environment: 4.7,
    },
    recentTrend: 'improving',
    lastThirtyDays: {
      reviews: 8,
      averageRating: 4.9,
    },
    helpfulnessMetrics: {
      totalHelpfulVotes: 156,
      averageHelpfulVotes: 3.3,
    },
  };

  const createReviewDto = {
    rating: 5,
    comment: 'Excellent session with great insights.',
    categories: {
      communication: 5,
      professionalism: 5,
      effectiveness: 5,
      environment: 4,
    },
    isAnonymous: false,
  };

  const updateReviewDto = {
    rating: 4,
    comment: 'Updated: Very good session with helpful guidance.',
    categories: {
      communication: 4,
      professionalism: 5,
      effectiveness: 4,
      environment: 4,
    },
  };

  const moderateReviewDto = {
    action: 'approve' as const,
    reason: 'Review meets community guidelines',
    moderatorNotes: 'Content is appropriate and helpful',
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockReviewsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<ReviewsController>(ReviewsController);
    reviewsService = module.get<ReviewsService>(ReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have reviewsService injected', () => {
      expect(reviewsService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', ReviewsController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', ReviewsController);
      expect(controllerMetadata).toBe('reviews');
    });
  });

  describe('POST /reviews/:meetingId/:therapistId', () => {
    const meetingId = 'meeting_123456789';
    const therapistId = TEST_USER_IDS.THERAPIST;

    it('should create review successfully', async () => {
      mockReviewsService.createReview.mockResolvedValue(mockReview);

      const result = await controller.createReview(
        meetingId,
        TEST_USER_IDS.CLIENT,
        therapistId,
        createReviewDto,
      );

      expect(result).toEqual(mockReview);
      expect(reviewsService.createReview).toHaveBeenCalledWith(
        meetingId,
        TEST_USER_IDS.CLIENT,
        therapistId,
        createReviewDto,
      );
    });

    it('should handle different rating values', async () => {
      const ratings = [1, 2, 3, 4, 5];

      for (const rating of ratings) {
        const dto = { ...createReviewDto, rating };
        const reviewWithRating = { ...mockReview, rating };
        mockReviewsService.createReview.mockResolvedValue(reviewWithRating);

        const result = await controller.createReview(
          meetingId,
          TEST_USER_IDS.CLIENT,
          therapistId,
          dto,
        );

        expect(result.rating).toBe(rating);
      }
    });

    it('should handle anonymous reviews', async () => {
      const anonymousDto = { ...createReviewDto, isAnonymous: true };
      const anonymousReview = { ...mockReview, isAnonymous: true };
      mockReviewsService.createReview.mockResolvedValue(anonymousReview);

      const result = await controller.createReview(
        meetingId,
        TEST_USER_IDS.CLIENT,
        therapistId,
        anonymousDto,
      );

      expect(result.isAnonymous).toBe(true);
    });

    it('should handle reviews with different category ratings', async () => {
      const categoryVariations = [
        { communication: 5, professionalism: 4, effectiveness: 3, environment: 5 },
        { communication: 3, professionalism: 3, effectiveness: 4, environment: 3 },
        { communication: 5, professionalism: 5, effectiveness: 5, environment: 5 },
      ];

      for (const categories of categoryVariations) {
        const dto = { ...createReviewDto, categories };
        const reviewWithCategories = { ...mockReview, categories };
        mockReviewsService.createReview.mockResolvedValue(reviewWithCategories);

        const result = await controller.createReview(
          meetingId,
          TEST_USER_IDS.CLIENT,
          therapistId,
          dto,
        );

        expect(result.categories).toEqual(categories);
      }
    });

    it('should handle reviews without comments', async () => {
      const dtoWithoutComment = { ...createReviewDto, comment: undefined };
      const reviewWithoutComment = { ...mockReview, comment: null };
      mockReviewsService.createReview.mockResolvedValue(reviewWithoutComment);

      const result = await controller.createReview(
        meetingId,
        TEST_USER_IDS.CLIENT,
        therapistId,
        dtoWithoutComment,
      );

      expect(result.comment).toBeNull();
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Meeting not found or already reviewed');
      mockReviewsService.createReview.mockRejectedValue(serviceError);

      await expect(
        controller.createReview(meetingId, TEST_USER_IDS.CLIENT, therapistId, createReviewDto)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('PUT /reviews/:id', () => {
    const reviewId = 'review_123456789';

    it('should update review successfully', async () => {
      const updatedReview = { ...mockReview, ...updateReviewDto, updatedAt: new Date() };
      mockReviewsService.updateReview.mockResolvedValue(updatedReview);

      const result = await controller.updateReview(
        reviewId,
        TEST_USER_IDS.CLIENT,
        updateReviewDto,
      );

      expect(result).toEqual(updatedReview);
      expect(reviewsService.updateReview).toHaveBeenCalledWith(
        reviewId,
        TEST_USER_IDS.CLIENT,
        updateReviewDto,
      );
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { rating: 3 };
      const partiallyUpdatedReview = { ...mockReview, rating: 3, updatedAt: new Date() };
      mockReviewsService.updateReview.mockResolvedValue(partiallyUpdatedReview);

      const result = await controller.updateReview(
        reviewId,
        TEST_USER_IDS.CLIENT,
        partialUpdate,
      );

      expect(result.rating).toBe(3);
      expect(result.comment).toBe(mockReview.comment); // unchanged
    });

    it('should handle rating changes', async () => {
      const ratingChanges = [1, 2, 3, 4, 5];

      for (const newRating of ratingChanges) {
        const updateDto = { rating: newRating };
        const updatedReview = { ...mockReview, rating: newRating };
        mockReviewsService.updateReview.mockResolvedValue(updatedReview);

        const result = await controller.updateReview(
          reviewId,
          TEST_USER_IDS.CLIENT,
          updateDto,
        );

        expect(result.rating).toBe(newRating);
      }
    });

    it('should handle comment updates', async () => {
      const commentUpdate = { comment: 'Updated review comment with more details.' };
      const updatedReview = { ...mockReview, comment: commentUpdate.comment };
      mockReviewsService.updateReview.mockResolvedValue(updatedReview);

      const result = await controller.updateReview(
        reviewId,
        TEST_USER_IDS.CLIENT,
        commentUpdate,
      );

      expect(result.comment).toBe(commentUpdate.comment);
    });

    it('should handle review not found', async () => {
      const notFoundError = new Error('Review not found');
      mockReviewsService.updateReview.mockRejectedValue(notFoundError);

      await expect(
        controller.updateReview('non-existent-id', TEST_USER_IDS.CLIENT, updateReviewDto)
      ).rejects.toThrow(notFoundError);
    });

    it('should handle unauthorized update attempts', async () => {
      const unauthorizedError = new Error('Not authorized to update this review');
      mockReviewsService.updateReview.mockRejectedValue(unauthorizedError);

      await expect(
        controller.updateReview(reviewId, 'different_user_id', updateReviewDto)
      ).rejects.toThrow(unauthorizedError);
    });
  });

  describe('DELETE /reviews/:id', () => {
    const reviewId = 'review_123456789';

    it('should delete review successfully', async () => {
      mockReviewsService.deleteReview.mockResolvedValue({ message: 'Review deleted successfully' });

      const result = await controller.deleteReview(reviewId, TEST_USER_IDS.CLIENT);

      expect(result).toEqual({ message: 'Review deleted successfully' });
      expect(reviewsService.deleteReview).toHaveBeenCalledWith(reviewId, TEST_USER_IDS.CLIENT);
    });

    it('should handle review not found', async () => {
      const notFoundError = new Error('Review not found');
      mockReviewsService.deleteReview.mockRejectedValue(notFoundError);

      await expect(
        controller.deleteReview('non-existent-id', TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(notFoundError);
    });

    it('should handle unauthorized deletion attempts', async () => {
      const unauthorizedError = new Error('Not authorized to delete this review');
      mockReviewsService.deleteReview.mockRejectedValue(unauthorizedError);

      await expect(
        controller.deleteReview(reviewId, 'different_user_id')
      ).rejects.toThrow(unauthorizedError);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database error during deletion');
      mockReviewsService.deleteReview.mockRejectedValue(serviceError);

      await expect(
        controller.deleteReview(reviewId, TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /reviews', () => {
    const mockQuery = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
      rating: 5,
      therapistId: TEST_USER_IDS.THERAPIST,
    };

    it('should get reviews successfully', async () => {
      mockReviewsService.getReviews.mockResolvedValue(mockReviewsList);

      const result = await controller.getReviews(mockQuery);

      expect(result).toEqual(mockReviewsList);
      expect(reviewsService.getReviews).toHaveBeenCalledWith(mockQuery);
    });

    it('should handle empty query', async () => {
      const emptyQuery = {};
      mockReviewsService.getReviews.mockResolvedValue(mockReviewsList);

      const result = await controller.getReviews(emptyQuery);

      expect(result).toEqual(mockReviewsList);
      expect(reviewsService.getReviews).toHaveBeenCalledWith(emptyQuery);
    });

    it('should handle pagination parameters', async () => {
      const paginationQueries = [
        { page: 1, limit: 5 },
        { page: 2, limit: 20 },
        { page: 3, limit: 50 },
      ];

      for (const query of paginationQueries) {
        mockReviewsService.getReviews.mockResolvedValue({
          ...mockReviewsList,
          pagination: { ...mockReviewsList.pagination, ...query },
        });

        const result = await controller.getReviews(query);

        expect(result.pagination.page).toBe(query.page);
        expect(result.pagination.limit).toBe(query.limit);
      }
    });

    it('should handle rating filters', async () => {
      const ratingFilters = [1, 2, 3, 4, 5];

      for (const rating of ratingFilters) {
        const query = { rating };
        const filteredResults = {
          ...mockReviewsList,
          reviews: mockReviewsList.reviews.filter(review => review.rating === rating),
        };
        mockReviewsService.getReviews.mockResolvedValue(filteredResults);

        const result = await controller.getReviews(query);

        expect(reviewsService.getReviews).toHaveBeenCalledWith(query);
      }
    });

    it('should handle sorting options', async () => {
      const sortOptions = [
        { sortBy: 'createdAt', sortOrder: 'desc' },
        { sortBy: 'rating', sortOrder: 'asc' },
        { sortBy: 'helpfulCount', sortOrder: 'desc' },
      ] as const;

      for (const sortOption of sortOptions) {
        mockReviewsService.getReviews.mockResolvedValue(mockReviewsList);

        const result = await controller.getReviews(sortOption);

        expect(reviewsService.getReviews).toHaveBeenCalledWith(sortOption);
      }
    });

    it('should handle empty results', async () => {
      const emptyResults = {
        reviews: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
        summary: { totalReviews: 0, averageRating: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
      };
      mockReviewsService.getReviews.mockResolvedValue(emptyResults);

      const result = await controller.getReviews({});

      expect(result.reviews).toEqual([]);
      expect(result.summary.totalReviews).toBe(0);
    });
  });

  describe('GET /reviews/therapist/:therapistId', () => {
    const therapistId = TEST_USER_IDS.THERAPIST;
    const mockQuery = { page: 1, limit: 10, sortBy: 'createdAt' as const };

    it('should get therapist reviews successfully', async () => {
      mockReviewsService.getTherapistReviews.mockResolvedValue(mockReviewsList);

      const result = await controller.getTherapistReviews(therapistId, mockQuery);

      expect(result).toEqual(mockReviewsList);
      expect(reviewsService.getTherapistReviews).toHaveBeenCalledWith(therapistId, mockQuery);
    });

    it('should handle different therapist IDs', async () => {
      const therapistIds = ['therapist_1', 'therapist_2', 'therapist_3'];

      for (const id of therapistIds) {
        const therapistReviews = {
          ...mockReviewsList,
          reviews: mockReviewsList.reviews.map(review => ({ ...review, therapistId: id })),
        };
        mockReviewsService.getTherapistReviews.mockResolvedValue(therapistReviews);

        const result = await controller.getTherapistReviews(id, mockQuery);

        expect(result.reviews.every(review => review.therapistId === id)).toBe(true);
      }
    });

    it('should handle therapist with no reviews', async () => {
      const emptyResults = {
        reviews: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
        summary: { totalReviews: 0, averageRating: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
      };
      mockReviewsService.getTherapistReviews.mockResolvedValue(emptyResults);

      const result = await controller.getTherapistReviews('therapist_no_reviews', mockQuery);

      expect(result.reviews).toEqual([]);
      expect(result.summary.totalReviews).toBe(0);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Therapist not found');
      mockReviewsService.getTherapistReviews.mockRejectedValue(serviceError);

      await expect(
        controller.getTherapistReviews('non-existent-therapist', mockQuery)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /reviews/therapist/:therapistId/stats', () => {
    const therapistId = TEST_USER_IDS.THERAPIST;

    it('should get therapist review stats successfully', async () => {
      mockReviewsService.getReviewStats.mockResolvedValue(mockReviewStats);

      const result = await controller.getTherapistReviewStats(therapistId);

      expect(result).toEqual(mockReviewStats);
      expect(reviewsService.getReviewStats).toHaveBeenCalledWith(therapistId);
    });

    it('should validate stats response structure', async () => {
      mockReviewsService.getReviewStats.mockResolvedValue(mockReviewStats);

      const result = await controller.getTherapistReviewStats(therapistId);

      expect(result).toHaveProperty('totalReviews');
      expect(result).toHaveProperty('averageRating');
      expect(result).toHaveProperty('ratingDistribution');
      expect(result).toHaveProperty('categoryAverages');
      expect(typeof result.totalReviews).toBe('number');
      expect(typeof result.averageRating).toBe('number');
      expect(typeof result.ratingDistribution).toBe('object');
    });

    it('should handle therapist with no reviews', async () => {
      const emptyStats = {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        categoryAverages: { communication: 0, professionalism: 0, effectiveness: 0, environment: 0 },
        recentTrend: 'stable',
        lastThirtyDays: { reviews: 0, averageRating: 0 },
        helpfulnessMetrics: { totalHelpfulVotes: 0, averageHelpfulVotes: 0 },
      };
      mockReviewsService.getReviewStats.mockResolvedValue(emptyStats);

      const result = await controller.getTherapistReviewStats('therapist_no_reviews');

      expect(result.totalReviews).toBe(0);
      expect(result.averageRating).toBe(0);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Stats calculation failed');
      mockReviewsService.getReviewStats.mockRejectedValue(serviceError);

      await expect(
        controller.getTherapistReviewStats(therapistId)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('POST /reviews/:id/helpful', () => {
    const reviewId = 'review_123456789';

    it('should mark review as helpful successfully', async () => {
      const helpfulResult = { message: 'Review marked as helpful', helpfulCount: 4 };
      mockReviewsService.markReviewHelpful.mockResolvedValue(helpfulResult);

      const result = await controller.markReviewHelpful(reviewId, TEST_USER_IDS.CLIENT);

      expect(result).toEqual(helpfulResult);
      expect(reviewsService.markReviewHelpful).toHaveBeenCalledWith(reviewId, TEST_USER_IDS.CLIENT);
    });

    it('should handle duplicate helpful marking', async () => {
      const duplicateError = new Error('Already marked as helpful');
      mockReviewsService.markReviewHelpful.mockRejectedValue(duplicateError);

      await expect(
        controller.markReviewHelpful(reviewId, TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(duplicateError);
    });

    it('should handle review not found', async () => {
      const notFoundError = new Error('Review not found');
      mockReviewsService.markReviewHelpful.mockRejectedValue(notFoundError);

      await expect(
        controller.markReviewHelpful('non-existent-review', TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(notFoundError);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database error');
      mockReviewsService.markReviewHelpful.mockRejectedValue(serviceError);

      await expect(
        controller.markReviewHelpful(reviewId, TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('POST /reviews/:id/moderate', () => {
    const reviewId = 'review_123456789';

    it('should moderate review successfully as moderator', async () => {
      const moderatedReview = { ...mockReview, status: 'APPROVED' };
      mockReviewsService.moderateReview.mockResolvedValue(moderatedReview);

      const result = await controller.moderateReview(
        reviewId,
        TEST_USER_IDS.MODERATOR,
        'moderator',
        moderateReviewDto,
      );

      expect(result).toEqual(moderatedReview);
      expect(reviewsService.moderateReview).toHaveBeenCalledWith(
        reviewId,
        TEST_USER_IDS.MODERATOR,
        moderateReviewDto,
      );
    });

    it('should moderate review successfully as admin', async () => {
      const moderatedReview = { ...mockReview, status: 'APPROVED' };
      mockReviewsService.moderateReview.mockResolvedValue(moderatedReview);

      const result = await controller.moderateReview(
        reviewId,
        TEST_USER_IDS.ADMIN,
        'admin',
        moderateReviewDto,
      );

      expect(result).toEqual(moderatedReview);
      expect(reviewsService.moderateReview).toHaveBeenCalledWith(
        reviewId,
        TEST_USER_IDS.ADMIN,
        moderateReviewDto,
      );
    });

    it('should deny access to non-moderator/non-admin users', async () => {
      const unauthorizedRoles = ['client', 'therapist'];

      for (const role of unauthorizedRoles) {
        await expect(
          controller.moderateReview(reviewId, TEST_USER_IDS.CLIENT, role, moderateReviewDto)
        ).rejects.toThrow(ForbiddenException);
        await expect(
          controller.moderateReview(reviewId, TEST_USER_IDS.CLIENT, role, moderateReviewDto)
        ).rejects.toThrow('Insufficient permissions');
      }
    });

    it('should handle different moderation actions', async () => {
      const moderationActions = [
        { action: 'approve', status: 'APPROVED' },
        { action: 'reject', status: 'REJECTED' },
        { action: 'flag', status: 'FLAGGED' },
      ] as const;

      for (const { action, status } of moderationActions) {
        const actionDto = { ...moderateReviewDto, action };
        const moderatedReview = { ...mockReview, status };
        mockReviewsService.moderateReview.mockResolvedValue(moderatedReview);

        const result = await controller.moderateReview(
          reviewId,
          TEST_USER_IDS.MODERATOR,
          'moderator',
          actionDto,
        );

        expect(result.status).toBe(status);
      }
    });

    it('should handle review not found', async () => {
      const notFoundError = new Error('Review not found');
      mockReviewsService.moderateReview.mockRejectedValue(notFoundError);

      await expect(
        controller.moderateReview(
          'non-existent-review',
          TEST_USER_IDS.MODERATOR,
          'moderator',
          moderateReviewDto,
        )
      ).rejects.toThrow(notFoundError);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Moderation failed');
      mockReviewsService.moderateReview.mockRejectedValue(serviceError);

      await expect(
        controller.moderateReview(
          reviewId,
          TEST_USER_IDS.MODERATOR,
          'moderator',
          moderateReviewDto,
        )
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /reviews/pending', () => {
    const mockQuery = { page: 1, limit: 10 };

    it('should get pending reviews as moderator', async () => {
      const pendingReviews = {
        ...mockReviewsList,
        reviews: mockReviewsList.reviews.map(review => ({ ...review, status: 'PENDING' })),
      };
      mockReviewsService.getReviews.mockResolvedValue(pendingReviews);

      const result = await controller.getPendingReviews('moderator', mockQuery);

      expect(result).toEqual(pendingReviews);
      expect(reviewsService.getReviews).toHaveBeenCalledWith({
        ...mockQuery,
        status: 'PENDING',
      });
    });

    it('should get pending reviews as admin', async () => {
      const pendingReviews = {
        ...mockReviewsList,
        reviews: mockReviewsList.reviews.map(review => ({ ...review, status: 'PENDING' })),
      };
      mockReviewsService.getReviews.mockResolvedValue(pendingReviews);

      const result = await controller.getPendingReviews('admin', mockQuery);

      expect(result).toEqual(pendingReviews);
      expect(reviewsService.getReviews).toHaveBeenCalledWith({
        ...mockQuery,
        status: 'PENDING',
      });
    });

    it('should deny access to non-moderator/non-admin users', async () => {
      const unauthorizedRoles = ['client', 'therapist'];

      for (const role of unauthorizedRoles) {
        await expect(
          controller.getPendingReviews(role, mockQuery)
        ).rejects.toThrow(ForbiddenException);
        await expect(
          controller.getPendingReviews(role, mockQuery)
        ).rejects.toThrow('Insufficient permissions');
      }
    });

    it('should handle empty pending reviews', async () => {
      const emptyResults = {
        reviews: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
        summary: { totalReviews: 0, averageRating: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
      };
      mockReviewsService.getReviews.mockResolvedValue(emptyResults);

      const result = await controller.getPendingReviews('moderator', mockQuery);

      expect(result.reviews).toEqual([]);
      expect(result.summary.totalReviews).toBe(0);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Failed to fetch pending reviews');
      mockReviewsService.getReviews.mockRejectedValue(serviceError);

      await expect(
        controller.getPendingReviews('moderator', mockQuery)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted review response', async () => {
      mockReviewsService.createReview.mockResolvedValue(mockReview);

      const result = await controller.createReview(
        'meeting_123',
        TEST_USER_IDS.CLIENT,
        TEST_USER_IDS.THERAPIST,
        createReviewDto,
      );

      TestAssertions.expectValidEntity(result, ['id', 'meetingId', 'clientId', 'therapistId', 'rating']);
      expect(result.rating).toBeGreaterThanOrEqual(1);
      expect(result.rating).toBeLessThanOrEqual(5);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should return properly formatted reviews list', async () => {
      mockReviewsService.getReviews.mockResolvedValue(mockReviewsList);

      const result = await controller.getReviews({});

      expect(result).toHaveProperty('reviews');
      expect(result).toHaveProperty('pagination');
      expect(result).toHaveProperty('summary');
      expect(Array.isArray(result.reviews)).toBe(true);
      result.reviews.forEach((review) => {
        TestAssertions.expectValidEntity(review, ['id', 'rating', 'status']);
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
      });
    });

    it('should return properly formatted review stats', async () => {
      mockReviewsService.getReviewStats.mockResolvedValue(mockReviewStats);

      const result = await controller.getTherapistReviewStats(TEST_USER_IDS.THERAPIST);

      expect(result).toHaveProperty('totalReviews');
      expect(result).toHaveProperty('averageRating');
      expect(result).toHaveProperty('ratingDistribution');
      expect(result).toHaveProperty('categoryAverages');
      expect(typeof result.totalReviews).toBe('number');
      expect(typeof result.averageRating).toBe('number');
      expect(result.totalReviews).toBeGreaterThanOrEqual(0);
      expect(result.averageRating).toBeGreaterThanOrEqual(0);
      expect(result.averageRating).toBeLessThanOrEqual(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Review service temporarily unavailable');
      mockReviewsService.getReviews.mockRejectedValue(serviceError);

      await expect(controller.getReviews({})).rejects.toThrow(serviceError);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockReviewsService.createReview.mockRejectedValue(dbError);

      await expect(
        controller.createReview(
          'meeting_123',
          TEST_USER_IDS.CLIENT,
          TEST_USER_IDS.THERAPIST,
          createReviewDto,
        )
      ).rejects.toThrow(dbError);
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Invalid review data');
      mockReviewsService.updateReview.mockRejectedValue(validationError);

      await expect(
        controller.updateReview('review_123', TEST_USER_IDS.CLIENT, updateReviewDto)
      ).rejects.toThrow(validationError);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete review lifecycle', async () => {
      // Create review
      mockReviewsService.createReview.mockResolvedValue(mockReview);
      const createResult = await controller.createReview(
        'meeting_123',
        TEST_USER_IDS.CLIENT,
        TEST_USER_IDS.THERAPIST,
        createReviewDto,
      );
      expect(createResult.id).toBeDefined();

      // Update review
      const updatedReview = { ...mockReview, rating: 4, comment: 'Updated comment' };
      mockReviewsService.updateReview.mockResolvedValue(updatedReview);
      const updateResult = await controller.updateReview(
        createResult.id,
        TEST_USER_IDS.CLIENT,
        { rating: 4, comment: 'Updated comment' },
      );
      expect(updateResult.rating).toBe(4);

      // Mark as helpful
      const helpfulResult = { message: 'Review marked as helpful', helpfulCount: 1 };
      mockReviewsService.markReviewHelpful.mockResolvedValue(helpfulResult);
      const helpfulResponse = await controller.markReviewHelpful(
        createResult.id,
        'another_user_id',
      );
      expect(helpfulResponse.helpfulCount).toBe(1);

      // Delete review
      mockReviewsService.deleteReview.mockResolvedValue({ message: 'Review deleted successfully' });
      const deleteResult = await controller.deleteReview(createResult.id, TEST_USER_IDS.CLIENT);
      expect(deleteResult.message).toContain('deleted');
    });

    it('should handle moderation workflow', async () => {
      // Get pending reviews
      const pendingReviews = {
        ...mockReviewsList,
        reviews: [{ ...mockReview, status: 'PENDING' }],
      };
      mockReviewsService.getReviews.mockResolvedValue(pendingReviews);
      const pendingResult = await controller.getPendingReviews('moderator', { page: 1, limit: 10 });
      expect(pendingResult.reviews).toHaveLength(1);

      // Moderate review
      const moderatedReview = { ...mockReview, status: 'APPROVED' };
      mockReviewsService.moderateReview.mockResolvedValue(moderatedReview);
      const moderationResult = await controller.moderateReview(
        mockReview.id,
        TEST_USER_IDS.MODERATOR,
        'moderator',
        moderateReviewDto,
      );
      expect(moderationResult.status).toBe('APPROVED');
    });

    it('should handle therapist analytics workflow', async () => {
      // Get therapist reviews
      mockReviewsService.getTherapistReviews.mockResolvedValue(mockReviewsList);
      const reviewsResult = await controller.getTherapistReviews(
        TEST_USER_IDS.THERAPIST,
        { page: 1, limit: 10 },
      );
      expect(reviewsResult.reviews).toHaveLength(2);

      // Get therapist stats
      mockReviewsService.getReviewStats.mockResolvedValue(mockReviewStats);
      const statsResult = await controller.getTherapistReviewStats(TEST_USER_IDS.THERAPIST);
      expect(statsResult.totalReviews).toBeGreaterThan(0);
      expect(statsResult.averageRating).toBeGreaterThan(0);
    });
  });
});