import { Module } from '@nestjs/common';
import { CommunitiesController } from './communities.controller';
import { CommunitiesService } from './communities.service';
import { CommunityAssignmentService } from './community-assignment.service';
import { CommunityMatchingService } from './services/community-matching.service';
import { CommunityRecommendationService } from './services/community-recommendation.service';
import { EnhancedCommunityService } from './services/enhanced-community.service';
import { CommunityRecommendationController } from './controllers/community-recommendation.controller';
import { ModerationController } from './controllers/moderation.controller';
import { EnhancedCommunityController } from './controllers/enhanced-community.controller';
import { PrismaService } from 'src/providers/prisma-client.provider';

@Module({
  controllers: [
    CommunitiesController,
    CommunityRecommendationController,
    ModerationController,
    EnhancedCommunityController,
  ],
  providers: [
    CommunitiesService,
    CommunityAssignmentService,
    CommunityMatchingService,
    CommunityRecommendationService,
    EnhancedCommunityService,
    PrismaService,
  ],
  exports: [
    CommunitiesService,
    CommunityAssignmentService,
    CommunityMatchingService,
    CommunityRecommendationService,
    EnhancedCommunityService,
  ],
})
export class CommunitiesModule {}
