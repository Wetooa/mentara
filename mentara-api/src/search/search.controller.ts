import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';

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
    if (province && typeof province === 'string') {
      filters.province = province.trim();
    }
    if (expertise && typeof expertise === 'string') {
      filters.expertise = expertise
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e.length > 0);
    }
    if (maxHourlyRate && typeof maxHourlyRate === 'string') {
      const rate = parseFloat(maxHourlyRate);
      if (!isNaN(rate) && rate >= 0) {
        filters.maxHourlyRate = rate;
      }
    }
    if (minExperience && typeof minExperience === 'string') {
      const exp = parseInt(minExperience, 10);
      if (!isNaN(exp) && exp >= 0) {
        filters.minExperience = exp;
      }
    }

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
