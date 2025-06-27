import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
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
import { FilesModule } from './files/files.module';
import { SessionsModule } from './sessions/sessions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { BillingModule } from './billing/billing.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SearchModule } from './search/search.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PrismaService } from './providers/prisma-client.provider';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { EventBusService } from './common/events/event-bus.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot({
      // Set this to `true` to use wildcards
      wildcard: true,
      // The delimiter used to segment namespaces
      delimiter: '.',
      // Disable throwing uncaught exceptions
      ignoreErrors: false,
      // Max listeners per event
      maxListeners: 10,
      // Show event name in memory leaks message when more than maximum amount of listeners
      verboseMemoryLeak: false,
    }),
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
    FilesModule,
    SessionsModule,
    NotificationsModule,
    AuditLogsModule,
    BillingModule,
    DashboardModule,
    SearchModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    EventBusService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
