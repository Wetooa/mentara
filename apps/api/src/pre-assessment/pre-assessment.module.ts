import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PreAssessmentController } from './pre-assessment.controller';
import { PreAssessmentService } from './pre-assessment.service';
import { AurisService } from './auris.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { RoleUtils } from '../utils/role-utils';
import { ClinicalInsightsService } from './analysis/clinical-insights.service';
import { TherapeuticRecommendationsService } from './analysis/therapeutic-recommendations.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [PreAssessmentController],
  providers: [
    PreAssessmentService,
    AurisService,
    PrismaService,
    RoleUtils,
    ClinicalInsightsService,
    TherapeuticRecommendationsService,
  ],
  exports: [
    PreAssessmentService,
    AurisService,
    ClinicalInsightsService,
    TherapeuticRecommendationsService,
  ],
})
export class PreAssessmentModule { }
