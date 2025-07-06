import { Module } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLoggingService } from '../common/services/audit-logging.service';
import { EventBusService } from '../common/events/event-bus.service';
import { PrismaService } from 'src/providers/prisma-client.provider';

@Module({
  controllers: [AuditLogsController],
  providers: [
    AuditLogsService,
    AuditLoggingService,
    EventBusService,
    PrismaService,
  ],
  exports: [AuditLogsService, AuditLoggingService],
})
export class AuditLogsModule {}
