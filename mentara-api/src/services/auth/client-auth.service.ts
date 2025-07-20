import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { RegisterClientDto, type EmailResponse } from 'mentara-commons';
import { PrismaService } from '../../providers/prisma-client.provider';
import { TokenService } from './token.service';
import { EmailVerificationService } from '../email/email-verification.service';
import { EmailService } from '../../email/email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class ClientAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly emailService: EmailService,
  ) {}

  async registerClient(registerDto: RegisterClientDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Create user and client profile in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          middleName: registerDto.middleName || undefined,
          birthDate: registerDto.birthDate
            ? new Date(registerDto.birthDate)
            : undefined,
          address: registerDto.address || undefined,
          avatarUrl: registerDto.avatarUrl || undefined,
          role: 'client',
          emailVerified: false,
        },
      });

      const client = await tx.client.create({
        data: {
          userId: user.id,
          hasSeenTherapistRecommendations:
            registerDto.hasSeenTherapistRecommendations || false,
        },
      });

      // Create preassessment record if answers are provided
      let preAssessment: any = null;
      if (registerDto.preassessmentAnswers && registerDto.preassessmentAnswers.length > 0) {
        preAssessment = await tx.preAssessment.create({
          data: {
            clientId: user.id,
            answers: registerDto.preassessmentAnswers,
          },
        });
      }

      return { user, client, preAssessment };
    });

    // Generate single token
    const { token } = await this.tokenService.generateToken(
      result.user.id,
      result.user.email,
      result.user.role,
    );

    // Generate and send OTP email for registration
    const otpCode = this.emailService.generateOtp(6);
    const hashedOtp = crypto.createHash('sha256').update(otpCode).digest('hex');
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const expiryTimeFormatted = this.emailService.formatExpiryTime(10);

    // Store OTP in database
    await this.prisma.user.update({
      where: { id: result.user.id },
      data: {
        emailVerifyToken: hashedOtp,
        emailVerifyTokenExp: otpExpiresAt,
      },
    });

    // Send OTP email
    const emailResult = await this.emailService.sendOtpEmail({
      to_email: result.user.email,
      to_name: result.user.firstName,
      otp_code: otpCode,
      expires_in: expiryTimeFormatted,
      type: 'registration',
    });

    if (emailResult.status === 'error') {
      throw new BadRequestException(emailResult.message);
    }

    return {
      user: result.user,
      tokens: { accessToken: token, refreshToken: token, expiresIn: 0 }, // For backward compatibility
      message: result.preAssessment
        ? 'Client registration and pre-assessment data saved successfully. Please check your email for the verification code.'
        : 'Client registration successful. Please check your email for the verification code.',
    };
  }

  async loginClient(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Find user with client role
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        role: 'client',
      },
      include: {
        client: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      throw new UnauthorizedException(
        'Account is temporarily locked due to failed login attempts',
      );
    }

    // Verify password
    if (!user.password) {
      throw new UnauthorizedException('Account setup incomplete');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment failed login count
      await this.handleFailedLogin(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed login count and update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockoutUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Generate single token
    const { token } = await this.tokenService.generateToken(
      user.id,
      user.email,
      user.role,
    );

    return {
      user,
      tokens: { accessToken: token, refreshToken: token, expiresIn: 0 }, // For backward compatibility
    };
  }

  async getClientProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        createdAt: true,
        role: true,
        client: {
          include: {
            assignedTherapists: {
              include: {
                therapist: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.role !== 'client') {
      throw new UnauthorizedException('Client not found');
    }

    // Return in the expected ClientProfileResponse format
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: 'client' as const,
      dateOfBirth: user.birthDate ? user.birthDate.toISOString() : undefined,
      phoneNumber: undefined, // Phone number not stored in User model for clients
      profileComplete: !!(user.firstName && user.lastName && user.birthDate),
      therapistId: user.client?.assignedTherapists?.[0]?.therapist?.user?.id || undefined,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async getFirstSignInStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: {
          select: {
            hasSeenTherapistRecommendations: true,
          },
        },
      },
    });

    if (!user || !user.client) {
      throw new UnauthorizedException('Client not found');
    }

    // Return in the expected OnboardingStatusResponse format
    return {
      isFirstSignIn: !user.lastLoginAt,
      hasSeenRecommendations: user.client.hasSeenTherapistRecommendations,
      profileCompleted: !!(user.firstName && user.lastName && user.birthDate),
      assessmentCompleted: false, // TODO: implement assessment completion check
    };
  }

  async markRecommendationsSeen(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
    });

    if (!client) {
      throw new UnauthorizedException('Client not found');
    }

    await this.prisma.client.update({
      where: { userId },
      data: {
        hasSeenTherapistRecommendations: true,
      },
    });

    // Return in the expected SuccessResponse format
    return {
      success: true,
      message: 'Recommendations marked as seen',
    };
  }

  async verifyRegistrationOtp(
    email: string,
    otpCode: string,
  ): Promise<EmailResponse> {
    if (!otpCode || !email) {
      throw new BadRequestException('Email and OTP code are required');
    }

    // Hash the provided OTP to compare with stored hash
    const hashedOtp = crypto.createHash('sha256').update(otpCode).digest('hex');

    // Find user by email and OTP token
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        emailVerifyToken: hashedOtp,
        role: 'client',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        emailVerified: true,
        emailVerifyTokenExp: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid OTP code or email');
    }

    if (user.emailVerified) {
      return {
        status: 'success',
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
      throw new BadRequestException('OTP code has expired');
    }

    // Verify the email and clean up OTP token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyTokenExp: null,
        isVerified: true,
      },
    });

    return {
      status: 'success',
      message: 'Email verified successfully',
    };
  }

  async resendRegistrationOtp(email: string): Promise<EmailResponse> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    // Find user with client role
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        role: 'client',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        emailVerified: true,
      },
    });

    if (!user) {
      // Don't reveal if email exists for security, but return success
      return {
        status: 'success',
        message:
          'If an account with this email exists, a new verification code has been sent.',
      };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new OTP
    const otpCode = this.emailService.generateOtp(6);
    const hashedOtp = crypto.createHash('sha256').update(otpCode).digest('hex');
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const expiryTimeFormatted = this.emailService.formatExpiryTime(10);

    // Update database with new OTP
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken: hashedOtp,
        emailVerifyTokenExp: otpExpiresAt,
      },
    });

    // Send new OTP email
    const emailResult = await this.emailService.sendOtpEmail({
      to_email: user.email,
      to_name: user.firstName,
      otp_code: otpCode,
      expires_in: expiryTimeFormatted,
      type: 'registration',
    });

    if (emailResult.status === 'error') {
      throw new BadRequestException(emailResult.message);
    }

    return {
      status: 'success',
      message: 'A new verification code has been sent to your email.',
    };
  }

  private async handleFailedLogin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { failedLoginCount: true },
    });

    const newFailedCount = (user?.failedLoginCount || 0) + 1;
    const maxAttempts = 5;
    const lockoutDuration = 30 * 60 * 1000; // 30 minutes

    const updateData: any = {
      failedLoginCount: newFailedCount,
    };

    if (newFailedCount >= maxAttempts) {
      updateData.lockoutUntil = new Date(Date.now() + lockoutDuration);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }
}
