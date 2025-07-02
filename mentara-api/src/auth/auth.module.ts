import { Module } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EventBusService } from '../common/events/event-bus.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, EventBusService],
  exports: [AuthService],
})
export class AuthModule {}
