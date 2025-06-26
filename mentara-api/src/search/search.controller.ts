import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { ClerkAuthGuard } from '../clerk-auth.guard';

@Controller('search')
@UseGuards(ClerkAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('therapists')
  searchTherapists(
    @Query('q') query: string,
    @Query('province') province?: string,
    @Query('expertise') expertise?: string,
    @Query('maxRate') maxHourlyRate?: string,
    @Query('minExp') minExperience?: string,
  ) {
    const filters: any = {};
    if (province) filters.province = province;
    if (expertise) filters.expertise = expertise.split(',');
    if (maxHourlyRate) filters.maxHourlyRate = parseFloat(maxHourlyRate);
    if (minExperience) filters.minExperience = parseInt(minExperience);

    return this.searchService.searchTherapists(query, filters);
  }

  @Get('posts')
  searchPosts(
    @Query('q') query: string,
    @Query('community') communityId?: string,
  ) {
    return this.searchService.searchPosts(query, communityId);
  }

  @Get('communities')
  searchCommunities(@Query('q') query: string) {
    return this.searchService.searchCommunities(query);
  }

  @Get('users')
  searchUsers(@Query('q') query: string, @Query('role') role?: string) {
    return this.searchService.searchUsers(query, role);
  }

  @Get('global')
  globalSearch(
    @Query('q') query: string,
    @Query('type') type?: 'therapists' | 'posts' | 'communities' | 'users',
  ) {
    return this.searchService.globalSearch(query, type);
  }
}
