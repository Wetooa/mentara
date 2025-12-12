import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
// Removed import - using local types instead
interface TherapistResponse {
  id: string;
  firstName: string;
  lastName: string;
  specialties: string[];
  isActive: boolean;
}

interface ClientResponse {
  id: string;
  firstName: string;
  lastName: string;
}

interface TherapistUpdateDto {
  specialties?: string[];
  isActive?: boolean;
  mobile?: string;
  province?: string;
  hourlyRate?: Decimal | number;
  areasOfExpertise?: string[];
  languagesOffered?: string[];
  preferredSessionLength?: number[];
  // Allow any other properties
  [key: string]: unknown;
}

@Injectable()
export class TherapistManagementService {
  private readonly logger = new Logger(TherapistManagementService.name);

  constructor(private readonly prisma: PrismaService) {}

  private calculateYearsOfExperience(startDate: Date): number {
    const now = new Date();
    let years = now.getFullYear() - startDate.getFullYear();
    if (
      now.getMonth() < startDate.getMonth() ||
      (now.getMonth() === startDate.getMonth() &&
        now.getDate() < startDate.getDate())
    ) {
      years--;
    }
    return years;
  }

  async getTherapistProfile(userId: string): Promise<unknown> {
    try {
      const therapist = await this.prisma.therapist.findUniqueOrThrow({
        where: { userId },
        include: {
          user: true,
          therapistAvailabilities: true,
          worksheets: true,
          meetings: true,
          assignedClients: true,
        },
      });
      return {
        ...therapist,
        // Map database fields to frontend-expected fields
        specialties: therapist.areasOfExpertise || [],
        treatmentSuccessRates:
          (therapist.treatmentSuccessRates as Record<string, unknown>) || {},
        hourlyRate: therapist.hourlyRate,
      };
    } catch (error) {
      console.error(
        'Error retrieving therapist profile:',
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve therapist profile',
      );
    }
  }

  async updateTherapistProfile(
    userId: string,
    data: TherapistUpdateDto,
  ): Promise<unknown> {
    try {
      // Update therapist profile data
      const therapistData: Record<string, unknown> = {};
      if (data.mobile !== undefined) therapistData.mobile = data.mobile;
      if (data.province !== undefined) therapistData.province = data.province;
      if (data.providerType !== undefined)
        therapistData.providerType = data.providerType;
      if (data.professionalLicenseType !== undefined)
        therapistData.professionalLicenseType = data.professionalLicenseType;
      if (data.isPRCLicensed !== undefined)
        therapistData.isPRCLicensed = data.isPRCLicensed;
      if (data.prcLicenseNumber !== undefined)
        therapistData.prcLicenseNumber = data.prcLicenseNumber;
      if (data.expirationDateOfLicense !== undefined)
        therapistData.expirationDateOfLicense = data.expirationDateOfLicense;
      if (data.practiceStartDate !== undefined)
        therapistData.practiceStartDate = data.practiceStartDate;
      if (data.areasOfExpertise !== undefined)
        therapistData.areasOfExpertise = data.areasOfExpertise;
      if (data.assessmentTools !== undefined)
        therapistData.assessmentTools = data.assessmentTools;
      if (data.therapeuticApproachesUsedList !== undefined)
        therapistData.therapeuticApproachesUsedList =
          data.therapeuticApproachesUsedList;
      if (data.languagesOffered !== undefined)
        therapistData.languagesOffered = data.languagesOffered;
      if (data.providedOnlineTherapyBefore !== undefined)
        therapistData.providedOnlineTherapyBefore =
          data.providedOnlineTherapyBefore;
      if (data.comfortableUsingVideoConferencing !== undefined)
        therapistData.comfortableUsingVideoConferencing =
          data.comfortableUsingVideoConferencing;
      if (data.preferredSessionLength !== undefined)
        therapistData.preferredSessionLength = data.preferredSessionLength;
      if (data.privateConfidentialSpace !== undefined)
        therapistData.privateConfidentialSpace = data.privateConfidentialSpace;
      if (data.compliesWithDataPrivacyAct !== undefined)
        therapistData.compliesWithDataPrivacyAct =
          data.compliesWithDataPrivacyAct;
      if (data.professionalLiabilityInsurance !== undefined)
        therapistData.professionalLiabilityInsurance =
          data.professionalLiabilityInsurance;
      if (data.complaintsOrDisciplinaryActions !== undefined)
        therapistData.complaintsOrDisciplinaryActions =
          data.complaintsOrDisciplinaryActions;
      if (data.willingToAbideByPlatformGuidelines !== undefined)
        therapistData.willingToAbideByPlatformGuidelines =
          data.willingToAbideByPlatformGuidelines;
      if (data.expertise !== undefined)
        therapistData.expertise = data.expertise;
      if (data.approaches !== undefined)
        therapistData.approaches = data.approaches;
      if (data.languages !== undefined)
        therapistData.languages = data.languages;
      if (data.illnessSpecializations !== undefined)
        therapistData.illnessSpecializations = data.illnessSpecializations;
      if (data.acceptTypes !== undefined)
        therapistData.acceptTypes = data.acceptTypes;
      if (data.treatmentSuccessRates !== undefined)
        therapistData.treatmentSuccessRates = data.treatmentSuccessRates;
      if (data.sessionLength !== undefined)
        therapistData.sessionLength = data.sessionLength;
      if (data.hourlyRate !== undefined)
        therapistData.hourlyRate = new Decimal(data.hourlyRate);

      const updatedTherapist = await this.prisma.therapist.update({
        where: { userId },
        data: therapistData,
        include: {
          user: true,
        },
      });
      return {
        ...updatedTherapist,
        // Map database fields to frontend-expected fields
        specialties: updatedTherapist.areasOfExpertise || [],
        treatmentSuccessRates:
          (updatedTherapist.treatmentSuccessRates as Record<string, any>) || {},
        hourlyRate: updatedTherapist.hourlyRate,
      };
    } catch (error) {
      this.logger.error(
        `Error updating therapist profile for userId: ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Failed to update therapist profile',
      );
    }
  }

  async getAssignedPatients(therapistId: string): Promise<unknown[]> {
    try {
      const therapist = await this.prisma.therapist.findUniqueOrThrow({
        where: { userId: therapistId },
      });

      // Find all active clients assigned to this therapist
      const assignedClients = await this.prisma.clientTherapist.findMany({
        where: {
          therapistId: therapist.userId,
          status: 'active',
        },
        include: { client: { include: { user: true } } },
      });

      return assignedClients.map((ct) => ({
        ...ct.client,
        user: ct.client.user,
        relationshipId: ct.id,
        assignedAt: ct.assignedAt,
      }));
    } catch (error) {
      this.logger.error(
        `Error retrieving assigned patients for therapistId: ${therapistId}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Failed to retrieve assigned patients',
      );
    }
  }

  async getPendingRequests(therapistId: string): Promise<unknown[]> {
    try {
      const therapist = await this.prisma.therapist.findUniqueOrThrow({
        where: { userId: therapistId },
      });

      // Find all pending client requests for this therapist
      const pendingRequests = await this.prisma.clientTherapist.findMany({
        where: {
          therapistId: therapist.userId,
          status: 'inactive',
        },
        include: { client: { include: { user: true } } },
        orderBy: { assignedAt: 'desc' },
      });

      return pendingRequests.map((ct) => ({
        ...ct.client,
        user: ct.client.user,
        relationshipId: ct.id,
        requestedAt: ct.assignedAt,
      }));
    } catch (error) {
      this.logger.error(
        `Error retrieving pending requests for therapistId: ${therapistId}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Failed to retrieve pending requests',
      );
    }
  }

  async acceptPatientRequest(
    therapistId: string,
    clientId: string,
  ): Promise<void> {
    try {
      const relationship = await this.prisma.clientTherapist.findFirst({
        where: {
          therapistId: therapistId,
          clientId: clientId,
          status: 'inactive',
        },
      });

      if (!relationship) {
        throw new NotFoundException('Patient request not found');
      }

      await this.prisma.clientTherapist.update({
        where: { id: relationship.id },
        data: { status: 'active' },
      });
    } catch (error) {
      this.logger.error(
        `Error accepting patient request for therapistId: ${therapistId}, clientId: ${clientId}`,
        error instanceof Error ? error.stack : String(error),
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to accept patient request',
      );
    }
  }

  async denyPatientRequest(
    therapistId: string,
    clientId: string,
  ): Promise<void> {
    try {
      const relationship = await this.prisma.clientTherapist.findFirst({
        where: {
          therapistId: therapistId,
          clientId: clientId,
          status: 'inactive',
        },
      });

      if (!relationship) {
        throw new NotFoundException('Patient request not found');
      }

      await this.prisma.clientTherapist.delete({
        where: { id: relationship.id },
      });
    } catch (error) {
      this.logger.error(
        `Error denying patient request for therapistId: ${therapistId}, clientId: ${clientId}`,
        error instanceof Error ? error.stack : String(error),
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to deny patient request');
    }
  }

  async removePatient(therapistId: string, clientId: string): Promise<void> {
    try {
      const relationship = await this.prisma.clientTherapist.findFirst({
        where: {
          therapistId: therapistId,
          clientId: clientId,
          status: 'active',
        },
      });

      if (!relationship) {
        throw new NotFoundException('Active patient relationship not found');
      }

      await this.prisma.clientTherapist.update({
        where: { id: relationship.id },
        data: { status: 'inactive' },
      });
    } catch (error) {
      this.logger.error(
        `Error removing patient for therapistId: ${therapistId}, clientId: ${clientId}`,
        error instanceof Error ? error.stack : String(error),
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to remove patient');
    }
  }

  async getAllClients(therapistId: string): Promise<unknown[]> {
    try {
      // Find all clients assigned to this therapist
      const assignedClients = await this.prisma.clientTherapist.findMany({
        where: { therapistId: therapistId },
        include: { client: { include: { user: true } } },
      });

      return assignedClients.map((ct) => ({
        ...ct.client,
      }));
    } catch (error) {
      this.logger.error(
        `Error retrieving all clients for therapistId: ${therapistId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Failed to retrieve all clients');
    }
  }

  async getClientById(therapistId: string, clientId: string): Promise<unknown> {
    try {
      // Find the specific client assigned to this therapist
      const assignedClient = await this.prisma.clientTherapist.findFirst({
        where: { therapistId: therapistId, clientId: clientId },
        include: { client: { include: { user: true } } },
      });
      if (!assignedClient) {
        throw new NotFoundException('Client not found');
      }

      return assignedClient.client;
    } catch (error) {
      this.logger.error(
        `Error retrieving client by ID for therapistId: ${therapistId}, clientId: ${clientId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Failed to retrieve client by ID');
    }
  }

  async getProfile(therapistId: string): Promise<unknown> {
    try {
      const therapist = await this.prisma.therapist.findUniqueOrThrow({
        where: { userId: therapistId },
        include: {
          user: true,
        },
      });
      return {
        ...therapist,
        // Map database fields to frontend-expected fields
        specialties: therapist.areasOfExpertise || [],
        treatmentSuccessRates:
          (therapist.treatmentSuccessRates as Record<string, unknown>) || {},
        hourlyRate: therapist.hourlyRate,
      };
    } catch (error) {
      this.logger.error(
        `Error retrieving therapist profile for therapistId: ${therapistId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Failed to retrieve therapist profile',
      );
    }
  }

  async updateProfile(
    therapistId: string,
    data: Prisma.TherapistUpdateInput,
  ): Promise<any> {
    try {
      const updatedTherapist = await this.prisma.therapist.update({
        where: { userId: therapistId },
        data,
        include: {
          user: true,
        },
      });
      return {
        ...updatedTherapist,
        // Map database fields to frontend-expected fields
        specialties: updatedTherapist.areasOfExpertise || [],
        treatmentSuccessRates:
          (updatedTherapist.treatmentSuccessRates as Record<string, any>) || {},
        hourlyRate: updatedTherapist.hourlyRate,
      };
    } catch (error) {
      this.logger.error(
        `Error updating therapist profile for therapistId: ${therapistId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Failed to update therapist profile',
      );
    }
  }

  async getMatchedClients(therapistId: string): Promise<unknown> {
    try {
      this.logger.debug(`getMatchedClients called with therapistId: ${therapistId}`);

      // First, verify the therapist exists
      const therapist = await this.prisma.therapist.findUnique({
        where: { userId: therapistId },
        select: {
          userId: true,
          user: { select: { firstName: true, lastName: true } },
        },
      });

      this.logger.debug(
        `Therapist found: ${
          therapist
            ? `${therapist.user.firstName} ${therapist.user.lastName} (ID: ${therapist.userId})`
            : 'NOT FOUND'
        }`,
      );

      if (!therapist) {
        this.logger.error(`Therapist not found with ID: ${therapistId}`);
        throw new NotFoundException(
          `Therapist with ID ${therapistId} not found`,
        );
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get all matched clients (no status needed - all relationships are active)
      const allMatches = await this.prisma.clientTherapist.findMany({
        where: {
          therapistId: therapistId,
        },
        include: {
          client: {
            include: {
              user: true,
              preAssessments: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: {
                  id: true,
                  createdAt: true,
                  answers: true,
                },
              },
            },
          },
        },
        orderBy: { assignedAt: 'desc' },
      });

      this.logger.debug(`ClientTherapist records found: ${allMatches.length}`);
      this.logger.debug(
        `Raw matches: ${JSON.stringify(
          allMatches.map((m) => ({
            id: m.id,
            clientId: m.clientId,
            therapistId: m.therapistId,
            assignedAt: m.assignedAt,
            status: m.status,
          })),
        )}`,
      );

      // Separate recent matches (last 30 days) from older ones
      const recentMatches = allMatches.filter(
        (match) => new Date(match.assignedAt) >= thirtyDaysAgo,
      );

      const olderMatches = allMatches.filter(
        (match) => new Date(match.assignedAt) < thirtyDaysAgo,
      );

      // Format the response with additional metadata
      const formatClientMatch = (relationship: {
        id: string;
        assignedAt: Date;
        client: {
          userId: string;
          user: {
            firstName: string;
            lastName: string;
            email: string;
            avatarUrl: string | null;
            createdAt: Date;
          };
          preAssessments: Array<{
            createdAt: Date;
          }>;
        };
      }) => {
        const latestAssessment = relationship.client.preAssessments[0] || null;
        return {
          relationshipId: relationship.id,
          client: {
            id: relationship.client.userId,
            firstName: relationship.client.user.firstName,
            lastName: relationship.client.user.lastName,
            email: relationship.client.user.email,
            profilePicture: relationship.client.user.avatarUrl,
            joinedAt: relationship.client.user.createdAt,
          },
          matchInfo: {
            assignedAt: relationship.assignedAt,
            daysSinceMatch: Math.floor(
              (Date.now() - new Date(relationship.assignedAt).getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          },
          assessmentInfo: latestAssessment
            ? {
                hasAssessment: true,
                completedAt: latestAssessment.createdAt,
                assessmentType: 'Pre-Assessment',
                daysSinceAssessment: Math.floor(
                  (Date.now() -
                    new Date(latestAssessment.createdAt).getTime()) /
                    (1000 * 60 * 60 * 24),
                ),
              }
            : {
                hasAssessment: false,
                completedAt: null,
                assessmentType: null,
                daysSinceAssessment: null,
              },
        };
      };

      return {
        recentMatches: recentMatches.map(formatClientMatch),
        allMatches: allMatches.map(formatClientMatch),
        summary: {
          totalRecentMatches: recentMatches.length,
          totalAllMatches: allMatches.length,
          totalMatches: allMatches.length,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error retrieving matched clients for therapistId: ${therapistId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Failed to retrieve matched clients',
      );
    }
  }
}
