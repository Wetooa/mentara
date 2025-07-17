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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  CreateReviewDto,
  CreateReviewDtoSchema,
  UpdateReviewDto,
  UpdateReviewDtoSchema,
  ModerateReviewDto,
  ModerateReviewDtoSchema,
  GetReviewsDto,
  GetReviewsDtoSchema,
  ReviewIdParam,
  ReviewIdParamSchema,
  Review,
  ReviewListResponse,
  ReviewStats,
} from 'mentara-commons';

@ApiTags('reviews')
@ApiBearerAuth('JWT-auth')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':meetingId/:therapistId')


  @ApiOperation({ 


    summary: 'Create create review',


    description: 'Create create review' 


  })


  @ApiResponse({ 


    status: 201, 


    description: 'Created successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  @HttpCode(HttpStatus.CREATED)
  async createReview(
    @Param('meetingId') meetingId: string,
    @CurrentUserId() clientId: string,
    @Param('therapistId') therapistId: string,
    @Body(new ZodValidationPipe(CreateReviewDtoSchema)) createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(
      meetingId,
      clientId,
      therapistId,
      createReviewDto,
    );
  }

  @Put(':id')


  @ApiOperation({ 


    summary: 'Update update review',


    description: 'Update update review' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Updated successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  async updateReview(
    @Param('id') reviewId: string,
    @CurrentUserId() clientId: string,
    @Body(new ZodValidationPipe(UpdateReviewDtoSchema)) updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(
      reviewId,
      clientId,
      updateReviewDto,
    );
  }

  @Delete(':id')


  @ApiOperation({ 


    summary: 'Delete delete review',


    description: 'Delete delete review' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Deleted successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReview(
    @Param('id') reviewId: string,
    @CurrentUserId() clientId: string,
  ) {
    return this.reviewsService.deleteReview(reviewId, clientId);
  }

  @Get()


  @ApiOperation({ 


    summary: 'Retrieve get reviews',


    description: 'Retrieve get reviews' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  async getReviews(
    @Query(new ZodValidationPipe(GetReviewsDtoSchema)) query: GetReviewsDto,
  ): Promise<ReviewListResponse> {
    return this.reviewsService.getReviews(query);
  }

  @Get('therapist/:therapistId')


  @ApiOperation({ 


    summary: 'Retrieve get therapist reviews',


    description: 'Retrieve get therapist reviews' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  async getTherapistReviews(
    @Param('therapistId') therapistId: string,
    @Query(new ZodValidationPipe(GetReviewsDtoSchema)) query: Omit<GetReviewsDto, 'therapistId'>,
  ): Promise<ReviewListResponse> {
    return this.reviewsService.getTherapistReviews(therapistId, query);
  }

  @Get('therapist/:therapistId/stats')


  @ApiOperation({ 


    summary: 'Retrieve get therapist review stats',


    description: 'Retrieve get therapist review stats' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  async getTherapistReviewStats(@Param('therapistId') therapistId: string) {
    return this.reviewsService.getReviewStats(therapistId);
  }

  @Post(':id/helpful')


  @ApiOperation({ 


    summary: 'Create mark review helpful',


    description: 'Create mark review helpful' 


  })


  @ApiResponse({ 


    status: 201, 


    description: 'Created successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  @HttpCode(HttpStatus.OK)
  async markReviewHelpful(
    @Param('id', new ZodValidationPipe(ReviewIdParamSchema)) reviewId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.reviewsService.markReviewHelpful(reviewId, userId);
  }

  // Admin/Moderator endpoints
  @Post(':id/moderate')

  @ApiOperation({ 

    summary: 'Create moderate review',

    description: 'Create moderate review' 

  })

  @ApiResponse({ 

    status: 201, 

    description: 'Created successfully' 

  })

  @ApiResponse({ status: 401, description: 'Unauthorized' })

  
  @HttpCode(HttpStatus.OK)
  async moderateReview(
    @Param('id', new ZodValidationPipe(ReviewIdParamSchema)) reviewId: string,
    @CurrentUserId() moderatorId: string,
    @CurrentUserRole() userRole: string,
    @Body(new ZodValidationPipe(ModerateReviewDtoSchema)) moderateReviewDto: ModerateReviewDto,
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


  @ApiOperation({ 


    summary: 'Retrieve get pending reviews',


    description: 'Retrieve get pending reviews' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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
      status: 'PENDING',
    });
  }
}
