import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CommunitiesModule } from './communities/communities.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { TherapistModule } from './therapist/therapist.module';
import { WorksheetsModule } from './worksheets/worksheets.module';
import { PreAssessmentModule } from './pre-assessment/pre-assessment.module';
import { BookingModule } from './booking/booking.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { ModeratorModule } from './moderator/moderator.module';
import { ClientModule } from './client/client.module';
import { MessagingModule } from './messaging/messaging.module';
import { PrismaService } from './providers/prisma-client.provider';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UsersModule,
    CommunitiesModule,
    PostsModule,
    CommentsModule,
    TherapistModule,
    WorksheetsModule,
    PreAssessmentModule,
    BookingModule,
    ReviewsModule,
    AdminModule,
    ModeratorModule,
    ClientModule,
    MessagingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
  ],
})
export class AppModule {}
