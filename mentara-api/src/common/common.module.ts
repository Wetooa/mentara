import { Module, Global } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { EventBusService } from './events/event-bus.service';
import { AuditLoggingService } from './services/audit-logging.service';
import { SupabaseStorageService } from './services/supabase-storage.service';
import { PrismaService } from '../providers/prisma-client.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    EventBusService,
    AuditLoggingService,
    SupabaseStorageService,
    PrismaService,
    EventEmitter2,
  ],
  exports: [EventBusService, AuditLoggingService, SupabaseStorageService],
})
export class CommonModule {}
