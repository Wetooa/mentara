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
  RegisterTherapistWithDocumentsRequestSchema,
  ALLOWED_DOCUMENT_MIME_TYPES,
  type RegisterTherapistDto,
  type LoginDto,
  type TherapistApplicationCreateDto,
  type RegisterTherapistWithDocumentsRequest,
} from 'mentara-commons';
import { TherapistAuthService } from '../services/therapist-auth.service';
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
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
      fileFilter: (req, file, callback) => {
        if (ALLOWED_DOCUMENT_MIME_TYPES.includes(file.mimetype as any)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type'), false);
        }
      },
    }),
  )
  async register(
    @Body('applicationDataJson') applicationDataJson: string,
    @Body('fileTypes') fileTypes: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      emailVerified: boolean;
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    message: string;
    applicationId?: string;
    uploadedFiles?: Array<{ id: string; fileName: string; url: string }>;
  }> {
    try {
      // Parse and validate application data from form
      let registerData: RegisterTherapistDto;
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

        registerData = JSON.parse(applicationDataJson);
      } catch (error) {
        console.error('JSON parsing error:', error);
        console.error('Raw applicationDataJson:', applicationDataJson);
        throw new BadRequestException(
          'Invalid application data format. Please check that all form fields are filled correctly.',
        );
      }

      // Validate required documents are present
      const requiredDocs = ['prcLicense', 'nbiClearance', 'resumeCV'];
      const hasFiles = files && files.length > 0;

      if (!hasFiles) {
        throw new BadRequestException(
          'Required documents must be uploaded: PRC License, NBI Clearance, Resume/CV',
        );
      }

      // Parse file type mappings
      let fileTypeMap: Record<string, string> = {};
      if (fileTypes) {
        try {
          fileTypeMap = JSON.parse(fileTypes);
          console.log('DEBUG: fileTypes received:', fileTypes);
          console.log('DEBUG: parsed fileTypeMap:', fileTypeMap);
        } catch {
          console.warn('Invalid fileTypes JSON, proceeding without mapping');
        }
      }

      // Validate that all required document types are present
      const uploadedDocTypes = Object.values(fileTypeMap);
      console.log(
        'DEBUG: uploadedDocTypes from fileTypeMap:',
        uploadedDocTypes,
      );
      console.log('DEBUG: requiredDocs expected:', requiredDocs);
      console.log('DEBUG: files received count:', files?.length || 0);
      console.log(
        'DEBUG: files details:',
        files?.map((f) => ({ name: f.originalname, mimetype: f.mimetype })),
      );

      const missingDocs = requiredDocs.filter(
        (doc) => !uploadedDocTypes.includes(doc),
      );
      console.log('DEBUG: missingDocs calculated:', missingDocs);

      if (missingDocs.length > 0) {
        const missingNames = missingDocs
          .map((doc) => {
            const docNames = {
              prcLicense: 'PRC License',
              nbiClearance: 'NBI Clearance',
              resumeCV: 'Resume/CV',
            };
            return docNames[doc as keyof typeof docNames];
          })
          .join(', ');

        throw new BadRequestException(
          `Missing required documents: ${missingNames}`,
        );
      }

      // Create unified therapist registration with documents
      console.log(
        'DEBUG: About to call registerTherapistWithDocuments with data:',
        {
          email: registerData.email,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          filesCount: files?.length || 0,
          fileTypeMapKeys: Object.keys(fileTypeMap),
        },
      );

      const result =
        await this.therapistAuthService.registerTherapistWithDocuments(
          registerData,
          files || [],
          fileTypeMap,
        );

      console.log(
        'DEBUG: registerTherapistWithDocuments completed successfully',
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
        applicationId: result.applicationId,
        uploadedFiles: result.uploadedFiles,
      };
    } catch (error) {
      console.error('Error registering therapist with documents:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      // Enhanced error handling with specific error types
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Enhanced error handling for user registration scenarios
      if (errorMessage.includes('already have a therapist account')) {
        throw new BadRequestException(
          'You already have a therapist account with this email. Please sign in to your existing account instead.',
        );
      }

      if (errorMessage.includes('email already exists')) {
        throw new BadRequestException(
          'An account with this email address already exists. Please use a different email or try logging in.',
        );
      }

      if (errorMessage.includes('privileges. Please contact support')) {
        throw new BadRequestException(errorMessage);
      }

      if (errorMessage.includes('file upload')) {
        throw new BadRequestException(
          'One or more files failed to upload. Please check file formats and sizes.',
        );
      }

      if (errorMessage.includes('validation')) {
        throw new BadRequestException(
          'Registration data validation failed. Please check all required fields.',
        );
      }

      throw new InternalServerErrorException(
        'Failed to register therapist with documents. Please try again or contact support.',
      );
    }
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
