import { Module } from '@nestjs/common';
import { TherapistRecommendationController } from './therapist-recommendation.controller';
import { TherapistRecommendationService } from './therapist-recommendation.service';
import { TherapistManagementController } from './therapist-management.controller';
import { TherapistManagementService } from './therapist-management.service';
import { TherapistApplicationController } from './therapist-application.controller';
import { TherapistApplicationService } from './therapist-application.service';
import { WorksheetsService } from '../worksheets/worksheets.service';
import { AdvancedMatchingService } from './services/advanced-matching.service';
import { CompatibilityAnalysisService } from './services/compatibility-analysis.service';
import { MatchingAnalyticsService } from './services/matching-analytics.service';
import { EmailService } from '../services/email.service';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { RoleUtils } from 'src/utils/role-utils';

@Module({
  controllers: [
    TherapistRecommendationController,
    TherapistManagementController,
    TherapistApplicationController,
  ],
  providers: [
    TherapistRecommendationService,
    TherapistManagementService,
    TherapistApplicationService,
    WorksheetsService,
    AdvancedMatchingService,
    CompatibilityAnalysisService,
    MatchingAnalyticsService,
    EmailService,
    PrismaService,
    RoleUtils,
  ],
  exports: [TherapistManagementService, TherapistApplicationService],
})
export class TherapistModule {}
