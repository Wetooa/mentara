import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  ClientResponse,
  ClientUpdateDto,
  TherapistResponse,
} from 'schema/auth';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<ClientResponse> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!client) {
        this.logger.warn(`Client profile not found for userId: ${userId}`);
        throw new NotFoundException('Client profile not found');
      }

      return client;
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
    data: ClientUpdateDto,
  ): Promise<ClientResponse> {
    try {
      return await this.prisma.client.update({
        where: { userId },
        data: {
          user: {
            update: data,
          },
        },
        include: { user: true },
      });
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
  ): Promise<TherapistResponse | null> {
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

    // Transform the Prisma result to match TherapistResponse type
    const therapist = assignment.therapist;
    return {
      ...therapist,
      treatmentSuccessRates:
        (therapist.treatmentSuccessRates as Record<string, any>) || {},
      hourlyRate: therapist.hourlyRate,
    };
  }

  async assignTherapist(
    userId: string,
    therapistId: string,
  ): Promise<TherapistResponse> {
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

    // Deactivate any existing assignments
    await this.prisma.clientTherapist.updateMany({
      where: {
        clientId: userId,
        status: 'active',
      },
      data: { status: 'inactive' },
    });

    // Create new assignment
    await this.prisma.clientTherapist.create({
      data: {
        clientId: userId,
        therapistId: therapistId,
        status: 'active',
      },
    });

    // Transform the Prisma result to match TherapistResponse type
    return {
      ...therapist,
      treatmentSuccessRates:
        (therapist.treatmentSuccessRates as Record<string, any>) || {},
      hourlyRate: therapist.hourlyRate,
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

    // Deactivate any existing assignments
    await this.prisma.clientTherapist.updateMany({
      where: {
        clientId: userId,
        status: 'active',
      },
      data: { status: 'inactive' },
    });
  }
}
