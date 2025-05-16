import { Module } from '@nestjs/common';
import { CommunitiesController } from './communities.controller';
import { CommunitiesService } from './communities.service';
import { PrismaService } from 'src/providers/prisma-client.provider';

@Module({
  controllers: [CommunitiesController],
  providers: [CommunitiesService, PrismaService],
  exports: [CommunitiesService],
})
export class CommunitiesModule {}
