import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
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
import { NotificationsModule } from './notifications/notifications.module';
import { BillingModule } from './billing/billing.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SearchModule } from './search/search.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { HealthModule } from './health/health.module';
import { EmailModule } from './email/email.module';
import { GroupSessionsModule } from './group-sessions/group-sessions.module';
import { JournalModule } from './journal/journal.module';
import { JobsModule } from './jobs/jobs.module';
import { PresenceModule } from './presence/presence.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { PrismaService } from './providers/prisma-client.provider';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { EventBusService } from './common/events/event-bus.service';
import { CommonModule } from './common/common.module';
import { CacheModule } from './cache/cache.module';
import { JwtAuthGuard } from './auth/core/guards/jwt-auth.guard';
import { SecurityGuard } from './common/guards/security.guard';
import { SecurityHeadersMiddleware } from './common/middleware/security-headers.middleware';
import { JwtService } from '@nestjs/jwt';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: process.env.NODE_ENV === 'production' ? 500 : 2000, // Increased limits for development
      },
      {
        name: 'auth',
        ttl: 300000, // 5 minutes
        limit: process.env.NODE_ENV === 'production' ? 30 : 100, // More reasonable auth attempts
      },
      {
        name: 'upload',
        ttl: 60000, // 1 minute
        limit: process.env.NODE_ENV === 'production' ? 20 : 50, // Increased upload limits
      },
      {
        name: 'community',
        ttl: 60000, // 1 minute
        limit: process.env.NODE_ENV === 'production' ? 400 : 1000, // Higher community interaction limits
      },
    ]),
    EventEmitterModule.forRoot({
      // FIXED: Disabled wildcards to prevent event routing chaos
      // Was causing MessageSentEvent to trigger ALL event handlers
      wildcard: false,
      // The delimiter used to segment namespaces (not needed without wildcards)
      delimiter: '.',
      // Disable throwing uncaught exceptions
      ignoreErrors: false,
      // Max listeners per event
      maxListeners: 10,
      // Show event name in memory leaks message when more than maximum amount of listeners
      verboseMemoryLeak: false,
    }),
    CommonModule,
    CacheModule,
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
    NotificationsModule,
    BillingModule,
    DashboardModule,
    SearchModule,
    AnalyticsModule,
    OnboardingModule,
    HealthModule,
    EmailModule,
    GroupSessionsModule,
    JournalModule,
    JobsModule,
    PresenceModule,
    RecommendationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    EventBusService,
    JwtService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SecurityGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityHeadersMiddleware).forRoutes('*');
  }
}
