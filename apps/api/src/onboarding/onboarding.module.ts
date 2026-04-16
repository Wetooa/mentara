import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { RoleUtils } from '../utils/role-utils';

@Module({
  controllers: [OnboardingController],
  providers: [OnboardingService, PrismaService, RoleUtils],
  exports: [OnboardingService],
})
export class OnboardingModule {}
