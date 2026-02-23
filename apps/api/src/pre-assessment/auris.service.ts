import { Injectable, Logger, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { PreAssessmentService } from './pre-assessment.service';
import { AurisResponseDto } from './types/pre-assessment.dto';

@Injectable()
export class AurisService {
  private readonly logger = new Logger(AurisService.name);
  private readonly flaskUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => PreAssessmentService))
    private readonly preAssessmentService: PreAssessmentService,
  ) {
    this.flaskUrl = this.configService.get<string>('FLASK_MICROSERVICE_URL') || 'http://localhost:5000';
  }

  async chat(userId: string, sessionId: string, message: string): Promise<any> {
    try {
      this.logger.log(`User ${userId} sending chat to AURIS session ${sessionId}`);
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.post(`${this.flaskUrl}/api/chat`, {
          session_id: sessionId,
          message,
        }),
      );
      const result = response.data;

      // Business Logic: Save results if assessment is complete
      if (result.state?.is_complete && result.results) {
        this.logger.log(`AURIS session ${sessionId} complete. Saving results for user ${userId}...`);
        await this.saveAurisResults(userId, result.results);
      }

      return result;
    } catch (error) {
      this.logger.error(`Error in Auris chat: ${error.message}`);
      throw new InternalServerErrorException('Failed to communicate with AI service');
    }
  }

  async endSession(userId: string, sessionId: string): Promise<any> {
    try {
      this.logger.log(`User ${userId} ending AURIS session ${sessionId}`);
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.post(`${this.flaskUrl}/api/session/${sessionId}/end`),
      );
      const result = response.data;

      // Business Logic: Save final results if available
      if (result.results) {
        await this.saveAurisResults(userId, result.results);
      }

      return result;
    } catch (error) {
      this.logger.error(`Error ending Auris session: ${error.message}`);
      throw new InternalServerErrorException('Failed to end AI session');
    }
  }

  private async saveAurisResults(userId: string, results: NonNullable<AurisResponseDto['results']>): Promise<void> {
    await this.preAssessmentService.createPreAssessment(userId, {
      assessmentId: results.assessmentId,
      method: results.method,
      completedAt: results.completedAt,
      data: results.data,
      pastTherapyExperiences: results.context.pastTherapyExperiences?.join(', ') || null,
      medicationHistory: results.context.medicationHistory?.join(', ') || null,
      accessibilityNeeds: results.context.accessibilityNeeds?.join(', ') || null,
    });
  }

  async getPdfSummary(sessionId: string): Promise<AxiosResponse> {
    try {
      return await firstValueFrom(
        this.httpService.get(`${this.flaskUrl}/api/session/${sessionId}/pdf/summary`, {
          responseType: 'arraybuffer',
        }),
      );
    } catch (error) {
      this.logger.error(`Error fetching PDF summary: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch assessment summary PDF');
    }
  }

  async getPdfHistory(sessionId: string): Promise<AxiosResponse> {
    try {
      return await firstValueFrom(
        this.httpService.get(`${this.flaskUrl}/api/session/${sessionId}/pdf/history`, {
          responseType: 'arraybuffer',
        }),
      );
    } catch (error) {
      this.logger.error(`Error fetching PDF history: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch conversation history PDF');
    }
  }
}
