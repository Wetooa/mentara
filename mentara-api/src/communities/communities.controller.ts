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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('communities')
@ApiBearerAuth('JWT-auth')
@Controller('communities')
@UseGuards(JwtAuthGuard)
export class CommunitiesController {
  constructor(
    private readonly communitiesService: CommunitiesService,
    private readonly communityAssignmentService: CommunityAssignmentService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()


  @ApiOperation({ 


    summary: 'Retrieve find all',


    description: 'Retrieve find all' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Retrieve get stats',


    description: 'Retrieve get stats' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Retrieve find by slug',


    description: 'Retrieve find by slug' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Retrieve find one',


    description: 'Retrieve find one' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Retrieve get members',


    description: 'Retrieve get members' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Create create',


    description: 'Create create' 


  })


  @ApiResponse({ 


    status: 201, 


    description: 'Created successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Update update',


    description: 'Update update' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Updated successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Delete remove',


    description: 'Delete remove' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Deleted successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Create join community',


    description: 'Create join community' 


  })


  @ApiResponse({ 


    status: 201, 


    description: 'Created successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Create leave community',


    description: 'Create leave community' 


  })


  @ApiResponse({ 


    status: 201, 


    description: 'Created successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Retrieve find by user id',


    description: 'Retrieve find by user id' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Retrieve get all with structure',


    description: 'Retrieve get all with structure' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  async getAllWithStructure(): Promise<CommunityWithRoomGroupsResponse[]> {
    return await this.communitiesService.findAllWithStructure();
  }

  @Get(':id/with-structure')


  @ApiOperation({ 


    summary: 'Retrieve get one with structure',


    description: 'Retrieve get one with structure' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  async getOneWithStructure(@Param('id') id: string) {
    return await this.communitiesService.findOneWithStructure(id);
  }

  @Post(':id/room-group')


  @ApiOperation({ 


    summary: 'Create create room group',


    description: 'Create create room group' 


  })


  @ApiResponse({ 


    status: 201, 


    description: 'Created successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Create create room',


    description: 'Create create room' 


  })


  @ApiResponse({ 


    status: 201, 


    description: 'Created successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Retrieve get rooms by group',


    description: 'Retrieve get rooms by group' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  async getRoomsByGroup(@Param('roomGroupId') roomGroupId: string) {
    return await this.communitiesService.findRoomsByGroup(roomGroupId);
  }

  // Community Assignment Endpoints
  @Post('assign/me')

  @ApiOperation({ 

    summary: 'Create assign communities to me',

    description: 'Create assign communities to me' 

  })

  @ApiResponse({ 

    status: 201, 

    description: 'Created successfully' 

  })

  @ApiResponse({ status: 401, description: 'Unauthorized' })

  
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


  @ApiOperation({ 


    summary: 'Create assign communities to user',


    description: 'Create assign communities to user' 


  })


  @ApiResponse({ 


    status: 201, 


    description: 'Created successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Retrieve get my recommended communities',


    description: 'Retrieve get my recommended communities' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Create bulk assign communities',


    description: 'Create bulk assign communities' 


  })


  @ApiResponse({ 


    status: 201, 


    description: 'Created successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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
}
