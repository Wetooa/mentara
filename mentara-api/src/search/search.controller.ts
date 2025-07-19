import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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

@ApiTags('search')
@ApiBearerAuth('JWT-auth')
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('therapists')
  @ApiOperation({
    summary: 'Search therapists',
    description:
      'Search for therapists with advanced filtering options including location, specialties, price range, and more',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Search query string',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'specialties',
    required: false,
    description: 'Filter by specializations (comma-separated)',
  })
  @ApiQuery({
    name: 'priceRange',
    required: false,
    description: 'Price range filter',
  })
  @ApiQuery({
    name: 'experienceYears',
    required: false,
    description: 'Minimum years of experience',
  })
  @ApiQuery({ name: 'rating', required: false, description: 'Minimum rating' })
  @ApiQuery({
    name: 'gender',
    required: false,
    description: 'Filter by gender',
  })
  @ApiQuery({
    name: 'languages',
    required: false,
    description: 'Filter by languages spoken',
  })
  @ApiQuery({
    name: 'availability',
    required: false,
    description: 'Filter by availability',
  })
  @ApiQuery({
    name: 'verifiedOnly',
    required: false,
    description: 'Show only verified therapists',
  })
  @ApiResponse({
    status: 200,
    description: 'Therapists found successfully',
    schema: {
      type: 'object',
      properties: {
        therapists: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              specializations: { type: 'array', items: { type: 'string' } },
              location: { type: 'string' },
              hourlyRate: { type: 'number' },
              rating: { type: 'number' },
              experienceYears: { type: 'number' },
              verified: { type: 'boolean' },
            },
          },
        },
        totalCount: { type: 'number' },
        filters: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Search posts',
    description:
      'Search for posts within communities with optional community filtering',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Search query string',
  })
  @ApiQuery({
    name: 'communityId',
    required: false,
    description: 'Filter by specific community ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Posts found successfully',
    schema: {
      type: 'object',
      properties: {
        posts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              content: { type: 'string' },
              authorId: { type: 'string' },
              communityId: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              likesCount: { type: 'number' },
              commentsCount: { type: 'number' },
            },
          },
        },
        totalCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  searchPosts(
    @Query(new ZodValidationPipe(SearchPostsQueryDtoSchema))
    query: SearchPostsQueryDto,
  ) {
    return this.searchService.searchPosts(query.query, query.communityId);
  }

  @Get('communities')
  @ApiOperation({
    summary: 'Search communities',
    description: 'Search for communities by name or description',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Search query string',
  })
  @ApiResponse({
    status: 200,
    description: 'Communities found successfully',
    schema: {
      type: 'object',
      properties: {
        communities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              memberCount: { type: 'number' },
              isPrivate: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        totalCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  searchCommunities(
    @Query(new ZodValidationPipe(SearchCommunitiesQueryDtoSchema))
    query: SearchCommunitiesQueryDto,
  ) {
    return this.searchService.searchCommunities(query.query);
  }

  @Get('users')
  @ApiOperation({
    summary: 'Search users',
    description:
      'Search for users by name or email with optional role filtering',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Search query string',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Filter by user role (client, therapist, admin, moderator)',
  })
  @ApiResponse({
    status: 200,
    description: 'Users found successfully',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        totalCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  searchUsers(
    @Query(new ZodValidationPipe(SearchUsersQueryDtoSchema))
    query: SearchUsersQueryDto,
  ) {
    return this.searchService.searchUsers(query.query, query.role);
  }

  @Get('global')
  @ApiOperation({
    summary: 'Global search',
    description:
      'Search across multiple entity types (users, therapists, posts, communities) in a single query',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Search query string',
  })
  @ApiQuery({
    name: 'types',
    required: false,
    description:
      'Entity types to search (users, therapists, posts, communities)',
  })
  @ApiResponse({
    status: 200,
    description: 'Global search results',
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: { type: 'object' },
            },
            therapists: {
              type: 'array',
              items: { type: 'object' },
            },
            posts: {
              type: 'array',
              items: { type: 'object' },
            },
            communities: {
              type: 'array',
              items: { type: 'object' },
            },
          },
        },
        totalCount: { type: 'number' },
        query: { type: 'string' },
        searchTypes: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  globalSearch(
    @Query(new ZodValidationPipe(GlobalSearchQueryDtoSchema))
    query: GlobalSearchQueryDto,
  ) {
    // Filter out unsupported types like 'worksheets'
    const supportedTypes = query.types?.filter((type) =>
      ['users', 'therapists', 'posts', 'communities'].includes(type),
    ) as ('users' | 'therapists' | 'posts' | 'communities')[] | undefined;

    return this.searchService.globalSearch(query.query, supportedTypes);
  }
}
