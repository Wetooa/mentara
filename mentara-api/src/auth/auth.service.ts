import { clerkClient } from '@clerk/clerk-sdk-node';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { ClientCreateDto, TherapistCreateDto } from 'src/schema/auth.schemas';
import { ClientResponse, TherapistResponse } from 'src/schema/client.schemas';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkAdmin(id: string) {
    const admin = await this.prisma.user.findUnique({
      where: { role: 'admin', id },
    });

    return !!admin;
  }

  async registerClient(
    userId: string,
    registerClientDto: ClientCreateDto,
  ): Promise<ClientResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      await this.prisma.user.create({
        data: registerClientDto.user.create!,
      });

      // Create user
      const client = await this.prisma.client.create({
        data: {
          ...registerClientDto,
          user: { connect: { id: userId } },
        },
        include: {
          user: true,
          worksheets: true,
          preAssessment: true,
          worksheetSubmissions: true,
          clientMedicalHistory: true,
          clientPreferences: true,
          assignedTherapists: true,
          meetings: true,
        },
      });

      return client;
    } catch (error) {
      console.error(
        'User registration error:',
        error instanceof Error ? error.message : error,
      );
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('User registration failed');
    }
  }

  async registerTherapist(
    userId: string,
    registerTherapistDto: TherapistCreateDto,
  ): Promise<TherapistResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      // Create user first
      await this.prisma.user.create({
        data: registerTherapistDto.user.create!,
      });

      // Create therapist
      await this.prisma.therapist.create({
        data: {
          approved: false,
          status: 'pending',
          ...registerTherapistDto,
        },
        include: {
          user: true,
          assignedClients: true,
          meetings: true,
          therapistAvailabilities: true,
        },
      });

      return await this.prisma.therapist.findUniqueOrThrow({
        where: { userId },
        include: {
          user: true,
          assignedClients: true,
          meetings: true,
          therapistAvailabilities: true,
          worksheets: true,
        },
      });
    } catch (error) {
      console.error(
        'Therapist registration error:',
        error instanceof Error ? error.message : error,
      );
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Therapist registration failed');
    }
  }

  async getUsers() {
    return clerkClient.users.getUserList();
  }

  async getUser(userId: string) {
    return clerkClient.users.getUser(userId);
  }
}
