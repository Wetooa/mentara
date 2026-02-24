import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import type { RegisterTherapistDto, EmailResponse } from '../types';
import { PrismaService } from '../../providers/prisma-client.provider';
import { TokenService } from '../shared/token.service';
import { EmailService } from '../../email/email.service';
import { EmailVerificationService } from '../shared/email-verification.service';
import {
  hashPassword,
  checkEmailAvailable,
  verifyPassword,
} from '../shared/auth.helpers';

@Injectable()
export class TherapistAuthService {
  private readonly logger = new Logger(TherapistAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly emailVerificationService: EmailVerificationService,
  ) { }

  async registerTherapist(registerDto: RegisterTherapistDto) {
    this.logger.log('Registering therapist');

    // Check if email is available
    await checkEmailAvailable(this.prisma, registerDto.email);

    // Hash password
    const hashedPassword = await hashPassword(registerDto.password);

    // Create user and therapist profile in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          middleName: registerDto.middleName || undefined,
          role: 'therapist',
          emailVerified: false,
        },
      });

      const therapist = await tx.therapist.create({
        data: {
          userId: user.id,
          mobile: registerDto.mobile,
          province: registerDto.province,
          timezone: registerDto.timezone || 'UTC',
          status: 'PENDING',
          providerType: registerDto.providerType,
          professionalLicenseType: registerDto.professionalLicenseType,
          prcLicenseNumber: registerDto.prcLicenseNumber,
          expirationDateOfLicense: new Date(registerDto.expirationDateOfLicense),
          practiceStartDate: new Date(registerDto.practiceStartDate),
          certifications: registerDto.certifications || {},
          certificateUrls: registerDto.certificateUrls || [],
          certificateNames: registerDto.certificateNames || [],
          licenseUrls: registerDto.licenseUrls || [],
          licenseNames: registerDto.licenseNames || [],
          documentUrls: registerDto.documentUrls || [],
          documentNames: registerDto.documentNames || [],
          yearsOfExperience: registerDto.yearsOfExperience,
          educationBackground: registerDto.educationBackground,
          specialCertifications: registerDto.specialCertifications || [],
          practiceLocation: registerDto.practiceLocation,
          acceptsInsurance: registerDto.acceptsInsurance ?? false,
          acceptedInsuranceTypes: registerDto.acceptedInsuranceTypes || [],
          areasOfExpertise: registerDto.areasOfExpertise || [],
          otherAreaOfExpertise: registerDto.otherAreaOfExpertise,
          therapeuticApproachesUsedList: registerDto.therapeuticApproachesUsedList || [],
          languagesOffered: registerDto.languagesOffered || [],
          providedOnlineTherapyBefore: registerDto.providedOnlineTherapyBefore === 'true' || registerDto.providedOnlineTherapyBefore === 'yes',
          comfortableUsingVideoConferencing: registerDto.comfortableUsingVideoConferencing === 'true' || registerDto.comfortableUsingVideoConferencing === 'yes',
          preferredSessionLength: registerDto.preferredSessionLength,
          privateConfidentialSpace: registerDto.privateConfidentialSpace,
          compliesWithDataPrivacyAct: registerDto.compliesWithDataPrivacyAct === 'true' || registerDto.compliesWithDataPrivacyAct === 'yes',
          complaintsOrDisciplinaryActions: registerDto.complaintsOrDisciplinaryActions,
          willingToAbideByPlatformGuidelines: registerDto.willingToAbideByPlatformGuidelines === 'true' || registerDto.willingToAbideByPlatformGuidelines === 'yes',
          expertise: registerDto.expertise || [],
          approaches: registerDto.approaches || [],
          languages: registerDto.languages || [],
          illnessSpecializations: registerDto.illnessSpecializations || [],
          acceptTypes: registerDto.acceptTypes || [],
          treatmentSuccessRates: registerDto.treatmentSuccessRates || {},
          sessionLength: registerDto.sessionLength,
          hourlyRate: registerDto.hourlyRate,
          preferOnlineOrOffline: registerDto.preferOnlineOrOffline,
          willingToCaterOutsideCebu: registerDto.willingToCaterOutsideCebu,
          preferredPayrollAccount: registerDto.preferredPayrollAccount,
        },
      });

      return { user, therapist };
    });

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
      message: 'Therapist registration successful. Please check your email for the verification code.',
    };
  }

  async getTherapistProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        therapist: true,
      },
    });

    if (!user || user.role !== 'therapist') {
      throw new UnauthorizedException('Therapist not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: 'therapist' as const,
      therapist: user.therapist,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async verifyRegistrationOtp(
    email: string,
    otpCode: string,
  ): Promise<EmailResponse> {
    if (!otpCode || !email) {
      throw new BadRequestException('Email and OTP code are required');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        email,
        role: 'therapist',
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid email');
    }

    const result = await this.emailVerificationService.verifyEmail(otpCode);

    if (result.success) {
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

    const user = await this.prisma.user.findFirst({
      where: {
        email,
        role: 'therapist',
      },
      select: {
        id: true,
        email: true,
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

    await this.emailVerificationService.resendVerificationEmail(email);

    return {
      success: true,
      status: 'success',
      message: 'A new verification code has been sent to your email.',
    };
  }
}
