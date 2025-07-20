import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth/auth.service';
import { EventBusService } from '../common/events/event-bus.service';
import { TokenService } from '../services/auth/token.service';
import { EmailVerificationService } from '../services/email/email-verification.service';
import { PasswordResetService } from '../services/email/password-reset.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { EmailModule } from '../email/email.module';

// Role-specific controllers
import { ClientAuthController } from './controllers/client-auth.controller';
import { TherapistAuthController } from './controllers/therapist-auth.controller';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { ModeratorAuthController } from './controllers/moderator-auth.controller';

// Role-specific services
import { ClientAuthService } from '../services/auth/client-auth.service';
import { TherapistAuthService } from '../services/auth/therapist-auth.service';
import { AdminAuthService } from '../services/auth/admin-auth.service';
import { ModeratorAuthService } from '../services/auth/moderator-auth.service';

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
