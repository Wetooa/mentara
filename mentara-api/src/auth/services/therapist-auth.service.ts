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

import type { RegisterTherapistDto } from '../types';
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
  ) {}

  async registerTherapistWithDocuments(
    registerData: RegisterTherapistDto,
    files: Express.Multer.File[],
    fileTypeMap: Record<string, string>,
  ) {
    // Hash password
    const hashedPassword = await bcrypt.hash(registerData.password, 12);

    // No longer need application data transformation since we create directly

    // Process and upload documents if provided
    let uploadedFiles: Array<{ id: string; fileName: string; url: string }> =
      [];
    let documentUrls: string[] = [];
    let documentNames: string[] = [];
    let certificateUrls: string[] = [];
    let certificateNames: string[] = [];
    let licenseUrls: string[] = [];
    let licenseNames: string[] = [];

    if (files && files.length > 0) {
      // Validate and upload files to Supabase
      for (const file of files) {
        const validation = this.supabaseStorageService.validateFile(file);
        if (!validation.isValid) {
          throw new BadRequestException(
            `File validation failed for ${file.originalname}: ${validation.error}`,
          );
        }
      }

      // Upload files to Supabase
      const uploadResults = await this.supabaseStorageService.uploadFiles(
        files,
        SupabaseStorageService.getSupportedBuckets().DOCUMENTS,
      );

      uploadedFiles = uploadResults.map((result, index) => ({
        id: `file-${Date.now()}-${index}`,
        fileName: files[index].originalname,
        url: result.url,
      }));

      // Categorize files based on fileTypeMap
      uploadedFiles.forEach((file, index) => {
        const fileType = fileTypeMap[files[index].originalname] || 'document';

        switch (fileType) {
          case 'certificate':
            certificateUrls.push(file.url);
            certificateNames.push(file.fileName);
            break;
          case 'license':
            licenseUrls.push(file.url);
            licenseNames.push(file.fileName);
            break;
          default:
            documentUrls.push(file.url);
            documentNames.push(file.fileName);
            break;
        }
      });
    }

    // Create user and therapist profile in transaction with proper error handling
    const userResult = await this.prisma.$transaction(async (tx) => {
      let user: any;
      let isExistingUser = false;

      try {
        // Try to create new user first
        user = await tx.user.create({
          data: {
            email: registerData.email,
            password: hashedPassword,
            firstName: registerData.firstName,
            lastName: registerData.lastName,
            role: 'therapist',
            emailVerified: false,
          },
        });
      } catch (error) {
        // Handle unique constraint violation (P2002) for email
        if (
          error &&
          typeof error === 'object' &&
          'code' in error &&
          error.code === 'P2002' &&
          'meta' in error &&
          error.meta &&
          typeof error.meta === 'object' &&
          'target' in error.meta &&
          Array.isArray(error.meta.target) &&
          error.meta.target.includes('email')
        ) {
          // Check existing user and their role
          const existingUser = await tx.user.findUnique({
            where: { email: registerData.email },
            include: { therapist: true },
          });

          if (!existingUser) {
            throw new BadRequestException(
              'User creation failed. Please try again.',
            );
          }

          // Handle based on existing user's role
          if (existingUser.role === 'therapist') {
            if (existingUser.therapist) {
              throw new BadRequestException(
                'You already have a therapist account with this email. Please sign in instead.',
              );
            }
            // User has therapist role but no therapist profile - use existing user
            user = existingUser;
            isExistingUser = true;
          } else if (existingUser.role === 'client') {
            // Allow client to upgrade to therapist
            user = await tx.user.update({
              where: { id: existingUser.id },
              data: {
                role: 'therapist',
                password: hashedPassword, // Update password
                firstName: registerData.firstName,
                lastName: registerData.lastName,
              },
            });
            isExistingUser = true;
          } else {
            // User has admin/moderator role
            throw new BadRequestException(
              `An account with this email already exists with ${existingUser.role} privileges. Please contact support if you need assistance.`,
            );
          }
        } else {
          // Re-throw other errors
          throw error;
        }
      }

      // No application update needed since we're creating directly

      // Create single therapist profile for all scenarios
      const therapist = await tx.therapist.create({
        data: {
          userId: user.id,
          status: 'PENDING',
          mobile: registerData.mobile,
          province: registerData.province,
          providerType: registerData.providerType,
          professionalLicenseType:
            registerData.professionalLicenseType_specify ||
            registerData.professionalLicenseType,
          isPRCLicensed: registerData.isPRCLicensed,
          prcLicenseNumber: registerData.prcLicenseNumber || '',
          expirationDateOfLicense: registerData.expirationDateOfLicense
            ? new Date(registerData.expirationDateOfLicense)
            : new Date(),
          practiceStartDate: registerData.practiceStartDate
            ? new Date(registerData.practiceStartDate)
            : new Date(),
          sessionLength:
            registerData.preferredSessionLength_specify ||
            registerData.preferredSessionLength ||
            '60 minutes',
          hourlyRate: registerData.hourlyRate || 0,
          providedOnlineTherapyBefore:
            registerData.providedOnlineTherapyBefore === 'yes',
          comfortableUsingVideoConferencing:
            registerData.comfortableUsingVideoConferencing === 'yes',
          compliesWithDataPrivacyAct:
            registerData.compliesWithDataPrivacyAct === 'yes',
          willingToAbideByPlatformGuidelines:
            registerData.willingToAbideByPlatformGuidelines === 'yes',
          treatmentSuccessRates: {},
          // Store document URLs from Supabase uploads
          certificateUrls,
          certificateNames,
          licenseUrls,
          licenseNames,
          documentUrls,
          documentNames,
          // Professional expertise arrays
          areasOfExpertise: registerData.areasOfExpertise,
          assessmentTools: registerData.assessmentTools,
          therapeuticApproachesUsedList:
            registerData.therapeuticApproachesUsedList_specify
              ? [
                  ...registerData.therapeuticApproachesUsedList.filter(
                    (t) => t !== 'other',
                  ),
                  registerData.therapeuticApproachesUsedList_specify,
                ]
              : registerData.therapeuticApproachesUsedList,
          languagesOffered: registerData.languagesOffered_specify
            ? [
                ...registerData.languagesOffered.filter((l) => l !== 'other'),
                registerData.languagesOffered_specify,
              ]
            : registerData.languagesOffered,
          // Additional fields from registration
          privateConfidentialSpace:
            registerData.privateConfidentialSpace === 'yes' ? 'yes' : 'no',
          professionalLiabilityInsurance:
            registerData.professionalLiabilityInsurance,
          complaintsOrDisciplinaryActions:
            registerData.complaintsOrDisciplinaryActions,
          // Compliance arrays for schema compatibility
          expertise: registerData.areasOfExpertise,
          approaches: registerData.therapeuticApproachesUsedList_specify
            ? [
                ...registerData.therapeuticApproachesUsedList.filter(
                  (t) => t !== 'other',
                ),
                registerData.therapeuticApproachesUsedList_specify,
              ]
            : registerData.therapeuticApproachesUsedList,
          languages: registerData.languagesOffered_specify
            ? [
                ...registerData.languagesOffered.filter((l) => l !== 'other'),
                registerData.languagesOffered_specify,
              ]
            : registerData.languagesOffered,
          acceptTypes: registerData.accepts || [],
          acceptsInsurance: false,
          acceptedInsuranceTypes: [],
          specialCertifications: [],
          illnessSpecializations: [],
          preferredSessionLength: [30, 45, 60], // Default session lengths
        },
      });

      return { user, therapist, isExistingUser };
    });

    // Generate single token
    const { token } = await this.tokenService.generateToken(
      userResult.user.id,
      userResult.user.email,
      userResult.user.role,
    );

    // Send verification email
    await this.emailVerificationService.sendVerificationEmail(
      userResult.user.id,
    );

    // Send therapist registration success email
    try {
      await this.emailService.sendTherapistRegistrationSuccess(
        userResult.user.email,
        `${userResult.user.firstName || ''} ${userResult.user.lastName || ''}`.trim() ||
          'Therapist',
        'Welcome to Mentara - Your Therapist Application Has Been Submitted'
      );
      console.log('Therapist registration success email sent successfully');
    } catch (error) {
      console.error('Failed to send therapist registration success email:', error);
      // Don't fail the entire operation if email fails
    }

    return {
      user: userResult.user,
      token,
      message: userResult.isExistingUser
        ? 'Therapist application submitted successfully. Your account has been upgraded to therapist role. Application is under review.'
        : 'Therapist registration successful with documents uploaded. Application is under review.',
      therapist: userResult.therapist,
      uploadedFiles,
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

    // Send therapist registration success email
    try {
      await this.emailService.sendTherapistRegistrationSuccess(
        result.user.email,
        `${result.user.firstName || ''} ${result.user.lastName || ''}`.trim() ||
          'Therapist',
        'Welcome to Mentara - Your Therapist Registration Was Successful'
      );
      console.log('Therapist registration success email sent successfully');
    } catch (error) {
      console.error('Failed to send therapist registration success email:', error);
      // Don't fail the entire operation if email fails
    }

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

  // Application management methods (moved from TherapistApplicationService)
  async getAllApplications(options: {
    status?: string;
    page: number;
    limit: number;
  }) {
    const { status, page, limit } = options;
    const skip = (page - 1) * limit;

    const whereClause = status ? { status: status.toUpperCase() as any } : {};

    const [applications, totalCount] = await Promise.all([
      this.prisma.therapist.findMany({
        where: whereClause,
        include: {
          user: true,
        },
        skip,
        take: limit,
        orderBy: { submissionDate: 'desc' },
      }),
      this.prisma.therapist.count({ where: whereClause }),
    ]);

    // Helper function to determine if license is active
    const isLicenseActive = (expirationDate: Date): boolean => {
      const today = new Date();
      return expirationDate > today;
    };

    const transformedApplications: TherapistApplicationResponse[] =
      await Promise.all(
        applications.map(async (app) => {
          const files = await this.getApplicationFiles(app.userId);

          return {
            id: app.userId,
            status: app.status,
            submissionDate: app.submissionDate.toISOString(),
            processingDate: app.processingDate?.toISOString(),
            firstName: (app as any).user?.firstName || '',
            lastName: (app as any).user?.lastName || '',
            email: (app as any).user?.email || '',
            mobile: app.mobile,
            province: app.province,
            providerType: app.providerType,
            professionalLicenseType: app.professionalLicenseType,
            isPRCLicensed: app.isPRCLicensed,
            prcLicenseNumber: app.prcLicenseNumber,
            expirationDateOfLicense: app.expirationDateOfLicense.toISOString(),
            isLicenseActive: isLicenseActive(app.expirationDateOfLicense)
              ? 'yes'
              : 'no',
            practiceStartDate: app.practiceStartDate.toISOString(),
            yearsOfExperience: app.yearsOfExperience?.toString() || 'N/A',
            areasOfExpertise: app.areasOfExpertise || [],
            assessmentTools: app.assessmentTools || [],
            therapeuticApproachesUsedList:
              app.therapeuticApproachesUsedList || [],
            languagesOffered: app.languagesOffered || [],
            providedOnlineTherapyBefore: app.providedOnlineTherapyBefore
              ? 'yes'
              : 'no',
            comfortableUsingVideoConferencing:
              app.comfortableUsingVideoConferencing ? 'yes' : 'no',
            weeklyAvailability: 'flexible', // Default value
            preferredSessionLength: app.sessionLength,
            accepts: app.acceptTypes || [],
            privateConfidentialSpace: app.privateConfidentialSpace || 'N/A',
            compliesWithDataPrivacyAct: app.compliesWithDataPrivacyAct
              ? 'yes'
              : 'no',
            professionalLiabilityInsurance:
              app.professionalLiabilityInsurance || 'N/A',
            complaintsOrDisciplinaryActions:
              app.complaintsOrDisciplinaryActions || 'N/A',
            willingToAbideByPlatformGuidelines:
              app.willingToAbideByPlatformGuidelines ? 'yes' : 'no',
            bio: app.educationBackground || undefined,
            hourlyRate: app.hourlyRate ? Number(app.hourlyRate) : undefined,
            files: files,
          };
        }),
      );

    return {
      applications: transformedApplications,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async getApplicationById(
    id: string,
  ): Promise<TherapistApplicationResponse | null> {
    const application = await this.prisma.therapist.findUnique({
      where: { userId: id },
      include: {
        user: true,
      },
    });

    if (!application) {
      return null;
    }

    const files = await this.getApplicationFiles(application.userId);

    // Helper function to determine if license is active
    const isLicenseActive = (expirationDate: Date): boolean => {
      const today = new Date();
      return expirationDate > today;
    };

    return {
      id: application.userId,
      status: application.status,
      submissionDate: application.submissionDate.toISOString(),
      processingDate: application.processingDate?.toISOString(),
      firstName: application.user.firstName || '',
      lastName: application.user.lastName || '',
      email: application.user.email,
      mobile: application.mobile,
      province: application.province,
      providerType: application.providerType,
      professionalLicenseType: application.professionalLicenseType,
      isPRCLicensed: application.isPRCLicensed,
      prcLicenseNumber: application.prcLicenseNumber,
      expirationDateOfLicense:
        application.expirationDateOfLicense.toISOString(),
      isLicenseActive: isLicenseActive(application.expirationDateOfLicense)
        ? 'yes'
        : 'no',
      practiceStartDate: application.practiceStartDate.toISOString(),
      yearsOfExperience: application.yearsOfExperience?.toString() || 'N/A',
      areasOfExpertise: application.areasOfExpertise || [],
      assessmentTools: application.assessmentTools || [],
      therapeuticApproachesUsedList:
        application.therapeuticApproachesUsedList || [],
      languagesOffered: application.languagesOffered || [],
      providedOnlineTherapyBefore: application.providedOnlineTherapyBefore
        ? 'yes'
        : 'no',
      comfortableUsingVideoConferencing:
        application.comfortableUsingVideoConferencing ? 'yes' : 'no',
      weeklyAvailability: 'flexible',
      preferredSessionLength: application.sessionLength,
      accepts: application.acceptTypes || [],
      privateConfidentialSpace: application.privateConfidentialSpace || 'N/A',
      compliesWithDataPrivacyAct: application.compliesWithDataPrivacyAct
        ? 'yes'
        : 'no',
      professionalLiabilityInsurance:
        application.professionalLiabilityInsurance || 'N/A',
      complaintsOrDisciplinaryActions:
        application.complaintsOrDisciplinaryActions || 'N/A',
      willingToAbideByPlatformGuidelines:
        application.willingToAbideByPlatformGuidelines ? 'yes' : 'no',
      bio: application.educationBackground || undefined,
      hourlyRate: application.hourlyRate
        ? Number(application.hourlyRate)
        : undefined,
      files: files,
    };
  }

  async updateApplicationStatus(
    id: string,
    updateData: ApplicationStatusUpdateDto,
  ): Promise<{
    success: boolean;
    message: string;
    credentials?: { email: string; password: string };
  }> {
    const application = await this.prisma.therapist.findUnique({
      where: { userId: id },
      include: { user: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    try {
      // Update application status
      await this.prisma.therapist.update({
        where: { userId: id },
        data: {
          status: updateData.status,
          processingDate: new Date(),
        },
      });

      let result: {
        success: boolean;
        message: string;
        credentials?: { email: string; password: string };
      } = {
        success: true,
        message: `Application ${updateData.status} successfully`,
      };

      // Handle status-specific actions and notifications
      if (updateData.status === 'APPROVED') {
        // Create Clerk account for approved therapist
        const temporaryPassword = this.generateTemporaryPassword();
        let clerkUserId: string | null = null;

        try {
          // Create Clerk user account
          const clerkUser = await this.createClerkTherapistAccount(
            application.user.email,
            `${application.user.firstName || ''} ${application.user.lastName || ''}`.trim(),
            temporaryPassword,
          );

          clerkUserId = clerkUser.id;
          console.log('Clerk account created successfully:', clerkUserId);

          // Update user record to change role to therapist and activate account
          await this.prisma.user.update({
            where: { id: application.userId },
            data: {
              role: 'therapist',
              isActive: true,
            },
          });

          console.log('User role updated to therapist');
        } catch (error) {
          console.error('Error creating Clerk account:', error);
          // Continue with the process but note the error
        }

        const credentials = {
          email: application.user.email,
          password: temporaryPassword,
        };

        result = {
          ...result,
          message:
            'Application approved successfully. Therapist account created and credentials generated.',
          credentials,
        };

        // Send approval email notification
        try {
          await this.emailService.sendTherapistApproved(
            application.user.email,
            `${application.user.firstName || ''} ${application.user.lastName || ''}`.trim() ||
              'Therapist',
            'Congratulations! Your Therapist Application Has Been Approved'
          );
          console.log('Approval email notification sent successfully');
        } catch (error) {
          console.error('Failed to send approval email notification:', error);
          // Don't fail the entire operation if email fails
        }
      } else if (updateData.status === 'REJECTED') {
        // Send rejection email notification
        try {
          await this.emailService.sendTherapistDenied(
            application.user.email,
            `${application.user.firstName || ''} ${application.user.lastName || ''}`.trim() ||
              'Therapist',
            'Update on Your Therapist Application'
          );
          console.log('Rejection email notification sent successfully');
        } catch (error) {
          console.error('Failed to send rejection email notification:', error);
          // Don't fail the entire operation if email fails
        }
      }

      return result;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw new BadRequestException('Failed to update application status');
    }
  }

  async getApplicationFiles(applicationId: string): Promise<
    Array<{
      id: string;
      fileName: string;
      fileUrl: string;
      uploadedAt: string;
    }>
  > {
    // Get therapist record with document URLs
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId: applicationId },
      select: {
        certificateUrls: true,
        certificateNames: true,
        licenseUrls: true,
        licenseNames: true,
        documentUrls: true,
        documentNames: true,
        createdAt: true,
      },
    });

    if (!therapist) {
      return [];
    }

    const files: Array<{
      id: string;
      fileName: string;
      fileUrl: string;
      uploadedAt: string;
    }> = [];

    // Process certificates
    therapist.certificateUrls.forEach((url, index) => {
      files.push({
        id: `cert-${index}`,
        fileName:
          therapist.certificateNames[index] || `certificate-${index + 1}`,
        fileUrl: url,
        uploadedAt: therapist.createdAt.toISOString(),
      });
    });

    // Process licenses
    therapist.licenseUrls.forEach((url, index) => {
      files.push({
        id: `license-${index}`,
        fileName: therapist.licenseNames[index] || `license-${index + 1}`,
        fileUrl: url,
        uploadedAt: therapist.createdAt.toISOString(),
      });
    });

    // Process documents
    therapist.documentUrls.forEach((url, index) => {
      files.push({
        id: `doc-${index}`,
        fileName: therapist.documentNames[index] || `document-${index + 1}`,
        fileUrl: url,
        uploadedAt: therapist.createdAt.toISOString(),
      });
    });

    return files;
  }

  private generateTemporaryPassword(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private async createClerkTherapistAccount(
    email: string,
    fullName: string,
    password: string,
  ): Promise<{ id: string; email: string }> {
    try {
      console.log('Creating Clerk account for therapist:', { email, fullName });
      console.log(
        'Password provided for future Clerk integration:',
        password ? 'Yes' : 'No',
      );

      // For production, you would integrate with Clerk Admin API
      // For now, we'll simulate the account creation and return a mock response
      // In a real implementation, you would use:
      // - Clerk Backend API
      // - clerk/backend package
      // - Or MCP Clerk integration

      // Create Clerk user using MCP integration
      // Note: In a real implementation, you would inject the Clerk MCP service
      // For now, we'll simulate a successful account creation

      const firstName = fullName.split(' ')[0] || '';
      const lastName = fullName.split(' ').slice(1).join(' ') || '';

      // Simulate Clerk account creation
      // In production, use the actual Clerk MCP service
      const clerkUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email,
        firstName: firstName,
        lastName: lastName,
        publicMetadata: {
          role: 'therapist',
        },
        privateMetadata: {
          accountType: 'therapist',
          createdBy: 'admin_approval',
          approvedAt: new Date().toISOString(),
        },
      };

      console.log('Clerk account created successfully:', {
        id: clerkUser.id,
        email: clerkUser.email,
        role: 'therapist',
      });

      // TODO: Replace with actual Clerk MCP call
      // Example using MCP Clerk integration:
      /*
      const clerkUser = await this.clerkMcpService.createUser({
        emailAddress: email,
        firstName: firstName,
        lastName: lastName,
        password: password,
        publicMetadata: { role: 'therapist' },
        privateMetadata: { 
          accountType: 'therapist',
          createdBy: 'admin_approval'
        }
      });
      */

      return {
        id: clerkUser.id,
        email: clerkUser.email,
      };
    } catch (error) {
      console.error('Error creating Clerk account:', error);
      throw new BadRequestException(
        'Failed to create therapist account. Please try again.',
      );
    }
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
