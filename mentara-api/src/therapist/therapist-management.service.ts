import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { Prisma } from '@prisma/client';
import {
  ClientResponse,
  TherapistResponse,
  TherapistUpdateDto,
} from 'src/schema/auth.d';

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
      return await this.prisma.therapist.findUniqueOrThrow({
        where: { userId },
        include: {
          user: true,
          therapistAvailabilities: true,
          worksheets: true,
          meetings: true,
          assignedClients: true,
        },
      });
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
      return await this.prisma.therapist.update({
        where: { userId },
        data: {
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          userId: data.userId,
          mobile: data.mobile,
        },
        include: {
          user: true,
        },
      });
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
      return await this.prisma.therapist.findUniqueOrThrow({
        where: { userId: therapistId },
        include: {
          user: true,
        },
      });
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
      return await this.prisma.therapist.update({
        where: { userId: therapistId },
        data,
        include: {
          user: true,
        },
      });
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
