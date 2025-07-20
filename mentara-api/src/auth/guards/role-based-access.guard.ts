import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/providers/prisma-client.provider';

// Define role hierarchy - higher numbers have more permissions
const ROLE_HIERARCHY = {
  client: 0,
  therapist: 1,
  moderator: 2,
  admin: 3,
};

// Define role-based permissions for different resources
const ROLE_PERMISSIONS = {
  // User management
  'users:create': ['admin'],
  'users:read:all': ['admin', 'moderator'],
  'users:read:own': ['client', 'therapist', 'moderator', 'admin'],
  'users:update:own': ['client', 'therapist', 'moderator', 'admin'],
  'users:update:others': ['admin'],
  'users:delete': ['admin'],
  'users:deactivate': ['admin', 'moderator'],

  // Therapist management
  'therapists:create': ['admin'],
  'therapists:read:all': ['admin', 'moderator'],
  'therapists:read:public': ['client', 'therapist', 'moderator', 'admin'],
  'therapists:update:own': ['therapist', 'admin'],
  'therapists:update:others': ['admin'],
  'therapists:approve': ['admin'],
  'therapists:assign': ['admin', 'moderator'],

  // Client management
  'clients:create': ['admin'],
  'clients:read:all': ['admin', 'moderator'],
  'clients:read:assigned': ['therapist'],
  'clients:read:own': ['client', 'admin'],
  'clients:update:own': ['client', 'admin'],
  'clients:update:assigned': ['therapist', 'admin'],

  // Assessment management
  'assessments:create:own': ['client'],
  'assessments:read:own': ['client', 'admin'],
  'assessments:read:assigned': ['therapist'],
  'assessments:read:all': ['admin', 'moderator'],
  'assessments:update:own': ['client'],
  'assessments:delete:own': ['client', 'admin'],
  'assessments:delete:all': ['admin'],

  // Session management
  'sessions:create': ['therapist', 'admin'],
  'sessions:read:own': ['client', 'therapist'],
  'sessions:read:all': ['admin', 'moderator'],
  'sessions:update:own': ['therapist'],
  'sessions:cancel:own': ['client', 'therapist'],
  'sessions:cancel:all': ['admin'],

  // Messaging
  'messages:create': ['client', 'therapist'],
  'messages:read:own': ['client', 'therapist'],
  'messages:read:all': ['admin', 'moderator'],
  'messages:moderate': ['moderator', 'admin'],

  // Community management
  'communities:create': ['admin'],
  'communities:read:all': ['client', 'therapist', 'moderator', 'admin'],
  'communities:update': ['admin', 'moderator'],
  'communities:moderate': ['moderator', 'admin'],
  'communities:join': ['client', 'therapist'],

  // Content management
  'posts:create': ['client', 'therapist'],
  'posts:read:all': ['client', 'therapist', 'moderator', 'admin'],
  'posts:update:own': ['client', 'therapist'],
  'posts:delete:own': ['client', 'therapist'],
  'posts:moderate': ['moderator', 'admin'],

  // File management
  'files:upload:own': ['client', 'therapist'],
  'files:read:own': ['client', 'therapist'],
  'files:read:assigned': ['therapist'],
  'files:read:all': ['admin'],
  'files:delete:own': ['client', 'therapist', 'admin'],
  'files:delete:all': ['admin'],

  // Admin functions
  'admin:access': ['admin'],
  'admin:analytics': ['admin', 'moderator'],
  'admin:system-config': ['admin'],

  // Billing
  'billing:create': ['admin'],
  'billing:read:own': ['client', 'therapist'],
  'billing:read:all': ['admin'],
  'billing:update': ['admin'],

  // Notifications
  'notifications:create': ['admin', 'moderator'],
  'notifications:read:own': ['client', 'therapist', 'moderator', 'admin'],
  'notifications:update:own': ['client', 'therapist', 'moderator', 'admin'],
};

// Decorator to define required permissions
export const RequirePermissions = (...permissions: string[]) =>
  Reflect.defineMetadata('permissions', permissions, Reflect);

// Decorator to define minimum role required
export const RequireRole = (role: keyof typeof ROLE_HIERARCHY) =>
  Reflect.defineMetadata('min_role', role, Reflect);

// Decorator to allow resource owner access
export const AllowResourceOwner = (resourceIdParam: string = 'id') =>
  Reflect.defineMetadata('resource_owner_param', resourceIdParam, Reflect);

@Injectable()
export class RoleBasedAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userRole = request.userRole || user?.role;
    const userId = request.userId || user?.userId;

    if (!userRole || !userId) {
      // If no role or user ID, deny access (unless it's a public route)
      return false;
    }

    // Check for required permissions
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (requiredPermissions) {
      const hasPermission = this.checkPermissions(
        userRole,
        requiredPermissions,
      );
      if (!hasPermission) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    // Check for minimum role requirement
    const minimumRole = this.reflector.getAllAndOverride<
      keyof typeof ROLE_HIERARCHY
    >('min_role', [context.getHandler(), context.getClass()]);

    if (minimumRole) {
      const hasRole = this.checkRole(userRole, minimumRole);
      if (!hasRole) {
        throw new ForbiddenException(`Minimum role '${minimumRole}' required`);
      }
    }

    // Check for resource owner access
    const resourceOwnerParam = this.reflector.getAllAndOverride<string>(
      'resource_owner_param',
      [context.getHandler(), context.getClass()],
    );

    if (resourceOwnerParam) {
      const resourceId = request.params[resourceOwnerParam];
      const isOwner = this.checkResourceOwnership(
        userId,
        resourceId,
        userRole,
        request,
      );
      if (!isOwner) {
        throw new ForbiddenException('Access denied - not resource owner');
      }
    }

    // Special validation for therapist-client relationships
    if (userRole === 'therapist') {
      const clientId = request.params.clientId || request.body?.clientId;
      if (clientId) {
        const isValidRelationship = await this.validateTherapistClientRelationship(
          userId,
          clientId,
        );
        if (!isValidRelationship) {
          throw new ForbiddenException(
            'Access denied - no active therapist-client relationship',
          );
        }
      }
    }

    return true;
  }

  private checkPermissions(
    userRole: string,
    requiredPermissions: string[],
  ): boolean {
    return requiredPermissions.some((permission) => {
      const allowedRoles = ROLE_PERMISSIONS[permission] || [];
      return allowedRoles.includes(userRole);
    });
  }

  private checkRole(
    userRole: string,
    minimumRole: keyof typeof ROLE_HIERARCHY,
  ): boolean {
    const userRoleLevel =
      ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY];
    const minimumRoleLevel = ROLE_HIERARCHY[minimumRole];

    return userRoleLevel !== undefined && userRoleLevel >= minimumRoleLevel;
  }

  private checkResourceOwnership(
    userId: string,
    resourceId: string,
    userRole: string,
    request: any,
  ): boolean {
    // If no resource ID specified, allow access
    if (!resourceId) return true;

    // Admin can access any resource
    if (userRole === 'admin') return true;

    // Check if the resource ID matches the user ID
    if (resourceId === userId) return true;

    // For therapists, deny access here - specific therapist-client validation 
    // is handled in the main canActivate method above
    if (userRole === 'therapist') {
      return false;
    }

    // For moderators, allow access to community resources
    if (userRole === 'moderator') {
      const path = request.path;
      if (
        path.includes('/communities') ||
        path.includes('/posts') ||
        path.includes('/comments')
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Validate that a therapist has an active relationship with a client
   */
  private async validateTherapistClientRelationship(
    therapistId: string,
    clientId: string,
  ): Promise<boolean> {
    try {
      const relationship = await this.prisma.clientTherapist.findFirst({
        where: {
          therapistId,
          clientId,
          status: 'ACTIVE',
        },
      });

      return !!relationship;
    } catch (error) {
      // Log error and deny access on database errors for security
      console.error('Error validating therapist-client relationship:', error);
      return false;
    }
  }

  // Helper method to get user permissions for debugging
  static getUserPermissions(userRole: string): string[] {
    return Object.entries(ROLE_PERMISSIONS)
      .filter(([_, roles]) => roles.includes(userRole))
      .map(([permission]) => permission);
  }

  // Helper method to check if a user can access a specific resource
  static canAccessResource(
    userRole: string,
    permission: string,
    userId?: string,
    resourceOwnerId?: string,
  ): boolean {
    const allowedRoles = ROLE_PERMISSIONS[permission] || [];
    const hasRolePermission = allowedRoles.includes(userRole);

    if (hasRolePermission) return true;

    // Check resource ownership
    if (userId && resourceOwnerId && userId === resourceOwnerId) {
      return true;
    }

    return false;
  }
}
