import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { TherapistApplicationDto } from './therapist-application.dto';
import { ApplicationStatusUpdateDto, TherapistApplicationResponse } from './therapist-application.controller';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TherapistApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async createApplication(applicationData: TherapistApplicationDto) {
    // Check if user already has an application
    const existingApplication = await this.prisma.therapist.findUnique({
      where: { userId: applicationData.userId },
    });

    if (existingApplication) {
      throw new BadRequestException('User already has a therapist application');
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: applicationData.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Convert string boolean values to actual booleans
    const convertedData = {
      ...applicationData,
      providedOnlineTherapyBefore: applicationData.providedOnlineTherapyBefore === 'true' || applicationData.providedOnlineTherapyBefore === 'yes',
      comfortableUsingVideoConferencing: applicationData.comfortableUsingVideoConferencing === 'true' || applicationData.comfortableUsingVideoConferencing === 'yes',
      practiceStartDate: new Date(applicationData.practiceStartDate),
      // Set default values for required fields
      expirationDateOfLicense: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default to 1 year from now
      licenseVerified: false,
      compliesWithDataPrivacyAct: true,
      willingToAbideByPlatformGuidelines: true,
      acceptsInsurance: false,
      hourlyRate: applicationData.hourlyRate || 0,
    };

    try {
      const application = await this.prisma.therapist.create({
        data: {
          userId: convertedData.userId,
          mobile: convertedData.mobile,
          province: convertedData.province,
          providerType: convertedData.providerType,
          professionalLicenseType: convertedData.professionalLicenseType,
          isPRCLicensed: convertedData.isPRCLicensed,
          prcLicenseNumber: convertedData.prcLicenseNumber,
          practiceStartDate: convertedData.practiceStartDate,
          areasOfExpertise: convertedData.areasOfExpertise,
          assessmentTools: convertedData.assessmentTools,
          therapeuticApproachesUsedList: convertedData.therapeuticApproachesUsedList,
          languagesOffered: convertedData.languagesOffered,
          providedOnlineTherapyBefore: convertedData.providedOnlineTherapyBefore,
          comfortableUsingVideoConferencing: convertedData.comfortableUsingVideoConferencing,
          sessionLength: convertedData.preferredSessionLength,
          hourlyRate: convertedData.hourlyRate,
          status: 'pending',
          submissionDate: new Date(),
          processingDate: new Date(),
          expirationDateOfLicense: convertedData.expirationDateOfLicense,
          licenseVerified: convertedData.licenseVerified,
          compliesWithDataPrivacyAct: convertedData.compliesWithDataPrivacyAct,
          willingToAbideByPlatformGuidelines: convertedData.willingToAbideByPlatformGuidelines,
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
          therapistFiles: true,
        },
        skip,
        take: limit,
        orderBy: { submissionDate: 'desc' },
      }),
      this.prisma.therapist.count({ where: whereClause }),
    ]);

    const transformedApplications: TherapistApplicationResponse[] = applications.map(app => ({
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
      providedOnlineTherapyBefore: app.providedOnlineTherapyBefore ? 'yes' : 'no',
      comfortableUsingVideoConferencing: app.comfortableUsingVideoConferencing ? 'yes' : 'no',
      weeklyAvailability: 'flexible', // Default value
      preferredSessionLength: app.sessionLength,
      accepts: app.acceptTypes,
      bio: app.educationBackground || undefined,
      hourlyRate: app.hourlyRate ? Number(app.hourlyRate) : undefined,
      files: app.therapistFiles.map(file => ({
        id: file.id,
        fileUrl: file.fileUrl,
        fileName: path.basename(file.fileUrl),
        uploadedAt: file.createdAt.toISOString(),
      })),
    }));

    return {
      applications: transformedApplications,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async getApplicationById(id: string): Promise<TherapistApplicationResponse | null> {
    const application = await this.prisma.therapist.findUnique({
      where: { userId: id },
      include: {
        user: true,
        therapistFiles: true,
      },
    });

    if (!application) {
      return null;
    }

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
      providedOnlineTherapyBefore: application.providedOnlineTherapyBefore ? 'yes' : 'no',
      comfortableUsingVideoConferencing: application.comfortableUsingVideoConferencing ? 'yes' : 'no',
      weeklyAvailability: 'flexible',
      preferredSessionLength: application.sessionLength,
      accepts: application.acceptTypes,
      bio: application.educationBackground || undefined,
      hourlyRate: application.hourlyRate ? Number(application.hourlyRate) : undefined,
      files: application.therapistFiles.map(file => ({
        id: file.id,
        fileUrl: file.fileUrl,
        fileName: path.basename(file.fileUrl),
        uploadedAt: file.createdAt.toISOString(),
      })),
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

      // If approved, handle Clerk account creation (placeholder for now)
      if (updateData.status === 'approved') {
        // TODO: Implement Clerk account creation here
        // For now, we'll return placeholder credentials
        const temporaryPassword = this.generateTemporaryPassword();
        
        result = {
          ...result,
          message: 'Application approved successfully. Therapist account credentials generated.',
          credentials: {
            email: application.user.email,
            password: temporaryPassword,
          },
        };
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
    const uploadsDir = path.join(process.cwd(), 'uploads', 'therapist-documents');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uploadedFiles: Array<{ id: string; fileName: string; url: string }> = [];

    for (const file of files) {
      try {
        const fileId = uuidv4();
        const fileExtension = path.extname(file.originalname);
        const fileName = `${fileId}${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);

        // Save file to disk
        fs.writeFileSync(filePath, file.buffer);

        // Generate file URL (adjust based on your server setup)
        const fileUrl = `/uploads/therapist-documents/${fileName}`;

        // Save file record to database
        const fileRecord = await this.prisma.therapistFiles.create({
          data: {
            id: fileId,
            therapistId: userId,
            fileUrl,
          },
        });

        uploadedFiles.push({
          id: fileRecord.id,
          fileName: file.originalname,
          url: fileRecord.fileUrl,
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        // Continue with other files even if one fails
      }
    }

    return uploadedFiles;
  }

  async getApplicationFiles(applicationId: string) {
    const files = await this.prisma.therapistFiles.findMany({
      where: { therapistId: applicationId },
      orderBy: { createdAt: 'desc' },
    });

    return files.map(file => ({
      id: file.id,
      fileName: path.basename(file.fileUrl),
      fileUrl: file.fileUrl,
      uploadedAt: file.createdAt.toISOString(),
    }));
  }

  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}