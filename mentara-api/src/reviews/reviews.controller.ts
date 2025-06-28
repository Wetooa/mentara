import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ClerkAuthGuard } from '../clerk-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { ReviewCreateDto, ReviewUpdateDto } from 'schema/review';

@Controller('reviews')
@UseGuards(ClerkAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createReview(
    @Param('meetingId') meetingId: string,
    @CurrentUserId() clientId: string,
    @Param('therapistId') therapistId: string,
    @Body() createReviewDto: ReviewCreateDto,
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
    @Body() updateReviewDto: ReviewUpdateDto,
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

  // @Get()
  // async getReviews(@Query() query: ReviewGetDto) {
  //   return this.reviewsService.getReviews(query);
  // }

  // @Get('therapist/:therapistId')
  // async getTherapistReviews(
  //   @Param('therapistId') therapistId: string,
  //   @Query() query: Omit<ReviewGetDto, 'therapistId'>,
  // ) {
  //   return this.reviewsService.getTherapistReviews(therapistId, query);
  // }

  // @Get('therapist/:therapistId/stats')
  // async getTherapistReviewStats(@Param('therapistId') therapistId: string) {
  //   return this.reviewsService.getReviewStats(therapistId);
  // }

  // @Post(':id/helpful')
  // async markReviewHelpful(
  //   @Param('id') reviewId: string,
  //   @CurrentUserId() userId: string,
  // ) {
  //   return this.reviewsService.markReviewHelpful(reviewId, userId);
  // }

  // // Admin/Moderator endpoints
  // @Post(':id/moderate')
  // async moderateReview(
  //   @Param('id') reviewId: string,
  //   @CurrentUserId() moderatorId: string,
  //   @CurrentUserRole() userRole: string,
  //   @Body() moderateReviewDto: ReviewStatusDto,
  // ) {
  //   // Only allow moderators and admins to moderate reviews
  //   if (!['moderator', 'admin'].includes(userRole)) {
  //     throw new Error('Insufficient permissions');
  //   }

  //   return this.reviewsService.moderateReview(
  //     reviewId,
  //     moderatorId,
  //     moderateReviewDto,
  //   );
  // }

  // @Get('pending')
  // async getPendingReviews(
  //   @CurrentUserRole() userRole: string,
  //   @Query() query: ReviewGetDto,
  // ) {
  //   // Only allow moderators and admins to view pending reviews
  //   if (!['moderator', 'admin'].includes(userRole)) {
  //     throw new Error('Insufficient permissions');
  //   }

  //   return this.reviewsService.getReviews({
  //     ...query,
  //     status: ReviewStatusEnum.Enum.PENDING,
  //   });
  // }
}
