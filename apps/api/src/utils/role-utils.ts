import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';

import { UserRole } from '../common/types';
export { UserRole };

export interface RolePermissions {
  canAccessAdminPanel: boolean;
  canManageUsers: boolean;
  canManageTherapists: boolean;
  canModerateContent: boolean;
  canCreateWorksheets: boolean;
  canAssignWorksheets: boolean;
}

@Injectable()
export class RoleUtils {
  constructor(private prisma: PrismaService) {}

  async getUserRole(clerkId: string): Promise<UserRole | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: clerkId },
        select: { role: true },
      });
      return (user?.role as UserRole) || null;
    } catch (error) {
      console.error(
        'Error getting user role:',
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  }

  async isUserAdmin(clerkId: string): Promise<boolean> {
    const role = await this.getUserRole(clerkId);
    return role === UserRole.ADMIN;
  }

  async isUserTherapist(clerkId: string): Promise<boolean> {
    const role = await this.getUserRole(clerkId);
    return role === UserRole.THERAPIST;
  }

  async isUserRegularUser(clerkId: string): Promise<boolean> {
    const role = await this.getUserRole(clerkId);
    return role === UserRole.USER;
  }

  getRolePermissions(role: UserRole): RolePermissions {
    switch (role) {
      case UserRole.ADMIN:
        return {
          canAccessAdminPanel: true,
          canManageUsers: true,
          canManageTherapists: true,
          canModerateContent: true,
          canCreateWorksheets: true,
          canAssignWorksheets: true,
        };
      case UserRole.THERAPIST:
        return {
          canAccessAdminPanel: false,
          canManageUsers: false,
          canManageTherapists: false,
          canModerateContent: false,
          canCreateWorksheets: true,
          canAssignWorksheets: true,
        };
      case UserRole.USER:
      default:
        return {
          canAccessAdminPanel: false,
          canManageUsers: false,
          canManageTherapists: false,
          canModerateContent: false,
          canCreateWorksheets: false,
          canAssignWorksheets: false,
        };
    }
  }

  async getUserPermissions(clerkId: string): Promise<RolePermissions> {
    const role = await this.getUserRole(clerkId);
    return this.getRolePermissions(role || UserRole.USER);
  }

  async requireRole(clerkId: string, requiredRole: UserRole): Promise<boolean> {
    const userRole = await this.getUserRole(clerkId);
    if (!userRole) return false;

    const roleHierarchy = {
      [UserRole.USER]: 1,
      [UserRole.THERAPIST]: 2,
      [UserRole.ADMIN]: 4,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }
}
