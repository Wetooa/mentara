import { Module } from '@nestjs/common';
import { TherapistController } from './therapist.controller';
import { TherapistService } from './therapist.service';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Module({
  controllers: [TherapistController],
  providers: [TherapistService, PrismaService],
  exports: [TherapistService],
})
export class TherapistModule {}
