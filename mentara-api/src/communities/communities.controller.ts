import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClerkAuthGuard } from 'src/clerk-auth.guard';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { CommunitiesService } from './communities.service';
import { PrismaService } from 'src/providers/prisma-client.provider';
import {
  CreateCommunityDto,
  UpdateCommunityDto,
  CommunityResponse,
  CommunityWithMembers,
  CommunityStats,
  ApiResponse,
} from 'src/types';

@Controller('communities')
@UseGuards(ClerkAuthGuard)
export class CommunitiesController {
  constructor(
    private readonly communitiesService: CommunitiesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async findAll(
    @Query('includeInactive') includeInactive?: string,
  ): Promise<ApiResponse<CommunityResponse[]>> {
    try {
      const communities = await this.communitiesService.findAll(
        includeInactive === 'true',
      );
      return {
        success: true,
        message: 'Communities retrieved successfully',
        data: communities,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch communities: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @Get('stats')
  async getStats(): Promise<ApiResponse<CommunityStats>> {
    try {
      const stats = await this.communitiesService.getStats();
      return {
        success: true,
        message: 'Community stats retrieved successfully',
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch community stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @Get('illness/:illness')
  async findByIllness(
    @Param('illness') illness: string,
    @CurrentUserId() clerkId: string,
  ): Promise<ApiResponse<CommunityResponse[]>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const communities = await this.communitiesService.findByIllness(
        illness,
        user.id,
      );
      return {
        success: true,
        message: 'Illness communities retrieved successfully',
        data: communities,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch illness communities: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @CurrentUserId() clerkId: string,
  ): Promise<ApiResponse<CommunityResponse>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const community = await this.communitiesService.findBySlug(slug, user.id);
      if (!community) {
        return {
          success: false,
          message: 'Community not found',
        };
      }

      return {
        success: true,
        message: 'Community retrieved successfully',
        data: community,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch community: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUserId() clerkId: string,
  ): Promise<ApiResponse<CommunityResponse>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const community = await this.communitiesService.findOne(id, user.id);
      if (!community) {
        return {
          success: false,
          message: 'Community not found',
        };
      }

      return {
        success: true,
        message: 'Community retrieved successfully',
        data: community,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch community: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @Get(':id/members')
  async getMembers(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<ApiResponse<CommunityWithMembers>> {
    try {
      const members = await this.communitiesService.getMembers(
        id,
        limit ? parseInt(limit) : 50,
        offset ? parseInt(offset) : 0,
      );
      return {
        success: true,
        message: 'Community members retrieved successfully',
        data: members,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch community members: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUserId() clerkId: string,
    @Body() communityData: CreateCommunityDto,
  ): Promise<ApiResponse<CommunityResponse>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const community = await this.communitiesService.create(
        communityData,
        user.id,
      );
      return {
        success: true,
        message: 'Community created successfully',
        data: community,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create community: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
    @Body() communityData: UpdateCommunityDto,
  ): Promise<ApiResponse<CommunityResponse>> {
    try {
      const community = await this.communitiesService.update(id, communityData);
      return {
        success: true,
        message: 'Community updated successfully',
        data: community,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update community: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
  ): Promise<ApiResponse<CommunityResponse>> {
    try {
      const community = await this.communitiesService.remove(id);
      return {
        success: true,
        message: 'Community deleted successfully',
        data: community,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to delete community: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  async joinCommunity(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
    @Body() data?: { role?: string },
  ): Promise<ApiResponse<null>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      await this.communitiesService.joinCommunity(id, user.id, data?.role);
      return {
        success: true,
        message: 'Successfully joined community',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to join community: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  async leaveCommunity(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
  ): Promise<ApiResponse<null>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      await this.communitiesService.leaveCommunity(id, user.id);
      return {
        success: true,
        message: 'Successfully left community',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to leave community: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @Get('user/:userId')
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<ApiResponse<CommunityResponse[]>> {
    try {
      const communities = await this.communitiesService.findByUserId(userId);
      return {
        success: true,
        message: 'User communities retrieved successfully',
        data: communities,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch user communities: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
