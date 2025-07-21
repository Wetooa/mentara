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
  ConflictException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { CommunitiesService } from './communities.service';
import { CommunityAssignmentService } from './community-assignment.service';
import {
  CommunityCreateInputDto,
  CommunityUpdateInputDto,
} from 'mentara-commons';

// Local response interfaces
interface CommunityResponse {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl: string;
  isPrivate?: boolean;
  memberCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CommunityStatsResponse {
  memberCount?: number;
  postCount?: number;
  activeMembers?: number;
  totalMembers?: number;
  totalPosts?: number;
  activeCommunities?: number;
  illnessCommunities?: any[];
}

interface CommunityWithMembersResponse extends CommunityResponse {
  members: any[];
}

interface CommunityWithRoomGroupsResponse extends CommunityResponse {
  roomGroups: Array<{
    id: string;
    name: string;
    order: number;
    communityId: string;
    rooms: Array<{
      id: string;
      name: string;
      order: number;
      postingRole: string;
      roomGroupId: string;
    }>;
  }>;
}
import { CurrentUserId } from 'src/auth/decorators/current-user-id.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('communities')
@UseGuards(JwtAuthGuard)
export class CommunitiesController {
  constructor(
    private readonly communitiesService: CommunitiesService,
    private readonly communityAssignmentService: CommunityAssignmentService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  // TODO: CONFUSING - Missing @Roles decorator - should this endpoint require authentication only or specific roles?
  // All authenticated users can currently access this endpoint, verify if this is intended behavior
  async findAll(): Promise<CommunityResponse[]> {
    try {
      return await this.communitiesService.findAll();
    } catch (error) {
      // TODO: CONFUSING PATTERN - This generic error handling masks specific exceptions
      // Consider letting service-level exceptions bubble up for better error responses
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
  @Roles('moderator', 'admin')
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
  @Roles('moderator', 'admin')
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
  @Roles('moderator', 'admin')
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
  @Roles('client', 'therapist', 'moderator', 'admin')
  @HttpCode(HttpStatus.OK)
  async joinCommunity(
    @Param('id') communityId: string,
    @CurrentUserId() userId: string,
  ): Promise<{ joined: boolean }> {
    try {
      await this.communitiesService.joinCommunity(communityId, userId);
      return { joined: true };
    } catch (error) {
      // Re-throw known HTTP exceptions to preserve proper error responses
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Only wrap unknown errors
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to join community',
      );
    }
  }

  @Post(':id/leave')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @HttpCode(HttpStatus.OK)
  async leaveCommunity(
    @Param('id') communityId: string,
    @CurrentUserId() userId: string,
  ): Promise<{ left: boolean }> {
    try {
      await this.communitiesService.leaveCommunity(communityId, userId);
      return { left: true };
    } catch (error) {
      // Re-throw known HTTP exceptions to preserve proper error responses
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Only wrap unknown errors
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to leave community',
      );
    }
  }

  @Get('user/:userId')
  // TODO: SECURITY CONCERN - Missing @Roles decorator allows any authenticated user to view another user's community memberships
  // This could be a privacy issue - consider adding role restrictions or user ownership validation
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
  @Roles('moderator', 'admin')
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
  @Roles('moderator', 'admin')
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
      const assignedCommunities =
        await this.communityAssignmentService.assignCommunitiesToUser(userId);
      return { assignedCommunities };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Post('assign/:userId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async assignCommunitiesToUser(
    @Param('userId') userId: string,
  ): Promise<{ assignedCommunities: string[] }> {
    try {
      const assignedCommunities =
        await this.communityAssignmentService.assignCommunitiesToUser(userId);
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
      const recommendedCommunities =
        await this.communityAssignmentService.getRecommendedCommunities(userId);
      return { recommendedCommunities };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Post('assign/bulk')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async bulkAssignCommunities(
    @Body() body: { userIds: string[] },
  ): Promise<{ results: { [userId: string]: string[] } }> {
    try {
      const results =
        await this.communityAssignmentService.bulkAssignCommunities(
          body.userIds,
        );
      return { results };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  // New endpoints for community posts and content management

  @Get('memberships/me')
  @Roles('client', 'therapist', 'moderator', 'admin')
  async getMyMemberships(@CurrentUserId() userId: string) {
    try {
      return await this.communitiesService.getMyMemberships(userId);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to get memberships',
      );
    }
  }

  @Get('rooms/:roomId/posts')
  @Roles('client', 'therapist', 'moderator', 'admin')
  async getPostsByRoom(
    @Param('roomId') roomId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 20;
      return await this.communitiesService.getPostsByRoom(
        roomId,
        Math.max(1, pageNum),
        Math.max(1, Math.min(50, limitNum)),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to get posts',
      );
    }
  }

  @Post('posts')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body() postData: { title: string; content: string; roomId: string },
    @CurrentUserId() userId: string,
  ) {
    try {
      return await this.communitiesService.createPost(
        postData.title,
        postData.content,
        postData.roomId,
        userId,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to create post',
      );
    }
  }

  @Post('posts/:postId/heart')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @HttpCode(HttpStatus.OK)
  async heartPost(
    @Param('postId') postId: string,
    @CurrentUserId() userId: string,
  ) {
    try {
      await this.communitiesService.heartPost(postId, userId);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to heart post',
      );
    }
  }

  @Delete('posts/:postId/heart')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @HttpCode(HttpStatus.OK)
  async unheartPost(
    @Param('postId') postId: string,
    @CurrentUserId() userId: string,
  ) {
    try {
      await this.communitiesService.unheartPost(postId, userId);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to unheart post',
      );
    }
  }

  @Get('me/joined')
  @Roles('client', 'therapist', 'moderator', 'admin')
  async getJoinedCommunities(@CurrentUserId() userId: string) {
    try {
      return await this.communitiesService.getJoinedCommunities(userId);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to get joined communities',
      );
    }
  }

  @Get('me/recommended')
  @Roles('client', 'therapist', 'moderator', 'admin')
  async getRecommendedCommunities(@CurrentUserId() userId: string) {
    try {
      return await this.communitiesService.getRecommendedCommunities(userId);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to get recommended communities',
      );
    }
  }

  @Get('activity/recent')
  @Roles('client', 'therapist', 'moderator', 'admin')
  async getRecentActivity(@CurrentUserId() userId: string) {
    try {
      return await this.communitiesService.getRecentActivity(userId);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to get recent activity',
      );
    }
  }
}
