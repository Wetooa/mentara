import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PreAssessmentController } from './pre-assessment.controller';
import { PreAssessmentService } from './pre-assessment.service';
import { AiServiceClient } from './services/ai-service.client';
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
    PrismaService,
    RoleUtils,
    ClinicalInsightsService,
    TherapeuticRecommendationsService,
  ],
  exports: [
    PreAssessmentService,
    AiServiceClient,
    ClinicalInsightsService,
    TherapeuticRecommendationsService,
  ],
})
export class PreAssessmentModule {}
