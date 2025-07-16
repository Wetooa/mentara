import { Module } from '@nestjs/common';
import { TherapistRecommendationController } from './therapist-recommendation.controller';
import { TherapistRecommendationService } from './therapist-recommendation.service';
import { TherapistManagementController } from './therapist-management.controller';
import { TherapistManagementService } from './therapist-management.service';
import { TherapistApplicationService } from './therapist-application.service';
import { TherapistProfileController } from './controllers/therapist-profile.controller';
import { TherapistClientController } from './controllers/therapist-client.controller';
import { TherapistWorksheetController } from './controllers/therapist-worksheet.controller';
import { TherapistRequestController } from './controllers/therapist-request.controller';
import { WorksheetsService } from '../worksheets/worksheets.service';
import { TherapistRequestService } from './services/therapist-request.service';
import { AdvancedMatchingService } from './services/advanced-matching.service';
import { CompatibilityAnalysisService } from './services/compatibility-analysis.service';
import { MatchingAnalyticsService } from './services/matching-analytics.service';
import { EmailService } from '../services/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { RoleUtils } from 'src/utils/role-utils';

@Module({
  controllers: [
    TherapistRecommendationController,
    TherapistManagementController,
    TherapistProfileController,
    TherapistClientController,
    TherapistWorksheetController,
    TherapistRequestController,
  ],
  providers: [
    TherapistRecommendationService,
    TherapistManagementService,
    TherapistApplicationService,
    TherapistRequestService,
    WorksheetsService,
    AdvancedMatchingService,
    CompatibilityAnalysisService,
    MatchingAnalyticsService,
    EmailService,
    NotificationsService,
    PrismaService,
    RoleUtils,
  ],
  exports: [
    TherapistManagementService,
    TherapistApplicationService,
    TherapistRequestService,
  ],
})
export class TherapistModule {}
