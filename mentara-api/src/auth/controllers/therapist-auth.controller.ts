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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiTooManyRequestsResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiConsumes,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
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
import { TherapistAuthService } from '../services/therapist-auth.service';
import { SupabaseStorageService } from '../../common/services/supabase-storage.service';
import { Request } from 'express';

import {
  TherapistApplicationResponse,
  ApplicationStatusUpdateDto,
} from '../../therapist/interfaces/therapist-application.interfaces';

@ApiTags('therapist-auth')
@ApiBearerAuth('JWT-auth')
@Controller('auth/therapist')
export class TherapistAuthController {
  constructor(
    private readonly therapistAuthService: TherapistAuthService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  @Public()
  @ApiOperation({
    summary: 'Register new therapist account',
    description:
      'Create a new therapist account. Initial registration before application approval.',
  })
  @ApiBody({
    type: 'object',
    description: 'Therapist registration data',
    schema: {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'therapist@example.com',
        },
        password: { type: 'string', minLength: 8, example: 'SecurePass123!' },
        firstName: { type: 'string', example: 'Dr. Sarah' },
        lastName: { type: 'string', example: 'Johnson' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Therapist account created successfully',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string' },
            emailVerified: { type: 'boolean' },
          },
        },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid registration data or email already exists',
  })
  @ApiTooManyRequestsResponse({ description: 'Too many registration attempts' })
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
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      expiresIn: result.tokens.expiresIn,
      message: result.message,
    };
  }

  @Public()
  @ApiOperation({
    summary: 'Therapist login',
    description: 'Authenticate therapist user and return access tokens',
  })
  @ApiBody({
    type: 'object',
    description: 'Therapist login credentials',
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'therapist@example.com',
        },
        password: { type: 'string', example: 'SecurePass123!' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string' },
            emailVerified: { type: 'boolean' },
          },
        },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiTooManyRequestsResponse({ description: 'Too many login attempts' })
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
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      expiresIn: result.tokens.expiresIn,
    };
  }

  @Public()
  @ApiOperation({
    summary: 'Submit therapist application with documents',
    description:
      'Submit a complete therapist application including required documents and certifications. Supports multiple file uploads.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Therapist application with supporting documents',
    schema: {
      type: 'object',
      properties: {
        applicationDataJson: {
          type: 'string',
          description: 'JSON string containing application data',
          example: JSON.stringify({
            email: 'therapist@example.com',
            firstName: 'Dr. Sarah',
            lastName: 'Johnson',
            licenseNumber: 'LIC123456',
            specializations: ['anxiety', 'depression'],
            education: 'PhD in Psychology',
            experience: '5 years',
          }),
        },
        fileTypes: {
          type: 'string',
          description: 'JSON string mapping file indices to types',
          example: JSON.stringify({ '0': 'license', '1': 'diploma' }),
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Supporting documents (PDF, DOC, DOCX, JPG, PNG)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        applicationId: { type: 'string' },
        uploadedFiles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              fileName: { type: 'string' },
              url: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid application data or file format',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to process application',
  })
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
  @ApiOperation({
    summary: 'Get therapist profile',
    description:
      'Retrieve the authenticated therapist user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'Therapist profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        role: { type: 'string' },
        licenseNumber: { type: 'string' },
        specializations: { type: 'array', items: { type: 'string' } },
        approvalStatus: { type: 'string' },
        profileComplete: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing authentication token',
  })
  @Get('profile')
  async getProfile(@CurrentUserId() userId: string) {
    return this.therapistAuthService.getTherapistProfile(userId);
  }

  // Admin-only endpoints for managing therapist applications
  @Get('applications')
  @ApiOperation({
    summary: 'Get all therapist applications (Admin only)',
    description:
      'Retrieve all therapist applications with optional filtering and pagination. Admin access required.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by application status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Applications retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        applications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              status: { type: 'string' },
              submittedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        totalCount: { type: 'number' },
        page: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing authentication token',
  })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  @ApiInternalServerErrorResponse({
    description: 'Failed to fetch applications',
  })
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
  @ApiOperation({
    summary: 'Get therapist application by ID (Admin only)',
    description:
      'Retrieve detailed information about a specific therapist application. Admin access required.',
  })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        licenseNumber: { type: 'string' },
        specializations: { type: 'array', items: { type: 'string' } },
        education: { type: 'string' },
        experience: { type: 'string' },
        status: { type: 'string' },
        submittedAt: { type: 'string', format: 'date-time' },
        reviewedAt: { type: 'string', format: 'date-time', nullable: true },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing authentication token',
  })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  @ApiNotFoundResponse({ description: 'Application not found' })
  @ApiInternalServerErrorResponse({
    description: 'Failed to fetch application',
  })
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
  @ApiOperation({
    summary: 'Update therapist application status (Admin only)',
    description:
      'Update the status of a therapist application (approve, reject, etc.). Admin access required.',
  })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiBody({
    description: 'Status update data',
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: ['approved', 'rejected', 'pending'],
          example: 'approved',
        },
        notes: {
          type: 'string',
          description: 'Optional notes about the decision',
        },
        reviewerComments: {
          type: 'string',
          description: 'Comments from the reviewing admin',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Application status updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        credentials: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            password: { type: 'string' },
          },
          description: 'Generated credentials for approved applications',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing authentication token',
  })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  @ApiNotFoundResponse({ description: 'Application not found' })
  @ApiInternalServerErrorResponse({
    description: 'Failed to update application status',
  })
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
  @ApiOperation({
    summary: 'Get therapist application files (Admin only)',
    description:
      'Retrieve all uploaded files for a specific therapist application. Admin access required.',
  })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application files retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          fileName: { type: 'string' },
          fileUrl: { type: 'string' },
          uploadedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing authentication token',
  })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  @ApiNotFoundResponse({ description: 'Application or files not found' })
  @ApiInternalServerErrorResponse({
    description: 'Failed to fetch application files',
  })
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
