import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
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
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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

  private generateCacheKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  }

  // Removed calculateAverageRating - now using database aggregation for better performance
  // This method was causing N+1 query issues when calculating ratings for multiple therapists

  async getTherapistList(query: TherapistListQuery): Promise<TherapistListResponse> {
    try {
      // Input validation
      const limit = Math.min(Math.max(query.limit || 20, 1), 100);
      const offset = Math.max(query.offset || 0, 0);
      const currentPage = Math.floor(offset / limit) + 1;

      // Generate cache key from query parameters
      const cacheKey = this.generateCacheKey('therapist-list', {
        limit,
        offset,
        search: query.search,
        specialties: query.specialties,
        languages: query.languages,
        province: query.province,
        minHourlyRate: query.minHourlyRate,
        maxHourlyRate: query.maxHourlyRate,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      // Try to get from cache
      const cached = await this.cacheManager.get<TherapistListResponse>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for therapist list: ${cacheKey}`);
        return cached;
      }

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
      if (query.minHourlyRate !== undefined || query.maxHourlyRate !== undefined) {
        whereClause.hourlyRate = {};
        
        if (query.minHourlyRate !== undefined) {
          whereClause.hourlyRate.gte = query.minHourlyRate;
        }
        
        if (query.maxHourlyRate !== undefined) {
          whereClause.hourlyRate.lte = query.maxHourlyRate;
        }
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

      // Fetch therapists with relations - optimized to use aggregation for ratings
      const therapists = await this.prisma.therapist.findMany({
        where: whereClause,
        select: {
          userId: true,
          areasOfExpertise: true,
          languagesOffered: true,
          approaches: true,
          province: true,
          hourlyRate: true,
          practiceStartDate: true,
          licenseVerified: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              bio: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy,
        skip: offset,
        take: limit,
      });

      // Get average ratings in a single aggregated query to avoid N+1
      const therapistIds = therapists.map(t => t.userId);
      const ratingAggregates = await this.prisma.review.groupBy({
        by: ['therapistId'],
        where: {
          therapistId: { in: therapistIds },
        },
        _avg: {
          rating: true,
        },
      });

      const ratingMap = new Map(
        ratingAggregates.map(agg => [agg.therapistId, agg._avg.rating || 0])
      );

      // Transform and enrich the data
      let therapistList: TherapistListItem[] = therapists.map((therapist) => {
        const yearsOfExperience = this.calculateYearsOfExperience(therapist.practiceStartDate);
        const averageRating = ratingMap.get(therapist.userId) || 0;

        return {
          id: therapist.userId,
          userId: therapist.userId,
          user: {
            id: therapist.user.id,
            firstName: therapist.user.firstName,
            lastName: therapist.user.lastName,
            avatarUrl: therapist.user.avatarUrl || undefined,
            bio: therapist.user.bio || undefined,
          },
          specialties: therapist.areasOfExpertise || [],
          languages: therapist.languagesOffered || [],
          areasOfExpertise: therapist.areasOfExpertise || [],
          approaches: therapist.approaches || [],
          province: therapist.province,
          hourlyRate: Number(therapist.hourlyRate),
          rating: averageRating,
          reviewCount: therapist._count.reviews,
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

      const response = {
        therapists: therapistList,
        totalCount,
        currentPage,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };

      // Cache the response
      await this.cacheManager.set(cacheKey, response, this.CACHE_TTL);
      this.logger.debug(`Cached therapist list: ${cacheKey}`);

      return response;
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

      // Try cache first
      const cacheKey = `therapist:${therapistId}`;
      const cached = await this.cacheManager.get<TherapistListItem>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for therapist: ${therapistId}`);
        return cached;
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
          // Removed reviews from include - using aggregation instead for better performance
        },
      });

      if (!therapist) {
        throw new NotFoundException(`Therapist with ID ${therapistId} not found`);
      }

      if (!therapist.user.isActive) {
        throw new NotFoundException('Therapist is not currently active');
      }

      const yearsOfExperience = this.calculateYearsOfExperience(therapist.practiceStartDate);
      
      // Get average rating using aggregation for better performance
      const ratingAggregate = await this.prisma.review.aggregate({
        where: { therapistId: therapist.userId },
        _avg: { rating: true },
        _count: { id: true },
      });
      const averageRating = ratingAggregate._avg.rating || 0;

      const result: TherapistListItem = {
        id: therapist.userId,
        userId: therapist.userId,
        user: {
          id: therapist.user.id,
          firstName: therapist.user.firstName,
          lastName: therapist.user.lastName,
          avatarUrl: therapist.user.avatarUrl || undefined,
          bio: therapist.user.bio || undefined,
        },
        specialties: therapist.areasOfExpertise || [],
        languages: therapist.languagesOffered || [],
        areasOfExpertise: therapist.areasOfExpertise || [],
        approaches: therapist.approaches || [],
        province: therapist.province,
        hourlyRate: Number(therapist.hourlyRate),
        rating: averageRating,
        reviewCount: ratingAggregate._count.id,
        yearsOfExperience,
        isActive: true,
        licenseVerified: therapist.licenseVerified,
        status: therapist.status,
        createdAt: therapist.createdAt.toISOString(),
        updatedAt: therapist.updatedAt.toISOString(),
      };

      // Cache the response
      await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
      this.logger.debug(`Cached therapist: ${therapistId}`);

      return result;
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