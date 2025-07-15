import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUserId } from '../../decorators/current-user-id.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  TherapistRequestResponseDtoSchema,
  TherapistRequestFiltersDtoSchema,
  BulkTherapistActionDtoSchema,
  type TherapistRequestResponseDto,
  type TherapistRequestFiltersDto,
  type BulkTherapistActionDto,
} from 'mentara-commons';
import { TherapistRequestService } from '../services/therapist-request.service';

@Controller('therapist/requests')
@UseGuards(JwtAuthGuard)
export class TherapistRequestController {
  private readonly logger = new Logger(TherapistRequestController.name);

  constructor(private readonly therapistRequestService: TherapistRequestService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getClientRequests(
    @Query(new ZodValidationPipe(TherapistRequestFiltersDtoSchema)) filters: TherapistRequestFiltersDto,
    @CurrentUserId() therapistId: string,
  ) {
    this.logger.log(`Therapist ${therapistId} fetching client requests`);
    return this.therapistRequestService.getTherapistRequests(therapistId, filters);
  }

  @Get('pending')
  @HttpCode(HttpStatus.OK)
  async getPendingRequests(@CurrentUserId() therapistId: string) {
    this.logger.log(`Therapist ${therapistId} fetching pending requests`);
    
    const pendingRequests = await this.therapistRequestService.getTherapistRequests(therapistId, {
      status: 'PENDING',
      page: 1,
      limit: 50,
      sortBy: 'requestedAt',
      sortOrder: 'asc', // Oldest first for fairness
    });

    return {
      success: true,
      pendingRequests: pendingRequests.requests,
      totalPending: pendingRequests.pagination.totalCount,
      summary: pendingRequests.summary,
    };
  }

  @Get('priority')
  @HttpCode(HttpStatus.OK)
  async getHighPriorityRequests(@CurrentUserId() therapistId: string) {
    this.logger.log(`Therapist ${therapistId} fetching high priority requests`);
    
    const highPriorityRequests = await this.therapistRequestService.getTherapistRequests(therapistId, {
      status: 'PENDING',
      priority: 'HIGH',
      page: 1,
      limit: 20,
      sortBy: 'requestedAt',
      sortOrder: 'asc',
    });

    const urgentRequests = await this.therapistRequestService.getTherapistRequests(therapistId, {
      status: 'PENDING',
      priority: 'URGENT',
      page: 1,
      limit: 20,
      sortBy: 'requestedAt',
      sortOrder: 'asc',
    });

    return {
      success: true,
      highPriorityRequests: highPriorityRequests.requests,
      urgentRequests: urgentRequests.requests,
      totalHighPriority: highPriorityRequests.pagination.totalCount,
      totalUrgent: urgentRequests.pagination.totalCount,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getRequestDetails(
    @Param('id') requestId: string,
    @CurrentUserId() therapistId: string,
  ) {
    this.logger.log(`Therapist ${therapistId} fetching request details for ${requestId}`);
    
    // Validate request ID format
    if (!requestId || requestId.length !== 36) {
      throw new BadRequestException('Invalid request ID format');
    }

    const requests = await this.therapistRequestService.getTherapistRequests(therapistId, {
      page: 1,
      limit: 1,
    });

    const request = requests.requests.find(r => r.id === requestId);
    
    if (!request) {
      throw new NotFoundException(`Request with ID ${requestId} not found or not accessible`);
    }

    return {
      success: true,
      request,
    };
  }

  @Put(':id/accept')
  @HttpCode(HttpStatus.OK)
  async acceptRequest(
    @Param('id') requestId: string,
    @Body(new ZodValidationPipe(TherapistRequestResponseDtoSchema)) responseDto: TherapistRequestResponseDto,
    @CurrentUserId() therapistId: string,
  ) {
    this.logger.log(`Therapist ${therapistId} accepting request ${requestId}`);
    
    // Validate request ID format
    if (!requestId || requestId.length !== 36) {
      throw new BadRequestException('Invalid request ID format');
    }

    return this.therapistRequestService.acceptClientRequest(requestId, therapistId, responseDto);
  }

  @Put(':id/decline')
  @HttpCode(HttpStatus.OK)
  async declineRequest(
    @Param('id') requestId: string,
    @Body(new ZodValidationPipe(TherapistRequestResponseDtoSchema)) responseDto: TherapistRequestResponseDto,
    @CurrentUserId() therapistId: string,
  ) {
    this.logger.log(`Therapist ${therapistId} declining request ${requestId}`);
    
    // Validate request ID format
    if (!requestId || requestId.length !== 36) {
      throw new BadRequestException('Invalid request ID format');
    }

    return this.therapistRequestService.declineClientRequest(requestId, therapistId, responseDto);
  }

  @Post('bulk-action')
  @HttpCode(HttpStatus.OK)
  async performBulkAction(
    @Body(new ZodValidationPipe(BulkTherapistActionDtoSchema)) actionDto: BulkTherapistActionDto,
    @CurrentUserId() therapistId: string,
  ) {
    this.logger.log(`Therapist ${therapistId} performing bulk ${actionDto.action} on ${actionDto.requestIds.length} requests`);
    return this.therapistRequestService.performBulkAction(therapistId, actionDto);
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  async getRequestStatistics(@CurrentUserId() therapistId: string) {
    this.logger.log(`Therapist ${therapistId} fetching request statistics`);
    return this.therapistRequestService.getTherapistRequestStatistics(therapistId);
  }

  @Get('recent')
  @HttpCode(HttpStatus.OK)
  async getRecentRequests(@CurrentUserId() therapistId: string) {
    this.logger.log(`Therapist ${therapistId} fetching recent requests`);
    
    const recentRequests = await this.therapistRequestService.getTherapistRequests(therapistId, {
      page: 1,
      limit: 10,
      sortBy: 'requestedAt',
      sortOrder: 'desc',
    });

    return {
      success: true,
      recentRequests: recentRequests.requests,
      hasMore: recentRequests.pagination.totalCount > 10,
      summary: recentRequests.summary,
    };
  }

  @Get('dashboard/summary')
  @HttpCode(HttpStatus.OK)
  async getDashboardSummary(@CurrentUserId() therapistId: string) {
    this.logger.log(`Therapist ${therapistId} fetching dashboard summary`);
    
    const [statistics, pendingRequests, highPriorityRequests] = await Promise.all([
      this.therapistRequestService.getTherapistRequestStatistics(therapistId),
      this.therapistRequestService.getTherapistRequests(therapistId, {
        status: 'PENDING',
        page: 1,
        limit: 5,
        sortBy: 'requestedAt',
        sortOrder: 'asc',
      }),
      this.therapistRequestService.getTherapistRequests(therapistId, {
        status: 'PENDING',
        priority: 'HIGH',
        page: 1,
        limit: 3,
        sortBy: 'requestedAt',
        sortOrder: 'asc',
      }),
    ]);

    return {
      success: true,
      statistics,
      recentPendingRequests: pendingRequests.requests,
      highPriorityRequests: highPriorityRequests.requests,
      actionRequired: pendingRequests.pagination.totalCount > 0,
      hasUrgentRequests: highPriorityRequests.requests.some(req => req.priority === 'URGENT'),
    };
  }

  @Get('client/:clientId/history')
  @HttpCode(HttpStatus.OK)
  async getClientRequestHistory(
    @Param('clientId') clientId: string,
    @CurrentUserId() therapistId: string,
  ) {
    this.logger.log(`Therapist ${therapistId} fetching request history for client ${clientId}`);
    
    // Validate client ID format
    if (!clientId || clientId.length !== 36) {
      throw new BadRequestException('Invalid client ID format');
    }

    const clientHistory = await this.therapistRequestService.getTherapistRequests(therapistId, {
      clientId,
      page: 1,
      limit: 50,
      sortBy: 'requestedAt',
      sortOrder: 'desc',
      includeExpired: true,
    });

    return {
      success: true,
      clientId,
      requestHistory: clientHistory.requests,
      totalRequests: clientHistory.pagination.totalCount,
      hasActiveRelationship: clientHistory.requests.some(req => req.status === 'ACCEPTED'),
    };
  }

  @Get('filters/options')
  @HttpCode(HttpStatus.OK)
  async getFilterOptions(@CurrentUserId() therapistId: string) {
    this.logger.log(`Therapist ${therapistId} fetching filter options`);
    
    // Return available filter options for the frontend
    return {
      success: true,
      filterOptions: {
        statuses: ['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED', 'WITHDRAWN'],
        priorities: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
        sortOptions: [
          { value: 'requestedAt', label: 'Request Date' },
          { value: 'respondedAt', label: 'Response Date' },
          { value: 'priority', label: 'Priority' },
          { value: 'status', label: 'Status' },
        ],
        sortOrders: [
          { value: 'desc', label: 'Newest First' },
          { value: 'asc', label: 'Oldest First' },
        ],
        bulkActions: [
          { value: 'accept', label: 'Accept Selected' },
          { value: 'decline', label: 'Decline Selected' },
          { value: 'mark_reviewed', label: 'Mark as Reviewed' },
        ],
      },
    };
  }

  @Get('count/pending')
  @HttpCode(HttpStatus.OK)
  async getPendingCount(@CurrentUserId() therapistId: string) {
    this.logger.log(`Therapist ${therapistId} fetching pending requests count`);
    
    const statistics = await this.therapistRequestService.getTherapistRequestStatistics(therapistId);
    
    return {
      success: true,
      pendingCount: statistics.pending,
      totalReceived: statistics.totalReceived,
      needsAttention: statistics.pending > 0,
    };
  }

  @Get('analytics/response-time')
  @HttpCode(HttpStatus.OK)
  async getResponseTimeAnalytics(@CurrentUserId() therapistId: string) {
    this.logger.log(`Therapist ${therapistId} fetching response time analytics`);
    
    const statistics = await this.therapistRequestService.getTherapistRequestStatistics(therapistId);
    
    // Get detailed response time breakdown
    const responseTimeBreakdown = {
      averageHours: statistics.averageResponseTime,
      performance: this.categorizeResponseTime(statistics.averageResponseTime),
      acceptanceRate: statistics.acceptanceRate,
      totalResponded: statistics.accepted + statistics.declined,
    };

    return {
      success: true,
      responseTimeAnalytics: responseTimeBreakdown,
      recommendations: this.getResponseTimeRecommendations(statistics.averageResponseTime, statistics.acceptanceRate),
    };
  }

  // ===== HELPER METHODS =====

  private categorizeResponseTime(averageHours: number): string {
    if (averageHours <= 2) return 'excellent';
    if (averageHours <= 6) return 'good';
    if (averageHours <= 24) return 'fair';
    return 'needs_improvement';
  }

  private getResponseTimeRecommendations(averageHours: number, acceptanceRate: number): string[] {
    const recommendations = [];

    if (averageHours > 24) {
      recommendations.push('Consider responding to client requests within 24 hours for better client experience');
    }

    if (acceptanceRate < 30) {
      recommendations.push('Your acceptance rate is low. Consider reviewing your availability and client preferences');
    }

    if (acceptanceRate > 80) {
      recommendations.push('Excellent acceptance rate! You\'re providing great accessibility to clients');
    }

    if (averageHours <= 6 && acceptanceRate > 60) {
      recommendations.push('You\'re doing great with both response time and acceptance rate!');
    }

    return recommendations;
  }
}