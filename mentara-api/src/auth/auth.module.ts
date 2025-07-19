import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EventBusService } from '../common/events/event-bus.service';
import { TokenService } from './services/token.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
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
import { ClientAuthService } from './services/client-auth.service';
import { TherapistAuthService } from './services/therapist-auth.service';
import { AdminAuthService } from './services/admin-auth.service';
import { ModeratorAuthService } from './services/moderator-auth.service';

// External dependencies
import { SupabaseStorageService } from '../common/services/supabase-storage.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      },
    }),
    EmailModule,
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

    // External dependencies
    SupabaseStorageService,
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
