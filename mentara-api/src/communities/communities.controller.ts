import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from 'src/clerk-auth.guard';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { CommunitiesService } from './communities.service';
import { Community, Prisma } from '@prisma/client';

@Controller('communities')
@UseGuards(ClerkAuthGuard)
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Get()
  async findAll(): Promise<Community[]> {
    try {
      return await this.communitiesService.findAll();
    } catch (error) {
      throw new HttpException(
        `Failed to fetch communities: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Community> {
    try {
      const community = await this.communitiesService.findOne(id);
      if (!community) {
        throw new HttpException('Community not found', HttpStatus.NOT_FOUND);
      }
      return community;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch community: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(
    @CurrentUserId() clerkId: string,
    @Body() communityData: Prisma.CommunityCreateInput,
  ): Promise<Community> {
    try {
      return await this.communitiesService.create(communityData);
    } catch (error) {
      throw new HttpException(
        `Failed to create community: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
    @Body() communityData: Prisma.CommunityUpdateInput,
  ): Promise<Community> {
    try {
      return await this.communitiesService.update(id, communityData);
    } catch (error) {
      throw new HttpException(
        `Failed to update community: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
  ): Promise<Community> {
    try {
      return await this.communitiesService.remove(id);
    } catch (error) {
      throw new HttpException(
        `Failed to delete community: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<Community[]> {
    try {
      return await this.communitiesService.findByUserId(userId);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch communities for user: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
