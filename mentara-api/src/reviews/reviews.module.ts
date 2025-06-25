import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { PrismaClientProvider } from '../providers/prisma-client.provider';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, PrismaClientProvider],
  exports: [ReviewsService],
})
export class ReviewsModule {}