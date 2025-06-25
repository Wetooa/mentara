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
import { ClerkAuthGuard } from 'src/clerk-auth.guard';

@Controller('moderator')
@UseGuards(ClerkAuthGuard)
export class ModeratorController {
  constructor(private readonly moderatorService: ModeratorService) {}

  @Get()
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
  async findOne(@Param('id') id: string): Promise<Moderator> {
    try {
      return await this.moderatorService.findOne(id);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch moderator: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
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
