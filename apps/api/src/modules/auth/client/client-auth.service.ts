import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import type { RegisterClientDto, EmailResponse, ClientAuthResponse } from '../types';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TokenService } from '../shared/token.service';
import { EmailVerificationService } from '../shared/email-verification.service';
import { PreAssessmentService } from '../../pre-assessment/pre-assessment.service';
import {
  hashPassword,
  checkEmailAvailable,
} from '../shared/auth.helpers';

@Injectable()
export class ClientAuthService {s
  private readonly logger = new Logger(ClientAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly preAssessmentService: PreAssessmentService,
  ) {}

  async registerClient(registerDto: RegisterClientDto) {
    this.logger.log('Registering client');

    // Check if email is available
    await checkEmailAvailable(this.prisma, registerDto.email);

    // Hash password
    const hashedPassword = await hashPassword(registerDto.password);

    // Create user and client profile in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          middleName: registerDto.middleName || undefined,
          birthDate: registerDto.birthDate ? new Date(registerDto.birthDate) : undefined,
          address: registerDto.address || undefined,
          avatarUrl: registerDto.avatarUrl || undefined,
          role: 'client',
          emailVerified: false,
        },
      });

      const client = await tx.client.create({
        data: {
          userId: user.id,
          hasSeenTherapistRecommendations: false, // Explicitly set to false on create
          birthdate: registerDto.birthDate ? new Date(registerDto.birthDate) : undefined,
        },
      });

      return { user, client };
    });

    // Handle pre-assessment data if provided
    if (registerDto.sessionId) {
      try {
        await this.preAssessmentService.linkAnonymousPreAssessment(
          result.user.id,
          registerDto.sessionId,
        );
      } catch (error) {
        this.logger.error(`Failed to link pre-assessment for client ${result.user.id}: ${error instanceof Error ? error.message : error}`);
        // We don't throw here to avoid failing registration if linking fails
      }
    } else if (registerDto.preassessmentAnswers) {
      try {
        await this.preAssessmentService.createPreAssessment(result.user.id, {
          assessmentId: null,
          method: 'CHECKLIST', // Default method
          completedAt: new Date(),
          data: registerDto.preassessmentAnswers,
          pastTherapyExperiences: null,
          medicationHistory: null,
          accessibilityNeeds: null,
        });
      } catch (error) {
        this.logger.error(`Failed to create pre-assessment for client ${result.user.id}: ${error instanceof Error ? error.message : error}`);
        // We don't throw here to avoid failing registration if pre-assessment fails
      }
    }

    // Generate token
    const { token } = await this.tokenService.generateToken(
      result.user.id,
      result.user.email,
      result.user.role,
    );

    // Send verification email
    await this.emailVerificationService.sendVerificationEmail(result.user.id);

    return {
      user: result.user,
      tokens: { accessToken: token, refreshToken: token, expiresIn: 0 },
      message: 'Client registration successful. Please check your email for the verification code.',
    };
  }

  async getClientProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: true,
      },
    });

    if (!user || user.role !== 'client') {
      throw new UnauthorizedException('Client not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: 'client' as const,
      client: user.client,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async verifyRegistrationOtp(
    email: string,
    otpCode: string,
  ): Promise<ClientAuthResponse> {
    if (!otpCode || !email) {
      throw new BadRequestException('Email and OTP code are required');
    }

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
      throw new BadRequestException('Invalid email');
    }

    const result = await this.emailVerificationService.verifyEmail(otpCode);

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
      },
    });

    const { token } = await this.tokenService.generateToken(
      user.id,
      user.email,
      user.role,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role as any,
        isEmailVerified: true,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        client: {
          hasSeenTherapistRecommendations: user.client?.hasSeenTherapistRecommendations ?? false,
        },
      },
      token,
      tokens: { accessToken: token, refreshToken: token },
      message: 'Account verified successfully. You are now logged in.',
    };
  }

  async resendRegistrationOtp(email: string): Promise<EmailResponse> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        email,
        role: 'client',
      },
      select: {
        id: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return {
        success: true,
        status: 'success',
        message: 'If an account with this email exists, a new verification code has been sent.',
      };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.emailVerificationService.resendVerificationEmail(user.id);

    return {
      success: true,
      status: 'success',
      message: 'A new verification code has been sent to your email.',
    };
  }
}
