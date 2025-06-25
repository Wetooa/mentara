import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClerkAuthGuard } from 'src/clerk-auth.guard';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { CommunityStats, CommunityWithMembers } from 'src/types';
import { CommunitiesService } from './communities.service';
import {
  CreateCommunityDto,
  UpdateCommunityDto,
  CommunityResponse,
} from './dto/community.dto';

@Controller('communities')
@UseGuards(ClerkAuthGuard)
export class CommunitiesController {
  constructor(
    private readonly communitiesService: CommunitiesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async findAll(): Promise<CommunityResponse[]> {
    try {
      return await this.communitiesService.findAll();
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Get('stats')
  async getStats(): Promise<CommunityStats> {
    try {
      return await this.communitiesService.getStats();
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Get('illness/:illness')
  async findByIllness(): Promise<CommunityResponse[]> {
    try {
      return await this.communitiesService.findByIllness();
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<CommunityResponse> {
    try {
      const community = await this.communitiesService.findBySlug(slug);
      if (!community) throw new NotFoundException('Community not found');
      return community;
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CommunityResponse> {
    try {
      const community = await this.communitiesService.findOne(id);
      if (!community) throw new NotFoundException('Community not found');
      return community;
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Get(':id/members')
  async getMembers(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<CommunityWithMembers> {
    try {
      return await this.communitiesService.getMembers(
        id,
        limit ? parseInt(limit) : 50,
        offset ? parseInt(offset) : 0,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() communityData: CreateCommunityDto,
  ): Promise<CommunityResponse> {
    try {
      return await this.communitiesService.create(communityData);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() communityData: UpdateCommunityDto,
  ): Promise<CommunityResponse> {
    try {
      return await this.communitiesService.update(id, communityData);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<CommunityResponse> {
    try {
      return await this.communitiesService.remove(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  joinCommunity(): void {
    // Membership logic would go here, if needed
    return;
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  leaveCommunity(): void {
    // Membership logic would go here, if needed
    return;
  }

  @Get('user/:userId')
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<CommunityResponse[]> {
    try {
      return await this.communitiesService.findByUserId(userId);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
