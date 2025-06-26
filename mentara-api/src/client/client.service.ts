import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { ClientResponse, ClientUpdateDto } from '../schema/auth';

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
}
