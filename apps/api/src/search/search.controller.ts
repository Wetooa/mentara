import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  SearchTherapistsQueryDtoSchema,
  SearchPostsQueryDtoSchema,
  SearchCommunitiesQueryDtoSchema,
  SearchUsersQueryDtoSchema,
  GlobalSearchQueryDtoSchema,
} from './validation/search.schemas';
import type {
  SearchTherapistsQueryDto,
  SearchPostsQueryDto,
  SearchCommunitiesQueryDto,
  SearchUsersQueryDto,
  GlobalSearchQueryDto,
} from './types';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('therapists')
  searchTherapists(
    @Query(new ZodValidationPipe(SearchTherapistsQueryDtoSchema))
    query: SearchTherapistsQueryDto,
  ) {
    // Convert availability string to object format if needed
    let availabilityObj: { dayOfWeek?: number; startTime?: string; endTime?: string; timezone?: string } | undefined;
    if (query.availability && typeof query.availability === 'string') {
      // If it's a string like 'immediate', 'within_week', etc., don't pass it as availability object
      // The search service should handle this differently
      availabilityObj = undefined;
    } else if (query.availability && typeof query.availability === 'object') {
      availabilityObj = query.availability as { dayOfWeek?: number; startTime?: string; endTime?: string; timezone?: string };
    }

    return this.searchService.searchTherapists(query.query || '', {
      location: query.location,
      specialties: query.specialties,
      priceRange: query.priceRange,
      experienceYears: query.experienceYears,
      rating: query.rating,
      gender: query.gender,
      languages: query.languages,
      availability: availabilityObj,
      verifiedOnly: query.verifiedOnly,
      // Map maxHourlyRate from priceRange.max for backward compatibility
      maxHourlyRate: query.priceRange?.max,
    });
  }

  @Get('posts')
  searchPosts(
    @Query(new ZodValidationPipe(SearchPostsQueryDtoSchema))
    query: SearchPostsQueryDto,
    @Req() req: any,
  ) {
    const userId = req.userId;
    return this.searchService.searchPosts(query.query, query.communityId, userId);
  }

  @Get('comments')
  searchComments(
    @Query(new ZodValidationPipe(SearchPostsQueryDtoSchema)) // Reuse PostsQueryDto for now
    query: SearchPostsQueryDto,
    @Req() req: any,
  ) {
    const userId = req.userId;
    return this.searchService.searchComments(query.query, query.communityId, userId);
  }

  @Get('communities')
  searchCommunities(
    @Query(new ZodValidationPipe(SearchCommunitiesQueryDtoSchema))
    query: SearchCommunitiesQueryDto,
  ) {
    return this.searchService.searchCommunities(query.query);
  }

  @Get('users')
  searchUsers(
    @Query(new ZodValidationPipe(SearchUsersQueryDtoSchema))
    query: SearchUsersQueryDto,
  ) {
    return this.searchService.searchUsers(query.query, query.role);
  }

  @Get('global')
  globalSearch(
    @Query(new ZodValidationPipe(GlobalSearchQueryDtoSchema))
    query: GlobalSearchQueryDto,
    @Req() req: any, // Get user from request
  ) {
    // Include worksheets and messages in supported types
    const supportedTypes = query.types?.filter((type) =>
      ['users', 'therapists', 'posts', 'communities', 'worksheets', 'messages'].includes(type),
    ) as ('users' | 'therapists' | 'posts' | 'communities' | 'worksheets' | 'messages')[] | undefined;

    // Extract user information from the request
    const userId = req.userId;
    const userRole = req.userRole;

    return this.searchService.globalSearch(
      query.query, 
      supportedTypes, 
      userId, 
      userRole
    );
  }
}
