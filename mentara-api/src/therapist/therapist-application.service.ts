import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { EmailService } from '../services/email.service';
import { TherapistApplicationDto } from './therapist-application.dto';
import {
  ApplicationStatusUpdateDto,
  TherapistApplicationResponse,
} from './therapist-application.controller';
import {
  FileStatus,
  AttachmentEntityType,
  AttachmentPurpose,
} from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TherapistApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createApplication(applicationData: TherapistApplicationDto) {
    // Check if user already has an application
    const existingApplication = await this.prisma.therapist.findUnique({
      where: { userId: applicationData.userId },
    });

    if (existingApplication) {
      throw new BadRequestException('User already has a therapist application');
    }

    // For public applications (temporary user IDs), skip user existence check
    const isPublicApplication = applicationData.userId.startsWith('temp_');

    if (!isPublicApplication) {
      // Check if user exists for authenticated applications
      const user = await this.prisma.user.findUnique({
        where: { id: applicationData.userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    } else {
      // For public applications, check if someone with this email already applied
      const existingByEmail = await this.prisma.therapist.findFirst({
        where: {
          OR: [
            { user: { email: applicationData.email } },
            // Also check temp user IDs with this email pattern
            {
              userId: { contains: applicationData.email.replace('@', '_at_') },
            },
          ],
        },
      });

      if (existingByEmail) {
        throw new BadRequestException(
          'An application with this email already exists',
        );
      }
    }

    // Process the application data
    const convertedData = {
      ...applicationData,
      practiceStartDate: new Date(applicationData.practiceStartDate),
      // Handle expiration date
      expirationDateOfLicense: applicationData.expirationDateOfLicense
        ? new Date(applicationData.expirationDateOfLicense)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default to 1 year from now
      // Set default values for required fields
      licenseVerified: false,
      acceptsInsurance: false,
      hourlyRate: applicationData.hourlyRate || 0,
    };

    try {
      // For public applications, we need to create the user record first
      if (isPublicApplication) {
        // Create a temporary user record
        await this.prisma.user.create({
          data: {
            id: convertedData.userId,
            email: convertedData.email,
            firstName: convertedData.firstName,
            lastName: convertedData.lastName,
            role: 'client', // Temporary role until approved
            isActive: false, // Inactive until approved
          },
        });
      }

      const application = await this.prisma.therapist.create({
        data: {
          userId: convertedData.userId,
          mobile: convertedData.mobile,
          province: convertedData.province,
          providerType: convertedData.providerType,
          professionalLicenseType: convertedData.professionalLicenseType,
          isPRCLicensed: convertedData.isPRCLicensed,
          prcLicenseNumber: convertedData.prcLicenseNumber || '',
          practiceStartDate: convertedData.practiceStartDate,
          areasOfExpertise: convertedData.areasOfExpertise,
          assessmentTools: convertedData.assessmentTools,
          therapeuticApproachesUsedList:
            convertedData.therapeuticApproachesUsedList,
          languagesOffered: convertedData.languagesOffered,
          providedOnlineTherapyBefore:
            convertedData.providedOnlineTherapyBefore,
          comfortableUsingVideoConferencing:
            convertedData.comfortableUsingVideoConferencing,
          privateConfidentialSpace: convertedData.privateConfidentialSpace
            ? 'yes'
            : 'no',
          compliesWithDataPrivacyAct: convertedData.compliesWithDataPrivacyAct,
          professionalLiabilityInsurance:
            convertedData.professionalLiabilityInsurance,
          complaintsOrDisciplinaryActions:
            convertedData.complaintsOrDisciplinaryActions,
          willingToAbideByPlatformGuidelines:
            convertedData.willingToAbideByPlatformGuidelines,
          sessionLength: convertedData.preferredSessionLength,
          hourlyRate: convertedData.hourlyRate,
          status: 'pending',
          submissionDate: new Date(),
          processingDate: new Date(),
          expirationDateOfLicense: convertedData.expirationDateOfLicense,
          licenseVerified: convertedData.licenseVerified,
          acceptsInsurance: convertedData.acceptsInsurance,
          acceptedInsuranceTypes: [],
          specialCertifications: [],
          expertise: convertedData.areasOfExpertise,
          approaches: convertedData.therapeuticApproachesUsedList,
          languages: convertedData.languagesOffered,
          illnessSpecializations: [],
          acceptTypes: convertedData.accepts || [],
          treatmentSuccessRates: {},
          preferredSessionLength: [30, 45, 60], // Default session lengths
        },
        include: {
          user: true,
        },
      });

      return application;
    } catch (error) {
      console.error('Error creating therapist application:', error);
      throw new BadRequestException('Failed to create application');
    }
  }

  async getAllApplications(options: {
    status?: string;
    page: number;
    limit: number;
  }) {
    const { status, page, limit } = options;
    const skip = (page - 1) * limit;

    const whereClause = status ? { status } : {};

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

    const transformedApplications: TherapistApplicationResponse[] =
      await Promise.all(
        applications.map(async (app) => {
          const files = await this.getApplicationFiles(app.userId);

          return {
            id: app.userId,
            status: app.status,
            submissionDate: app.submissionDate.toISOString(),
            processingDate: app.processingDate?.toISOString(),
            firstName: app.user.firstName || '',
            lastName: app.user.lastName || '',
            email: app.user.email,
            mobile: app.mobile,
            province: app.province,
            providerType: app.providerType,
            professionalLicenseType: app.professionalLicenseType,
            isPRCLicensed: app.isPRCLicensed,
            prcLicenseNumber: app.prcLicenseNumber,
            practiceStartDate: app.practiceStartDate.toISOString(),
            areasOfExpertise: app.areasOfExpertise,
            assessmentTools: app.assessmentTools,
            therapeuticApproachesUsedList: app.therapeuticApproachesUsedList,
            languagesOffered: app.languagesOffered,
            providedOnlineTherapyBefore: app.providedOnlineTherapyBefore
              ? 'yes'
              : 'no',
            comfortableUsingVideoConferencing:
              app.comfortableUsingVideoConferencing ? 'yes' : 'no',
            weeklyAvailability: 'flexible', // Default value
            preferredSessionLength: app.sessionLength,
            accepts: app.acceptTypes,
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
      practiceStartDate: application.practiceStartDate.toISOString(),
      areasOfExpertise: application.areasOfExpertise,
      assessmentTools: application.assessmentTools,
      therapeuticApproachesUsedList: application.therapeuticApproachesUsedList,
      languagesOffered: application.languagesOffered,
      providedOnlineTherapyBefore: application.providedOnlineTherapyBefore
        ? 'yes'
        : 'no',
      comfortableUsingVideoConferencing:
        application.comfortableUsingVideoConferencing ? 'yes' : 'no',
      weeklyAvailability: 'flexible',
      preferredSessionLength: application.sessionLength,
      accepts: application.acceptTypes,
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
      if (updateData.status === 'approved') {
        // TODO: Implement Clerk account creation here
        // For now, we'll return placeholder credentials
        const temporaryPassword = this.generateTemporaryPassword();

        const credentials = {
          email: application.user.email,
          password: temporaryPassword,
        };

        result = {
          ...result,
          message:
            'Application approved successfully. Therapist account credentials generated.',
          credentials,
        };

        // Send approval email notification
        try {
          await this.emailService.sendTherapistWelcomeEmail(
            application.user.email,
            `${application.user.firstName || ''} ${application.user.lastName || ''}`.trim() ||
              'Therapist',
            credentials,
          );
          console.log('Approval email notification sent successfully');
        } catch (error) {
          console.error('Failed to send approval email notification:', error);
          // Don't fail the entire operation if email fails
        }
      } else if (updateData.status === 'rejected') {
        // Send rejection email notification
        try {
          await this.emailService.sendTherapistRejectionEmail(
            application.user.email,
            `${application.user.firstName || ''} ${application.user.lastName || ''}`.trim() ||
              'Therapist',
            updateData.adminNotes,
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

  async uploadDocuments(
    userId: string,
    files: Express.Multer.File[],
    fileTypeMap: Record<string, string> = {},
  ): Promise<Array<{ id: string; fileName: string; url: string }>> {
    // Verify therapist application exists
    const application = await this.prisma.therapist.findUnique({
      where: { userId },
    });

    if (!application) {
      throw new NotFoundException('Therapist application not found');
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(
      process.cwd(),
      'uploads',
      'therapist-documents',
    );
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uploadedFiles: Array<{ id: string; fileName: string; url: string }> =
      [];

    for (const file of files) {
      try {
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadsDir, fileName);

        // Save file to disk
        fs.writeFileSync(filePath, file.buffer);

        // Create file record using modern File system
        const fileRecord = await this.prisma.file.create({
          data: {
            filename: file.originalname,
            displayName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            storagePath: `uploads/therapist-documents/${fileName}`,
            uploadedBy: userId,
            status: FileStatus.UPLOADED,
          },
        });

        // Determine the purpose based on file type mapping
        const fileType = fileTypeMap[file.originalname] || 'document';
        const purpose = this.mapFileTypeToPurpose(fileType);

        // Attach file to therapist application
        await this.prisma.fileAttachment.create({
          data: {
            fileId: fileRecord.id,
            entityType: AttachmentEntityType.THERAPIST_APPLICATION,
            entityId: userId,
            purpose: purpose,
          },
        });

        uploadedFiles.push({
          id: fileRecord.id,
          fileName: file.originalname,
          url: `/api/files/serve/${fileRecord.id}`, // Use protected endpoint
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        // Continue with other files even if one fails
      }
    }

    return uploadedFiles;
  }

  async getApplicationFiles(applicationId: string) {
    const attachments = await this.prisma.fileAttachment.findMany({
      where: {
        entityType: AttachmentEntityType.THERAPIST_APPLICATION,
        entityId: applicationId,
      },
      include: {
        file: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return attachments.map((attachment) => ({
      id: attachment.file.id,
      fileName: attachment.file.filename,
      fileUrl: `/api/files/serve/${attachment.file.id}`, // Use protected endpoint
      uploadedAt: attachment.file.createdAt.toISOString(),
    }));
  }

  private mapFileTypeToPurpose(fileType: string): AttachmentPurpose {
    const typeMapping: Record<string, AttachmentPurpose> = {
      license: AttachmentPurpose.LICENSE,
      certificate: AttachmentPurpose.CERTIFICATE,
      certification: AttachmentPurpose.CERTIFICATE,
      resume: AttachmentPurpose.DOCUMENT,
      cv: AttachmentPurpose.DOCUMENT,
      transcript: AttachmentPurpose.DOCUMENT,
      diploma: AttachmentPurpose.CERTIFICATE,
      degree: AttachmentPurpose.CERTIFICATE,
    };

    return typeMapping[fileType.toLowerCase()] || AttachmentPurpose.DOCUMENT;
  }

  async createApplicationWithDocuments(
    applicationData: TherapistApplicationDto,
    files: Express.Multer.File[],
    fileTypeMap: Record<string, string> = {},
  ): Promise<{
    application: any;
    uploadedFiles: Array<{ id: string; fileName: string; url: string }>;
  }> {
    // Use database transaction to ensure atomicity
    return await this.prisma.$transaction(async (prisma) => {
      // Check if user already has an application
      const existingApplication = await prisma.therapist.findUnique({
        where: { userId: applicationData.userId },
      });

      if (existingApplication) {
        throw new BadRequestException('User already has a therapist application');
      }

      // For public applications (temporary user IDs), skip user existence check
      const isPublicApplication = applicationData.userId.startsWith('temp_');

      if (!isPublicApplication) {
        // Check if user exists for authenticated applications
        const user = await prisma.user.findUnique({
          where: { id: applicationData.userId },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }
      } else {
        // For public applications, check if someone with this email already applied
        const existingByEmail = await prisma.therapist.findFirst({
          where: {
            OR: [
              { user: { email: applicationData.email } },
              // Also check temp user IDs with this email pattern
              {
                userId: { contains: applicationData.email.replace('@', '_at_') },
              },
            ],
          },
        });

        if (existingByEmail) {
          throw new BadRequestException(
            'An application with this email already exists',
          );
        }
      }

      // Process the application data
      const convertedData = {
        ...applicationData,
        practiceStartDate: new Date(applicationData.practiceStartDate),
        // Handle expiration date
        expirationDateOfLicense: applicationData.expirationDateOfLicense
          ? new Date(applicationData.expirationDateOfLicense)
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default to 1 year from now
        // Set default values for required fields
        licenseVerified: false,
        acceptsInsurance: false,
        hourlyRate: applicationData.hourlyRate || 0,
      };

      // For public applications, create the user record first
      if (isPublicApplication) {
        await prisma.user.create({
          data: {
            id: convertedData.userId,
            email: convertedData.email,
            firstName: convertedData.firstName,
            lastName: convertedData.lastName,
            role: 'client', // Temporary role until approved
            isActive: false, // Inactive until approved
          },
        });
      }

      // Create the therapist application
      const application = await prisma.therapist.create({
        data: {
          userId: convertedData.userId,
          mobile: convertedData.mobile,
          province: convertedData.province,
          providerType: convertedData.providerType,
          professionalLicenseType: convertedData.professionalLicenseType,
          isPRCLicensed: convertedData.isPRCLicensed,
          prcLicenseNumber: convertedData.prcLicenseNumber || '',
          practiceStartDate: convertedData.practiceStartDate,
          areasOfExpertise: convertedData.areasOfExpertise,
          assessmentTools: convertedData.assessmentTools,
          therapeuticApproachesUsedList:
            convertedData.therapeuticApproachesUsedList,
          languagesOffered: convertedData.languagesOffered,
          providedOnlineTherapyBefore:
            convertedData.providedOnlineTherapyBefore,
          comfortableUsingVideoConferencing:
            convertedData.comfortableUsingVideoConferencing,
          privateConfidentialSpace: convertedData.privateConfidentialSpace
            ? 'yes'
            : 'no',
          compliesWithDataPrivacyAct: convertedData.compliesWithDataPrivacyAct,
          professionalLiabilityInsurance:
            convertedData.professionalLiabilityInsurance,
          complaintsOrDisciplinaryActions:
            convertedData.complaintsOrDisciplinaryActions,
          willingToAbideByPlatformGuidelines:
            convertedData.willingToAbideByPlatformGuidelines,
          sessionLength: convertedData.preferredSessionLength,
          hourlyRate: convertedData.hourlyRate,
          status: 'pending',
          submissionDate: new Date(),
          processingDate: new Date(),
          expirationDateOfLicense: convertedData.expirationDateOfLicense,
          licenseVerified: convertedData.licenseVerified,
          acceptsInsurance: convertedData.acceptsInsurance,
          acceptedInsuranceTypes: [],
          specialCertifications: [],
          expertise: convertedData.areasOfExpertise,
          approaches: convertedData.therapeuticApproachesUsedList,
          languages: convertedData.languagesOffered,
          illnessSpecializations: [],
          acceptTypes: convertedData.accepts || [],
          treatmentSuccessRates: {},
          preferredSessionLength: [30, 45, 60], // Default session lengths
        },
        include: {
          user: true,
        },
      });

      // Process and upload documents if provided
      let uploadedFiles: Array<{ id: string; fileName: string; url: string }> = [];
      
      if (files && files.length > 0) {
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(
          process.cwd(),
          'uploads',
          'therapist-documents',
        );
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        for (const file of files) {
          try {
            const fileName = `${Date.now()}-${file.originalname}`;
            const filePath = path.join(uploadsDir, fileName);

            // Save file to disk
            fs.writeFileSync(filePath, file.buffer);

            // Create file record using modern File system
            const fileRecord = await prisma.file.create({
              data: {
                filename: file.originalname,
                displayName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                storagePath: `uploads/therapist-documents/${fileName}`,
                uploadedBy: application.userId,
                status: FileStatus.UPLOADED,
              },
            });

            // Determine the purpose based on file type mapping
            const fileType = fileTypeMap[file.originalname] || 'document';
            const purpose = this.mapFileTypeToPurpose(fileType);

            // Attach file to therapist application
            await prisma.fileAttachment.create({
              data: {
                fileId: fileRecord.id,
                entityType: AttachmentEntityType.THERAPIST_APPLICATION,
                entityId: application.userId,
                purpose: purpose,
              },
            });

            uploadedFiles.push({
              id: fileRecord.id,
              fileName: file.originalname,
              url: `/api/files/serve/${fileRecord.id}`, // Use protected endpoint
            });
          } catch (error) {
            console.error('Error uploading file:', error);
            // In a transaction, this will cause the entire operation to rollback
            throw new BadRequestException(`Failed to upload file: ${file.originalname}`);
          }
        }
      }

      return {
        application,
        uploadedFiles,
      };
    });
  }

  private generateTemporaryPassword(): string {
    const chars =
      'ABCDEFGHIJ KLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
