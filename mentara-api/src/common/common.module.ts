import { Module, Global } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventBusService } from './events/event-bus.service';
import { AuditLoggingService } from './services/audit-logging.service';
import { PrismaService } from '../providers/prisma-client.provider';

@Global()
@Module({
  providers: [
    EventBusService,
    AuditLoggingService,
    PrismaService,
    EventEmitter2,
  ],
  exports: [EventBusService, AuditLoggingService],
})
export class CommonModule {}
