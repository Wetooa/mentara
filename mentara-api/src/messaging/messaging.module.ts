import { Module } from '@nestjs/common';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { MessagingGateway } from './messaging.gateway';
import { PrismaService } from '../providers/prisma-client.provider';

@Module({
  controllers: [MessagingController],
  providers: [MessagingService, MessagingGateway, PrismaService],
  exports: [MessagingService, MessagingGateway],
})
export class MessagingModule {}