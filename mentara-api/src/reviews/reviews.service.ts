import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, ReviewStatus } from '@prisma/client';
import { CreateReviewDto, UpdateReviewDto, ModerateReviewDto, GetReviewsDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaClient) {}

  async createReview(clientId: string, createReviewDto: CreateReviewDto) {
    const { therapistId, meetingId, ...reviewData } = createReviewDto;

    // Verify the client has had a completed session with this therapist
    const completedMeeting = await this.prisma.meeting.findFirst({
      where: {
        clientId,
        therapistId,
        status: 'COMPLETED',
        ...(meetingId && { id: meetingId }),
      },
    });

    if (!completedMeeting) {
      throw new BadRequestException('You can only review therapists after completing a session with them');
    }

    // Check if review already exists for this client-therapist pair
    const existingReview = await this.prisma.review.findUnique({
      where: {
        clientId_therapistId_meetingId: {
          clientId,
          therapistId,
          meetingId: meetingId || null,
        },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this therapist for this session');
    }

    // Create the review
    const review = await this.prisma.review.create({
      data: {
        ...reviewData,
        clientId,
        therapistId,
        meetingId,
        status: ReviewStatus.PENDING,
      },
      include: {
        client: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        therapist: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        meeting: {
          select: {
            startTime: true,
            duration: true,
          },
        },
      },
    });

    // Update therapist's average rating
    await this.updateTherapistRating(therapistId);

    return review;
  }

  async updateReview(reviewId: string, clientId: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.clientId !== clientId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        ...updateReviewDto,
        status: ReviewStatus.PENDING, // Reset to pending for re-moderation
        updatedAt: new Date(),
      },
      include: {
        client: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        therapist: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        meeting: {
          select: {
            startTime: true,
            duration: true,
          },
        },
      },
    });

    // Update therapist's average rating
    await this.updateTherapistRating(review.therapistId);

    return updatedReview;
  }

  async deleteReview(reviewId: string, clientId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.clientId !== clientId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    // Update therapist's average rating
    await this.updateTherapistRating(review.therapistId);

    return { message: 'Review deleted successfully' };
  }

  async getReviews(query: GetReviewsDto) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      status: ReviewStatus.APPROVED, // Only show approved reviews by default
      ...filters,
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          client: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          therapist: {
            select: {
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
          meeting: {
            select: {
              startTime: true,
              duration: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async getTherapistReviews(therapistId: string, query: Omit<GetReviewsDto, 'therapistId'>) {
    return this.getReviews({ ...query, therapistId });
  }

  async getReviewStats(therapistId: string) {
    const stats = await this.prisma.review.groupBy({
      by: ['rating'],
      where: {
        therapistId,
        status: ReviewStatus.APPROVED,
      },
      _count: {
        rating: true,
      },
    });

    const totalReviews = stats.reduce((sum, stat) => sum + stat._count.rating, 0);
    const totalRating = stats.reduce((sum, stat) => sum + (stat.rating * stat._count.rating), 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    stats.forEach(stat => {
      ratingDistribution[stat.rating] = stat._count.rating;
    });

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
      ratingDistribution,
    };
  }

  async moderateReview(reviewId: string, moderatorId: string, moderateReviewDto: ModerateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const moderatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        status: moderateReviewDto.status,
        moderatedBy: moderatorId,
        moderatedAt: new Date(),
        moderationNote: moderateReviewDto.moderationNote,
      },
      include: {
        client: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        therapist: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Update therapist's average rating if status changed to/from approved
    if (moderateReviewDto.status === ReviewStatus.APPROVED || review.status === ReviewStatus.APPROVED) {
      await this.updateTherapistRating(review.therapistId);
    }

    return moderatedReview;
  }

  async markReviewHelpful(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user already marked this review as helpful
    const existingVote = await this.prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId,
        },
      },
    });

    if (existingVote) {
      // Remove the helpful vote
      await this.prisma.reviewHelpful.delete({
        where: { id: existingVote.id },
      });

      await this.prisma.review.update({
        where: { id: reviewId },
        data: {
          helpfulCount: {
            decrement: 1,
          },
        },
      });

      return { helpful: false, helpfulCount: review.helpfulCount - 1 };
    } else {
      // Add helpful vote
      await this.prisma.reviewHelpful.create({
        data: {
          reviewId,
          userId,
        },
      });

      await this.prisma.review.update({
        where: { id: reviewId },
        data: {
          helpfulCount: {
            increment: 1,
          },
        },
      });

      return { helpful: true, helpfulCount: review.helpfulCount + 1 };
    }
  }

  private async updateTherapistRating(therapistId: string) {
    const stats = await this.getReviewStats(therapistId);
    
    await this.prisma.therapist.update({
      where: { userId: therapistId },
      data: {
        patientSatisfaction: stats.averageRating,
      },
    });
  }
}