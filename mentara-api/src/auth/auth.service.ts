import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
// Remove unused imports - these DTOs don't exist in mentara-commons
import { EventBusService } from '../common/events/event-bus.service';
import { UserRegisteredEvent } from '../common/events/user-events';
import { TokenService, TokenPair } from './services/token.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly tokenService: TokenService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  async registerClient(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    additionalData?: any,
  ): Promise<{ user: any; tokens: TokenPair; message: string }> {
    try {
      // Use the existing local registration method
      const { user } = await this.registerUserWithEmail(
        email,
        password,
        firstName,
        lastName,
        'client',
        additionalData,
      );

      // Generate tokens for immediate login after registration
      const tokens = await this.tokenService.generateTokenPair(
        user.id,
        user.email,
        user.role,
      );

      return {
        user,
        tokens,
        message:
          'Client registered successfully. Please check your email to verify your account.',
      };
    } catch (error) {
      console.error(
        'Client registration error:',
        error instanceof Error ? error.message : error,
      );
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Client registration failed');
    }
  }

  async registerTherapist(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    additionalData?: any,
  ): Promise<{ user: any; tokens: TokenPair; message: string }> {
    try {
      // Use the existing local registration method
      const { user } = await this.registerUserWithEmail(
        email,
        password,
        firstName,
        lastName,
        'therapist',
        additionalData,
      );

      // Generate tokens for immediate login after registration
      const tokens = await this.tokenService.generateTokenPair(
        user.id,
        user.email,
        user.role,
      );

      return {
        user,
        tokens,
        message:
          'Therapist registered successfully. Please check your email to verify your account. Your application is pending approval.',
      };
    } catch (error) {
      console.error(
        'Therapist registration error:',
        error instanceof Error ? error.message : error,
      );
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Therapist registration failed');
    }
  }

  async getUsers() {
    return this.prisma.user.findMany({
      where: {
        deactivatedAt: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        client: {
          select: {
            userId: true,
          },
        },
        therapist: {
          select: {
            userId: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        deactivatedAt: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        client: {
          select: {
            userId: true,
          },
        },
        therapist: {
          select: {
            userId: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async forceLogout(userId: string) {
    try {
      // Revoke all JWT refresh tokens for the user
      await this.tokenService.revokeAllUserTokens(userId);

      return { success: true, message: 'User sessions revoked successfully' };
    } catch (error) {
      console.error(
        'Force logout error:',
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException('Force logout failed');
    }
  }

  // Local Authentication Methods
  async registerUserWithEmail(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: 'client' | 'therapist' = 'client',
    additionalData?: any,
  ): Promise<{ user: any; message: string }> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.tokenService.hashPassword(password);

    // Generate email verification token
    const { hashedToken, expiresAt } =
      await this.tokenService.generateEmailVerificationToken();

    // Create user
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      emailVerifyToken: hashedToken,
      emailVerifyTokenExp: expiresAt,
      ...additionalData,
    };

    const user = await this.prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
      },
    });

    // Create role-specific record
    if (role === 'client') {
      await this.prisma.client.create({
        data: { userId: user.id },
      });
    } else if (role === 'therapist') {
      await this.prisma.therapist.create({
        data: {
          userId: user.id,
          status: 'pending',
          mobile: '',
          province: '',
          providerType: '',
          professionalLicenseType: '',
          isPRCLicensed: '',
          prcLicenseNumber: '',
          expirationDateOfLicense: new Date(),
          practiceStartDate: new Date(),
          sessionLength: '',
          hourlyRate: 0,
          providedOnlineTherapyBefore: false,
          comfortableUsingVideoConferencing: false,
          compliesWithDataPrivacyAct: false,
          willingToAbideByPlatformGuidelines: false,
          treatmentSuccessRates: {},
        },
      });
    }

    // Send verification email
    await this.emailVerificationService.sendVerificationEmail(user.id);

    // Publish registration event
    await this.eventBus.emit(
      new UserRegisteredEvent({
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role,
        registrationMethod: 'email',
      }),
    );

    return {
      user,
      message:
        'User registered successfully. Please check your email to verify your account.',
    };
  }

  async loginWithEmail(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ user: any; tokens: TokenPair }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        password: true,
        emailVerified: true,
        deactivatedAt: true,
        lockoutUntil: true,
        failedLoginCount: true,
        client: true,
        therapist: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.deactivatedAt) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Please complete account setup or reset your password',
      );
    }

    // Check account lockout
    const isLockedOut = await this.tokenService.checkAccountLockout(user.id);
    if (isLockedOut) {
      throw new UnauthorizedException(
        'Account is temporarily locked due to too many failed login attempts',
      );
    }

    // Verify password
    const isPasswordValid = await this.tokenService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      await this.tokenService.handleFailedLogin(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check email verification
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email address before logging in',
      );
    }

    // Reset failed login count and update last login
    await this.tokenService.resetFailedLoginCount(user.id);

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(
      user.id,
      user.email,
      user.role,
      ipAddress,
      userAgent,
    );

    // Remove sensitive data from user object
    const {
      password: _,
      lockoutUntil: __,
      failedLoginCount: ___,
      ...safeUser
    } = user;

    return { user: safeUser, tokens };
  }

  async refreshTokens(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenPair> {
    return this.tokenService.refreshAccessToken(
      refreshToken,
      ipAddress,
      userAgent,
    );
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeRefreshToken(refreshToken);
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
        deactivatedAt: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        client: true,
        therapist: true,
      },
    });
  }

  // Email verification methods
  async verifyEmail(
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.emailVerificationService.verifyEmail(token);
  }

  async resendVerificationEmail(email: string): Promise<void> {
    return this.emailVerificationService.resendVerificationEmail(email);
  }

  // Password reset methods
  async requestPasswordReset(email: string): Promise<void> {
    return this.passwordResetService.requestPasswordReset(email);
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.passwordResetService.resetPassword(token, newPassword);
  }

  async validateResetToken(
    token: string,
  ): Promise<{ valid: boolean; email?: string }> {
    return this.passwordResetService.validateResetToken(token);
  }

  // Account management methods
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true, deactivatedAt: true },
    });

    if (!user || user.deactivatedAt) {
      throw new UnauthorizedException('User not found or deactivated');
    }

    if (!user.password) {
      throw new BadRequestException('Please complete account setup first');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.tokenService.comparePassword(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check if new password is different
    const isSamePassword = await this.tokenService.comparePassword(
      newPassword,
      user.password,
    );
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // Hash new password
    const hashedPassword = await this.tokenService.hashPassword(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Revoke all refresh tokens for security
    await this.tokenService.revokeAllUserTokens(userId);

    return {
      success: true,
      message: 'Password changed successfully. Please log in again.',
    };
  }

  async deactivateAccount(
    userId: string,
    reason?: string,
    deactivatedBy?: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deactivatedAt: new Date(),
        deactivatedBy,
        deactivationReason: reason,
      },
    });

    // Revoke all tokens
    await this.tokenService.revokeAllUserTokens(userId);

    return {
      success: true,
      message: 'Account deactivated successfully',
    };
  }

  async reactivateAccount(
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deactivatedAt: null,
        deactivatedBy: null,
        deactivationReason: null,
        failedLoginCount: 0,
        lockoutUntil: null,
      },
    });

    return {
      success: true,
      message: 'Account reactivated successfully',
    };
  }

  async handleOAuthLogin(oauthUser: any, provider: string) {
    try {
      // Check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: oauthUser.email },
      });

      if (existingUser) {
        // User exists, generate tokens and return
        const tokens = await this.tokenService.generateTokenPair(
          existingUser.id,
          existingUser.email,
          existingUser.role,
        );

        return {
          user: {
            id: existingUser.id,
            email: existingUser.email,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            role: existingUser.role,
            emailVerified: existingUser.emailVerified,
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          message: 'Login successful',
        };
      } else {
        // Create new user from OAuth data
        const newUser = await this.prisma.user.create({
          data: {
            email: oauthUser.email,
            firstName: oauthUser.firstName,
            lastName: oauthUser.lastName,
            role: 'client', // Default role
            emailVerified: true, // OAuth emails are pre-verified
            avatarUrl: oauthUser.picture,
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            emailVerified: true,
          },
        });

        // Create client record for new user
        await this.prisma.client.create({
          data: { userId: newUser.id },
        });

        const tokens = await this.tokenService.generateTokenPair(
          newUser.id,
          newUser.email,
          newUser.role,
        );

        // Emit user registration event
        this.eventBus.emit(
          new UserRegisteredEvent({
            userId: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role as
              | 'client'
              | 'therapist'
              | 'moderator'
              | 'admin',
            registrationMethod: 'oauth',
          }),
        );

        return {
          user: newUser,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          message: 'Account created successfully',
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `OAuth login failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // ===== FIRST-TIME USER FLOW METHODS =====

  async getFirstSignInStatus(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      select: {
        hasSeenTherapistRecommendations: true,
        createdAt: true,
      },
    });

    if (!client) {
      throw new UnauthorizedException('Client profile not found');
    }

    return {
      isFirstTime: !client.hasSeenTherapistRecommendations,
      needsWelcomeFlow: !client.hasSeenTherapistRecommendations,
      memberSince: client.createdAt,
    };
  }

  async markRecommendationsSeen(userId: string) {
    const updatedClient = await this.prisma.client.update({
      where: { userId },
      data: { hasSeenTherapistRecommendations: true },
      select: {
        hasSeenTherapistRecommendations: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      hasSeenRecommendations: updatedClient.hasSeenTherapistRecommendations,
      markedAt: updatedClient.updatedAt,
      message: 'Recommendations marked as seen successfully',
    };
  }
}
