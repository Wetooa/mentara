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
import { CreatePreAssessmentDto, AurisChatDto } from './types/pre-assessment.dto';
import { PreAssessment } from '@prisma/client';
import { AurisService } from './auris.service';

@Controller('pre-assessment')
@UseGuards(JwtAuthGuard)
export class PreAssessmentController {
  private readonly logger = new Logger(PreAssessmentController.name);

  constructor(
    private readonly preAssessmentService: PreAssessmentService,
    private readonly aurisService: AurisService,
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

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(
    @CurrentUserId() userId: string,
    @Body() body: AurisChatDto,
  ) {
    return await this.aurisService.chat(userId, body.sessionId, body.message);
  }

  @Post('session/:sessionId/end')
  @HttpCode(HttpStatus.OK)
  async endSession(
    @CurrentUserId() userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return await this.aurisService.endSession(userId, sessionId);
  }

  @Get('session/:sessionId/pdf/summary')
  async getPdfSummary(
    @Param('sessionId') sessionId: string,
    @Res({ passthrough: true }) res: any,
  ) {
    const pdfResponse = await this.aurisService.getPdfSummary(sessionId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=assessment_summary_${sessionId}.pdf`,
    });
    return new StreamableFile(Buffer.from(pdfResponse.data));
  }

  @Get('session/:sessionId/pdf/history')
  async getPdfHistory(
    @Param('sessionId') sessionId: string,
    @Res({ passthrough: true }) res: any,
  ) {
    const pdfResponse = await this.aurisService.getPdfHistory(sessionId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=conversation_history_${sessionId}.pdf`,
    });
    return new StreamableFile(Buffer.from(pdfResponse.data));
  }
}
