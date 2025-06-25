import { Module } from '@nestjs/common';
import { TherapistApplicationController } from './therapist-application.controller';
import { TherapistApplicationService } from './therapist-application.service';
import { TherapistRecommendationController } from './therapist-recommendation.controller';
import { TherapistRecommendationService } from './therapist-recommendation.service';
import { TherapistManagementController } from './therapist-management.controller';
import { TherapistManagementService } from './therapist-management.service';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { RoleUtils } from 'src/utils/role-utils';

@Module({
  controllers: [
    TherapistApplicationController,
    TherapistRecommendationController,
    TherapistManagementController,
  ],
  providers: [
    TherapistApplicationService,
    TherapistRecommendationService,
    TherapistManagementService,
    PrismaService,
    RoleUtils,
  ],
  exports: [TherapistManagementService],
})
export class TherapistModule {}
