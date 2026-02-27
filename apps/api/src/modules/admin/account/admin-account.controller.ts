import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator';
import { CurrentUserRole } from '../../../common/decorators/current-user-role.decorator';
import { ValidatedBody } from '../../../common/decorators/validate-body.decorator';
import {
  UpdateAdminDtoSchema,
  type UpdateAdminDto,
  type AdminResponseDto,
} from '../types';

@Controller('admin/accounts')
@UseGuards(JwtAuthGuard)
export class AdminAccountController {
  private readonly logger = new Logger(AdminAccountController.name);

  constructor(private readonly adminService: AdminService) {}

  @Get()
  async findAll(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<AdminResponseDto[]> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    try {
      this.logger.log(`Admin ${currentUserId} retrieving all admins`);
      return await this.adminService.findAll(limit, offset);
    } catch (error) {
      this.logger.error('Failed to retrieve admins:', error);
      throw new HttpException(
        'Failed to retrieve admin users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
  ): Promise<AdminResponseDto | null> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    try {
      this.logger.log(`Admin ${currentUserId} retrieving admin ${id}`);
      const admin = await this.adminService.findOne(id);

      if (!admin) {
        throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
      }

      return admin;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Failed to retrieve admin:', error);
      throw new HttpException(
        'Failed to retrieve admin user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @ValidatedBody(UpdateAdminDtoSchema) updateAdminDto: UpdateAdminDto,
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
  ): Promise<AdminResponseDto> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    try {
      this.logger.log(`Admin ${currentUserId} updating admin ${id}`);
      return await this.adminService.update(id, updateAdminDto);
    } catch (error) {
      this.logger.error('Failed to update admin:', error);
      throw new HttpException(
        'Failed to update admin user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
  ): Promise<{ message: string }> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    try {
      this.logger.log(`Admin ${currentUserId} deleting admin ${id}`);

      // Prevent self-deletion
      if (id === currentUserId) {
        throw new HttpException(
          'Cannot delete your own admin account',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.adminService.remove(id);
      return { message: 'Admin user deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Failed to delete admin:', error);
      throw new HttpException(
        'Failed to delete admin user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
