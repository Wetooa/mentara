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
  ValidationPipe,
  UsePipes
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleBasedAccessGuard } from '../../guards/role-based-access.guard';
import { Roles } from '../../decorators/roles.decorator';
import { GetUser } from '../../decorators/get-user.decorator';
import { JoinRequestService } from '../services/join-request.service';
import { IsString, IsOptional, IsIn, IsUUID, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { JoinRequestStatus } from '@prisma/client';

class CreateJoinRequestDto {
  @IsUUID()
  communityId: string;

  @IsOptional()
  @IsString()
  message?: string;
}

class ProcessJoinRequestDto {
  @IsString()
  @IsIn(['approve', 'reject'])
  action: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  moderatorNote?: string;
}

class JoinRequestFiltersDto {
  @IsOptional()
  @IsUUID()
  communityId?: string;

  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'])
  status?: JoinRequestStatus;

  @IsOptional()
  @IsUUID()
  moderatorId?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

class StatsFiltersDto {
  @IsOptional()
  @IsUUID()
  communityId?: string;

  @IsOptional()
  @IsUUID()
  moderatorId?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

@ApiTags('Community Moderation')
@Controller('communities/moderation')
@UseGuards(JwtAuthGuard, RoleBasedAccessGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
export class ModerationController {
  constructor(
    private readonly joinRequestService: JoinRequestService
  ) {}

  // ===== JOIN REQUEST MANAGEMENT =====

  @Post('join-requests')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a join request',
    description: 'Submit a request to join a community'
  })
  @ApiResponse({
    status: 201,
    description: 'Join request created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            user: { type: 'object' },
            community: { type: 'object' },
            status: { type: 'string' },
            message: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or user already has pending/approved request'
  })
  async createJoinRequest(
    @GetUser() user: any,
    @Body() dto: CreateJoinRequestDto
  ) {
    try {
      const joinRequest = await this.joinRequestService.createJoinRequest({
        userId: user.id,
        communityId: dto.communityId,
        message: dto.message
      });

      return {
        success: true,
        data: joinRequest,
        message: 'Join request created successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('join-requests')
  @Roles('moderator', 'admin')
  @ApiOperation({ 
    summary: 'Get join requests for moderation',
    description: 'Retrieve join requests with filtering and pagination (moderator/admin only)'
  })
  @ApiQuery({ name: 'communityId', required: false, type: 'string' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] })
  @ApiQuery({ name: 'moderatorId', required: false, type: 'string' })
  @ApiQuery({ name: 'dateFrom', required: false, type: 'string', format: 'date' })
  @ApiQuery({ name: 'dateTo', required: false, type: 'string', format: 'date' })
  @ApiQuery({ name: 'page', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Join requests retrieved successfully'
  })
  async getJoinRequests(
    @Query() filters: JoinRequestFiltersDto
  ) {
    try {
      const result = await this.joinRequestService.getJoinRequests({
        communityId: filters.communityId,
        status: filters.status as JoinRequestStatus,
        moderatorId: filters.moderatorId,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined
      }, filters.page, filters.limit);

      return {
        success: true,
        data: result,
        message: 'Join requests retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('join-requests/my-requests')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @ApiOperation({ 
    summary: 'Get current user join requests',
    description: 'Retrieve join requests submitted by the current user'
  })
  @ApiResponse({
    status: 200,
    description: 'User join requests retrieved successfully'
  })
  async getUserJoinRequests(@GetUser() user: any) {
    try {
      const requests = await this.joinRequestService.getUserJoinRequests(user.id);

      return {
        success: true,
        data: requests,
        message: 'User join requests retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('join-requests/pending')
  @Roles('moderator', 'admin')
  @ApiOperation({ 
    summary: 'Get pending join requests for moderator',
    description: 'Retrieve pending join requests for communities the moderator can moderate'
  })
  @ApiResponse({
    status: 200,
    description: 'Pending join requests retrieved successfully'
  })
  async getPendingJoinRequests(@GetUser() user: any) {
    try {
      const requests = await this.joinRequestService.getPendingRequestsForModerator(user.id);

      return {
        success: true,
        data: requests,
        message: 'Pending join requests retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  @Put('join-requests/:requestId/process')
  @Roles('moderator', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Process a join request',
    description: 'Approve or reject a join request (moderator/admin only)'
  })
  @ApiParam({
    name: 'requestId',
    type: 'string',
    format: 'uuid',
    description: 'Join request ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Join request processed successfully'
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions to moderate this community'
  })
  @ApiResponse({
    status: 404,
    description: 'Join request not found'
  })
  async processJoinRequest(
    @GetUser() user: any,
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Body() dto: ProcessJoinRequestDto
  ) {
    try {
      const processedRequest = await this.joinRequestService.processJoinRequest({
        requestId,
        moderatorId: user.id,
        action: dto.action,
        moderatorNote: dto.moderatorNote
      });

      return {
        success: true,
        data: processedRequest,
        message: `Join request ${dto.action}ed successfully`
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete('join-requests/:requestId')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Cancel a join request',
    description: 'Cancel a pending join request (user can cancel their own requests)'
  })
  @ApiParam({
    name: 'requestId',
    type: 'string',
    format: 'uuid',
    description: 'Join request ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Join request cancelled successfully'
  })
  @ApiResponse({
    status: 403,
    description: 'Can only cancel your own pending requests'
  })
  async cancelJoinRequest(
    @GetUser() user: any,
    @Param('requestId', ParseUUIDPipe) requestId: string
  ) {
    try {
      await this.joinRequestService.cancelJoinRequest(requestId, user.id);

      return {
        success: true,
        message: 'Join request cancelled successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // ===== STATISTICS AND ANALYTICS =====

  @Get('join-requests/stats')
  @Roles('moderator', 'admin')
  @ApiOperation({ 
    summary: 'Get join request statistics',
    description: 'Retrieve statistics about join requests for moderation analytics'
  })
  @ApiQuery({ name: 'communityId', required: false, type: 'string' })
  @ApiQuery({ name: 'moderatorId', required: false, type: 'string' })
  @ApiQuery({ name: 'dateFrom', required: false, type: 'string', format: 'date' })
  @ApiQuery({ name: 'dateTo', required: false, type: 'string', format: 'date' })
  @ApiResponse({
    status: 200,
    description: 'Join request statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            totalRequests: { type: 'number' },
            pendingRequests: { type: 'number' },
            approvedRequests: { type: 'number' },
            rejectedRequests: { type: 'number' },
            cancelledRequests: { type: 'number' },
            averageProcessingTime: { type: 'number' },
            approvalRate: { type: 'number' },
            byPriority: { type: 'object' }
          }
        }
      }
    }
  })
  async getJoinRequestStats(@Query() filters: StatsFiltersDto) {
    try {
      const stats = await this.joinRequestService.getJoinRequestStats(
        filters.communityId,
        filters.moderatorId,
        filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        filters.dateTo ? new Date(filters.dateTo) : undefined
      );

      return {
        success: true,
        data: stats,
        message: 'Join request statistics retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('communities/:communityId/join-requests')
  @Roles('moderator', 'admin')
  @ApiOperation({ 
    summary: 'Get join requests for a specific community',
    description: 'Retrieve join requests for a specific community (moderator/admin only)'
  })
  @ApiParam({
    name: 'communityId',
    type: 'string',
    format: 'uuid',
    description: 'Community ID'
  })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] })
  @ApiQuery({ name: 'page', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Community join requests retrieved successfully'
  })
  async getCommunityJoinRequests(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Query() query: Pick<JoinRequestFiltersDto, 'status' | 'page' | 'limit'>
  ) {
    try {
      const result = await this.joinRequestService.getJoinRequests({
        communityId,
        status: query.status as JoinRequestStatus
      }, query.page || 1, query.limit || 20);

      return {
        success: true,
        data: result,
        message: 'Community join requests retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('communities/:communityId/stats')
  @Roles('moderator', 'admin')
  @ApiOperation({ 
    summary: 'Get statistics for a specific community',
    description: 'Retrieve moderation statistics for a specific community'
  })
  @ApiParam({
    name: 'communityId',
    type: 'string',
    format: 'uuid',
    description: 'Community ID'
  })
  @ApiQuery({ name: 'dateFrom', required: false, type: 'string', format: 'date' })
  @ApiQuery({ name: 'dateTo', required: false, type: 'string', format: 'date' })
  @ApiResponse({
    status: 200,
    description: 'Community statistics retrieved successfully'
  })
  async getCommunityStats(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Query() filters: Pick<StatsFiltersDto, 'dateFrom' | 'dateTo'>
  ) {
    try {
      const stats = await this.joinRequestService.getJoinRequestStats(
        communityId,
        undefined,
        filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        filters.dateTo ? new Date(filters.dateTo) : undefined
      );

      return {
        success: true,
        data: stats,
        message: 'Community statistics retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('moderators/:moderatorId/stats')
  @Roles('admin')
  @ApiOperation({ 
    summary: 'Get statistics for a specific moderator',
    description: 'Retrieve moderation statistics for a specific moderator (admin only)'
  })
  @ApiParam({
    name: 'moderatorId',
    type: 'string',
    format: 'uuid',
    description: 'Moderator ID'
  })
  @ApiQuery({ name: 'dateFrom', required: false, type: 'string', format: 'date' })
  @ApiQuery({ name: 'dateTo', required: false, type: 'string', format: 'date' })
  @ApiResponse({
    status: 200,
    description: 'Moderator statistics retrieved successfully'
  })
  async getModeratorStats(
    @Param('moderatorId', ParseUUIDPipe) moderatorId: string,
    @Query() filters: Pick<StatsFiltersDto, 'dateFrom' | 'dateTo'>
  ) {
    try {
      const stats = await this.joinRequestService.getJoinRequestStats(
        undefined,
        moderatorId,
        filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        filters.dateTo ? new Date(filters.dateTo) : undefined
      );

      return {
        success: true,
        data: stats,
        message: 'Moderator statistics retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // ===== BULK OPERATIONS =====

  @Post('join-requests/bulk-process')
  @Roles('moderator', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Bulk process join requests',
    description: 'Process multiple join requests at once (moderator/admin only)'
  })
  @ApiResponse({
    status: 200,
    description: 'Join requests processed successfully'
  })
  async bulkProcessJoinRequests(
    @GetUser() user: any,
    @Body() dto: {
      requestIds: string[];
      action: 'approve' | 'reject';
      moderatorNote?: string;
    }
  ) {
    try {
      const results = [];

      for (const requestId of dto.requestIds) {
        try {
          const processedRequest = await this.joinRequestService.processJoinRequest({
            requestId,
            moderatorId: user.id,
            action: dto.action,
            moderatorNote: dto.moderatorNote
          });
          results.push({ requestId, success: true, data: processedRequest });
        } catch (error) {
          results.push({ requestId, success: false, error: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      return {
        success: true,
        data: {
          results,
          summary: {
            total: dto.requestIds.length,
            successful: successCount,
            failed: failureCount
          }
        },
        message: `Bulk processing completed: ${successCount} successful, ${failureCount} failed`
      };
    } catch (error) {
      throw error;
    }
  }
}