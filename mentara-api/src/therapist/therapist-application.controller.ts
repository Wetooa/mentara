import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpException,
  HttpStatus,
  Query,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from 'src/clerk-auth.guard';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { TherapistApplicationService } from './therapist-application.service';
import { TherapistApplication, Prisma } from '@prisma/client';

@Controller('therapist/application')
@UseGuards(ClerkAuthGuard)
export class TherapistApplicationController {
  constructor(
    private readonly therapistApplicationService: TherapistApplicationService,
  ) {}

  @Get()
  async findAll(
    @CurrentUserId() clerkId: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{
    applications: TherapistApplication[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    try {
      // Check if user is admin
      if (
        !clerkId ||
        !(await this.therapistApplicationService.isUserAdmin(clerkId))
      ) {
        throw new ForbiddenException('Unauthorized: Admin access required');
      }

      const take = limit ? parseInt(limit) : 100;
      const skip = offset ? parseInt(offset) : 0;

      const { applications, total } =
        await this.therapistApplicationService.findAll({
          status,
          skip,
          take,
        });

      return {
        applications,
        pagination: {
          total,
          limit: take,
          offset: skip,
        },
      };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch applications: ${error.message}`,
        error instanceof ForbiddenException
          ? HttpStatus.FORBIDDEN
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TherapistApplication> {
    try {
      const application = await this.therapistApplicationService.findOne(id);
      if (!application) {
        throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
      }
      return application;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch application: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(
    @CurrentUserId() clerkId: string,
    @Body() applicationData: any,
  ): Promise<{ success: boolean; message: string; applicationId: string }> {
    try {
      // Validate the application data
      if (
        !applicationData.firstName ||
        !applicationData.lastName ||
        !applicationData.email
      ) {
        throw new HttpException(
          'Missing required fields',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Prepare data for database insertion
      const sanitizedData: Prisma.TherapistApplicationCreateInput = {
        clerkUserId: clerkId,
        status: 'pending',

        // Personal Info
        firstName: String(applicationData.firstName || ''),
        lastName: String(applicationData.lastName || ''),
        email: String(applicationData.email || ''),
        mobile: String(applicationData.mobile || ''),
        province: String(applicationData.province || ''),

        // Professional Info
        providerType: String(applicationData.providerType || ''),
        professionalLicenseType: String(
          applicationData.professionalLicenseType || '',
        ),
        isPRCLicensed: String(applicationData.isPRCLicensed || 'no'),
        prcLicenseNumber: String(applicationData.prcLicenseNumber || ''),
        expirationDateOfLicense: applicationData.expirationDateOfLicense
          ? new Date(applicationData.expirationDateOfLicense)
          : null,
        isLicenseActive: String(applicationData.isLicenseActive || 'no'),
        yearsOfExperience: String(applicationData.yearsOfExperience || ''),
        areasOfExpertise: applicationData.areasOfExpertise || {},
        assessmentTools: applicationData.assessmentTools || {},
        therapeuticApproachesUsedList:
          applicationData.therapeuticApproachesUsedList || {},
        languagesOffered: applicationData.languagesOffered || {},

        // Practice Details
        providedOnlineTherapyBefore: String(
          applicationData.providedOnlineTherapyBefore || 'no',
        ),
        comfortableUsingVideoConferencing: String(
          applicationData.comfortableUsingVideoConferencing || 'no',
        ),
        weeklyAvailability: String(applicationData.weeklyAvailability || ''),
        preferredSessionLength: String(
          applicationData.preferredSessionLength || '',
        ),
        accepts: applicationData.accepts || {},

        // Compliance
        privateConfidentialSpace: String(
          applicationData.privateConfidentialSpace || 'no',
        ),
        compliesWithDataPrivacyAct: String(
          applicationData.compliesWithDataPrivacyAct || 'no',
        ),
        professionalLiabilityInsurance: String(
          applicationData.professionalLiabilityInsurance || 'no',
        ),
        complaintsOrDisciplinaryActions: String(
          applicationData.complaintsOrDisciplinaryActions || 'no',
        ),
        willingToAbideByPlatformGuidelines: String(
          applicationData.willingToAbideByPlatformGuidelines || 'no',
        ),

        // Documents
        uploadedDocuments: applicationData.uploadedDocuments || {},

        // Store the complete application data
        applicationData: applicationData,
      };

      const application =
        await this.therapistApplicationService.create(sanitizedData);

      return {
        success: true,
        message: 'Application submitted successfully',
        applicationId: application.id,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to submit application: ${error.message}`,
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
    @Body() applicationData: Prisma.TherapistApplicationUpdateInput,
  ): Promise<TherapistApplication> {
    try {
      return await this.therapistApplicationService.update(id, applicationData);
    } catch (error) {
      throw new HttpException(
        `Failed to update application: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
  ): Promise<TherapistApplication> {
    try {
      return await this.therapistApplicationService.remove(id);
    } catch (error) {
      throw new HttpException(
        `Failed to delete application: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
