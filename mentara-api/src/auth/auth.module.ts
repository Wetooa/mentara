import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { AuthHealthController } from './auth-health.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EventBusService } from '../common/events/event-bus.service';
import { TokenService } from './shared/token.service';
import { EmailVerificationService } from './shared/email-verification.service';
import { PasswordResetService } from './shared/password-reset.service';
import { JwtStrategy } from './core/strategies/jwt.strategy';
import { GoogleStrategy } from './core/strategies/google.strategy';
import { MicrosoftStrategy } from './core/strategies/microsoft.strategy';
import { EmailModule } from '../email/email.module';

// Role-specific controllers
import { ClientAuthController } from './client/client-auth.controller';
import { TherapistAuthController } from './therapist/therapist-auth.controller';
import { AdminAuthController } from './admin/admin-auth.controller';
import { ModeratorAuthController } from './moderator/moderator-auth.controller';

// Role-specific services
import { ClientAuthService } from './client/client-auth.service';
import { TherapistAuthService } from './therapist/therapist-auth.service';
import { AdminAuthService } from './admin/admin-auth.service';
import { ModeratorAuthService } from './moderator/moderator-auth.service';

import { TherapistModule } from '../therapist/therapist.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        // No expiration - tokens don't expire for simplicity
      },
    }),
    EmailModule,
    TherapistModule,
  ],
  controllers: [
    AuthHealthController,
    AuthController,
    ClientAuthController,
    TherapistAuthController,
    AdminAuthController,
    ModeratorAuthController,
  ],
  providers: [
    AuthService,
    PrismaService,
    EventBusService,
    TokenService,
    EmailVerificationService,
    PasswordResetService,
    JwtStrategy,
    GoogleStrategy,
    MicrosoftStrategy,

    // Role-specific services
    ClientAuthService,
    TherapistAuthService,
    AdminAuthService,
    ModeratorAuthService,
  ],
  exports: [
    AuthService,
    TokenService,
    EmailVerificationService,
    PasswordResetService,
    JwtStrategy,
    ClientAuthService,
    TherapistAuthService,
    AdminAuthService,
    ModeratorAuthService,
  ],
})
export class AuthModule {}
