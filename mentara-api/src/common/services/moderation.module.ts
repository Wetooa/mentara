import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ModerationService } from './moderation.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [ModerationService],
  exports: [ModerationService],
})
export class ModerationModule {}
