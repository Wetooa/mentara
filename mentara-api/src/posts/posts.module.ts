import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { RedditFeaturesService } from './services/reddit-features.service';
import { RedditFeaturesController } from './controllers/reddit-features.controller';
import { PrismaService } from 'src/providers/prisma-client.provider';

@Module({
  controllers: [
    PostsController,
    RedditFeaturesController
  ],
  providers: [
    PostsService,
    RedditFeaturesService,
    PrismaService
  ],
  exports: [
    PostsService,
    RedditFeaturesService
  ],
})
export class PostsModule {}
