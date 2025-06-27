import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PreAssessmentController } from './pre-assessment.controller';
import { PreAssessmentService } from './pre-assessment.service';
import { AiServiceClient } from './services/ai-service.client';
import { PrismaService } from '../providers/prisma-client.provider';

@Module({
  imports: [ConfigModule],
  controllers: [PreAssessmentController],
  providers: [PreAssessmentService, AiServiceClient, PrismaService],
  exports: [PreAssessmentService, AiServiceClient],
})
export class PreAssessmentModule {}
