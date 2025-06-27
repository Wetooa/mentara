import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { User, Prisma } from '@prisma/client';
import { UserRole } from 'src/utils/role-utils';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
      throw new Error(error instanceof Error ? error.message : String(error));
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
      throw new Error(error instanceof Error ? error.message : String(error));
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
          moderator: true,
        },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async findByRole(role: string): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: {
        role,
        isActive: true, // Only return active users
      },
    });
  }

  async findAllIncludeInactive(): Promise<User[]> {
    // For administrative purposes - include inactive users
    try {
      return await this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<User> {
    // Implement soft delete for HIPAA compliance
    return await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        suspendedAt: new Date(),
        suspensionReason: 'Account deactivated by user',
        // Keep all data intact for compliance
      },
    });
  }

  async deactivate(
    id: string,
    reason?: string,
    deactivatedBy?: string,
  ): Promise<User> {
    // Administrative deactivation with audit trail
    return await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        suspendedAt: new Date(),
        suspendedBy: deactivatedBy,
        suspensionReason: reason || 'Account deactivated by administrator',
      },
    });
  }

  async reactivate(id: string): Promise<User> {
    // Allow reactivation if needed
    return await this.prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        suspendedAt: null,
        suspendedBy: null,
        suspensionReason: null,
      },
    });
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
}
