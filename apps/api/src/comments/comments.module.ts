import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { PrismaService } from 'src/providers/prisma-client.provider';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, PrismaService],
  exports: [CommentsService],
})
export class CommentsModule {}
