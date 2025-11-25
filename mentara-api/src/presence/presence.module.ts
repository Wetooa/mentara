import { Module } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  providers: [PresenceService, PrismaService],
  exports: [PresenceService],
})
export class PresenceModule {}

