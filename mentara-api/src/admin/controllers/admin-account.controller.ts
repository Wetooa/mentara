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
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../auth/guards/admin-auth.guard';
import { AdminOnly } from '../../auth/decorators/admin-only.decorator';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';
import { ValidatedBody } from '../../common/decorators/validate-body.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  CreateAdminDtoSchema,
  UpdateAdminDtoSchema,
  type CreateAdminDto,
  type UpdateAdminDto,
  type AdminResponseDto,
} from 'mentara-commons';

@ApiTags('admin-account')
@ApiBearerAuth('JWT-auth')
@Controller('admin/accounts')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
export class AdminAccountController {
  private readonly logger = new Logger(AdminAccountController.name);

  constructor(private readonly adminService: AdminService) {}

  @Post()


  @ApiOperation({ 


    summary: 'Create create',


    description: 'Create create' 


  })


  @ApiResponse({ 


    status: 201, 


    description: 'Created successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  @AdminOnly()
  async create(
    @ValidatedBody(CreateAdminDtoSchema) createAdminDto: CreateAdminDto,
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


  @ApiOperation({ 


    summary: 'Retrieve find all',


    description: 'Retrieve find all' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Retrieve find one',


    description: 'Retrieve find one' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Partially update update',


    description: 'Partially update update' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Updated successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  @AdminOnly()
  async update(
    @Param('id') id: string,
    @ValidatedBody(UpdateAdminDtoSchema) updateAdminDto: UpdateAdminDto,
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


  @ApiOperation({ 


    summary: 'Delete remove',


    description: 'Delete remove' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Deleted successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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
