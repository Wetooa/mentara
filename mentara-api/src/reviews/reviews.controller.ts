import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { CurrentUserRole } from '../auth/decorators/current-user-role.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateReviewDtoSchema,
  UpdateReviewDtoSchema,
  ModerateReviewDtoSchema,
  GetReviewsDtoSchema,
  ReviewIdParamSchema,
} from './validation';
import type {
  CreateReviewDto,
  UpdateReviewDto,
  ModerateReviewDto,
  GetReviewsDto,
  ReviewIdParam,
  ReviewListResponse,
} from './types';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':meetingId/:therapistId')
  @HttpCode(HttpStatus.CREATED)
  async createReview(
    @Param('meetingId') meetingId: string,
    @CurrentUserId() clientId: string,
    @Param('therapistId') therapistId: string,
    @Body(new ZodValidationPipe(CreateReviewDtoSchema))
    createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(
      meetingId,
      clientId,
      therapistId,
      createReviewDto,
    );
  }

  @Put(':id')
  async updateReview(
    @Param('id') reviewId: string,
    @CurrentUserId() clientId: string,
    @Body(new ZodValidationPipe(UpdateReviewDtoSchema))
    updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(
      reviewId,
      clientId,
      updateReviewDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReview(
    @Param('id') reviewId: string,
    @CurrentUserId() clientId: string,
  ) {
    return this.reviewsService.deleteReview(reviewId, clientId);
  }

  @Get()
  async getReviews(
    @Query(new ZodValidationPipe(GetReviewsDtoSchema)) query: GetReviewsDto,
  ): Promise<ReviewListResponse> {
    return this.reviewsService.getReviews(query);
  }

  @Get('therapist/:therapistId')
  async getTherapistReviews(
    @Param('therapistId') therapistId: string,
    @Query(new ZodValidationPipe(GetReviewsDtoSchema))
    query: Omit<GetReviewsDto, 'therapistId'>,
  ): Promise<ReviewListResponse> {
    return this.reviewsService.getTherapistReviews(therapistId, query);
  }

  @Get('therapist/:therapistId/stats')
  async getTherapistReviewStats(@Param('therapistId') therapistId: string) {
    return this.reviewsService.getReviewStats(therapistId);
  }

  @Post(':id/helpful')
  @HttpCode(HttpStatus.OK)
  async markReviewHelpful(
    @Param('id', new ZodValidationPipe(ReviewIdParamSchema)) reviewId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.reviewsService.markReviewHelpful(reviewId, userId);
  }

  // Admin/Moderator endpoints
  @Post(':id/moderate')
  @HttpCode(HttpStatus.OK)
  async moderateReview(
    @Param('id', new ZodValidationPipe(ReviewIdParamSchema)) reviewId: string,
    @CurrentUserId() moderatorId: string,
    @CurrentUserRole() userRole: string,
    @Body(new ZodValidationPipe(ModerateReviewDtoSchema))
    moderateReviewDto: ModerateReviewDto,
  ) {
    // Only allow moderators and admins to moderate reviews
    if (!['moderator', 'admin'].includes(userRole)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.reviewsService.moderateReview(
      reviewId,
      moderatorId,
      moderateReviewDto,
    );
  }

  @Get('pending')
  async getPendingReviews(
    @CurrentUserRole() userRole: string,
    @Query(new ZodValidationPipe(GetReviewsDtoSchema)) query: GetReviewsDto,
  ): Promise<ReviewListResponse> {
    // Only allow moderators and admins to view pending reviews
    if (!['moderator', 'admin'].includes(userRole)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.reviewsService.getReviews({
      ...query,
      status: 'pending',
    });
  }
}
