import { Injectable } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { Prisma } from '@prisma/client';
import { ClientWithUser } from 'src/types';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<ClientWithUser> {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!client) {
      throw new Error('Client not found');
    }
    return client;
  }

  async updateProfile(
    userId: string,
    data: Prisma.ClientUpdateInput,
  ): Promise<ClientWithUser> {
    return await this.prisma.client.update({
      where: { userId },
      data,
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
