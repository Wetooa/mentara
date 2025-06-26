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
} from '@nestjs/common';
import { PreAssessmentService } from './pre-assessment.service';
import { ClerkAuthGuard } from '../clerk-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { CreatePreAssessmentDto } from '../schema/pre-assessment.d';
import { PreAssessment } from '@prisma/client';

@Controller('pre-assessment')
@UseGuards(ClerkAuthGuard)
export class PreAssessmentController {
  constructor(private readonly preAssessmentService: PreAssessmentService) {}

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
}
