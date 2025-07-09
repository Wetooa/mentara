import { Module } from '@nestjs/common';
import { CommunitiesController } from './communities.controller';
import { CommunitiesService } from './communities.service';
import { CommunityAssignmentService } from './community-assignment.service';
import { PrismaService } from 'src/providers/prisma-client.provider';

@Module({
  controllers: [CommunitiesController],
  providers: [CommunitiesService, CommunityAssignmentService, PrismaService],
  exports: [CommunitiesService, CommunityAssignmentService],
})
export class CommunitiesModule {}
