import { Injectable } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { ApiResponse } from '../types';
import { Decimal } from '@prisma/client/runtime/library';

export interface UpdateTherapistSpecializationsDto {
  illnessSpecializations: string[];
  expertiseLevels: Record<string, number>;
  treatmentSuccessRates?: Record<string, number>;
}

export interface TherapistProfileResponse {
  id: string;
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  profileImageUrl?: string;
  hourlyRate?: Decimal;
  patientSatisfaction?: Decimal;
  totalPatients: number;
  province: string;
  providerType: string;
  yearsOfExperience?: number;
  illnessSpecializations: string[];
  expertiseLevels: Record<string, number>;
  treatmentSuccessRates?: Record<string, number>;
  therapeuticApproaches: string[];
  languages: string[];
  weeklyAvailability?: string;
  sessionLength?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TherapistManagementService {
  constructor(private prisma: PrismaService) {}

  async updateTherapistSpecializations(
    clerkId: string,
    data: UpdateTherapistSpecializationsDto,
  ): Promise<ApiResponse<TherapistProfileResponse>> {
    try {
      const therapist = await this.prisma.therapist.findUnique({
        where: { clerkUserId: clerkId },
      });

      if (!therapist) {
        return {
          success: false,
          message: 'Therapist not found',
        };
      }

      const updatedTherapist = await this.prisma.therapist.update({
        where: { clerkUserId: clerkId },
        data: {
          illnessSpecializations: data.illnessSpecializations,
          expertiseLevels: data.expertiseLevels,
          treatmentSuccessRates: data.treatmentSuccessRates,
        },
      });

      return {
        success: true,
        message: 'Therapist specializations updated successfully',
        data: updatedTherapist as TherapistProfileResponse,
      };
    } catch (error) {
      console.error(
        'Error updating therapist specializations:',
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        message: 'Failed to update therapist specializations',
      };
    }
  }

  async getTherapistProfile(
    clerkId: string,
  ): Promise<ApiResponse<TherapistProfileResponse>> {
    try {
      const therapist = await this.prisma.therapist.findUnique({
        where: { clerkUserId: clerkId },
      });

      if (!therapist) {
        return {
          success: false,
          message: 'Therapist not found',
        };
      }

      return {
        success: true,
        message: 'Therapist profile retrieved successfully',
        data: therapist as TherapistProfileResponse,
      };
    } catch (error) {
      console.error(
        'Error retrieving therapist profile:',
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        message: 'Failed to retrieve therapist profile',
      };
    }
  }

  async updateTherapistProfile(
    clerkId: string,
    data: Partial<TherapistProfileResponse>,
  ): Promise<ApiResponse<TherapistProfileResponse>> {
    try {
      const therapist = await this.prisma.therapist.findUnique({
        where: { clerkUserId: clerkId },
      });

      if (!therapist) {
        return {
          success: false,
          message: 'Therapist not found',
        };
      }

      const updatedTherapist = await this.prisma.therapist.update({
        where: { clerkUserId: clerkId },
        data: {
          bio: data.bio,
          profileImageUrl: data.profileImageUrl,
          hourlyRate: data.hourlyRate,
          weeklyAvailability: data.weeklyAvailability,
          sessionLength: data.sessionLength,
          therapeuticApproaches: data.therapeuticApproaches,
          languages: data.languages,
        },
      });

      return {
        success: true,
        message: 'Therapist profile updated successfully',
        data: updatedTherapist as TherapistProfileResponse,
      };
    } catch (error) {
      console.error(
        'Error updating therapist profile:',
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        message: 'Failed to update therapist profile',
      };
    }
  }

  getAvailableIllnesses(): ApiResponse<string[]> {
    try {
      // Return list of all available illnesses for specialization
      const availableIllnesses = [
        'Stress',
        'Anxiety',
        'Depression',
        'Insomnia',
        'Panic Disorder',
        'Bipolar Disorder',
        'OCD',
        'PTSD',
        'Social Anxiety',
        'Phobias',
        'Burnout',
        'Eating Disorders',
        'ADHD',
        'Substance Abuse',
        'Grief and Loss',
        'Relationship Issues',
        'Family Therapy',
        'Couples Therapy',
        'Trauma',
        'Self-Esteem',
        'Anger Management',
        'Workplace Issues',
        'Life Transitions',
        'Chronic Illness',
        'LGBTQ+ Issues',
        'Cultural Issues',
        'Addiction',
        'Personality Disorders',
        'Mood Disorders',
        'Psychotic Disorders',
      ];

      return {
        success: true,
        message: 'Available illnesses retrieved successfully',
        data: availableIllnesses,
      };
    } catch (error) {
      console.error(
        'Error retrieving available illnesses:',
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        message: 'Failed to retrieve available illnesses',
      };
    }
  }

  async getAssignedPatients(clerkId: string): Promise<ApiResponse<any[]>> {
    try {
      const therapist = await this.prisma.therapist.findUnique({
        where: { user: { clerkId } },
      });
      if (!therapist) {
        return {
          success: false,
          message: 'Therapist not found',
        };
      }
      // Find all clients assigned to this therapist
      const assignedClients = await this.prisma.clientTherapist.findMany({
        where: { therapistId: therapist.id, status: 'active' },
        include: { client: { include: { user: true } } },
      });
      const patients = assignedClients.map((ct) => ct.client.user);
      return {
        success: true,
        message: 'Assigned patients retrieved successfully',
        data: patients,
      };
    } catch (error) {
      console.error(
        'Error retrieving assigned patients:',
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        message: 'Failed to retrieve assigned patients',
      };
    }
  }

  async getAllClients(clerkId: string): Promise<ApiResponse<any[]>> {
    try {
      const therapist = await this.prisma.therapist.findUnique({
        where: { user: { clerkId } },
      });
      if (!therapist) {
        return {
          success: false,
          message: 'Therapist not found',
        };
      }
      // Find all clients assigned to this therapist
      const assignedClients = await this.prisma.clientTherapist.findMany({
        where: { therapistId: therapist.id, status: 'active' },
        include: { client: { include: { user: true } } },
      });
      const patients = assignedClients.map((ct) => ct.client.user);
      return {
        success: true,
        message: 'All clients retrieved successfully',
        data: patients,
      };
    } catch (error) {
      console.error(
        'Error retrieving all clients:',
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        message: 'Failed to retrieve all clients',
      };
    }
  }

  async getClientById(
    clerkId: string,
    clientId: string,
  ): Promise<ApiResponse<any>> {
    try {
      const therapist = await this.prisma.therapist.findUnique({
        where: { user: { clerkId } },
      });
      if (!therapist) {
        return {
          success: false,
          message: 'Therapist not found',
        };
      }
      // Find the specific client assigned to this therapist
      const assignedClient = await this.prisma.clientTherapist.findFirst({
        where: { therapistId: therapist.id, clientId: clientId },
        include: { client: { include: { user: true } } },
      });
      if (!assignedClient) {
        return {
          success: false,
          message: 'Client not found',
        };
      }
      return {
        success: true,
        message: 'Client retrieved successfully',
        data: assignedClient.client.user,
      };
    } catch (error) {
      console.error(
        'Error retrieving client by ID:',
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        message: 'Failed to retrieve client by ID',
      };
    }
  }

  async getProfile(
    clerkId: string,
  ): Promise<ApiResponse<TherapistProfileResponse>> {
    try {
      const therapist = await this.prisma.therapist.findUnique({
        where: { clerkUserId: clerkId },
      });
      if (!therapist) {
        return {
          success: false,
          message: 'Therapist not found',
        };
      }
      return {
        success: true,
        message: 'Therapist profile retrieved successfully',
        data: therapist as TherapistProfileResponse,
      };
    } catch (error) {
      console.error(
        'Error retrieving therapist profile:',
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        message: 'Failed to retrieve therapist profile',
      };
    }
  }

  async updateProfile(
    clerkId: string,
    data: Partial<TherapistProfileResponse>,
  ): Promise<ApiResponse<TherapistProfileResponse>> {
    try {
      const therapist = await this.prisma.therapist.findUnique({
        where: { clerkUserId: clerkId },
      });
      if (!therapist) {
        return {
          success: false,
          message: 'Therapist not found',
        };
      }
      const updatedTherapist = await this.prisma.therapist.update({
        where: { clerkUserId: clerkId },
        data: {
          bio: data.bio,
          profileImageUrl: data.profileImageUrl,
          hourlyRate: data.hourlyRate,
          weeklyAvailability: data.weeklyAvailability,
          sessionLength: data.sessionLength,
          therapeuticApproaches: data.therapeuticApproaches,
          languages: data.languages,
        },
      });
      return {
        success: true,
        message: 'Therapist profile updated successfully',
        data: updatedTherapist as TherapistProfileResponse,
      };
    } catch (error) {
      console.error(
        'Error updating therapist profile:',
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        message: 'Failed to update therapist profile',
      };
    }
  }
}
