import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PreAssessmentController } from './pre-assessment.controller';
import { PreAssessmentService } from './pre-assessment.service';
import { AurisService } from './auris.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { RoleUtils } from '../utils/role-utils';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [PreAssessmentController],
  providers: [
    PreAssessmentService,
    AurisService,
    PrismaService,
    RoleUtils,
  ],
  exports: [
    PreAssessmentService,
    AurisService,
  ],
})
export class PreAssessmentModule { }
