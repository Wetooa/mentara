import { clerkClient } from '@clerk/clerk-sdk-node';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { ClientWithUser, TherapistWithUser } from 'src/types';
import { RegisterClientDto } from './dto/register-client.dto';
import { RegisterTherapistDto } from './dto/register-therapist.dto';

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
    registerUserDto: RegisterClientDto,
  ): Promise<ClientWithUser> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      // Create user
      const client = await this.prisma.client.create({
        data: {
          user: { connect: { id: userId } },
          ...registerUserDto,
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
    registerTherapistDto: RegisterTherapistDto,
  ): Promise<TherapistWithUser> {
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
        data: {
          id: userId,
          ...registerTherapistDto,
        },
      });

      // Create therapist
      const therapist = await this.prisma.therapist.create({
        data: {
          user: { connect: { id: userId } },
          approved: false,
          status: 'pending',
          ...registerTherapistDto,
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
    return clerkClient.users.getUserList();
  }

  async getUser(userId: string) {
    return clerkClient.users.getUser(userId);
  }
}
