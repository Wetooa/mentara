import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { UserRole } from 'src/utils/role-utils';
import { EventBusService } from '../../common/events/event-bus.service';
import {
  UserRegisteredEvent,
  UserProfileUpdatedEvent,
  UserDeactivatedEvent,
  UserReactivatedEvent,
} from '../../common/events/user-events';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
  ) {}

  async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        id,
        isActive: true, // Only return active users by default
      },
    });
  }

  async findByIdIncludeInactive(id: string): Promise<User | null> {
    // For administrative purposes - can see inactive users
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany({
        where: { isActive: true },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async findOne(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: {
          id,
          isActive: true, // Only return active users
        },
        include: { therapist: true },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async findOneIncludeInactive(id: string): Promise<User | null> {
    // For administrative purposes
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        include: {
          therapist: true,
          client: true,
          admin: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async findByRole(role: string, limit = 100, offset = 0): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: {
        role,
        isActive: true, // Only return active users
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllIncludeInactive(limit = 100, offset = 0): Promise<User[]> {
    // For administrative purposes - include inactive users
    try {
      return await this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      // Get previous values for audit trail
      const previousUser = await this.findById(id);
      if (!previousUser) {
        throw new InternalServerErrorException('User not found');
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data,
      });

      // Publish profile updated event
      await this.eventBus.emit(
        new UserProfileUpdatedEvent({
          userId: id,
          updatedFields: Object.keys(data),
          previousValues: this.extractUserFields(previousUser),
          newValues: this.extractUserFields(updatedUser),
        }),
      );

      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update user: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async remove(id: string): Promise<User> {
    try {
      // Implement soft delete for HIPAA compliance
      const deactivatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          suspendedAt: new Date(),
          suspensionReason: 'Account deactivated by user',
          // Keep all data intact for compliance
        },
      });

      // Publish user deactivation event
      await this.eventBus.emit(
        new UserDeactivatedEvent({
          userId: id,
          reason: 'Account deactivated by user',
          deactivatedBy: id, // Self-deactivation
          isTemporary: false,
        }),
      );

      return deactivatedUser;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to deactivate user: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async deactivate(
    id: string,
    reason?: string,
    deactivatedBy?: string,
  ): Promise<User> {
    try {
      // Administrative deactivation with audit trail
      const deactivatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          suspendedAt: new Date(),
          suspendedBy: deactivatedBy,
          suspensionReason: reason || 'Account deactivated by administrator',
        },
      });

      // Publish user deactivation event
      await this.eventBus.emit(
        new UserDeactivatedEvent({
          userId: id,
          reason: reason || 'Account deactivated by administrator',
          deactivatedBy: deactivatedBy || 'system',
          isTemporary: true, // Administrative deactivations are typically temporary
        }),
      );

      return deactivatedUser;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to deactivate user: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async reactivate(id: string, reactivatedBy?: string): Promise<User> {
    try {
      // Get user info for calculating inactive duration
      const user = await this.findByIdIncludeInactive(id);
      if (!user) {
        throw new InternalServerErrorException('User not found');
      }

      const inactiveDuration = user.suspendedAt
        ? Math.floor(
            (Date.now() - user.suspendedAt.getTime()) / (1000 * 60 * 60 * 24),
          )
        : 0;

      const reactivatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          isActive: true,
          suspendedAt: null,
          suspendedBy: null,
          suspensionReason: null,
        },
      });

      // Publish user reactivation event
      await this.eventBus.emit(
        new UserReactivatedEvent({
          userId: id,
          reactivatedBy: reactivatedBy || 'system',
          inactiveDuration,
        }),
      );

      return reactivatedUser;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to reactivate user: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async permanentDelete(id: string): Promise<User> {
    // Only for extreme cases with proper authorization
    // This should only be called by super admins after proper data retention period
    return await this.prisma.user.delete({
      where: { id },
    });
  }

  async getUserRole(id: string): Promise<UserRole | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });
    return (user?.role as UserRole) || null;
  }

  // Add a user creation method that publishes events
  async create(data: Prisma.UserCreateInput): Promise<User> {
    try {
      const newUser = await this.prisma.user.create({
        data,
      });

      // Publish user registration event
      await this.eventBus.emit(
        new UserRegisteredEvent({
          userId: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role as 'client' | 'therapist' | 'admin',
          registrationMethod: 'email', // Default, can be enhanced later
        }),
      );

      return newUser;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create user: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // Helper method to extract relevant user fields for events
  private extractUserFields(user: User): Record<string, any> {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      role: user.role,
      isActive: user.isActive,
      avatarUrl: user.avatarUrl,
      birthDate: user.birthDate,
      address: user.address,
      // Remove unsupported properties - these don't exist in User model
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
