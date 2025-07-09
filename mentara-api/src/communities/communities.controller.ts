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
  BadRequestException,
} from '@nestjs/common';
import { ClerkAuthGuard } from 'src/guards/clerk-auth.guard';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { CommunitiesService } from './communities.service';
import { CommunityAssignmentService } from './community-assignment.service';
import {
  CommunityCreateInputDto,
  CommunityResponse,
  CommunityStatsResponse,
  CommunityUpdateInputDto,
  CommunityWithMembersResponse,
  CommunityWithRoomGroupsResponse,
} from 'schema/community';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';

@Controller('communities')
@UseGuards(ClerkAuthGuard)
export class CommunitiesController {
  constructor(
    private readonly communitiesService: CommunitiesService,
    private readonly communityAssignmentService: CommunityAssignmentService,
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
  async getStats(): Promise<CommunityStatsResponse> {
    try {
      return await this.communitiesService.getStats();
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
  ): Promise<CommunityWithMembersResponse> {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 50;
      const offsetNum = offset ? parseInt(offset, 10) : 0;

      if (limit && isNaN(limitNum)) {
        throw new BadRequestException('Invalid limit parameter');
      }
      if (offset && isNaN(offsetNum)) {
        throw new BadRequestException('Invalid offset parameter');
      }

      return await this.communitiesService.getMembers(
        id,
        Math.max(1, Math.min(100, limitNum)), // Clamp between 1-100
        Math.max(0, offsetNum), // Ensure non-negative
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
    @Body() communityData: CommunityCreateInputDto,
  ): Promise<CommunityResponse> {
    try {
      return await this.communitiesService.createCommunity(communityData);
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
    @Body() communityData: CommunityUpdateInputDto,
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
  async joinCommunity(
    @Param('id') communityId: string,
    @CurrentUserId() userId: string,
  ): Promise<{ joined: boolean }> {
    try {
      await this.communitiesService.joinCommunity(communityId, userId);
      return { joined: true };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  async leaveCommunity(
    @Param('id') communityId: string,
    @CurrentUserId() userId: string,
  ): Promise<{ left: boolean }> {
    try {
      await this.communitiesService.leaveCommunity(communityId, userId);
      return { left: true };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
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

  @Get('with-structure')
  async getAllWithStructure(): Promise<CommunityWithRoomGroupsResponse[]> {
    return await this.communitiesService.findAllWithStructure();
  }

  @Get(':id/with-structure')
  async getOneWithStructure(@Param('id') id: string) {
    return await this.communitiesService.findOneWithStructure(id);
  }

  @Post(':id/room-group')
  async createRoomGroup(
    @Param('id') communityId: string,
    @Body() dto: { name: string; order: number },
  ) {
    return await this.communitiesService.createRoomGroup(
      communityId,
      dto.name,
      dto.order,
    );
  }

  @Post('room-group/:roomGroupId/room')
  async createRoom(
    @Param('roomGroupId') roomGroupId: string,
    @Body() dto: { name: string; order: number },
  ) {
    return await this.communitiesService.createRoom(
      roomGroupId,
      dto.name,
      dto.order,
    );
  }

  @Get('room-group/:roomGroupId/rooms')
  async getRoomsByGroup(@Param('roomGroupId') roomGroupId: string) {
    return await this.communitiesService.findRoomsByGroup(roomGroupId);
  }

  // Community Assignment Endpoints
  @Post('assign/me')
  @HttpCode(HttpStatus.OK)
  async assignCommunitiesToMe(
    @CurrentUserId() userId: string,
  ): Promise<{ assignedCommunities: string[] }> {
    try {
      const assignedCommunities = await this.communityAssignmentService.assignCommunitiesToUser(userId);
      return { assignedCommunities };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Post('assign/:userId')
  @HttpCode(HttpStatus.OK)
  async assignCommunitiesToUser(
    @Param('userId') userId: string,
  ): Promise<{ assignedCommunities: string[] }> {
    try {
      const assignedCommunities = await this.communityAssignmentService.assignCommunitiesToUser(userId);
      return { assignedCommunities };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Get('recommended/me')
  async getMyRecommendedCommunities(
    @CurrentUserId() userId: string,
  ): Promise<{ recommendedCommunities: string[] }> {
    try {
      const recommendedCommunities = await this.communityAssignmentService.getRecommendedCommunities(userId);
      return { recommendedCommunities };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Post('assign/bulk')
  @HttpCode(HttpStatus.OK)
  async bulkAssignCommunities(
    @Body() body: { userIds: string[] },
  ): Promise<{ results: { [userId: string]: string[] } }> {
    try {
      const results = await this.communityAssignmentService.bulkAssignCommunities(body.userIds);
      return { results };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
