import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PreAssessmentController } from './pre-assessment.controller';
import { PreAssessmentService } from './pre-assessment.service';
import { AiServiceClient } from './services/ai-service.client';
import { SambaNovaClientService } from './services/sambanova-client.service';
import { PreAssessmentChatbotService } from './services/pre-assessment-chatbot.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { RoleUtils } from '../utils/role-utils';
import { ClinicalInsightsService } from './analysis/clinical-insights.service';
import { TherapeuticRecommendationsService } from './analysis/therapeutic-recommendations.service';

@Module({
  imports: [ConfigModule],
  controllers: [PreAssessmentController],
  providers: [
    PreAssessmentService,
    AiServiceClient,
    SambaNovaClientService,
    PreAssessmentChatbotService,
    PrismaService,
    RoleUtils,
    ClinicalInsightsService,
    TherapeuticRecommendationsService,
  ],
  exports: [
    PreAssessmentService,
    AiServiceClient,
    SambaNovaClientService,
    PreAssessmentChatbotService,
    ClinicalInsightsService,
    TherapeuticRecommendationsService,
  ],
})
export class PreAssessmentModule {}
