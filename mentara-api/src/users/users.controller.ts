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
  UseInterceptors,
  UploadedFiles,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import { AdminOnly } from 'src/auth/decorators/admin-only.decorator';
import { CurrentUserId } from 'src/auth/decorators/current-user-id.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  UserIdParamSchema,
  DeactivateUserDtoSchema,
  UpdateUserRequestSchema,
  type UserIdParam,
  type DeactivateUserDto,
  type UpdateUserRequest,
  type UserResponse,
  type SuccessMessageResponse,
} from 'mentara-commons';
import { UsersService } from './users.service';
import { SupabaseStorageService } from 'src/common/services/supabase-storage.service';
import { RoleUtils } from 'src/utils/role-utils';
import { UserResponseDto, SuccessMessageDto } from 'src/common/dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly roleUtils: RoleUtils,
  ) {}

  @Get()
  @UseGuards(AdminAuthGuard)
  @AdminOnly()
  async findAll(@CurrentUserId() currentUserId: string): Promise<UserResponse[]> {
    try {
      this.logger.log(`Admin ${currentUserId} retrieving all users`);
      const users = await this.usersService.findAll();
      return UserResponseDto.fromPrismaUsers(users);
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
  ): Promise<UserResponse[]> {
    try {
      this.logger.log(
        `Admin ${currentUserId} retrieving all users including inactive`,
      );
      const users = await this.usersService.findAllIncludeInactive();
      return UserResponseDto.fromPrismaUsers(users);
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
    @Param(new ZodValidationPipe(UserIdParamSchema)) params: UserIdParam,
    @CurrentUserId() currentUserId: string,
  ): Promise<UserResponse> {
    try {
      // Users can only view their own profile unless they're admin
      const isAdmin = await this.roleUtils.isUserAdmin(currentUserId);

      if (!isAdmin && params.id !== currentUserId) {
        throw new ForbiddenException('You can only access your own profile');
      }

      const user = isAdmin
        ? await this.usersService.findOneIncludeInactive(params.id)
        : await this.usersService.findOne(params.id);

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return UserResponseDto.fromPrismaUser(user);
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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  async update(
    @Param(new ZodValidationPipe(UserIdParamSchema)) params: UserIdParam,
    @Body(new ZodValidationPipe(UpdateUserRequestSchema))
    userData: UpdateUserRequest,
    @CurrentUserId() currentUserId: string,
    @UploadedFiles()
    files?: { avatar?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ): Promise<UserResponse> {
    try {
      // Users can only update their own profile unless they're admin
      const isAdmin = await this.roleUtils.isUserAdmin(currentUserId);

      if (!isAdmin && params.id !== currentUserId) {
        throw new ForbiddenException('You can only update your own profile');
      }

      // Handle file uploads if provided
      let avatarUrl: string | undefined;
      let coverImageUrl: string | undefined;

      if (files?.avatar?.[0]) {
        const validation = this.supabaseStorageService.validateFile(
          files.avatar[0],
        );
        if (!validation.isValid) {
          throw new HttpException(
            `Avatar validation failed: ${validation.error}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        const uploadResult = await this.supabaseStorageService.uploadFile(
          files.avatar[0],
          SupabaseStorageService.getSupportedBuckets().USER_PROFILES,
        );
        avatarUrl = uploadResult.url;
      }

      if (files?.cover?.[0]) {
        const validation = this.supabaseStorageService.validateFile(
          files.cover[0],
        );
        if (!validation.isValid) {
          throw new HttpException(
            `Cover image validation failed: ${validation.error}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        const uploadResult = await this.supabaseStorageService.uploadFile(
          files.cover[0],
          SupabaseStorageService.getSupportedBuckets().USER_PROFILES,
        );
        coverImageUrl = uploadResult.url;
      }

      // Prevent non-admins from changing sensitive fields
      if (!isAdmin) {
        const allowedFields = [
          'firstName',
          'middleName',
          'lastName',
          'birthDate',
          'address',
          'bio',
          'avatarUrl',
          'coverImageUrl',
          'phoneNumber',
          'timezone',
          'language',
          'theme',
        ];
        const sanitizedData: Partial<UpdateUserRequest> = {};

        for (const field of allowedFields) {
          if (userData[field as keyof UpdateUserRequest] !== undefined) {
            (sanitizedData as any)[field] =
              userData[field as keyof UpdateUserRequest];
          }
        }
        userData = sanitizedData as UpdateUserRequest;
      }

      // Add uploaded file URLs to userData
      if (avatarUrl) userData.avatarUrl = avatarUrl;
      if (coverImageUrl) userData.coverImageUrl = coverImageUrl;

      const updatedUser = await this.usersService.update(params.id, userData);
      return UserResponseDto.fromPrismaUser(updatedUser);
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
    @Param(new ZodValidationPipe(UserIdParamSchema)) params: UserIdParam,
    @CurrentUserId() currentUserId: string,
  ): Promise<SuccessMessageResponse> {
    try {
      // Users can only deactivate their own account unless they're admin
      const isAdmin = await this.roleUtils.isUserAdmin(currentUserId);

      if (!isAdmin && params.id !== currentUserId) {
        throw new ForbiddenException(
          'You can only deactivate your own account',
        );
      }

      this.logger.log(
        `User/Admin ${currentUserId} deactivating user ${params.id}`,
      );
      await this.usersService.remove(params.id);

      return new SuccessMessageDto('User account deactivated successfully');
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
    @Param(new ZodValidationPipe(UserIdParamSchema)) params: UserIdParam,
    @Body(new ZodValidationPipe(DeactivateUserDtoSchema))
    body: DeactivateUserDto,
    @CurrentUserId() currentUserId: string,
  ): Promise<SuccessMessageResponse> {
    try {
      this.logger.log(
        `Admin ${currentUserId} deactivating user ${params.id} with reason: ${body.reason}`,
      );
      await this.usersService.deactivate(params.id, body.reason, currentUserId);

      return new SuccessMessageDto('User account deactivated by administrator');
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
    @Param(new ZodValidationPipe(UserIdParamSchema)) params: UserIdParam,
    @CurrentUserId() currentUserId: string,
  ): Promise<SuccessMessageResponse> {
    try {
      this.logger.log(`Admin ${currentUserId} reactivating user ${params.id}`);
      await this.usersService.reactivate(params.id);

      return new SuccessMessageDto('User account reactivated successfully');
    } catch (error) {
      this.logger.error('Failed to reactivate user:', error);
      throw new HttpException(
        `Failed to reactivate user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
