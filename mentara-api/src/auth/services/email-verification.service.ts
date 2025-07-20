import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { EmailService } from '../../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Send verification email to user
   * @param userId - User ID to send verification email to
   */
  async sendVerificationEmail(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifyToken: verificationToken,
        emailVerifyTokenExp: expiresAt,
      },
    });

    // Send verification email using the sendOTP method (reusing for email verification)
    await this.emailService.sendOTP(
      user.email,
      user.firstName || 'User',
      'Verify Your Mentara Email Address',
      undefined, // Will generate OTP
      '24 hours'
    );
  }

  /**
   * Verify email with verification token
   * @param token - Verification token
   * @returns Verification result
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyTokenExp: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return {
        success: false,
        message: 'Invalid or expired verification token',
      };
    }

    // Mark email as verified and clear token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyTokenExp: null,
      },
    });

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  /**
   * Resend verification email
   * @param email - User email to resend verification to
   */
  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Reuse the sendVerificationEmail method
    await this.sendVerificationEmail(user.id);
  }
}