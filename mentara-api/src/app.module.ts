import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,

    // UsersModule,
    // CommunitiesModule,
    // PostsModule,
    // CommentsModule,
    // TherapistModule,
    // WebhooksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // PrismaService,
    // ClerkClientProvider,
    // { provide: APP_GUARD, useClass: ClerkAuthGuard },
  ],
})
export class AppModule {}
