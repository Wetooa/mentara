import { Module } from '@nestjs/common';
import { TherapistRecommendationController } from './therapist-recommendation.controller';
import { TherapistsController } from './therapists.controller';
import { TherapistRecommendationService } from './therapist-recommendation.service';

import { TherapistManagementService } from './therapist-management.service';

import { TherapistProfileController } from './controllers/therapist-profile.controller';
import { TherapistClientController } from './controllers/therapist-client.controller';
import { TherapistWorksheetController } from './controllers/therapist-worksheet.controller';
import { TherapistMatchController } from './therapist-match.controller';
import { TherapistListController } from './controllers/therapist-list.controller';
import { TherapistListService } from './services/therapist-list.service';
import { WorksheetsService } from '../worksheets/worksheets.service';
import { AdvancedMatchingService } from './services/advanced-matching.service';
import { IntelligentMatchingService } from './matching/intelligent-matching.service';
import { MatchingOrchestratorService } from './matching/matching-orchestrator.service';
import { ConversationAnalysisService } from './matching/analysis/conversation-analysis.service';
import { CompatibilityAnalysisService } from './matching/analysis/compatibility-analysis.service';
import { ClientEngagementAnalysisService } from './matching/analysis/client-engagement-analysis.service';
import { TherapistPerformanceAnalysisService } from './matching/analysis/therapist-performance-analysis.service';
import { ReviewSentimentAnalysisService } from './matching/analysis/review-sentiment-analysis.service';
import { EngagementMatchingService } from './matching/scoring/engagement-matching.service';
import { PerformanceMatchingService } from './matching/scoring/performance-matching.service';
import { PreferenceMatchingService } from './matching/scoring/preference-matching.service';
import { EmailModule } from '../email/email.module';
import { NotificationsService } from '../notifications/notifications.service';
import { MessagingService } from '../messaging/messaging.service';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { RoleUtils } from 'src/utils/role-utils';
import { PreAssessmentModule } from '../pre-assessment/pre-assessment.module';
import { MessagingModule } from '../messaging/messaging.module';
import { CommunitiesModule } from '../communities/communities.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [PreAssessmentModule, EmailModule, MessagingModule, CommunitiesModule, CacheModule],
  controllers: [
    TherapistRecommendationController,
    TherapistsController,
    TherapistProfileController,
    TherapistClientController,
    TherapistWorksheetController,
    TherapistMatchController,
    TherapistListController,
  ],
  providers: [
    TherapistRecommendationService,
    TherapistManagementService,
    TherapistListService,
    WorksheetsService,
    AdvancedMatchingService,
    IntelligentMatchingService,
    MatchingOrchestratorService,
    ConversationAnalysisService,
    CompatibilityAnalysisService,
    ClientEngagementAnalysisService,
    TherapistPerformanceAnalysisService,
    ReviewSentimentAnalysisService,
    EngagementMatchingService,
    PerformanceMatchingService,
    PreferenceMatchingService,
    NotificationsService,
    MessagingService,
    PrismaService,
    RoleUtils,
  ],
  exports: [
    TherapistManagementService,
    TherapistRecommendationService,
    AdvancedMatchingService,
    IntelligentMatchingService,
    MatchingOrchestratorService,
    ConversationAnalysisService,
    CompatibilityAnalysisService,
    ClientEngagementAnalysisService,
    TherapistPerformanceAnalysisService,
    ReviewSentimentAnalysisService,
    EngagementMatchingService,
    PerformanceMatchingService,
    PreferenceMatchingService,
  ],
})
export class TherapistModule {}
