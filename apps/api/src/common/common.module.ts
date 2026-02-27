import { Module, Global } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { EventBusService } from './events/event-bus.service';
import { SupabaseStorageService } from './services/supabase-storage.service';
import { PrismaService } from '../core/prisma/prisma.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    EventBusService,
    SupabaseStorageService,
    PrismaService,
    EventEmitter2,
  ],
  exports: [EventBusService, SupabaseStorageService],
})
export class CommonModule {}
