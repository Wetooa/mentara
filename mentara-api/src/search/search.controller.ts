import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  SearchTherapistsQueryDtoSchema,
  SearchPostsQueryDtoSchema,
  SearchCommunitiesQueryDtoSchema,
  SearchUsersQueryDtoSchema,
  GlobalSearchQueryDtoSchema,
  type SearchTherapistsQueryDto,
  type SearchPostsQueryDto,
  type SearchCommunitiesQueryDto,
  type SearchUsersQueryDto,
  type GlobalSearchQueryDto,
} from 'mentara-commons';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('therapists')
  searchTherapists(
    @Query(new ZodValidationPipe(SearchTherapistsQueryDtoSchema))
    query: SearchTherapistsQueryDto,
  ) {
    return this.searchService.searchTherapists(query.query || '', {
      location: query.location,
      specialties: query.specialties,
      priceRange: query.priceRange,
      experienceYears: query.experienceYears,
      rating: query.rating,
      gender: query.gender,
      languages: query.languages,
      availability: query.availability,
      verifiedOnly: query.verifiedOnly,
      // Map maxHourlyRate from priceRange.max for backward compatibility
      maxHourlyRate: query.priceRange?.max,
    });
  }

  @Get('posts')
  searchPosts(
    @Query(new ZodValidationPipe(SearchPostsQueryDtoSchema))
    query: SearchPostsQueryDto,
  ) {
    return this.searchService.searchPosts(query.query, query.communityId);
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
