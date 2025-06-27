import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { ClientResponse, ClientUpdateDto, TherapistResponse } from 'schema/auth';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<ClientResponse> {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  async updateProfile(
    userId: string,
    data: ClientUpdateDto,
  ): Promise<ClientResponse> {
    return await this.prisma.client.update({
      where: { userId },
      data: {
        user: {
          update: data,
        },
      },
      include: { user: true },
    });
  }

  async needsTherapistRecommendations(userId: string): Promise<boolean> {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      select: { hasSeenTherapistRecommendations: true },
    });
    return !client?.hasSeenTherapistRecommendations;
  }

  async markTherapistRecommendationsSeen(userId: string): Promise<void> {
    await this.prisma.client.update({
      where: { userId },
      data: { hasSeenTherapistRecommendations: true },
    });
  }

  async getAssignedTherapist(userId: string): Promise<TherapistResponse | null> {
    const assignment = await this.prisma.clientTherapist.findFirst({
      where: { 
        clientId: userId, 
        status: 'active' 
      },
      include: {
        therapist: {
          include: { user: true }
        }
      },
      orderBy: { assignedAt: 'desc' }
    });

    if (!assignment?.therapist) {
      return null;
    }

    // Transform the Prisma result to match TherapistResponse type
    const therapist = assignment.therapist;
    return {
      ...therapist,
      treatmentSuccessRates: therapist.treatmentSuccessRates as Record<string, any> || {},
      hourlyRate: therapist.hourlyRate ? Number(therapist.hourlyRate) : 0,
    };
  }

  async assignTherapist(userId: string, therapistId: string): Promise<TherapistResponse> {
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
        status: 'active' 
      },
      data: { status: 'inactive' }
    });

    // Create new assignment
    await this.prisma.clientTherapist.create({
      data: {
        clientId: userId,
        therapistId: therapistId,
        status: 'active'
      }
    });

    // Transform the Prisma result to match TherapistResponse type
    return {
      ...therapist,
      treatmentSuccessRates: therapist.treatmentSuccessRates as Record<string, any> || {},
      hourlyRate: therapist.hourlyRate ? Number(therapist.hourlyRate) : 0,
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
        status: 'active' 
      },
      data: { status: 'inactive' }
    });
  }
}
