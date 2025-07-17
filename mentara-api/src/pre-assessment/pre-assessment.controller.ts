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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { CreatePreAssessmentDto } from '../../schema/pre-assessment';
import { PreAssessment } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('pre-assessment')
@ApiBearerAuth('JWT-auth')
@Controller('pre-assessment')
@UseGuards(JwtAuthGuard)
export class PreAssessmentController {
  private readonly logger = new Logger(PreAssessmentController.name);

  constructor(
    private readonly preAssessmentService: PreAssessmentService,
    private readonly aiServiceClient: AiServiceClient,
  ) {}

  @Post()


  @ApiOperation({ 


    summary: 'Create create pre assessment',


    description: 'Create create pre assessment' 


  })


  @ApiResponse({ 


    status: 201, 


    description: 'Created successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Retrieve get pre assessment',


    description: 'Retrieve get pre assessment' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Update update pre assessment',


    description: 'Update update pre assessment' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Updated successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Delete delete pre assessment',


    description: 'Delete delete pre assessment' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Deleted successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Retrieve check ai service health',


    description: 'Retrieve check ai service health' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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
