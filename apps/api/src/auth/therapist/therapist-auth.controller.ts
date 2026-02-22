import {
  Body,
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../core/guards/jwt-auth.guard';
import { CurrentUserId } from '../core/decorators/current-user-id.decorator';
import { Public } from '../core/decorators/public.decorator';
// Import types from local auth types
import type { RegisterTherapistDto } from '../types';

// Import constants from local auth constants
import { ALLOWED_DOCUMENT_MIME_TYPES } from '../types';
import { TherapistAuthService } from './therapist-auth.service';
import { SupabaseStorageService } from '../../common/services/supabase-storage.service';

@Controller('auth/therapist')
export class TherapistAuthController {
  private readonly logger = new Logger(TherapistAuthController.name);

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
    therapistId?: string;
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
        this.logger.error('JSON parsing error:', error);
        this.logger.error('Raw applicationDataJson:', applicationDataJson);
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
          this.logger.debug('DEBUG: fileTypes received:', fileTypes);
          this.logger.debug('DEBUG: parsed fileTypeMap:', fileTypeMap);
        } catch {
          this.logger.warn(
            'Invalid fileTypes JSON, proceeding without mapping',
          );
        }
      }

      // Validate that all required document types are present
      const uploadedDocTypes = Object.values(fileTypeMap);
      this.logger.debug(
        'DEBUG: uploadedDocTypes from fileTypeMap:',
        uploadedDocTypes,
      );
      this.logger.debug('DEBUG: requiredDocs expected:', requiredDocs);
      this.logger.debug('DEBUG: files received count:', files?.length ?? 0);
      this.logger.debug(
        'DEBUG: files details:',
        files?.map((f) => ({ name: f.originalname, mimetype: f.mimetype })),
      );

      const missingDocs = requiredDocs.filter(
        (doc) => !uploadedDocTypes.includes(doc),
      );
      this.logger.debug('DEBUG: missingDocs calculated:', missingDocs);

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
      this.logger.log(
        'DEBUG: About to call registerTherapistWithDocuments with data:',
        {
          email: registerData.email,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          filesCount: files?.length ?? 0,
          fileTypeMapKeys: Object.keys(fileTypeMap),
        },
      );

      const result =
        await this.therapistAuthService.registerTherapistWithDocuments(
          registerData,
          files || [],
          fileTypeMap,
        );

      this.logger.log(
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
        therapistId: result.therapist?.userId,
        uploadedFiles: result.uploadedFiles,
      };
    } catch (error) {
      this.logger.error('Error registering therapist with documents:', error);

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

  // REMOVED: Duplicate login route - use universal /auth/login instead
  // This was redundant with AuthController.login() which handles all roles

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUserId() userId: string) {
    return this.therapistAuthService.getTherapistProfile(userId);
  }
}
