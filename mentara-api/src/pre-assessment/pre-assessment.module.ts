import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PreAssessmentController } from './pre-assessment.controller';
import { PreAssessmentService } from './pre-assessment.service';
import { AiServiceClient } from './services/ai-service.client';
import { PrismaService } from '../providers/prisma-client.provider';
import { RoleUtils } from '../utils/role-utils';

@Module({
  imports: [ConfigModule],
  controllers: [PreAssessmentController],
  providers: [PreAssessmentService, AiServiceClient, PrismaService, RoleUtils],
  exports: [PreAssessmentService, AiServiceClient],
})
export class PreAssessmentModule {}
