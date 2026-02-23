import { Module } from '@nestjs/common';
import { TherapistController } from './therapist.controller';
import { TherapistService } from './therapist.service';
import { PrismaService } from 'src/providers/prisma-client.provider';

@Module({
  controllers: [TherapistController],
  providers: [TherapistService, PrismaService],
  exports: [TherapistService],
})
export class TherapistModule {}
