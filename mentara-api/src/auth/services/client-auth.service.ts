import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import type { RegisterClientDto, EmailResponse } from '../types';
import { PrismaService } from '../../providers/prisma-client.provider';
import { TokenService } from './token.service';
import { EmailService } from '../../email/email.service';
import { EmailVerificationService } from './email-verification.service';
import * as bcrypt from 'bcrypt';
import { processPreAssessmentAnswers } from '../../pre-assessment/pre-assessment.utils';
import { generateAIEvaluationData } from '../../pre-assessment/ai-evaluation.utils';

@Injectable()
export class ClientAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  async registerClient(registerDto: RegisterClientDto) {
    console.log('Registering client with preassessment data:', registerDto);

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
      if (
        registerDto.preassessmentAnswers &&
        registerDto.preassessmentAnswers.length > 0
      ) {
        // Import scoring utilities

        // Calculate scores from flat answers array
        const { scores, severityLevels } = processPreAssessmentAnswers(
          registerDto.preassessmentAnswers,
        );

        // Generate realistic AI evaluation data based on assessment results
        const aiEvaluationData = generateAIEvaluationData(
          scores,
          severityLevels,
        );

        preAssessment = await tx.preAssessment.create({
          data: {
            clientId: user.id,
            answers: registerDto.preassessmentAnswers, // Flat array of 201 responses
            scores, // Calculated scores by questionnaire
            severityLevels, // Severity classifications
            aiEstimate: aiEvaluationData as any, // Realistic AI evaluation data - cast to satisfy Prisma JSON type
            isProcessed: true, // Mark as processed since we calculated scores
            processedAt: new Date(),
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

    // Send verification email using EmailVerificationService
    await this.emailVerificationService.sendVerificationEmail(result.user.id);

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
      include: {
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
      avatarUrl: user.avatarUrl || undefined,
      dateOfBirth: user.birthDate ? user.birthDate.toISOString() : undefined,
      phoneNumber: undefined, // Phone number not stored in User model for clients
      profileComplete: !!(user.firstName && user.lastName && user.birthDate),
      therapistId:
        user.client?.assignedTherapists?.[0]?.therapist?.user?.id || undefined,
      createdAt: user.createdAt.toISOString(),
      hasSeenTherapistRecommendations:
        user.client?.hasSeenTherapistRecommendations || false,
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
    const profileCompleted = !!(
      user.firstName &&
      user.lastName &&
      user.birthDate
    );
    const assessmentCompleted = false; // TODO: implement assessment completion check
    const completedSteps: string[] = [];

    if (profileCompleted) completedSteps.push('profile');
    if (user.client.hasSeenTherapistRecommendations)
      completedSteps.push('recommendations');
    if (assessmentCompleted) completedSteps.push('assessment');

    return {
      isFirstSignIn: !user.lastLoginAt,
      hasSeenRecommendations: user.client.hasSeenTherapistRecommendations,
      profileCompleted,
      assessmentCompleted,
      isOnboardingComplete:
        profileCompleted &&
        user.client.hasSeenTherapistRecommendations &&
        assessmentCompleted,
      completedSteps,
      nextStep: !profileCompleted
        ? 'profile'
        : !user.client.hasSeenTherapistRecommendations
          ? 'recommendations'
          : !assessmentCompleted
            ? 'assessment'
            : undefined,
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

    // First verify the user exists and has client role
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        role: 'client',
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid email');
    }

    // Use EmailVerificationService to verify the OTP
    const result = await this.emailVerificationService.verifyEmail(otpCode);

    if (result.success) {
      // Update emailVerified flag for client
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
        },
      });
    }

    return {
      success: result.success,
      status: result.success ? 'success' : 'error',
      message: result.message,
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
        success: true,
        status: 'success',
        message:
          'If an account with this email exists, a new verification code has been sent.',
      };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Use EmailVerificationService to resend verification email
    await this.emailVerificationService.resendVerificationEmail(email);

    return {
      success: true,
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
