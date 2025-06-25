import { Module } from '@nestjs/common';
import { TherapistApplicationController } from './therapist-application.controller';
import { TherapistApplicationService } from './therapist-application.service';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { RoleUtils } from 'src/utils/role-utils';

@Module({
  controllers: [TherapistApplicationController],
  providers: [TherapistApplicationService, PrismaService, RoleUtils],
  exports: [TherapistApplicationService],
})
export class TherapistModule {}
