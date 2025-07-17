import { Controller, UseGuards, Logger } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  // NOTE: This controller has been refactored for better organization.
  // All routes have been moved to focused controllers:
  //
  // - Admin account management → AdminAccountController (/admin/accounts)
  // - Therapist applications → AdminTherapistController (/admin/therapists)
  // - User management → AdminUserController (/admin/users)
  // - Platform analytics → AdminAnalyticsController (/admin/analytics)
  // - Content moderation → AdminModerationController (/admin/moderation)
  //
  // This controller can be removed once all client code has been updated
  // to use the new route paths. It currently serves as a placeholder to
  // maintain the module structure.
}
