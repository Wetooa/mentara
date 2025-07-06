import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  CreateAdminDto,
  UpdateAdminDto,
  AdminResponseDto,
} from './dto/admin.dto';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { AdminOnly } from '../decorators/admin-only.decorator';
import { CurrentUserId } from '../decorators/current-user-id.decorator';

@Controller('admin')
@UseGuards(ClerkAuthGuard, AdminAuthGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  @Post()
  @AdminOnly()
  async create(
    @Body() createAdminDto: CreateAdminDto,
    @CurrentUserId() currentUserId: string,
  ): Promise<AdminResponseDto> {
    try {
      this.logger.log(
        `Admin ${currentUserId} creating new admin for user ${createAdminDto.userId}`,
      );
      return await this.adminService.create(createAdminDto);
    } catch (error) {
      this.logger.error('Failed to create admin:', error);
      throw new HttpException(
        'Failed to create admin user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @AdminOnly()
  async findAll(
    @CurrentUserId() currentUserId: string,
  ): Promise<AdminResponseDto[]> {
    try {
      this.logger.log(`Admin ${currentUserId} retrieving all admins`);
      return await this.adminService.findAll();
    } catch (error) {
      this.logger.error('Failed to retrieve admins:', error);
      throw new HttpException(
        'Failed to retrieve admin users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @AdminOnly()
  async findOne(
    @Param('id') id: string,
    @CurrentUserId() currentUserId: string,
  ): Promise<AdminResponseDto | null> {
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
  @AdminOnly()
  async update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
    @CurrentUserId() currentUserId: string,
  ): Promise<AdminResponseDto> {
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
  @AdminOnly()
  async remove(
    @Param('id') id: string,
    @CurrentUserId() currentUserId: string,
  ): Promise<{ message: string }> {
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
