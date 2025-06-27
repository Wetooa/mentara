import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Post,
  UseGuards,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { ClerkAuthGuard } from 'src/clerk-auth.guard';
import { AdminAuthGuard } from 'src/guards/admin-auth.guard';
import { AdminOnly } from 'src/decorators/admin-only.decorator';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { UsersService } from './users.service';
import { RoleUtils } from 'src/utils/role-utils';

@Controller('users')
@UseGuards(ClerkAuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly roleUtils: RoleUtils,
  ) {}

  @Get()
  @UseGuards(AdminAuthGuard)
  @AdminOnly()
  async findAll(@CurrentUserId() currentUserId: string): Promise<User[]> {
    try {
      this.logger.log(`Admin ${currentUserId} retrieving all users`);
      return await this.usersService.findAll();
    } catch (error) {
      this.logger.error('Failed to fetch users:', error);
      throw new HttpException(
        `Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all-including-inactive')
  @UseGuards(AdminAuthGuard)
  @AdminOnly()
  async findAllIncludeInactive(
    @CurrentUserId() currentUserId: string,
  ): Promise<User[]> {
    try {
      this.logger.log(
        `Admin ${currentUserId} retrieving all users including inactive`,
      );
      return await this.usersService.findAllIncludeInactive();
    } catch (error) {
      this.logger.error('Failed to fetch all users:', error);
      throw new HttpException(
        `Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUserId() currentUserId: string,
  ): Promise<User> {
    try {
      // Users can only view their own profile unless they're admin
      const isAdmin = await this.roleUtils.isUserAdmin(currentUserId);

      if (!isAdmin && id !== currentUserId) {
        throw new ForbiddenException('You can only access your own profile');
      }

      const user = isAdmin
        ? await this.usersService.findOneIncludeInactive(id)
        : await this.usersService.findOne(id);

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof HttpException
      ) {
        throw error;
      }
      this.logger.error('Failed to fetch user:', error);
      throw new HttpException(
        `Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() userData: Prisma.UserUpdateInput,
    @CurrentUserId() currentUserId: string,
  ): Promise<User> {
    try {
      // Users can only update their own profile unless they're admin
      const isAdmin = await this.roleUtils.isUserAdmin(currentUserId);

      if (!isAdmin && id !== currentUserId) {
        throw new ForbiddenException('You can only update your own profile');
      }

      // Prevent non-admins from changing sensitive fields
      if (!isAdmin) {
        const allowedFields = [
          'firstName',
          'lastName',
          'bio',
          'avatarUrl',
          'phoneNumber',
          'timezone',
          'language',
          'theme',
        ];
        const sanitizedData: Prisma.UserUpdateInput = {};

        for (const field of allowedFields) {
          if (userData[field] !== undefined) {
            sanitizedData[field] = userData[field];
          }
        }
        userData = sanitizedData;
      }

      return await this.usersService.update(id, userData);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error('Failed to update user:', error);
      throw new HttpException(
        `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUserId() currentUserId: string,
  ): Promise<{ message: string }> {
    try {
      // Users can only deactivate their own account unless they're admin
      const isAdmin = await this.roleUtils.isUserAdmin(currentUserId);

      if (!isAdmin && id !== currentUserId) {
        throw new ForbiddenException(
          'You can only deactivate your own account',
        );
      }

      this.logger.log(`User/Admin ${currentUserId} deactivating user ${id}`);
      await this.usersService.remove(id);

      return { message: 'User account deactivated successfully' };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error('Failed to deactivate user:', error);
      throw new HttpException(
        `Failed to deactivate user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/deactivate')
  @UseGuards(AdminAuthGuard)
  @AdminOnly()
  async deactivateUser(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @CurrentUserId() currentUserId: string,
  ): Promise<{ message: string }> {
    try {
      this.logger.log(
        `Admin ${currentUserId} deactivating user ${id} with reason: ${body.reason}`,
      );
      await this.usersService.deactivate(id, body.reason, currentUserId);

      return { message: 'User account deactivated by administrator' };
    } catch (error) {
      this.logger.error('Failed to deactivate user:', error);
      throw new HttpException(
        `Failed to deactivate user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/reactivate')
  @UseGuards(AdminAuthGuard)
  @AdminOnly()
  async reactivateUser(
    @Param('id') id: string,
    @CurrentUserId() currentUserId: string,
  ): Promise<{ message: string }> {
    try {
      this.logger.log(`Admin ${currentUserId} reactivating user ${id}`);
      await this.usersService.reactivate(id);

      return { message: 'User account reactivated successfully' };
    } catch (error) {
      this.logger.error('Failed to reactivate user:', error);
      throw new HttpException(
        `Failed to reactivate user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
