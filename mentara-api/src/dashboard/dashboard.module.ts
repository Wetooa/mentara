import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaService } from '../providers/prisma-client.provider';
import { MessagingModule } from '../messaging/messaging.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [MessagingModule, CacheModule],
  controllers: [DashboardController],
  providers: [DashboardService, PrismaService],
  exports: [DashboardService],
})
export class DashboardModule {}
