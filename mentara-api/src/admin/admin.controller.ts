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
  Query,
  Put,
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

  // ===== THERAPIST APPLICATION MANAGEMENT =====

  @Get('therapist-applications')
  @AdminOnly()
  async getAllTherapistApplications(
    @CurrentUserId() currentUserId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      this.logger.log(
        `Admin ${currentUserId} retrieving therapist applications`,
      );
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;

      return await this.adminService.getAllTherapistApplications({
        status,
        page: pageNum,
        limit: limitNum,
      });
    } catch (error) {
      this.logger.error('Failed to retrieve therapist applications:', error);
      throw new HttpException(
        'Failed to retrieve therapist applications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('therapist-applications/:id')
  @AdminOnly()
  async getTherapistApplication(
    @CurrentUserId() currentUserId: string,
    @Param('id') applicationId: string,
  ) {
    try {
      this.logger.log(
        `Admin ${currentUserId} retrieving therapist application ${applicationId}`,
      );
      const application =
        await this.adminService.getTherapistApplication(applicationId);

      if (!application) {
        throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
      }

      return application;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Failed to retrieve therapist application:', error);
      throw new HttpException(
        'Failed to retrieve therapist application',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('therapist-applications/:id/approve')
  @AdminOnly()
  async approveTherapistApplication(
    @CurrentUserId() currentUserId: string,
    @Param('id') applicationId: string,
    @Body() approvalData: { notes?: string },
  ) {
    try {
      this.logger.log(
        `Admin ${currentUserId} approving therapist application ${applicationId}`,
      );
      return await this.adminService.approveTherapistApplication(
        applicationId,
        currentUserId,
        approvalData.notes,
      );
    } catch (error) {
      this.logger.error('Failed to approve therapist application:', error);
      throw new HttpException(
        'Failed to approve therapist application',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('therapist-applications/:id/reject')
  @AdminOnly()
  async rejectTherapistApplication(
    @CurrentUserId() currentUserId: string,
    @Param('id') applicationId: string,
    @Body() rejectionData: { reason: string; notes?: string },
  ) {
    try {
      this.logger.log(
        `Admin ${currentUserId} rejecting therapist application ${applicationId}`,
      );
      return await this.adminService.rejectTherapistApplication(
        applicationId,
        currentUserId,
        rejectionData.reason,
        rejectionData.notes,
      );
    } catch (error) {
      this.logger.error('Failed to reject therapist application:', error);
      throw new HttpException(
        'Failed to reject therapist application',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===== USER MANAGEMENT =====

  @Get('users')
  @AdminOnly()
  async getAllUsers(
    @CurrentUserId() currentUserId: string,
    @Query('role') role?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    try {
      this.logger.log(`Admin ${currentUserId} retrieving users`);
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;

      return await this.adminService.getAllUsers({
        role,
        page: pageNum,
        limit: limitNum,
        search,
      });
    } catch (error) {
      this.logger.error('Failed to retrieve users:', error);
      throw new HttpException(
        'Failed to retrieve users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('users/:id')
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

  @Put('users/:id/suspend')
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

  @Put('users/:id/unsuspend')
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

  // ===== PLATFORM ANALYTICS =====

  @Get('analytics/overview')
  @AdminOnly()
  async getPlatformOverview(@CurrentUserId() currentUserId: string) {
    try {
      this.logger.log(`Admin ${currentUserId} retrieving platform overview`);
      return await this.adminService.getPlatformOverview();
    } catch (error) {
      this.logger.error('Failed to retrieve platform overview:', error);
      throw new HttpException(
        'Failed to retrieve platform overview',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/matching-performance')
  @AdminOnly()
  async getMatchingPerformance(
    @CurrentUserId() currentUserId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      this.logger.log(
        `Admin ${currentUserId} retrieving matching performance analytics`,
      );
      return await this.adminService.getMatchingPerformance(startDate, endDate);
    } catch (error) {
      this.logger.error('Failed to retrieve matching performance:', error);
      throw new HttpException(
        'Failed to retrieve matching performance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===== CONTENT MODERATION =====

  @Get('content/flagged')
  @AdminOnly()
  async getFlaggedContent(
    @CurrentUserId() currentUserId: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      this.logger.log(`Admin ${currentUserId} retrieving flagged content`);
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;

      return await this.adminService.getFlaggedContent({
        type,
        page: pageNum,
        limit: limitNum,
      });
    } catch (error) {
      this.logger.error('Failed to retrieve flagged content:', error);
      throw new HttpException(
        'Failed to retrieve flagged content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('content/:contentType/:contentId/moderate')
  @AdminOnly()
  async moderateContent(
    @CurrentUserId() currentUserId: string,
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
    @Body()
    moderationData: { action: 'approve' | 'remove' | 'flag'; reason?: string },
  ) {
    try {
      this.logger.log(
        `Admin ${currentUserId} moderating ${contentType} ${contentId}`,
      );
      return await this.adminService.moderateContent(
        contentType,
        contentId,
        currentUserId,
        moderationData.action,
        moderationData.reason,
      );
    } catch (error) {
      this.logger.error('Failed to moderate content:', error);
      throw new HttpException(
        'Failed to moderate content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
