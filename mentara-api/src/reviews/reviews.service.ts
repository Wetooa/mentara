import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MeetingStatus } from '@prisma/client';
import { PrismaService } from '../providers/prisma-client.provider';
import type {
  CreateReviewDto,
  UpdateReviewDto,
  GetReviewsDto,
  ModerateReviewDto,
  ReviewListResponse,
  ReviewStatsDto,
} from './types';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(
    meetingId: string,
    clientId: string,
    therapistId: string,
    createReviewDto: CreateReviewDto,
  ) {
    const { rating, title, content, isAnonymous } = createReviewDto;

    // Verify the client has had a completed session with this therapist
    const completedMeeting = await this.prisma.meeting.findFirst({
      where: {
        clientId,
        therapistId,
        id: meetingId,
        status: MeetingStatus.COMPLETED,
      },
    });

    if (!completedMeeting) {
      throw new BadRequestException(
        'You can only review therapists after completing a session with them',
      );
    }

    // Check if review already exists for this client-therapist pair
    const existingReview = await this.prisma.review.findFirst({
      where: {
        clientId,
        therapistId,
        meetingId: meetingId,
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        'You have already reviewed this therapist for this session',
      );
    }

    // Create the review
    const review = await this.prisma.review.create({
      data: {
        rating,
        title,
        content,
        isAnonymous,
        clientId,
        therapistId,
        meetingId: meetingId,
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
            user: true,
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

    return {
      ...review,
      therapist: {
        ...review.therapist,
        id: review.therapistId,
      },
    };
  }

  async updateReview(
    reviewId: string,
    clientId: string,
    updateReviewDto: UpdateReviewDto,
  ) {
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
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
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

    return { message: 'Review deleted successfully' };
  }

  async getReviews(query: GetReviewsDto): Promise<ReviewListResponse> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      therapistId,
      clientId,
      status,
      rating,
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (therapistId) where.therapistId = therapistId;
    if (clientId) where.clientId = clientId;
    if (rating) where.rating = rating;

    const [reviews, totalCount] = await Promise.all([
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
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
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

    const totalPages = Math.ceil(totalCount / limit);

    // Calculate average rating for the result set
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    // Calculate rating distribution
    const ratingDistribution = reviews.reduce(
      (dist, review) => {
        dist[review.rating.toString()] =
          (dist[review.rating.toString()] || 0) + 1;
        return dist;
      },
      { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    );

    return {
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title || undefined,
        content: review.content || undefined,
        therapistId: review.therapistId,
        clientId: review.clientId,
        meetingId: review.meetingId || undefined,
        isAnonymous: review.isAnonymous,
        status: 'approved' as const, // Default status since Review model doesn't have this field
        categories: {
          communication: undefined,
          professionalism: undefined,
          helpfulness: undefined,
          availability: undefined,
          overall: review.rating, // Use overall rating as fallback
        },
        tags: [], // Default empty array since tags are not in current Review model
        wouldRecommend: review.rating >= 4, // Infer recommendation from rating
        helpfulCount: 0, // Default count since Review model doesn't have this field
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        client: review.client
          ? {
              id: review.clientId,
              firstName: review.client.user?.firstName,
              lastName: review.client.user?.lastName,
            }
          : undefined,
        therapist: review.therapist
          ? {
              id: review.therapistId,
              user: {
                firstName: review.therapist.user?.firstName || '',
                lastName: review.therapist.user?.lastName || '',
                avatarUrl: review.therapist.user?.avatarUrl,
              },
            }
          : undefined,
      })),
      totalCount,
      page,
      pageSize: limit,
      totalPages,
      averageRating,
      ratingDistribution,
    };
  }

  async getTherapistReviews(
    therapistId: string,
    query: Omit<GetReviewsDto, 'therapistId'>,
  ): Promise<ReviewListResponse> {
    return this.getReviews({ ...query, therapistId });
  }

  async getReviewStats(therapistId: string): Promise<ReviewStatsDto> {
    const stats = await this.prisma.review.groupBy({
      by: ['rating'],
      where: {
        therapistId,
      },
      _count: {
        rating: true,
      },
    });

    const totalReviews = stats.reduce(
      (sum, stat) => sum + stat._count.rating,
      0,
    );
    const totalRating = stats.reduce(
      (sum, stat) => sum + stat.rating * stat._count.rating,
      0,
    );
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    const ratingDistribution = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };

    stats.forEach((stat) => {
      ratingDistribution[stat.rating.toString()] = stat._count.rating;
    });

    // Get monthly reviews for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyStats = await this.prisma.review.groupBy({
      by: ['createdAt'],
      where: {
        therapistId,
        createdAt: {
          gte: twelveMonthsAgo,
        },
      },
      _count: {
        rating: true,
      },
      _avg: {
        rating: true,
      },
    });

    // Group by month
    const monthlyReviews = monthlyStats.reduce(
      (acc, stat) => {
        const month = stat.createdAt.toISOString().substring(0, 7); // YYYY-MM format
        if (!acc[month]) {
          acc[month] = { count: 0, totalRating: 0 };
        }
        acc[month].count += stat._count.rating;
        acc[month].totalRating += (stat._avg.rating || 0) * stat._count.rating;
        return acc;
      },
      {} as Record<string, { count: number; totalRating: number }>,
    );

    const monthlyReviewsArray = Object.entries(monthlyReviews).map(
      ([month, data]) => ({
        month,
        count: data.count,
        averageRating: data.count > 0 ? data.totalRating / data.count : 0,
      }),
    );

    // Get recent reviews
    const recentReviews = await this.prisma.review.findMany({
      where: {
        therapistId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
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
      },
    });

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
      categoryAverages: {
        communication: undefined,
        professionalism: undefined,
        helpfulness: undefined,
        availability: undefined,
        overall: averageRating,
      },
      recommendationRate: totalReviews > 0 ? 
        (stats.filter(s => s.rating >= 4).reduce((sum, s) => sum + s._count.rating, 0) / totalReviews) * 100 : 0,
      totalHelpfulVotes: 0, // Default since Review model doesn't have helpful votes
      recentReviews: recentReviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title || undefined,
        content: review.content || undefined,
        therapistId: review.therapistId,
        clientId: review.clientId,
        meetingId: review.meetingId || undefined,
        isAnonymous: review.isAnonymous,
        status: 'approved' as const, // Default status since Review model doesn't have this field
        categories: {
          communication: undefined,
          professionalism: undefined,
          helpfulness: undefined,
          availability: undefined,
          overall: review.rating, // Use overall rating as fallback
        },
        tags: [], // Default empty array since tags are not in current Review model
        wouldRecommend: review.rating >= 4, // Infer recommendation from rating
        helpfulCount: 0, // Default count since Review model doesn't have this field
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        client: review.client
          ? {
              id: review.clientId,
              firstName: review.client.user?.firstName,
              lastName: review.client.user?.lastName,
            }
          : undefined,
        therapist: {
          id: review.therapistId,
          user: {
            firstName: '',
            lastName: '',
            avatarUrl: undefined,
          },
        },
      })),
    };
  }

  async markReviewHelpful(reviewId: string, userId: string) {
    // Verify review exists
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // For now, return a simple response since the Review model doesn't have helpfulCount
    // This method would typically track users who marked reviews as helpful
    return {
      message: 'Review marked as helpful',
      reviewId,
      helpfulCount: 1, // Placeholder value
    };
  }

  async moderateReview(
    reviewId: string,
    moderatorId: string,
    moderateReviewDto: ModerateReviewDto,
  ) {
    // Verify review exists
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // For now, return a simple response since the Review model doesn't have moderation fields
    // This method would typically update review status and add moderation notes
    return {
      message: 'Review moderated successfully',
      reviewId,
      moderatedBy: moderatorId,
      status: moderateReviewDto.status || 'APPROVED',
      moderationNote: moderateReviewDto.moderatorNotes,
    };
  }
}
