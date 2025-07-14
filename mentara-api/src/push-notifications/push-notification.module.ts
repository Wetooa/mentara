import { Module } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { PushNotificationController } from './push-notification.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [PushNotificationService],
  controllers: [PushNotificationController],
  exports: [PushNotificationService],
})
export class PushNotificationModule {}