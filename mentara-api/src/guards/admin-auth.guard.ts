import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RoleUtils, UserRole } from '../utils/role-utils';
import { ADMIN_ONLY_KEY } from '../decorators/admin-only.decorator';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  private readonly logger = new Logger(AdminAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private roleUtils: RoleUtils,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAdminOnly = this.reflector.getAllAndOverride<boolean>(
      ADMIN_ONLY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isAdminOnly) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.userId;

    if (!userId) {
      this.logger.warn('No user ID found in request');
      throw new ForbiddenException('Authentication required');
    }

    try {
      const isAdmin = await this.roleUtils.isUserAdmin(userId);

      if (!isAdmin) {
        this.logger.warn(
          `User ${userId} attempted to access admin endpoint without permission`,
        );
        throw new ForbiddenException('Admin access required');
      }

      return true;
    } catch (error) {
      this.logger.error('Error checking admin permissions:', error);
      throw new ForbiddenException('Unable to verify admin permissions');
    }
  }
}

