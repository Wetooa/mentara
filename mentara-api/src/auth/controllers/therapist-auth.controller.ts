import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { CurrentUserRole } from '../decorators/current-user-role.decorator';
import { Public } from '../decorators/public.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ValidatedBody } from '../../common/decorators/validate-body.decorator';
import {
  RegisterTherapistDtoSchema,
  LoginDtoSchema,
  TherapistApplicationCreateDtoSchema,
  type RegisterTherapistDto,
  type LoginDto,
  type TherapistApplicationCreateDto,
} from 'mentara-commons';
import { TherapistAuthService } from '../../services/auth/therapist-auth.service';
import { SupabaseStorageService } from '../../common/services/supabase-storage.service';
import { Request } from 'express';

import {
  TherapistApplicationResponse,
  ApplicationStatusUpdateDto,
} from '../../therapist/interfaces/therapist-application.interfaces';

@Controller('auth/therapist')
export class TherapistAuthController {
  constructor(
    private readonly therapistAuthService: TherapistAuthService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 3, ttl: 600000 } }) // 3 therapist registrations per 10 minutes
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(RegisterTherapistDtoSchema))
    registerDto: RegisterTherapistDto,
  ) {
    const result = await this.therapistAuthService.registerTherapist(
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
    );

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        emailVerified: result.user.emailVerified,
      },
      accessToken: result.token,
      refreshToken: result.token, // Same token for compatibility
      expiresIn: 0, // Non-expiring
      message: result.message,
    };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 300000 } }) // 10 login attempts per 5 minutes
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginDtoSchema)) loginDto: LoginDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const result = await this.therapistAuthService.loginTherapist(
      loginDto.email,
      loginDto.password,
      ipAddress,
      userAgent,
    );

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        emailVerified: result.user.emailVerified,
      },
      accessToken: result.token,
      refreshToken: result.token, // Same token for compatibility
      expiresIn: 0, // Non-expiring
    };
  }

  @Public()
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
      // Parse application data from form
      let applicationData: TherapistApplicationCreateDto;
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
      } catch (error) {
        console.error('JSON parsing error:', error);
        console.error('Raw applicationDataJson:', applicationDataJson);
        throw new BadRequestException(
          'Invalid application data format. Please check that all form fields are filled correctly.',
        );
      }

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
        await this.therapistAuthService.createApplicationWithDocuments(
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

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUserId() userId: string) {
    return this.therapistAuthService.getTherapistProfile(userId);
  }

  // Admin-only endpoints for managing therapist applications
  @Get('applications')
  @UseGuards(JwtAuthGuard)
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

      const result = await this.therapistAuthService.getAllApplications({
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

  @Get('applications/:id')
  @UseGuards(JwtAuthGuard)
  async getApplicationById(
    @CurrentUserRole() role: string,
    @Param('id') id: string,
  ): Promise<TherapistApplicationResponse> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    try {
      const application =
        await this.therapistAuthService.getApplicationById(id);

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

  @Put('applications/:id/status')
  @UseGuards(JwtAuthGuard)
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
      const result = await this.therapistAuthService.updateApplicationStatus(
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

  @Get('applications/:id/files')
  @UseGuards(JwtAuthGuard)
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
        await this.therapistAuthService.getApplicationFiles(applicationId);
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
