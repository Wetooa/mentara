import { createClerkClient } from '@clerk/backend';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import {
  ClientCreateDto,
  ClientResponse,
  TherapistCreateDto,
  TherapistResponse,
} from 'src/schema/auth';

@Injectable()
export class AuthService {
  private readonly clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

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

      await this.clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: 'client',
        },
      });

      await this.prisma.user.create({
        data: registerClientDto.user,
      });

      // Create user
      const client = await this.prisma.client.create({
        data: {
          ...registerClientDto,
          user: { connect: { id: userId } },
        },
        include: {
          user: true,
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

      await this.clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: 'therapist',
        },
      });

      // Create user first
      await this.prisma.user.create({
        data: registerTherapistDto.user,
      });

      // Create therapist
      const therapist = await this.prisma.therapist.create({
        data: {
          ...registerTherapistDto,
          user: { connect: { id: userId } },
          status: 'pending',
        },
        include: {
          user: true,
        },
      });

      return therapist;
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
    return this.clerkClient.users.getUserList();
  }

  async getUser(userId: string) {
    return this.clerkClient.users.getUser(userId);
  }
}
