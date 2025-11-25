import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../providers/prisma-client.provider';
import { CacheService } from '../cache/cache.service';

/**
 * Background job to warm frequently accessed caches
 * Improves response times for common queries
 */
@Injectable()
export class CacheWarmingJob {
  private readonly logger = new Logger(CacheWarmingJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /**
   * Warm community list cache
   * Runs every 30 minutes
   */
  @Cron('*/30 * * * *') // Every 30 minutes
  async warmCommunityListCache() {
    this.logger.log('Starting community list cache warming...');

    try {
      // Get top 50 communities by membership count
      const communities = await this.prisma.community.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          avatarUrl: true,
          isPublic: true,
          _count: {
            select: {
              memberships: true,
            },
          },
        },
        orderBy: {
          memberships: {
            _count: 'desc',
          },
        },
        take: 50,
      });

      // Cache the result for 20 minutes
      const cacheKey = this.cache.generateKey('communities', 'list', 'top50');
      await this.cache.set(cacheKey, communities, 1200); // 20 minutes TTL

      this.logger.log(`Warmed community list cache with ${communities.length} communities`);
    } catch (error) {
      this.logger.error('Error warming community list cache:', error);
    }
  }

  /**
   * Warm therapist specialties and certifications cache
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async warmTherapistMetadataCache() {
    this.logger.log('Starting therapist metadata cache warming...');

    try {
      // Get unique specialties
      const therapists = await this.prisma.therapist.findMany({
        where: {
          status: 'APPROVED',
        },
        select: {
          areasOfExpertise: true,
          languagesOffered: true,
          specialCertifications: true,
        },
        take: 1000, // Sample to get variety
      });

      // Extract unique values
      const specialties = new Set<string>();
      const languages = new Set<string>();
      const certifications = new Set<string>();

      therapists.forEach((therapist) => {
        therapist.areasOfExpertise?.forEach((s) => specialties.add(s));
        therapist.languagesOffered?.forEach((l) => languages.add(l));
        therapist.specialCertifications?.forEach((c) => certifications.add(c));
      });

      const metadata = {
        specialties: Array.from(specialties).sort(),
        languages: Array.from(languages).sort(),
        certifications: Array.from(certifications).sort(),
      };

      // Cache for 2 hours
      const cacheKey = this.cache.generateKey('therapists', 'metadata');
      await this.cache.set(cacheKey, metadata, 7200); // 2 hours TTL

      this.logger.log(
        `Warmed therapist metadata cache: ${specialties.size} specialties, ${languages.size} languages, ${certifications.size} certifications`,
      );
    } catch (error) {
      this.logger.error('Error warming therapist metadata cache:', error);
    }
  }

  /**
   * Warm pre-assessment questions cache
   * Runs daily
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async warmPreAssessmentCache() {
    this.logger.log('Starting pre-assessment cache warming...');

    try {
      // This would cache pre-assessment questions if they're stored in the database
      // For now, this is a placeholder for future implementation
      this.logger.log('Pre-assessment cache warming completed (placeholder)');
    } catch (error) {
      this.logger.error('Error warming pre-assessment cache:', error);
    }
  }
}

