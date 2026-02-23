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
import type { Response } from 'express';
import { PreAssessmentService } from './pre-assessment.service';
import { AiServiceClient } from './services/ai-service.client';
import { GeminiClientService } from './services/gemini-client.service';
import { QuestionnaireSelectorService } from './services/questionnaire-selector.service';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/core/decorators/current-user-id.decorator';
import { CurrentUserRole } from '../auth/core/decorators/current-user-role.decorator';
import { Public } from '../auth/core/decorators/public.decorator';
import { CreatePreAssessmentDto } from './types/pre-assessment.dto';
import { PreAssessment } from '@prisma/client';

@Controller('pre-assessment')
@UseGuards(JwtAuthGuard)
export class PreAssessmentController {
  private readonly logger = new Logger(PreAssessmentController.name);

  constructor(
    private readonly preAssessmentService: PreAssessmentService,
    private readonly aiServiceClient: AiServiceClient,
    private readonly geminiClient: GeminiClientService,
    private readonly questionnaireSelector: QuestionnaireSelectorService,
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
      return await this.preAssessmentService.getPreAssessmentByUserId(id);
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
