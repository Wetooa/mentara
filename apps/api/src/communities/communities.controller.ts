import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto, UpdateCommunityDto, JoinCommunityDto } from './types';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  CreateCommunitySchema,
  UpdateCommunitySchema,
  CommunityIdParamSchema,
  JoinCommunitySchema,
} from './validation/community.schemas';

@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateCommunitySchema))
  async create(@Body() createCommunityDto: CreateCommunityDto) {
    return await this.communitiesService.create(createCommunityDto);
  }

  @Get()
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('category') category?: string,
  ) {
    return await this.communitiesService.findAll(limit ? +limit : 10, offset ? +offset : 0, category);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.communitiesService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(UpdateCommunitySchema))
  async update(
    @Param('id') id: string,
    @Body() updateCommunityDto: UpdateCommunityDto,
  ) {
    return await this.communitiesService.update(id, updateCommunityDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.communitiesService.remove(id);
  }

  @Post(':id/join')
  @UsePipes(new ZodValidationPipe(JoinCommunitySchema))
  async join(
    @Param('id') id: string,
    @Body() joinDto: JoinCommunityDto,
  ) {
    return await this.communitiesService.join(id, joinDto.userId);
  }

  @Delete(':id/leave/:userId')
  async leave(
    @Param('id') id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return await this.communitiesService.leave(id, userId);
  }

  @Get(':id/rooms')
  async getRooms(@Param('id') id: string) {
    return await this.communitiesService.getRooms(id);
  }
}
