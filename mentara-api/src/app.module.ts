import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
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
import { MeetingsModule } from './meetings/meetings.module';
import { FilesModule } from './files/files.module';
import { SessionsModule } from './sessions/sessions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { BillingModule } from './billing/billing.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SearchModule } from './search/search.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { PrismaService } from './providers/prisma-client.provider';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { EventBusService } from './common/events/event-bus.service';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute per IP
      },
      {
        name: 'auth',
        ttl: 300000, // 5 minutes
        limit: 10, // 10 auth attempts per 5 minutes per IP
      },
      {
        name: 'upload',
        ttl: 60000, // 1 minute
        limit: 5, // 5 file uploads per minute per IP
      },
    ]),
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
    CommonModule,
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
    MeetingsModule,
    FilesModule,
    SessionsModule,
    NotificationsModule,
    AuditLogsModule,
    BillingModule,
    DashboardModule,
    SearchModule,
    AnalyticsModule,
    OnboardingModule,
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
