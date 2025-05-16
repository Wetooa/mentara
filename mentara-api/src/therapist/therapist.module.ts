import { Module } from '@nestjs/common';
import { TherapistApplicationController } from './therapist-application.controller';
import { TherapistApplicationService } from './therapist-application.service';
import { PrismaService } from 'src/providers/prisma-client.provider';

@Module({
  controllers: [TherapistApplicationController],
  providers: [TherapistApplicationService, PrismaService],
  exports: [TherapistApplicationService],
})
export class TherapistModule {}
