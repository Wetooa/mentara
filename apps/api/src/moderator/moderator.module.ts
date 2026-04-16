import { Module } from '@nestjs/common';
import { ModeratorController } from './moderator.controller';
import { ModeratorService } from './moderator.service';
import { PrismaService } from '../providers/prisma-client.provider';

@Module({
  controllers: [ModeratorController],
  providers: [ModeratorService, PrismaService],
  exports: [ModeratorService],
})
export class ModeratorModule {}
