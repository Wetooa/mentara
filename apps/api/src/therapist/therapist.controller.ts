import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/core/guards/jwt-auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { TherapistService } from './therapist.service';
import {
  CreateTherapistSchema,
  UpdateTherapistSchema,
  TherapistIdParamSchema,
} from './validation';
import { CreateTherapistDto, UpdateTherapistDto } from './types';

@ApiTags('therapists')
@Controller('therapists')
@UseGuards(JwtAuthGuard)
export class TherapistController {
  private readonly logger = new Logger(TherapistController.name);

  constructor(private readonly therapistService: TherapistService) {}

  @Get()
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: string,
  ) {
    this.logger.log(`Fetching therapists with status: ${status}, limit: ${limit}, offset: ${offset}`);
    return this.therapistService.findAll(
      limit ? parseInt(limit, 10) : 10,
      offset ? parseInt(offset, 10) : 0,
      status,
    );
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'The ID of the therapist' })
  async findOne(@Param(new ZodValidationPipe(TherapistIdParamSchema)) params: { id: string }) {
    this.logger.log(`Fetching therapist with ID: ${params.id}`);
    return this.therapistService.findOne(params.id);
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateTherapistSchema)) data: CreateTherapistDto,
  ) {
    this.logger.log(`Creating therapist profile for user: ${data.userId}`);
    return this.therapistService.create(data);
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'The ID of the therapist' })
  async update(
    @Param(new ZodValidationPipe(TherapistIdParamSchema)) params: { id: string },
    @Body(new ZodValidationPipe(UpdateTherapistSchema)) data: UpdateTherapistDto,
  ) {
    this.logger.log(`Updating therapist profile for user: ${params.id}`);
    return this.therapistService.update(params.id, data);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'The ID of the therapist' })
  async remove(@Param(new ZodValidationPipe(TherapistIdParamSchema)) params: { id: string }) {
    this.logger.log(`Deleting therapist profile for user: ${params.id}`);
    return this.therapistService.remove(params.id);
  }
}
