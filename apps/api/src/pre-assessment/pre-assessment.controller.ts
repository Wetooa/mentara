import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  BadRequestException,
  Logger,
  ForbiddenException,
  NotFoundException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { PreAssessmentService } from './pre-assessment.service';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/core/decorators/current-user-id.decorator';
import { CreatePreAssessmentDto } from './types/pre-assessment.dto';
import { PreAssessment } from '@prisma/client';

@Controller('pre-assessment')
@UseGuards(JwtAuthGuard)
export class PreAssessmentController {
  private readonly logger = new Logger(PreAssessmentController.name);

  constructor(
    private readonly preAssessmentService: PreAssessmentService,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPreAssessment(
    @CurrentUserId() id: string,
    @Body() data: CreatePreAssessmentDto,
  ): Promise<{ id: string; message: string }> {
    try {
      const response = await this.preAssessmentService.createPreAssessment(id, data);
      return { id: response.id, message: 'Pre-assessment created successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getPreAssessment(@CurrentUserId() id: string): Promise<PreAssessment> {
    try {
      return await this.preAssessmentService.getPreAssessmentByClientId(id);
    } catch (error) {
      // If it's already a NotFoundException, re-throw it (don't convert to 500)
      if (error instanceof NotFoundException) {
        throw error;
      }
      // For other errors, convert to InternalServerErrorException
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }
}
