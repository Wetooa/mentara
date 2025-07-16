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
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../auth/guards/admin-auth.guard';
import { AdminOnly } from '../../auth/decorators/admin-only.decorator';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AdminUserQuerySchema, type AdminUserQuery } from 'mentara-commons';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
export class AdminUserController {
  private readonly logger = new Logger(AdminUserController.name);

  constructor(private readonly adminService: AdminService) {}

  @Get()
  @AdminOnly()
  async getAllUsers(
    @CurrentUserId() currentUserId: string,
    @Query(new ZodValidationPipe(AdminUserQuerySchema)) query: AdminUserQuery,
  ) {
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
  @AdminOnly()
  async getUser(
    @CurrentUserId() currentUserId: string,
    @Param('id') userId: string,
  ) {
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
  @AdminOnly()
  async suspendUser(
    @CurrentUserId() currentUserId: string,
    @Param('id') userId: string,
    @Body() suspensionData: { reason: string; duration?: number },
  ) {
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
  @AdminOnly()
  async unsuspendUser(
    @CurrentUserId() currentUserId: string,
    @Param('id') userId: string,
  ) {
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
