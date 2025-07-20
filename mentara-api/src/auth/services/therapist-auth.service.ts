import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { TokenService } from './token.service';
import { EmailVerificationService } from './email-verification.service';
import { EmailService } from '../../email/email.service';
import { SupabaseStorageService } from '../../common/services/supabase-storage.service';
import { TherapistApplicationService } from '../../therapist/therapist-application.service';
import { type TherapistApplicationCreateDto, type RegisterTherapistDto } from 'mentara-commons';
import {
  TherapistApplicationResponse,
  ApplicationStatusUpdateDto,
} from '../../therapist/interfaces/therapist-application.interfaces';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TherapistAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly emailService: EmailService,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly therapistApplicationService: TherapistApplicationService,
  ) {}

  async registerTherapistWithDocuments(
    registerData: RegisterTherapistDto,
    files: Express.Multer.File[],
    fileTypeMap: Record<string, string>,
  ) {
    // Hash password
    const hashedPassword = await bcrypt.hash(registerData.password, 12);

    // Transform registration data to application format
    const applicationData: TherapistApplicationCreateDto = {
      userId: `temp_${Date.now()}_${registerData.email.replace('@', '_at_')}`,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      email: registerData.email,
      mobile: registerData.mobile,
      province: registerData.province,
      providerType: registerData.providerType,
      professionalLicenseType: registerData.professionalLicenseType_specify || registerData.professionalLicenseType,
      isPRCLicensed: registerData.isPRCLicensed,
      prcLicenseNumber: registerData.prcLicenseNumber || '',
      isLicenseActive: registerData.isLicenseActive || '',
      expirationDateOfLicense: registerData.expirationDateOfLicense,
      practiceStartDate: registerData.practiceStartDate,
      areasOfExpertise: registerData.areasOfExpertise,
      assessmentTools: registerData.assessmentTools,
      therapeuticApproachesUsedList: registerData.therapeuticApproachesUsedList_specify
        ? [...registerData.therapeuticApproachesUsedList.filter(t => t !== 'other'), registerData.therapeuticApproachesUsedList_specify]
        : registerData.therapeuticApproachesUsedList,
      languagesOffered: registerData.languagesOffered_specify
        ? [...registerData.languagesOffered.filter(l => l !== 'other'), registerData.languagesOffered_specify]
        : registerData.languagesOffered,
      providedOnlineTherapyBefore: registerData.providedOnlineTherapyBefore === 'yes',
      comfortableUsingVideoConferencing: registerData.comfortableUsingVideoConferencing === 'yes',
      privateConfidentialSpace: registerData.privateConfidentialSpace === 'yes',
      compliesWithDataPrivacyAct: registerData.compliesWithDataPrivacyAct === 'yes',
      weeklyAvailability: registerData.weeklyAvailability,
      preferredSessionLength: registerData.preferredSessionLength_specify || registerData.preferredSessionLength,
      accepts: registerData.accepts,
      bio: registerData.bio || '',
      hourlyRate: registerData.hourlyRate || 0,
      professionalLiabilityInsurance: registerData.professionalLiabilityInsurance,
      complaintsOrDisciplinaryActions: registerData.complaintsOrDisciplinaryActions,
      complaintsOrDisciplinaryActions_specify: registerData.complaintsOrDisciplinaryActions_specify,
      willingToAbideByPlatformGuidelines: registerData.willingToAbideByPlatformGuidelines === 'yes',
    };

    // Create application with documents first
    const applicationResult = await this.therapistApplicationService.createApplicationWithDocuments(
      applicationData,
      files,
      fileTypeMap,
    );

    // Create user and therapist profile in transaction with proper error handling
    const userResult = await this.prisma.$transaction(async (tx) => {
      try {
        // Try to create new user first
        const user = await tx.user.create({
          data: {
            email: registerData.email,
            password: hashedPassword,
            firstName: registerData.firstName,
            lastName: registerData.lastName,
            role: 'therapist',
            emailVerified: false,
          },
        });

        // Update the application with the real user ID
        await tx.therapist.update({
          where: { userId: applicationResult.application.userId },
          data: { userId: user.id },
        });

        const therapist = await tx.therapist.create({
          data: {
            userId: user.id,
            status: 'PENDING',
            mobile: registerData.mobile,
            province: registerData.province,
            providerType: registerData.providerType,
            professionalLicenseType: registerData.professionalLicenseType_specify || registerData.professionalLicenseType,
            isPRCLicensed: registerData.isPRCLicensed,
            prcLicenseNumber: registerData.prcLicenseNumber || '',
            expirationDateOfLicense: registerData.expirationDateOfLicense ? new Date(registerData.expirationDateOfLicense) : new Date(),
            practiceStartDate: registerData.practiceStartDate ? new Date(registerData.practiceStartDate) : new Date(),
            sessionLength: registerData.preferredSessionLength_specify || registerData.preferredSessionLength || '60 minutes',
            hourlyRate: registerData.hourlyRate || 0,
            providedOnlineTherapyBefore: registerData.providedOnlineTherapyBefore === 'yes',
            comfortableUsingVideoConferencing: registerData.comfortableUsingVideoConferencing === 'yes',
            compliesWithDataPrivacyAct: registerData.compliesWithDataPrivacyAct === 'yes',
            willingToAbideByPlatformGuidelines: registerData.willingToAbideByPlatformGuidelines === 'yes',
            treatmentSuccessRates: {},
          },
        });

        return { user, therapist, isExistingUser: false };
      } catch (error) {
        // Handle unique constraint violation (P2002) for email
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002' && 
            'meta' in error && error.meta && typeof error.meta === 'object' && 
            'target' in error.meta && Array.isArray(error.meta.target) && 
            error.meta.target.includes('email')) {
          // Check existing user and their role
          const existingUser = await tx.user.findUnique({
            where: { email: registerData.email },
            include: { therapist: true },
          });

          if (!existingUser) {
            throw new BadRequestException('User creation failed. Please try again.');
          }

          // Handle based on existing user's role
          if (existingUser.role === 'therapist') {
            if (existingUser.therapist) {
              throw new BadRequestException(
                'You already have a therapist account with this email. Please sign in instead.',
              );
            }
            // User has therapist role but no therapist profile - create profile
            const therapist = await tx.therapist.create({
              data: {
                userId: existingUser.id,
                status: 'PENDING',
                mobile: registerData.mobile,
                province: registerData.province,
                providerType: registerData.providerType,
                professionalLicenseType: registerData.professionalLicenseType_specify || registerData.professionalLicenseType,
                isPRCLicensed: registerData.isPRCLicensed,
                prcLicenseNumber: registerData.prcLicenseNumber || '',
                expirationDateOfLicense: registerData.expirationDateOfLicense ? new Date(registerData.expirationDateOfLicense) : new Date(),
                practiceStartDate: registerData.practiceStartDate ? new Date(registerData.practiceStartDate) : new Date(),
                sessionLength: registerData.preferredSessionLength_specify || registerData.preferredSessionLength || '60 minutes',
                hourlyRate: registerData.hourlyRate || 0,
                providedOnlineTherapyBefore: registerData.providedOnlineTherapyBefore === 'yes',
                comfortableUsingVideoConferencing: registerData.comfortableUsingVideoConferencing === 'yes',
                compliesWithDataPrivacyAct: registerData.compliesWithDataPrivacyAct === 'yes',
                willingToAbideByPlatformGuidelines: registerData.willingToAbideByPlatformGuidelines === 'yes',
                treatmentSuccessRates: {},
              },
            });

            // Update application with existing user ID
            await tx.therapist.update({
              where: { userId: applicationResult.application.userId },
              data: { userId: existingUser.id },
            });

            return { user: existingUser, therapist, isExistingUser: true };
          } else if (existingUser.role === 'client') {
            // Allow client to upgrade to therapist
            const updatedUser = await tx.user.update({
              where: { id: existingUser.id },
              data: { 
                role: 'therapist',
                password: hashedPassword, // Update password
                firstName: registerData.firstName,
                lastName: registerData.lastName,
              },
            });

            const therapist = await tx.therapist.create({
              data: {
                userId: existingUser.id,
                status: 'PENDING',
                mobile: registerData.mobile,
                province: registerData.province,
                providerType: registerData.providerType,
                professionalLicenseType: registerData.professionalLicenseType_specify || registerData.professionalLicenseType,
                isPRCLicensed: registerData.isPRCLicensed,
                prcLicenseNumber: registerData.prcLicenseNumber || '',
                expirationDateOfLicense: registerData.expirationDateOfLicense ? new Date(registerData.expirationDateOfLicense) : new Date(),
                practiceStartDate: registerData.practiceStartDate ? new Date(registerData.practiceStartDate) : new Date(),
                sessionLength: registerData.preferredSessionLength_specify || registerData.preferredSessionLength || '60 minutes',
                hourlyRate: registerData.hourlyRate || 0,
                providedOnlineTherapyBefore: registerData.providedOnlineTherapyBefore === 'yes',
                comfortableUsingVideoConferencing: registerData.comfortableUsingVideoConferencing === 'yes',
                compliesWithDataPrivacyAct: registerData.compliesWithDataPrivacyAct === 'yes',
                willingToAbideByPlatformGuidelines: registerData.willingToAbideByPlatformGuidelines === 'yes',
                treatmentSuccessRates: {},
              },
            });

            // Update application with existing user ID
            await tx.therapist.update({
              where: { userId: applicationResult.application.userId },
              data: { userId: existingUser.id },
            });

            return { user: updatedUser, therapist, isExistingUser: true };
          } else {
            // User has admin/moderator role
            throw new BadRequestException(
              `An account with this email already exists with ${existingUser.role} privileges. Please contact support if you need assistance.`,
            );
          }
        }
        
        // Re-throw other errors
        throw error;
      }
    });

    // Generate single token
    const { token } = await this.tokenService.generateToken(
      userResult.user.id,
      userResult.user.email,
      userResult.user.role,
    );

    // Send verification email
    await this.emailVerificationService.sendVerificationEmail(userResult.user.id);

    return {
      user: userResult.user,
      token,
      message: userResult.isExistingUser 
        ? 'Therapist application submitted successfully. Your account has been upgraded to therapist role. Application is under review.'
        : 'Therapist registration successful with documents uploaded. Application is under review.',
      applicationId: applicationResult.application.id,
      uploadedFiles: applicationResult.uploadedFiles,
    };
  }

  async registerTherapist(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and therapist profile in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'therapist',
          emailVerified: false,
        },
      });

      const therapist = await tx.therapist.create({
        data: {
          userId: user.id,
          status: 'PENDING',
          mobile: '',
          province: '',
          providerType: '',
          professionalLicenseType: '',
          isPRCLicensed: '',
          prcLicenseNumber: '',
          expirationDateOfLicense: new Date(),
          practiceStartDate: new Date(),
          sessionLength: '60 minutes', // Default
          hourlyRate: 0,
          providedOnlineTherapyBefore: false,
          comfortableUsingVideoConferencing: false,
          compliesWithDataPrivacyAct: false,
          willingToAbideByPlatformGuidelines: false,
          treatmentSuccessRates: {},
        },
      });

      return { user, therapist };
    });

    // Generate single token
    const { token } = await this.tokenService.generateToken(
      result.user.id,
      result.user.email,
      result.user.role,
    );

    // Send verification email
    await this.emailVerificationService.sendVerificationEmail(result.user.id);

    return {
      user: result.user,
      token,
      message:
        'Therapist registration successful. Please complete your application and submit required documents.',
    };
  }

  async loginTherapist(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Find user with therapist role
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        role: 'therapist',
      },
      include: {
        therapist: true,
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
      token,
    };
  }

  async getTherapistProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        therapist: {
          include: {
            assignedClients: {
              include: {
                client: {
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

    if (!user || user.role !== 'therapist') {
      throw new UnauthorizedException('Therapist not found');
    }

    return user;
  }

  // Application management methods (delegated to TherapistApplicationService)
  async createApplicationWithDocuments(
    applicationData: TherapistApplicationCreateDto,
    files: Express.Multer.File[],
    fileTypeMap: Record<string, string>,
  ) {
    return this.therapistApplicationService.createApplicationWithDocuments(
      applicationData,
      files,
      fileTypeMap,
    );
  }

  async getAllApplications(params: {
    status?: string;
    page: number;
    limit: number;
  }): Promise<{
    applications: TherapistApplicationResponse[];
    totalCount: number;
    page: number;
    totalPages: number;
  }> {
    return this.therapistApplicationService.getAllApplications(params);
  }

  async getApplicationById(
    id: string,
  ): Promise<TherapistApplicationResponse | null> {
    return this.therapistApplicationService.getApplicationById(id);
  }

  async updateApplicationStatus(
    id: string,
    updateData: ApplicationStatusUpdateDto,
  ): Promise<{
    success: boolean;
    message: string;
    credentials?: { email: string; password: string };
  }> {
    return this.therapistApplicationService.updateApplicationStatus(
      id,
      updateData,
    );
  }

  async getApplicationFiles(applicationId: string): Promise<
    Array<{
      id: string;
      fileName: string;
      fileUrl: string;
      uploadedAt: string;
    }>
  > {
    return this.therapistApplicationService.getApplicationFiles(applicationId);
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
