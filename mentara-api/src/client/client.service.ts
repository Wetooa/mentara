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
      profileImage: undefined,
    };
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

    // Delete any existing assignments
    await this.prisma.clientTherapist.deleteMany({
      where: {
        clientId: userId,
      },
    });

    // Create new assignment
    await this.prisma.clientTherapist.create({
      data: {
        clientId: userId,
        therapistId: therapistId,
      },
    });

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

    // Delete any existing assignments
    await this.prisma.clientTherapist.deleteMany({
      where: {
        clientId: userId,
      },
    });
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
