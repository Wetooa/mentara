import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // AuthModule,
    // UsersModule,
    // CommunitiesModule,
    // PostsModule,
    // CommentsModule,
    // TherapistModule,
    // WebhooksModule,
  ],
  controllers: [
    AppController,

    // AuthController,
  ],
  providers: [
    AppService,

    // AuthService,
    // PrismaService,
    // ClerkClientProvider,
    // { provide: APP_GUARD, useClass: ClerkAuthGuard },
  ],
})
export class AppModule {}
