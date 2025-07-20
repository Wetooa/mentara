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
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #8B5CF6;">Verify Your Mentara Account</h2>
          <p>Hello ${firstName},</p>
          <p>Thank you for signing up for Mentara. Please click the button below to verify your email address and activate your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If you didn't create an account with Mentara, you can safely ignore this email.</p>
          <p>If you have any questions, please contact us at ${process.env.SUPPORT_EMAIL || 'support@mentara.com'}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from Mentara. Please do not reply to this email.
          </p>
        </div>
      `;

      await this.emailService.sendGenericEmail({
        to: email,
        subject: 'Verify Your Mentara Account',
        html,
        text: `Hello ${firstName}, Please verify your email address by visiting: ${verificationUrl}`
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
