import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { EmailService } from '../../../core/providers/email/email.service';
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

    // Generate raw OTP code
    const otpCode = this.emailService.generateOtp(6);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store raw OTP in database
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifyToken: otpCode, // Store raw OTP instead of crypto token
        emailVerifyTokenExp: expiresAt,
      },
    });

    // Send the same OTP code via email
    await this.emailService.sendOTP(
      user.email,
      user.firstName || 'User',
      'Verify Your Mentara Email Address',
      otpCode, // Pass the generated OTP code
      '24 hours',
    );
  }

  /**
   * Verify email with verification token
   * @param token - Verification token
   * @returns Verification result
   */
  async verifyEmail(
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerifyToken: token, // Direct comparison with raw OTP
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
