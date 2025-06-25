import { Injectable } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    try {
      return await this.prisma.client.findUnique({
        where: { userId },
        include: { user: true },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async updateProfile(userId: string, data: Record<string, any>) {
    try {
      return await this.prisma.client.update({
        where: { userId },
        data,
        include: { user: true },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
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
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async markTherapistRecommendationsSeen(userId: string): Promise<void> {
    try {
      await this.prisma.client.update({
        where: { userId },
        data: { hasSeenTherapistRecommendations: true },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
