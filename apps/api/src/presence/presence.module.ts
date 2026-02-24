import { Module } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { PrismaService } from '../providers/prisma-client.provider';

@Module({
  providers: [PresenceService, PrismaService],
  exports: [PresenceService],
})
export class PresenceModule {}

