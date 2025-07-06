import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { CurrentUserRole } from '../decorators/current-user-role.decorator';
import { TherapistApplicationService } from './therapist-application.service';
import { TherapistApplicationDto } from './dto/therapist-application.dto';

export interface TherapistApplicationResponse {
  id: string;
  status: string;
  submissionDate: string;
  processingDate?: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  province: string;
  providerType: string;
  professionalLicenseType: string;
  isPRCLicensed: string;
  prcLicenseNumber: string;
  practiceStartDate: string;
  areasOfExpertise: string[];
  assessmentTools: string[];
  therapeuticApproachesUsedList: string[];
  languagesOffered: string[];
  providedOnlineTherapyBefore: string;
  comfortableUsingVideoConferencing: string;
  weeklyAvailability: string;
  preferredSessionLength: string;
  accepts: string[];
  bio?: string;
  hourlyRate?: number;
  files?: Array<{
    id: string;
    fileUrl: string;
    fileName: string;
    uploadedAt: string;
  }>;
}

export interface ApplicationStatusUpdateDto {
  status: 'approved' | 'rejected' | 'pending';
  adminNotes?: string;
  credentials?: {
    email: string;
    temporaryPassword: string;
  };
}

@Controller('therapist')
export class TherapistApplicationController {
  constructor(
    private readonly therapistApplicationService: TherapistApplicationService,
  ) {}

  @Post('apply-with-documents')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/jpg',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type'), false);
        }
      },
    }),
  )
  async applyWithDocuments(
    @Body('applicationDataJson') applicationDataJson: string,
    @Body('fileTypes') fileTypes: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{
    success: boolean;
    message: string;
    applicationId: string;
    uploadedFiles: Array<{ id: string; fileName: string; url: string }>;
  }> {
    try {
      // Debug logging for received data
      console.log('Raw form data received:', {
        applicationDataJsonType: typeof applicationDataJson,
        applicationDataJsonLength: applicationDataJson?.length,
        applicationDataJsonPreview: applicationDataJson?.substring(0, 100),
        fileTypesType: typeof fileTypes,
        fileTypesValue: fileTypes,
        filesCount: files?.length || 0,
        filesNames: files?.map((f) => f.originalname) || [],
      });

      // Parse application data from form
      let applicationData: TherapistApplicationDto;
      try {
        if (!applicationDataJson) {
          throw new BadRequestException(
            'Application data is missing. Please ensure the form is submitted correctly.',
          );
        }

        if (typeof applicationDataJson !== 'string') {
          console.error(
            'Expected string but received:',
            typeof applicationDataJson,
            applicationDataJson,
          );
          throw new BadRequestException(
            'Application data must be a JSON string.',
          );
        }

        applicationData = JSON.parse(applicationDataJson);
        console.log('Successfully parsed application data:', {
          firstName: applicationData.firstName,
          lastName: applicationData.lastName,
          email: applicationData.email,
          hasRequiredFields: !!(
            applicationData.firstName &&
            applicationData.lastName &&
            applicationData.email
          ),
        });
      } catch (error) {
        console.error('JSON parsing error:', error);
        console.error('Raw applicationDataJson:', applicationDataJson);
        throw new BadRequestException(
          'Invalid application data format. Please check that all form fields are filled correctly.',
        );
      }

      console.log('Received consolidated application with documents:', {
        firstName: applicationData.firstName,
        lastName: applicationData.lastName,
        email: applicationData.email,
        fileCount: files?.length || 0,
        fileNames: files?.map((f) => f.originalname) || [],
      });

      // For public applications, create a temporary user ID
      const tempUserId = `temp_${Date.now()}_${applicationData.email.replace('@', '_at_')}`;
      const applicationWithUserId = { ...applicationData, userId: tempUserId };

      // Parse file type mappings
      let fileTypeMap: Record<string, string> = {};
      if (fileTypes) {
        try {
          fileTypeMap = JSON.parse(fileTypes);
        } catch {
          console.warn('Invalid fileTypes JSON, proceeding without mapping');
        }
      }

      // Use consolidated service method to create application and upload documents in one transaction
      const result =
        await this.therapistApplicationService.createApplicationWithDocuments(
          applicationWithUserId,
          files || [],
          fileTypeMap,
        );

      return {
        success: true,
        message: 'Application submitted successfully with documents',
        applicationId: result.application.userId,
        uploadedFiles: result.uploadedFiles,
      };
    } catch (error) {
      console.error('Error submitting application with documents:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      // Enhanced error handling with specific error types
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('email already exists')) {
        throw new BadRequestException(
          'An application with this email address already exists. Please check your email or contact support.',
        );
      }

      if (errorMessage.includes('file upload')) {
        throw new BadRequestException(
          'One or more files failed to upload. Please check file formats and sizes.',
        );
      }

      if (errorMessage.includes('validation')) {
        throw new BadRequestException(
          'Application data validation failed. Please check all required fields.',
        );
      }

      throw new InternalServerErrorException(
        'Failed to submit application with documents. Please try again or contact support.',
      );
    }
  }

  // Deprecated: Use apply-with-documents endpoint instead for atomic submission

  // Deprecated: Use apply-with-documents endpoint instead for atomic submission

  @Get('application')
  @UseGuards(ClerkAuthGuard)
  async getAllApplications(
    @CurrentUserRole() role: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{
    applications: TherapistApplicationResponse[];
    totalCount: number;
    page: number;
    totalPages: number;
  }> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    try {
      const pageNum = page ? Math.max(1, page) : 1;
      const limitNum = limit ? Math.min(Math.max(1, limit), 100) : 10;

      const result = await this.therapistApplicationService.getAllApplications({
        status,
        page: pageNum,
        limit: limitNum,
      });

      return result;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw new InternalServerErrorException('Failed to fetch applications');
    }
  }

  @Get('application/:id')
  @UseGuards(ClerkAuthGuard)
  async getApplicationById(
    @CurrentUserRole() role: string,
    @Param('id') id: string,
  ): Promise<TherapistApplicationResponse> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    try {
      const application =
        await this.therapistApplicationService.getApplicationById(id);

      if (!application) {
        throw new NotFoundException('Application not found');
      }

      return application;
    } catch (error) {
      console.error('Error fetching application:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch application');
    }
  }

  @Put('application/:id/status')
  @UseGuards(ClerkAuthGuard)
  async updateApplicationStatus(
    @CurrentUserRole() role: string,
    @Param('id') id: string,
    @Body() updateData: ApplicationStatusUpdateDto,
  ): Promise<{
    success: boolean;
    message: string;
    credentials?: { email: string; password: string };
  }> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    try {
      const result =
        await this.therapistApplicationService.updateApplicationStatus(
          id,
          updateData,
        );

      return result;
    } catch (error) {
      console.error('Error updating application status:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update application status',
      );
    }
  }

  // Deprecated: Use apply-with-documents endpoint instead for atomic submission with documents

  // Deprecated: Use apply-with-documents endpoint instead for atomic submission with documents

  @Get('application/:id/files')
  @UseGuards(ClerkAuthGuard)
  async getApplicationFiles(
    @CurrentUserRole() role: string,
    @Param('id') applicationId: string,
  ): Promise<
    Array<{
      id: string;
      fileName: string;
      fileUrl: string;
      uploadedAt: string;
    }>
  > {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    try {
      const files =
        await this.therapistApplicationService.getApplicationFiles(
          applicationId,
        );
      return files;
    } catch (error) {
      console.error('Error fetching application files:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch application files',
      );
    }
  }
}
