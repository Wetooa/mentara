import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  ClientResponse,
  TherapistResponse,
  TherapistUpdateDto,
} from 'schema/auth';

@Injectable()
export class TherapistManagementService {
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

  async getTherapistProfile(userId: string): Promise<TherapistResponse> {
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
        treatmentSuccessRates:
          (therapist.treatmentSuccessRates as Record<string, any>) || {},
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
  ): Promise<TherapistResponse> {
    try {
      // Update therapist profile data
      const therapistData: any = {};
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
        treatmentSuccessRates:
          (updatedTherapist.treatmentSuccessRates as Record<string, any>) || {},
        hourlyRate: updatedTherapist.hourlyRate,
      };
    } catch (error) {
      console.error(
        'Error updating therapist profile:',
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException(
        'Failed to update therapist profile',
      );
    }
  }

  async getAssignedPatients(therapistId: string): Promise<ClientResponse[]> {
    try {
      const therapist = await this.prisma.therapist.findUniqueOrThrow({
        where: { userId: therapistId },
      });

      // Find all clients assigned to this therapist
      const assignedClients = await this.prisma.clientTherapist.findMany({
        where: { therapistId: therapist.userId, status: 'active' },
        include: { client: { include: { user: true } } },
      });

      return assignedClients.map((ct) => ({
        ...ct.client,
        user: ct.client.user,
      }));
    } catch (error) {
      console.error(
        'Error retrieving assigned patients:',
        error instanceof Error ? error.message : error,
      );

      throw new InternalServerErrorException(
        'Failed to retrieve assigned patients',
      );
    }
  }

  async getAllClients(therapistId: string): Promise<ClientResponse[]> {
    try {
      // Find all clients assigned to this therapist
      const assignedClients = await this.prisma.clientTherapist.findMany({
        where: { therapistId: therapistId, status: 'active' },
        include: { client: { include: { user: true } } },
      });

      return assignedClients.map((ct) => ({
        ...ct.client,
      }));
    } catch (error) {
      console.error(
        'Error retrieving all clients:',
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException('Failed to retrieve all clients');
    }
  }

  async getClientById(
    therapistId: string,
    clientId: string,
  ): Promise<ClientResponse> {
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
      console.error(
        'Error retrieving client by ID:',
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException('Failed to retrieve client by ID');
    }
  }

  async getProfile(therapistId: string): Promise<TherapistResponse> {
    try {
      const therapist = await this.prisma.therapist.findUniqueOrThrow({
        where: { userId: therapistId },
        include: {
          user: true,
        },
      });
      return {
        ...therapist,
        treatmentSuccessRates:
          (therapist.treatmentSuccessRates as Record<string, any>) || {},
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

  async updateProfile(
    therapistId: string,
    data: Prisma.TherapistUpdateInput,
  ): Promise<TherapistResponse> {
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
        treatmentSuccessRates:
          (updatedTherapist.treatmentSuccessRates as Record<string, any>) || {},
        hourlyRate: updatedTherapist.hourlyRate,
      };
    } catch (error) {
      console.error(
        'Error updating therapist profile:',
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException(
        'Failed to update therapist profile',
      );
    }
  }
}
