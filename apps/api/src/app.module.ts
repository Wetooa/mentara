import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { TherapistModule } from './modules/therapist/therapist.module';
import { WorksheetsModule } from './modules/worksheets/worksheets.module';
import { PreAssessmentModule } from './modules/pre-assessment/pre-assessment.module';
import { BookingModule } from './modules/booking/booking.module';
import { AdminModule } from './modules/admin/admin.module';
import { BillingModule } from './modules/billing/billing.module';
import { PresenceModule } from './modules/presence/presence.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { PrismaService } from './core/prisma/prisma.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { EventBusService } from './common/events/event-bus.service';
import { CommonModule } from './common/common.module';
import { JwtAuthGuard } from './modul../../common/guards/jwt-auth.guard';
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
        ttl: 60000,
        limit: process.env.NODE_ENV === 'production' ? 500 : 2000,
      },
      {
        name: 'auth',
        ttl: 300000,
        limit: process.env.NODE_ENV === 'production' ? 30 : 100,
      },
      {
        name: 'upload',
        ttl: 60000,
        limit: process.env.NODE_ENV === 'production' ? 20 : 50,
      },
      {
        name: 'community',
        ttl: 60000,
        limit: process.env.NODE_ENV === 'production' ? 400 : 1000,
      },
    ]),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      ignoreErrors: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
    }),
    CommonModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    TherapistModule,
    WorksheetsModule,
    PreAssessmentModule,
    BookingModule,
    AdminModule,
    BillingModule,
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
