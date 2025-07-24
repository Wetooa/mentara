import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { MessagingService } from '../messaging/messaging.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import type {
  UpdateClientDto,
  TherapistRecommendation,
  ClientProfileDto,
} from './types';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagingService: MessagingService,
  ) {}

  async getProfile(userId: string): Promise<ClientProfileDto> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!client) {
        this.logger.warn(`Client profile not found for userId: ${userId}`);
        throw new NotFoundException('Client profile not found');
      }

      return this.transformPrismaUserToDTO(client.user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.error(
          `Database error in getProfile: ${error.code} - ${error.message}`,
        );
        throw new InternalServerErrorException(
          'Failed to retrieve client profile',
        );
      }

      this.logger.error(
        `Unexpected error in getProfile: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async updateProfile(
    userId: string,
    data: UpdateClientDto,
  ): Promise<ClientProfileDto> {
    try {
      const updatedClient = await this.prisma.client.update({
        where: { userId },
        data: {
          user: {
            update: data,
          },
        },
        include: { user: true },
      });

      return this.transformPrismaUserToDTO(updatedClient.user);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            this.logger.warn(`Client not found for update, userId: ${userId}`);
            throw new NotFoundException('Client not found');
          case 'P2002':
            this.logger.warn(
              `Unique constraint violation in updateProfile: ${error.message}`,
            );
            throw new BadRequestException(
              'A profile with this data already exists',
            );
          default:
            this.logger.error(
              `Database error in updateProfile: ${error.code} - ${error.message}`,
            );
            throw new InternalServerErrorException(
              'Failed to update client profile',
            );
        }
      }

      this.logger.error(
        `Unexpected error in updateProfile: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating profile',
      );
    }
  }

  async needsTherapistRecommendations(userId: string): Promise<boolean> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { userId },
        select: { hasSeenTherapistRecommendations: true },
      });
      return !client?.hasSeenTherapistRecommendations;
    } catch (error) {
      this.logger.error(
        `Error checking therapist recommendations for userId ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException(
        'Failed to check therapist recommendation status',
      );
    }
  }

  async markTherapistRecommendationsSeen(userId: string): Promise<void> {
    try {
      await this.prisma.client.update({
        where: { userId },
        data: { hasSeenTherapistRecommendations: true },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        this.logger.warn(
          `Client not found when marking recommendations seen, userId: ${userId}`,
        );
        throw new NotFoundException('Client not found');
      }

      this.logger.error(
        `Error marking therapist recommendations seen for userId ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException(
        'Failed to update therapist recommendation status',
      );
    }
  }

  async getAssignedTherapist(
    userId: string,
  ): Promise<TherapistRecommendation | null> {
    const assignment = await this.prisma.clientTherapist.findFirst({
      where: {
        clientId: userId,
        status: 'active',
      },
      include: {
        therapist: {
          include: { user: true },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    if (!assignment?.therapist) {
      return null;
    }

    // Transform the Prisma result to match TherapistRecommendation type
    const therapist = assignment.therapist;
    return {
      id: therapist.userId,
      firstName: therapist.user.firstName,
      lastName: therapist.user.lastName,
      title: 'Therapist',
      specialties: therapist.areasOfExpertise,
      hourlyRate: Number(therapist.hourlyRate),
      experience: therapist.yearsOfExperience || 0,
      province: therapist.province,
      isActive: therapist.status === 'APPROVED',
      bio: therapist.user.bio || undefined,
      profileImage: therapist.user.avatarUrl || undefined,
    };
  }

  async getAssignedTherapists(
    userId: string,
  ): Promise<TherapistRecommendation[]> {
    const assignments = await this.prisma.clientTherapist.findMany({
      where: {
        clientId: userId,
        status: 'active',
      },
      include: {
        therapist: {
          include: { user: true },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    if (!assignments || assignments.length === 0) {
      return [];
    }

    // Transform the Prisma results to match TherapistRecommendation type
    return assignments.map((assignment) => {
      const therapist = assignment.therapist;
      return {
        id: therapist.userId,
        firstName: therapist.user.firstName,
        lastName: therapist.user.lastName,
        title: 'Therapist',
        specialties: therapist.areasOfExpertise || [], // Fixed: map areasOfExpertise to specialties
        hourlyRate: Number(therapist.hourlyRate || 0),
        experience: therapist.yearsOfExperience || 0,
        province: therapist.province,
        isActive: therapist.status === 'APPROVED',
        bio: therapist.user.bio || undefined,
        profileImage: therapist.user.avatarUrl || undefined,
      };
    });
  }

  async assignTherapist(
    userId: string,
    therapistId: string,
  ): Promise<TherapistRecommendation> {
    // Check if client exists
    const client = await this.prisma.client.findUnique({
      where: { userId },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Check if therapist exists
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId: therapistId },
      include: { user: true },
    });
    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    // Check if this assignment already exists
    const existingAssignment = await this.prisma.clientTherapist.findUnique({
      where: {
        clientId_therapistId: {
          clientId: userId,
          therapistId: therapistId,
        },
      },
    });

    // If assignment already exists, update status to active
    if (existingAssignment) {
      await this.prisma.clientTherapist.update({
        where: { id: existingAssignment.id },
        data: { status: 'active' },
      });
    } else {
      // Create new assignment
      await this.prisma.clientTherapist.create({
        data: {
          clientId: userId,
          therapistId: therapistId,
          status: 'active',
        },
      });
    }

    // Automatically create conversation between client and therapist
    try {
      await this.messagingService.createConversation(userId, {
        participantIds: [therapistId],
        type: 'direct',
        title: `Therapy Session with ${therapist.user.firstName} ${therapist.user.lastName}`,
      });
      this.logger.log(
        `Auto-created conversation between client ${userId} and therapist ${therapistId}`,
      );
    } catch (error) {
      // Log error but don't fail the assignment if conversation creation fails
      this.logger.warn(
        `Failed to auto-create conversation between client ${userId} and therapist ${therapistId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // Transform the Prisma result to match TherapistRecommendation type
    return {
      id: therapist.userId,
      firstName: therapist.user.firstName,
      lastName: therapist.user.lastName,
      title: 'Therapist',
      specialties: therapist.areasOfExpertise,
      hourlyRate: Number(therapist.hourlyRate),
      experience: therapist.yearsOfExperience || 0,
      province: therapist.province,
      isActive: therapist.status === 'APPROVED',
      bio: therapist.user.bio || undefined,
      profileImage: undefined,
    };
  }

  async removeTherapist(userId: string): Promise<void> {
    // Check if client exists
    const client = await this.prisma.client.findUnique({
      where: { userId },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Set all existing assignments to inactive instead of deleting
    await this.prisma.clientTherapist.updateMany({
      where: {
        clientId: userId,
        status: 'active',
      },
      data: {
        status: 'inactive',
      },
    });
  }

  async getPendingTherapistRequests(
    userId: string,
  ): Promise<TherapistRecommendation[]> {
    try {
      const pendingRequests = await this.prisma.clientTherapist.findMany({
        where: {
          clientId: userId,
          status: 'inactive', // Pending requests
        },
        include: {
          therapist: {
            include: { user: true },
          },
        },
        orderBy: { assignedAt: 'desc' },
      });

      if (!pendingRequests || pendingRequests.length === 0) {
        return [];
      }

      // Transform the Prisma results to match TherapistRecommendation type
      return pendingRequests.map((request) => {
        const therapist = request.therapist;
        return {
          id: therapist.userId,
          firstName: therapist.user.firstName,
          lastName: therapist.user.lastName,
          title: 'Therapist',
          specialties: therapist.areasOfExpertise,
          hourlyRate: Number(therapist.hourlyRate),
          experience: therapist.yearsOfExperience || 0,
          province: therapist.province,
          isActive: therapist.status === 'APPROVED',
          bio: therapist.user.bio || undefined,
          profileImage: therapist.user.avatarUrl || undefined,
          requestedAt: request.assignedAt.toISOString(),
          requestId: request.id,
        };
      });
    } catch (error) {
      this.logger.error(
        `Error getting pending therapist requests for userId ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException(
        'Failed to get pending therapist requests',
      );
    }
  }

  async cancelTherapistRequest(
    userId: string,
    therapistId: string,
  ): Promise<void> {
    try {
      // Check if client exists
      const client = await this.prisma.client.findUnique({
        where: { userId },
      });
      if (!client) {
        this.logger.warn(`Client not found for cancel request, userId: ${userId}`);
        throw new NotFoundException('Client not found');
      }

      // Find and delete the pending request
      const deletedRequest = await this.prisma.clientTherapist.deleteMany({
        where: {
          clientId: userId,
          therapistId: therapistId,
          status: 'inactive', // Only cancel pending requests
        },
      });

      if (deletedRequest.count === 0) {
        throw new NotFoundException('Pending request not found');
      }

      this.logger.log(
        `Successfully cancelled therapist request for client ${userId} to therapist ${therapistId}`,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.error(
          `Database error in cancelTherapistRequest: ${error.code} - ${error.message}`,
        );
        throw new InternalServerErrorException(
          'Failed to cancel therapist request',
        );
      }

      this.logger.error(
        `Unexpected error in cancelTherapistRequest: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async requestTherapist(
    userId: string,
    therapistId: string,
  ): Promise<TherapistRecommendation> {
    try {
      // Check if client exists
      const client = await this.prisma.client.findUnique({
        where: { userId },
      });
      if (!client) {
        this.logger.warn(`Client not found for request, userId: ${userId}`);
        throw new NotFoundException('Client not found');
      }

      // Check if therapist exists and is approved
      const therapist = await this.prisma.therapist.findUnique({
        where: { userId: therapistId },
        include: { user: true },
      });
      if (!therapist) {
        this.logger.warn(
          `Therapist not found for request, therapistId: ${therapistId}`,
        );
        throw new NotFoundException('Therapist not found');
      }

      if (therapist.status !== 'APPROVED') {
        throw new BadRequestException('Therapist is not approved');
      }

      // Check if this request already exists
      const existingRequest = await this.prisma.clientTherapist.findUnique({
        where: {
          clientId_therapistId: {
            clientId: userId,
            therapistId: therapistId,
          },
        },
      });

      if (existingRequest) {
        if (existingRequest.status === 'active') {
          throw new BadRequestException(
            'You are already connected to this therapist',
          );
        }
        if (existingRequest.status === 'inactive') {
          throw new BadRequestException(
            'Request already sent to this therapist',
          );
        }
      }

      // Create new therapist request with inactive status
      await this.prisma.clientTherapist.create({
        data: {
          clientId: userId,
          therapistId: therapistId,
          status: 'inactive', // Request pending
        },
      });

      // Return therapist information
      return {
        id: therapist.userId,
        firstName: therapist.user.firstName,
        lastName: therapist.user.lastName,
        title: 'Therapist',
        specialties: therapist.areasOfExpertise,
        hourlyRate: Number(therapist.hourlyRate),
        experience: therapist.yearsOfExperience || 0,
        province: therapist.province,
        isActive: therapist.status === 'APPROVED',
        bio: therapist.user.bio || undefined,
        profileImage: undefined,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.error(
          `Database error in requestTherapist: ${error.code} - ${error.message}`,
        );
        throw new InternalServerErrorException(
          'Failed to send therapist request',
        );
      }

      this.logger.error(
        `Unexpected error in requestTherapist: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  private transformPrismaUserToDTO(user: any): ClientProfileDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role as 'client' | 'therapist' | 'admin' | 'moderator',
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
