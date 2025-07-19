import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { EmailService } from '../../email/email.service';
import { TokenService } from './token.service';
import * as crypto from 'crypto';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
  ) {}

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        deactivatedAt: true,
        resetToken: true,
        resetTokenExpiry: true,
      },
    });

    if (!user) {
      // Don't reveal if email exists for security
      return;
    }

    if (user.deactivatedAt) {
      throw new BadRequestException('Account is deactivated');
    }

    // Check if there's an existing valid token (prevent spam)
    if (
      user.resetToken &&
      user.resetTokenExpiry &&
      user.resetTokenExpiry > new Date()
    ) {
      const timeDiff = user.resetTokenExpiry.getTime() - new Date().getTime();
      if (timeDiff > 50 * 60 * 1000) {
        // More than 50 minutes remaining
        throw new BadRequestException(
          'Password reset email already sent. Please check your email or wait before requesting again.',
        );
      }
    }

    // Generate new reset token
    const { token, hashedToken, expiresAt } =
      await this.tokenService.generatePasswordResetToken();

    // Update user with reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: expiresAt,
      },
    });

    // Send password reset email
    await this.sendPasswordResetEmail(user.email, user.firstName, token);
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!token || !newPassword) {
      throw new BadRequestException(
        'Reset token and new password are required',
      );
    }

    // Validate password strength
    this.validatePasswordStrength(newPassword);

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findUnique({
      where: { resetToken: hashedToken },
      select: {
        id: true,
        email: true,
        resetTokenExpiry: true,
        deactivatedAt: true,
        password: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (user.deactivatedAt) {
      throw new BadRequestException('Account is deactivated');
    }

    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      // Clean up expired token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      });
      throw new BadRequestException('Reset token has expired');
    }

    // Check if new password is different from current (if user has one)
    if (user.password) {
      const isSamePassword = await this.tokenService.comparePassword(
        newPassword,
        user.password,
      );
      if (isSamePassword) {
        throw new BadRequestException(
          'New password must be different from current password',
        );
      }
    }

    // Hash new password
    const hashedPassword = await this.tokenService.hashPassword(newPassword);

    // Update password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        failedLoginCount: 0, // Reset failed login attempts
        lockoutUntil: null, // Clear any lockout
      },
    });

    // Revoke all existing refresh tokens for security
    await this.tokenService.revokeAllUserTokens(user.id);

    // Send confirmation email
    await this.sendPasswordResetConfirmationEmail(user.email);

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  async validateResetToken(
    token: string,
  ): Promise<{ valid: boolean; email?: string }> {
    if (!token) {
      return { valid: false };
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findUnique({
      where: { resetToken: hashedToken },
      select: {
        email: true,
        resetTokenExpiry: true,
        deactivatedAt: true,
      },
    });

    if (!user || user.deactivatedAt) {
      return { valid: false };
    }

    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return { valid: false };
    }

    return {
      valid: true,
      email: user.email,
    };
  }

  private validatePasswordStrength(password: string): void {
    const minLength = parseInt(process.env.MIN_PASSWORD_LENGTH || '8');

    if (password.length < minLength) {
      throw new BadRequestException(
        `Password must be at least ${minLength} characters long`,
      );
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one uppercase letter',
      );
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one lowercase letter',
      );
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one number',
      );
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one special character',
      );
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password',
      'password123',
      '123456',
      'qwerty',
      'abc123',
      'letmein',
      'welcome',
      'monkey',
      '1234567890',
      'admin',
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      throw new BadRequestException(
        'Password is too common. Please choose a more secure password',
      );
    }
  }

  private async sendPasswordResetEmail(
    email: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    try {
      await this.emailService.sendGenericEmail({
        to: email,
        subject: 'Reset Your Mentara Password',
        template: 'password-reset',
        data: {
          firstName,
          resetUrl,
          expiryTime: '1 hour',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@mentara.com',
        },
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new BadRequestException('Failed to send password reset email');
    }
  }

  private async sendPasswordResetConfirmationEmail(
    email: string,
  ): Promise<void> {
    try {
      await this.emailService.sendGenericEmail({
        to: email,
        subject: 'Password Reset Successful',
        template: 'password-reset-confirmation',
        data: {
          supportEmail: process.env.SUPPORT_EMAIL || 'support@mentara.com',
          loginUrl: `${process.env.FRONTEND_URL}/login`,
        },
      });
    } catch (error) {
      console.error('Failed to send password reset confirmation email:', error);
      // Don't throw error here as password reset was successful
    }
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.user.updateMany({
      where: {
        resetTokenExpiry: {
          lt: new Date(),
        },
      },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }
}
