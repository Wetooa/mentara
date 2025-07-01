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
import { ClerkAuthGuard } from '../clerk-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { CurrentUserRole } from '../decorators/current-user-role.decorator';
import { TherapistApplicationService } from './therapist-application.service';
import { TherapistApplicationDto } from './therapist-application.dto';

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

  @Post('apply')
  async submitPublicApplication(
    @Body() applicationData: TherapistApplicationDto,
  ): Promise<{ 
    success: boolean; 
    message: string; 
    applicationId?: string; 
  }> {
    try {
      console.log('Received public therapist application:', {
        firstName: applicationData.firstName,
        lastName: applicationData.lastName,
        email: applicationData.email,
      });
      
      // For public applications, we need to create a temporary user ID or use email as identifier
      const tempUserId = `temp_${Date.now()}_${applicationData.email.replace('@', '_at_')}`;
      const applicationWithUserId = { ...applicationData, userId: tempUserId };
      
      const application = await this.therapistApplicationService.createApplication(
        applicationWithUserId,
      );

      return {
        success: true,
        message: 'Application submitted successfully',
        applicationId: application.userId,
      };
    } catch (error) {
      console.error('Error submitting therapist application:', error);
      throw new InternalServerErrorException('Failed to submit application');
    }
  }

  @Post('application')
  @UseGuards(ClerkAuthGuard)
  async submitApplication(
    @Body() applicationData: TherapistApplicationDto,
    @CurrentUserId() userId: string,
  ): Promise<{ 
    success: boolean; 
    message: string; 
    applicationId?: string; 
  }> {
    try {
      // Use the authenticated user's ID instead of from the body
      const applicationWithUserId = { ...applicationData, userId };
      
      const application = await this.therapistApplicationService.createApplication(
        applicationWithUserId,
      );

      return {
        success: true,
        message: 'Application submitted successfully',
        applicationId: application.userId,
      };
    } catch (error) {
      console.error('Error submitting therapist application:', error);
      throw new InternalServerErrorException('Failed to submit application');
    }
  }

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
      const application = await this.therapistApplicationService.getApplicationById(id);
      
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
      const result = await this.therapistApplicationService.updateApplicationStatus(
        id,
        updateData,
      );

      return result;
    } catch (error) {
      console.error('Error updating application status:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update application status');
    }
  }

  @Post('upload')
  @UseGuards(ClerkAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10, {
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
  }))
  async uploadDocuments(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUserId() userId: string,
    @Body('fileTypes') fileTypes: string, // JSON string of file type mappings
  ): Promise<{
    success: boolean;
    message: string;
    uploadedFiles: Array<{ id: string; fileName: string; url: string }>;
  }> {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('No files provided');
      }

      let fileTypeMap: Record<string, string> = {};
      if (fileTypes) {
        try {
          fileTypeMap = JSON.parse(fileTypes);
        } catch (error) {
          console.warn('Invalid fileTypes JSON, proceeding without mapping');
        }
      }

      const uploadedFiles = await this.therapistApplicationService.uploadDocuments(
        userId,
        files,
        fileTypeMap,
      );

      return {
        success: true,
        message: 'Files uploaded successfully',
        uploadedFiles,
      };
    } catch (error) {
      console.error('Error uploading documents:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload documents');
    }
  }

  @Get('application/:id/files')
  @UseGuards(ClerkAuthGuard)
  async getApplicationFiles(
    @CurrentUserRole() role: string,
    @Param('id') applicationId: string,
  ): Promise<Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  }>> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    try {
      const files = await this.therapistApplicationService.getApplicationFiles(applicationId);
      return files;
    } catch (error) {
      console.error('Error fetching application files:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch application files');
    }
  }
}