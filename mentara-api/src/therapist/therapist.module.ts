import { Module } from '@nestjs/common';
import { TherapistRecommendationController } from './therapist-recommendation.controller';
import { TherapistRecommendationService } from './therapist-recommendation.service';
import { TherapistManagementController } from './therapist-management.controller';
import { TherapistManagementService } from './therapist-management.service';
import { TherapistApplicationService } from './therapist-application.service';
import { TherapistProfileController } from './controllers/therapist-profile.controller';
import { TherapistClientController } from './controllers/therapist-client.controller';
import { TherapistWorksheetController } from './controllers/therapist-worksheet.controller';
import { WorksheetsService } from '../worksheets/worksheets.service';
import { AdvancedMatchingService } from './services/advanced-matching.service';
import { CompatibilityAnalysisService } from './services/compatibility-analysis.service';
import { EmailModule } from '../email/email.module';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { RoleUtils } from 'src/utils/role-utils';
import { PreAssessmentModule } from '../pre-assessment/pre-assessment.module';

@Module({
  imports: [PreAssessmentModule, EmailModule],
  controllers: [
    TherapistRecommendationController,
    TherapistManagementController,
    TherapistProfileController,
    TherapistClientController,
    TherapistWorksheetController,
  ],
  providers: [
    TherapistRecommendationService,
    TherapistManagementService,
    TherapistApplicationService,
    WorksheetsService,
    AdvancedMatchingService,
    CompatibilityAnalysisService,
    NotificationsService,
    PrismaService,
    RoleUtils,
  ],
  exports: [
    TherapistManagementService,
    TherapistApplicationService,
  ],
})
export class TherapistModule {}
