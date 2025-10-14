import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/core/decorators/current-user-id.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('therapists')
@ApiBearerAuth('JWT-auth')
@Controller('therapists')
@UseGuards(JwtAuthGuard)
export class TherapistsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all approved therapists',
    description: 'Retrieve all therapists with APPROVED status',
  })
  @ApiResponse({
    status: 200,
    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getAllTherapists(
    @CurrentUserId() userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    try {
      const take = limit ? Math.min(limit, 1000) : undefined; // Allow unlimited, max 1000 for safety
      const skip = offset ? Math.max(offset, 0) : 0;

      // Get all approved therapists with their user information
      const [therapists, totalCount] = await Promise.all([
        this.prisma.therapist.findMany({
          where: {
            status: 'APPROVED',
          },
          take,
          skip,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
                bio: true,
                createdAt: true,
              },
            },
            reviews: {
              select: {
                rating: true,
                content: true,
                createdAt: true,
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
              orderBy: {
                createdAt: 'desc',
              },
              take: 5, // Latest 5 reviews
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.therapist.count({
          where: {
            status: 'APPROVED',
          },
        }),
      ]);

      // Transform data to match frontend expectations
      const transformedTherapists = therapists.map((therapist) => {
        const averageRating =
          therapist.reviews.length > 0
            ? therapist.reviews.reduce(
                (sum, review) => sum + review.rating,
                0,
              ) / therapist.reviews.length
            : 0;

        return {
          id: therapist.userId,
          userId: therapist.userId,
          firstName: therapist.user.firstName,
          lastName: therapist.user.lastName,
          name: `${therapist.user.firstName} ${therapist.user.lastName}`,
          email: therapist.user.email,
          avatarUrl: therapist.user.avatarUrl,
          profileImage: therapist.user.avatarUrl,
          bio: therapist.user.bio,
          title: 'Licensed Therapist', // Could be made dynamic later
          specialties: therapist.areasOfExpertise || [],
          areasOfExpertise: therapist.areasOfExpertise || [],
          approaches: therapist.approaches || [],
          languages: therapist.languages || [],
          illnessSpecializations: therapist.illnessSpecializations || [],
          experience: therapist.yearsOfExperience || 0,
          yearsOfExperience: therapist.yearsOfExperience || 0,
          sessionPrice: `$${therapist.hourlyRate.toString()}`,
          hourlyRate: Number(therapist.hourlyRate),
          rating: Number(averageRating.toFixed(1)),
          totalReviews: (therapist as any).reviews.length,
          location: therapist.province,
          province: therapist.province,
          timezone: therapist.timezone,
          isActive: true, // All approved therapists are considered active
          acceptsInsurance: therapist.acceptsInsurance,
          acceptedInsuranceTypes: therapist.acceptedInsuranceTypes || [],
          sessionLength: therapist.sessionLength,
          preferredSessionLength: therapist.preferredSessionLength || [],
          createdAt: therapist.createdAt,
          updatedAt: therapist.updatedAt,
        };
      });

      // Handle pagination calculation safely
      const pageSize = take || totalCount || 1; // Use take if provided, otherwise totalCount, or 1 as fallback
      
      return {
        success: true,
        data: {
          therapists: transformedTherapists,
          totalCount,
          currentPage: take ? Math.floor(skip / take) + 1 : 1,
          totalPages: Math.ceil(totalCount / pageSize),
          hasNextPage: take ? skip + take < totalCount : false,
          hasPreviousPage: skip > 0,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to fetch therapists',
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get therapist profile by ID',
    description: 'Retrieve detailed therapist profile information',
  })
  @ApiParam({
    name: 'id',
    description: 'Therapist user ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Therapist not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getTherapistProfile(@Param('id') therapistId: string) {
    try {
      const therapist = await this.prisma.therapist.findFirst({
        where: {
          userId: therapistId,
          status: 'APPROVED',
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
              bio: true,
              createdAt: true,
            },
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              content: true,
              createdAt: true,
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
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10, // Get more reviews for profile page
          },
          therapistAvailabilities: {
            select: {
              dayOfWeek: true,
              startTime: true,
              endTime: true,
              isAvailable: true,
            },
            where: {
              isAvailable: true,
            },
          },
        },
      });

      if (!therapist) {
        throw new NotFoundException(
          `Therapist with ID ${therapistId} not found`,
        );
      }

      const averageRating =
        therapist.reviews.length > 0
          ? therapist.reviews.reduce((sum, review) => sum + review.rating, 0) /
            therapist.reviews.length
          : 0;

      const transformedTherapist = {
        id: therapist.userId,
        userId: therapist.userId,
        firstName: therapist.user.firstName,
        lastName: therapist.user.lastName,
        name: `${therapist.user.firstName} ${therapist.user.lastName}`,
        email: therapist.user.email,
        avatarUrl: therapist.user.avatarUrl,
        profileImage: therapist.user.avatarUrl,
        bio: therapist.user.bio,
        title: 'Licensed Therapist',
        specialties: therapist.areasOfExpertise || [],
        areasOfExpertise: therapist.areasOfExpertise || [],
        approaches: therapist.approaches || [],
        languages: therapist.languages || [],
        illnessSpecializations: therapist.illnessSpecializations || [],
        experience: therapist.yearsOfExperience || 0,
        yearsOfExperience: therapist.yearsOfExperience || 0,
        sessionPrice: `$${therapist.hourlyRate.toString()}`,
        hourlyRate: therapist.hourlyRate,
        rating: Number(averageRating.toFixed(1)),
        totalReviews: (therapist as any).reviews.length,
        location: therapist.province,
        province: therapist.province,
        timezone: therapist.timezone,
        isActive: true,
        acceptsInsurance: therapist.acceptsInsurance,
        acceptedInsuranceTypes: therapist.acceptedInsuranceTypes || [],
        sessionLength: therapist.sessionLength,
        preferredSessionLength: therapist.preferredSessionLength || [],
        availability: therapist.therapistAvailabilities,
        reviews: therapist.reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          comment: review.content,
          createdAt: review.createdAt,
          clientName: `${review.client.user.firstName} ${review.client.user.lastName[0]}.`,
          clientAvatar: review.client.user.avatarUrl,
        })),
        createdAt: therapist.createdAt,
        updatedAt: therapist.updatedAt,

        // Additional profile fields
        educationBackground: therapist.educationBackground,
        specialCertifications: therapist.specialCertifications || [],
        practiceLocation: therapist.practiceLocation,
        therapeuticApproachesUsedList:
          therapist.therapeuticApproachesUsedList || [],
        assessmentTools: therapist.assessmentTools || [],
        languagesOffered: therapist.languagesOffered || [],
        providedOnlineTherapyBefore: therapist.providedOnlineTherapyBefore,
        comfortableUsingVideoConferencing:
          therapist.comfortableUsingVideoConferencing,
        professionalLicenseType: therapist.professionalLicenseType,
        licenseVerified: therapist.licenseVerified,
        practiceStartDate: therapist.practiceStartDate,
      };

      return {
        success: true,
        data: transformedTherapist,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Failed to fetch therapist profile',
      );
    }
  }
}
