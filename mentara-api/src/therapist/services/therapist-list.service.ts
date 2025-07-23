import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { Prisma } from '@prisma/client';
import type {
  TherapistListQuery,
  TherapistListResponse,
  TherapistListItem,
} from '../types/therapist.dto';

@Injectable()
export class TherapistListService {
  private readonly logger = new Logger(TherapistListService.name);

  constructor(private readonly prisma: PrismaService) {}

  private calculateYearsOfExperience(startDate: Date): number {
    const now = new Date();
    let years = now.getFullYear() - startDate.getFullYear();
    if (
      now.getMonth() < startDate.getMonth() ||
      (now.getMonth() === startDate.getMonth() &&
        now.getDate() < startDate.getDate())
    ) {
      years--;
    }
    return Math.max(0, years);
  }

  private calculateAverageRating(reviews: { rating: number }[]): number {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }

  async getTherapistList(query: TherapistListQuery): Promise<TherapistListResponse> {
    try {
      // Input validation
      const limit = Math.min(Math.max(query.limit || 20, 1), 100);
      const offset = Math.max(query.offset || 0, 0);
      const currentPage = Math.floor(offset / limit) + 1;

      this.logger.log(`Getting therapist list with limit ${limit}, offset ${offset}`);

      // Build where clause
      const whereClause: Prisma.TherapistWhereInput = {
        status: 'APPROVED', // Only show approved therapists
        user: {
          isActive: true, // Only active users
        },
      };

      // Add search filter
      if (query.search?.trim()) {
        const searchTerm = query.search.trim();
        whereClause.OR = [
          {
            user: {
              firstName: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
          {
            user: {
              lastName: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
          {
            areasOfExpertise: {
              hasSome: [searchTerm],
            },
          },
          {
            specialCertifications: {
              hasSome: [searchTerm],
            },
          },
        ];
      }

      // Add specialty filter
      if (query.specialties?.length) {
        whereClause.areasOfExpertise = {
          hasSome: query.specialties,
        };
      }

      // Add language filter
      if (query.languages?.length) {
        whereClause.languagesOffered = {
          hasSome: query.languages,
        };
      }

      // Add province filter
      if (query.province?.trim()) {
        whereClause.province = {
          equals: query.province.trim(),
          mode: 'insensitive',
        };
      }

      // Add rate filters
      if (query.minHourlyRate !== undefined) {
        whereClause.hourlyRate = {
          ...whereClause.hourlyRate,
          gte: query.minHourlyRate,
        };
      }

      if (query.maxHourlyRate !== undefined) {
        whereClause.hourlyRate = {
          ...whereClause.hourlyRate,
          lte: query.maxHourlyRate,
        };
      }

      // Add experience filters
      if (query.minExperience !== undefined || query.maxExperience !== undefined) {
        // We'll filter by experience after fetching since it's calculated
      }

      // Build order by clause
      let orderBy: Prisma.TherapistOrderByWithRelationInput[] = [];
      
      switch (query.sortBy) {
        case 'rating':
          // We'll sort by rating after calculating averages
          break;
        case 'experience':
          orderBy.push({ practiceStartDate: query.sortOrder === 'desc' ? 'asc' : 'desc' });
          break;
        case 'hourlyRate':
          orderBy.push({ hourlyRate: query.sortOrder || 'asc' });
          break;
        case 'name':
          orderBy.push({ user: { firstName: query.sortOrder || 'asc' } });
          break;
        default:
          // Default sort by creation date (newest first)
          orderBy.push({ createdAt: 'desc' });
      }

      // Get total count for pagination
      const totalCount = await this.prisma.therapist.count({
        where: whereClause,
      });

      // Fetch therapists with relations
      const therapists = await this.prisma.therapist.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              bio: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy,
        skip: offset,
        take: limit,
      });

      // Transform and enrich the data
      let therapistList: TherapistListItem[] = therapists.map((therapist) => {
        const yearsOfExperience = this.calculateYearsOfExperience(therapist.practiceStartDate);
        const averageRating = this.calculateAverageRating(therapist.reviews);

        return {
          id: therapist.userId,
          userId: therapist.userId,
          user: {
            id: therapist.user.id,
            firstName: therapist.user.firstName,
            lastName: therapist.user.lastName,
            avatarUrl: therapist.user.avatarUrl,
            bio: therapist.user.bio,
          },
          specialties: therapist.areasOfExpertise || [],
          languages: therapist.languagesOffered || [],
          areasOfExpertise: therapist.areasOfExpertise || [],
          approaches: therapist.approaches || [],
          province: therapist.province,
          hourlyRate: Number(therapist.hourlyRate),
          rating: averageRating,
          reviewCount: therapist.reviews.length,
          yearsOfExperience,
          isActive: true, // Only active therapists are returned
          licenseVerified: therapist.licenseVerified,
          status: therapist.status,
          createdAt: therapist.createdAt.toISOString(),
          updatedAt: therapist.updatedAt.toISOString(),
        };
      });

      // Apply post-fetch filters
      if (query.minRating !== undefined) {
        therapistList = therapistList.filter(t => t.rating >= query.minRating!);
      }

      if (query.minExperience !== undefined) {
        therapistList = therapistList.filter(t => t.yearsOfExperience >= query.minExperience!);
      }

      if (query.maxExperience !== undefined) {
        therapistList = therapistList.filter(t => t.yearsOfExperience <= query.maxExperience!);
      }

      // Apply post-fetch sorting for rating
      if (query.sortBy === 'rating') {
        therapistList.sort((a, b) => {
          const order = query.sortOrder === 'desc' ? -1 : 1;
          return (a.rating - b.rating) * order;
        });
      }

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = currentPage < totalPages;
      const hasPreviousPage = currentPage > 1;

      this.logger.log(`Retrieved ${therapistList.length} therapists out of ${totalCount} total`);

      return {
        therapists: therapistList,
        totalCount,
        currentPage,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    } catch (error) {
      this.logger.error('Error getting therapist list:', error);
      throw new InternalServerErrorException(
        `Failed to get therapist list: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async getTherapistById(therapistId: string): Promise<TherapistListItem> {
    try {
      if (!therapistId?.trim()) {
        throw new BadRequestException('Therapist ID is required');
      }

      this.logger.log(`Getting therapist details for ID: ${therapistId}`);

      const therapist = await this.prisma.therapist.findUnique({
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
              avatarUrl: true,
              bio: true,
              isActive: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      });

      if (!therapist) {
        throw new NotFoundException(`Therapist with ID ${therapistId} not found`);
      }

      if (!therapist.user.isActive) {
        throw new NotFoundException('Therapist is not currently active');
      }

      const yearsOfExperience = this.calculateYearsOfExperience(therapist.practiceStartDate);
      const averageRating = this.calculateAverageRating(therapist.reviews);

      return {
        id: therapist.userId,
        userId: therapist.userId,
        user: {
          id: therapist.user.id,
          firstName: therapist.user.firstName,
          lastName: therapist.user.lastName,
          avatarUrl: therapist.user.avatarUrl,
          bio: therapist.user.bio,
        },
        specialties: therapist.areasOfExpertise || [],
        languages: therapist.languagesOffered || [],
        areasOfExpertise: therapist.areasOfExpertise || [],
        approaches: therapist.approaches || [],
        province: therapist.province,
        hourlyRate: Number(therapist.hourlyRate),
        rating: averageRating,
        reviewCount: therapist.reviews.length,
        yearsOfExperience,
        isActive: true,
        licenseVerified: therapist.licenseVerified,
        status: therapist.status,
        createdAt: therapist.createdAt.toISOString(),
        updatedAt: therapist.updatedAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Error getting therapist by ID ${therapistId}:`, error);
      throw new InternalServerErrorException(
        `Failed to get therapist: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}