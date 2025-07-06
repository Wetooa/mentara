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
} from '../../schema/auth';
import { EventBusService } from '../common/events/event-bus.service';
import { UserRegisteredEvent } from '../common/events/user-events';

@Injectable()
export class AuthService {
  private readonly clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

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

      // Publish user registration event
      await this.eventBus.emit(
        new UserRegisteredEvent({
          userId,
          email: client.user.email,
          firstName: client.user.firstName,
          lastName: client.user.lastName,
          role: 'client',
          registrationMethod: 'email', // Default, could be enhanced
        }),
      );

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

      // Publish user registration event
      await this.eventBus.emit(
        new UserRegisteredEvent({
          userId,
          email: therapist.user.email,
          firstName: therapist.user.firstName,
          lastName: therapist.user.lastName,
          role: 'therapist',
          registrationMethod: 'email', // Default, could be enhanced
        }),
      );

      return {
        ...therapist,
        treatmentSuccessRates:
          (therapist.treatmentSuccessRates as Record<string, any>) || {},
      };
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

  async forceLogout(userId: string) {
    try {
      // Revoke all sessions for the user
      const sessions = await this.clerkClient.sessions.getSessionList({
        userId: userId,
      });

      // Revoke each active session
      const revokePromises = sessions.data.map((session) =>
        this.clerkClient.sessions.revokeSession(session.id),
      );

      await Promise.all(revokePromises);

      return { success: true, message: 'User sessions revoked successfully' };
    } catch (error) {
      console.error(
        'Force logout error:',
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException('Force logout failed');
    }
  }
}
