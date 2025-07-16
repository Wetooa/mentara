import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleBasedAccessGuard } from '../../auth/guards/role-based-access.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { GetUser } from '../../decorators/get-user.decorator';

// JoinRequestService removed - join requests feature disabled
// This controller now provides stub responses for API compatibility

@Controller('communities/moderation')
@UseGuards(JwtAuthGuard, RoleBasedAccessGuard)
@Roles('moderator', 'admin')
@ApiTags('Community Moderation')
@ApiBearerAuth()
export class ModerationController {
  constructor() {
    // JoinRequestService removed - join requests feature disabled
  }

  @Post('join-requests')
  @ApiOperation({ summary: 'Create join request (disabled)' })
  @ApiResponse({ status: 400, description: 'Feature disabled' })
  async createJoinRequest(@Body() dto: any) {
    throw new BadRequestException('Join requests feature has been disabled');
  }

  @Get('join-requests')
  @ApiOperation({ summary: 'Get join requests (disabled)' })
  @ApiResponse({ status: 200, description: 'Empty list - feature disabled' })
  async getJoinRequests(@Query() query: any) {
    return {
      requests: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      filters: {},
    };
  }

  @Get('join-requests/user/:userId')
  @ApiOperation({ summary: 'Get user join requests (disabled)' })
  @ApiResponse({ status: 200, description: 'Empty list - feature disabled' })
  async getUserJoinRequests(@Param('userId') userId: string) {
    return [];
  }

  @Get('join-requests/pending')
  @ApiOperation({ summary: 'Get pending requests (disabled)' })
  @ApiResponse({ status: 200, description: 'Empty list - feature disabled' })
  async getPendingRequests(@GetUser() user: any) {
    return [];
  }

  @Put('join-requests/:requestId/process')
  @ApiOperation({ summary: 'Process join request (disabled)' })
  @ApiResponse({ status: 400, description: 'Feature disabled' })
  async processJoinRequest(
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Body() dto: any,
    @GetUser() user: any,
  ) {
    throw new BadRequestException('Join requests feature has been disabled');
  }

  @Delete('join-requests/:requestId')
  @ApiOperation({ summary: 'Cancel join request (disabled)' })
  @ApiResponse({ status: 400, description: 'Feature disabled' })
  async cancelJoinRequest(
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @GetUser() user: any,
  ) {
    throw new BadRequestException('Join requests feature has been disabled');
  }

  @Get('stats/join-requests')
  @ApiOperation({ summary: 'Get join request stats (disabled)' })
  @ApiResponse({ status: 200, description: 'Empty stats - feature disabled' })
  async getJoinRequestStats(@Query() query: any) {
    return {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      avgProcessingTime: 0,
      requestsByStatus: {},
      recentActivity: [],
    };
  }

  @Post('join-requests/bulk-process')
  @ApiOperation({ summary: 'Bulk process join requests (disabled)' })
  @ApiResponse({ status: 400, description: 'Feature disabled' })
  async bulkProcessJoinRequests(@Body() dto: any, @GetUser() user: any) {
    throw new BadRequestException('Join requests feature has been disabled');
  }
}