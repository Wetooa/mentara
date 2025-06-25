import { Module } from '@nestjs/common';
import { PreAssessmentController } from './pre-assessment.controller';
import { PreAssessmentService } from './pre-assessment.service';
import { PrismaService } from '../providers/prisma-client.provider';

@Module({
  controllers: [PreAssessmentController],
  providers: [PreAssessmentService, PrismaService],
  exports: [PreAssessmentService],
})
export class PreAssessmentModule {}
