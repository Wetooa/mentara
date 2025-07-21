import {
  Controller,
  Get,
  Put,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
  Query,
  Param,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';
import { CurrentUserRole } from '../../auth/decorators/current-user-role.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AdminUserQuerySchema, type AdminUserQuery } from 'mentara-commons';

@Controller('admin/users')
@UseGuards(JwtAuthGuard)
export class AdminUserController {
  private readonly logger = new Logger(AdminUserController.name);

  constructor(private readonly adminService: AdminService) {}

  @Get()
  async getAllUsers(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
    @Query(new ZodValidationPipe(AdminUserQuerySchema)) query: AdminUserQuery,
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    try {
      this.logger.log(`Admin ${currentUserId} retrieving users`);

      return await this.adminService.getAllUsers({
        role: query.role,
        page: query.page,
        limit: query.limit,
        search: query.search,
        status: query.status,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });
    } catch (error) {
      this.logger.error('Failed to retrieve users:', error);
      throw new HttpException(
        'Failed to retrieve users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getUser(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
    @Param('id') userId: string,
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    try {
      this.logger.log(`Admin ${currentUserId} retrieving user ${userId}`);
      const user = await this.adminService.getUser(userId);

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Failed to retrieve user:', error);
      throw new HttpException(
        'Failed to retrieve user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/suspend')
  async suspendUser(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
    @Param('id') userId: string,
    @Body() suspensionData: { reason: string; duration?: number },
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    try {
      this.logger.log(`Admin ${currentUserId} suspending user ${userId}`);
      return await this.adminService.suspendUser(
        userId,
        currentUserId,
        suspensionData.reason,
        suspensionData.duration,
      );
    } catch (error) {
      this.logger.error('Failed to suspend user:', error);
      throw new HttpException(
        'Failed to suspend user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/unsuspend')
  async unsuspendUser(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
    @Param('id') userId: string,
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    try {
      this.logger.log(`Admin ${currentUserId} unsuspending user ${userId}`);
      return await this.adminService.unsuspendUser(userId, currentUserId);
    } catch (error) {
      this.logger.error('Failed to unsuspend user:', error);
      throw new HttpException(
        'Failed to unsuspend user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
