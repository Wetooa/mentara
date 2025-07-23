import { Module } from '@nestjs/common';
import { TherapistRecommendationController } from './therapist-recommendation.controller';
import { TherapistsController } from './therapists.controller';
import { TherapistRecommendationService } from './therapist-recommendation.service';

import { TherapistManagementService } from './therapist-management.service';

import { TherapistProfileController } from './controllers/therapist-profile.controller';
import { TherapistClientController } from './controllers/therapist-client.controller';
import { TherapistWorksheetController } from './controllers/therapist-worksheet.controller';
import { TherapistMatchController } from './therapist-match.controller';
import { WorksheetsService } from '../worksheets/worksheets.service';
import { AdvancedMatchingService } from './services/advanced-matching.service';
import { CompatibilityAnalysisService } from './services/compatibility-analysis.service';
import { EmailModule } from '../email/email.module';
import { NotificationsService } from '../notifications/notifications.service';
import { MessagingService } from '../messaging/messaging.service';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { RoleUtils } from 'src/utils/role-utils';
import { PreAssessmentModule } from '../pre-assessment/pre-assessment.module';
import { MessagingModule } from '../messaging/messaging.module';
import { CommunitiesModule } from '../communities/communities.module';

@Module({
  imports: [PreAssessmentModule, EmailModule, MessagingModule, CommunitiesModule],
  controllers: [
    TherapistRecommendationController,
    TherapistsController,
    TherapistProfileController,
    TherapistClientController,
    TherapistWorksheetController,
    TherapistMatchController,
  ],
  providers: [
    TherapistRecommendationService,
    TherapistManagementService,
    WorksheetsService,
    AdvancedMatchingService,
    CompatibilityAnalysisService,
    NotificationsService,
    MessagingService,
    PrismaService,
    RoleUtils,
  ],
  exports: [
    TherapistManagementService,

  ],
})
export class TherapistModule {}
