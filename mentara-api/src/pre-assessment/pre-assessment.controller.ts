import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PreAssessmentService } from './pre-assessment.service';
import { AiServiceClient } from './services/ai-service.client';
import { ClerkAuthGuard } from '../clerk-auth.guard';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { AdminOnly } from '../decorators/admin-only.decorator';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { CreatePreAssessmentDto } from '../../schema/pre-assessment';
import { PreAssessment } from '@prisma/client';

@Controller('pre-assessment')
@UseGuards(ClerkAuthGuard)
export class PreAssessmentController {
  private readonly logger = new Logger(PreAssessmentController.name);

  constructor(
    private readonly preAssessmentService: PreAssessmentService,
    private readonly aiServiceClient: AiServiceClient,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPreAssessment(
    @CurrentUserId() id: string,
    @Body() data: CreatePreAssessmentDto,
  ): Promise<PreAssessment> {
    try {
      return await this.preAssessmentService.createPreAssessment(id, data);
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
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async updatePreAssessment(
    @CurrentUserId() id: string,
    @Body() data: Partial<CreatePreAssessmentDto>,
  ): Promise<PreAssessment> {
    try {
      return await this.preAssessmentService.updatePreAssessment(id, data);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async deletePreAssessment(@CurrentUserId() id: string): Promise<null> {
    try {
      return await this.preAssessmentService.deletePreAssessment(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Get('ai-service/health')
  @UseGuards(AdminAuthGuard)
  @AdminOnly()
  async checkAiServiceHealth(@CurrentUserId() currentUserId: string): Promise<{
    status: string;
    healthy: boolean;
    serviceInfo: any;
    timestamp: string;
  }> {
    try {
      this.logger.log(`Admin ${currentUserId} checking AI service health`);
      
      const healthy = await this.aiServiceClient.healthCheck();
      const serviceInfo = this.aiServiceClient.getServiceInfo();
      
      return {
        status: healthy ? 'healthy' : 'unhealthy',
        healthy,
        serviceInfo,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('AI service health check failed:', error);
      return {
        status: 'error',
        healthy: false,
        serviceInfo: this.aiServiceClient.getServiceInfo(),
        timestamp: new Date().toISOString(),
      };
    }
  }
}
