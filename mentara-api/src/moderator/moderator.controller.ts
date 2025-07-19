import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ModeratorService } from './moderator.service';
import { Moderator, Prisma } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('moderator')
@ApiBearerAuth('JWT-auth')
@Controller('moderator')
@UseGuards(JwtAuthGuard)
export class ModeratorController {
  constructor(private readonly moderatorService: ModeratorService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve find all',

    description: 'Retrieve find all',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(): Promise<Moderator[]> {
    try {
      return await this.moderatorService.findAll();
    } catch (error) {
      throw new HttpException(
        `Failed to fetch moderators: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve find one',

    description: 'Retrieve find one',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string): Promise<Moderator> {
    try {
      const moderator = await this.moderatorService.findOne(id);
      if (!moderator) {
        throw new HttpException('Moderator not found', HttpStatus.NOT_FOUND);
      }
      return moderator;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to fetch moderator: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create create',

    description: 'Create create',
  })
  @ApiResponse({
    status: 201,

    description: 'Created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() data: Prisma.ModeratorCreateInput): Promise<Moderator> {
    try {
      return await this.moderatorService.create(data);
    } catch (error) {
      throw new HttpException(
        `Failed to create moderator: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update update',

    description: 'Update update',
  })
  @ApiResponse({
    status: 200,

    description: 'Updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() data: Prisma.ModeratorUpdateInput,
  ): Promise<Moderator> {
    try {
      return await this.moderatorService.update(id, data);
    } catch (error) {
      throw new HttpException(
        `Failed to update moderator: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete remove',

    description: 'Delete remove',
  })
  @ApiResponse({
    status: 200,

    description: 'Deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string): Promise<Moderator> {
    try {
      return await this.moderatorService.remove(id);
    } catch (error) {
      throw new HttpException(
        `Failed to delete moderator: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
