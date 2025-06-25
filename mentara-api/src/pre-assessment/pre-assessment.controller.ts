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
} from '@nestjs/common';
import { PreAssessmentService } from './pre-assessment.service';
import { ClerkAuthGuard } from '../clerk-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import {
  CreatePreAssessmentDto,
  PreAssessmentResponse,
  ApiResponse,
} from '../types';

@Controller('pre-assessment')
@UseGuards(ClerkAuthGuard)
export class PreAssessmentController {
  constructor(private readonly preAssessmentService: PreAssessmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPreAssessment(
    @CurrentUserId() id: string,
    @Body() data: CreatePreAssessmentDto,
  ): Promise<ApiResponse<PreAssessmentResponse>> {
    return this.preAssessmentService.createPreAssessment(id, data);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getPreAssessment(
    @CurrentUserId() id: string,
  ): Promise<ApiResponse<PreAssessmentResponse>> {
    return this.preAssessmentService.getPreAssessmentByClerkId(id);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async updatePreAssessment(
    @CurrentUserId() id: string,
    @Body() data: Partial<CreatePreAssessmentDto>,
  ): Promise<ApiResponse<PreAssessmentResponse>> {
    return this.preAssessmentService.updatePreAssessment(id, data);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async deletePreAssessment(
    @CurrentUserId() id: string,
  ): Promise<ApiResponse<null>> {
    return this.preAssessmentService.deletePreAssessment(id);
  }
}
