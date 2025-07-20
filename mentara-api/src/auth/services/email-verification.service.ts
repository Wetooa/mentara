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
export class EmailVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
  ) {}

  async sendVerificationEmail(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        emailVerified: true,
        emailVerifyToken: true,
        emailVerifyTokenExp: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Check if there's an existing valid token
    if (
      user.emailVerifyToken &&
      user.emailVerifyTokenExp &&
      user.emailVerifyTokenExp > new Date()
    ) {
      // Resend existing token (rate limiting would be handled at controller level)
      await this.sendVerificationEmailWithToken(
        user.email,
        user.firstName,
        user.emailVerifyToken,
      );
      return;
    }

    // Generate new verification token
    const { token, hashedToken, expiresAt } =
      await this.tokenService.generateEmailVerificationToken();

    // Update user with new token
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifyToken: hashedToken,
        emailVerifyTokenExp: expiresAt,
      },
    });

    // Send verification email
    await this.sendVerificationEmailWithToken(
      user.email,
      user.firstName,
      token,
    );
  }

  async verifyEmail(
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findUnique({
      where: { emailVerifyToken: hashedToken },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        emailVerifyTokenExp: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.emailVerified) {
      return {
        success: true,
        message: 'Email already verified',
      };
    }

    if (!user.emailVerifyTokenExp || user.emailVerifyTokenExp < new Date()) {
      // Clean up expired token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerifyToken: null,
          emailVerifyTokenExp: null,
        },
      });
      throw new BadRequestException('Verification token has expired');
    }

    // Verify the email
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyTokenExp: null,
        isVerified: true, // Update general verification status
      },
    });

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        emailVerified: true,
      },
    });

    if (!user) {
      // Don't reveal if email exists for security
      return;
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.sendVerificationEmail(user.id);
  }

  private async sendVerificationEmailWithToken(
    email: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    try {
      await this.emailService.sendGenericEmail({
        to: email,
        subject: 'Verify Your Mentara Account',
        template: 'email-verification',
        data: {
          firstName,
          verificationUrl,
          supportEmail: process.env.SUPPORT_EMAIL || 'support@mentara.com',
        },
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new BadRequestException('Failed to send verification email');
    }
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.user.updateMany({
      where: {
        emailVerifyTokenExp: {
          lt: new Date(),
        },
      },
      data: {
        emailVerifyToken: null,
        emailVerifyTokenExp: null,
      },
    });
  }
}
