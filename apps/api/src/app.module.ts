import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

// Core & Common
import { PrismaModule } from './core/prisma/prisma.module';
import { PrismaService } from './core/prisma/prisma.service';
import { CommonModule } from './common/common.module';
import { EventBusService } from './common/events/event-bus.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';  
import { SecurityGuard } from './common/guards/security.guard';
import { SecurityHeadersMiddleware } from './common/middleware/security-headers.middleware';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';

// App Root
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
