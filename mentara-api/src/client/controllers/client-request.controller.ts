import {
  Controller,
  Get,
  Post,
  Put,
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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  SendTherapistRequestDtoSchema,
  SendMultipleTherapistRequestsDtoSchema,
  ClientRequestFiltersDtoSchema,
  CancelClientRequestDtoSchema,
  type SendTherapistRequestDto,
  type SendMultipleTherapistRequestsDto,
  type ClientRequestFiltersDto,
  type CancelClientRequestDto,
} from 'mentara-commons';
import { ClientRequestService } from '../services/client-request.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('client-request')
@ApiBearerAuth('JWT-auth')
@Controller('client/requests')
@UseGuards(JwtAuthGuard)
export class ClientRequestController {
  private readonly logger = new Logger(ClientRequestController.name);

  constructor(private readonly clientRequestService: ClientRequestService) {}

  @Post('therapist/:therapistId')
  @ApiOperation({
    summary: 'Create send therapist request',

    description: 'Create send therapist request',
  })
  @ApiResponse({
    status: 201,

    description: 'Created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async sendTherapistRequest(
    @Param('therapistId') therapistId: string,
    @Body(new ZodValidationPipe(SendTherapistRequestDtoSchema))
    requestDto: SendTherapistRequestDto,
    @CurrentUserId() clientId: string,
  ) {
    this.logger.log(
      `Client ${clientId} sending request to therapist ${therapistId}`,
    );

    // Validate therapist ID format
    if (!therapistId || therapistId.length !== 36) {
      throw new BadRequestException('Invalid therapist ID format');
    }

    return this.clientRequestService.sendTherapistRequest(
      clientId,
      therapistId,
      requestDto,
    );
  }

  @Post('therapists/bulk')
  @ApiOperation({
    summary: 'Create send multiple therapist requests',

    description: 'Create send multiple therapist requests',
  })
  @ApiResponse({
    status: 201,

    description: 'Created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async sendMultipleTherapistRequests(
    @Body(new ZodValidationPipe(SendMultipleTherapistRequestsDtoSchema))
    requestData: SendMultipleTherapistRequestsDto,
    @CurrentUserId() clientId: string,
  ) {
    this.logger.log(
      `Client ${clientId} sending requests to ${requestData.therapistIds.length} therapists`,
    );
    return this.clientRequestService.sendMultipleTherapistRequests(
      clientId,
      requestData,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve get my requests',

    description: 'Retrieve get my requests',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getMyRequests(
    @Query(new ZodValidationPipe(ClientRequestFiltersDtoSchema))
    filters: ClientRequestFiltersDto,
    @CurrentUserId() clientId: string,
  ) {
    this.logger.log(`Client ${clientId} fetching their therapist requests`);
    return this.clientRequestService.getClientRequests(clientId, filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve get request details',

    description: 'Retrieve get request details',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getRequestDetails(
    @Param('id') requestId: string,
    @CurrentUserId() clientId: string,
  ) {
    this.logger.log(
      `Client ${clientId} fetching request details for ${requestId}`,
    );

    // Validate request ID format
    if (!requestId || requestId.length !== 36) {
      throw new BadRequestException('Invalid request ID format');
    }

    const requests = await this.clientRequestService.getClientRequests(
      clientId,
      {
        page: 1,
        limit: 1,
        sortBy: 'requestedAt',
        sortOrder: 'desc',
      },
    );

    const request = requests.requests.find((r) => r.id === requestId);

    if (!request) {
      throw new NotFoundException(
        `Request with ID ${requestId} not found or not accessible`,
      );
    }

    return {
      success: true,
      request,
    };
  }

  @Put(':id/cancel')
  @ApiOperation({
    summary: 'Update cancel request',

    description: 'Update cancel request',
  })
  @ApiResponse({
    status: 200,

    description: 'Updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async cancelRequest(
    @Param('id') requestId: string,
    @Body(new ZodValidationPipe(CancelClientRequestDtoSchema))
    cancelDto: CancelClientRequestDto,
    @CurrentUserId() clientId: string,
  ) {
    this.logger.log(`Client ${clientId} cancelling request ${requestId}`);

    // Validate request ID format
    if (!requestId || requestId.length !== 36) {
      throw new BadRequestException('Invalid request ID format');
    }

    return this.clientRequestService.cancelRequest(
      requestId,
      clientId,
      cancelDto.reason,
    );
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Retrieve get request statistics',

    description: 'Retrieve get request statistics',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getRequestStatistics(@CurrentUserId() clientId: string) {
    this.logger.log(`Client ${clientId} fetching request statistics`);
    return this.clientRequestService.getClientRequestStatistics(clientId);
  }

  @Get('pending/count')
  @ApiOperation({
    summary: 'Retrieve get pending requests count',

    description: 'Retrieve get pending requests count',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getPendingRequestsCount(@CurrentUserId() clientId: string) {
    this.logger.log(`Client ${clientId} fetching pending requests count`);

    const statistics =
      await this.clientRequestService.getClientRequestStatistics(clientId);

    return {
      success: true,
      pendingCount: statistics.pending,
      totalSent: statistics.totalSent,
    };
  }

  @Get('recent')
  @ApiOperation({
    summary: 'Retrieve get recent requests',

    description: 'Retrieve get recent requests',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getRecentRequests(@CurrentUserId() clientId: string) {
    this.logger.log(`Client ${clientId} fetching recent requests`);

    const recentRequests = await this.clientRequestService.getClientRequests(
      clientId,
      {
        page: 1,
        limit: 5,
        sortBy: 'requestedAt',
        sortOrder: 'desc',
      },
    );

    return {
      success: true,
      recentRequests: recentRequests.requests,
      hasMore: recentRequests.pagination.totalCount > 5,
    };
  }

  @Put('expire-stale')
  @ApiOperation({
    summary: 'Update expire stale requests',

    description: 'Update expire stale requests',
  })
  @ApiResponse({
    status: 200,

    description: 'Updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async expireStaleRequests(@CurrentUserId() clientId: string) {
    this.logger.log(`Client ${clientId} triggering stale request expiration`);

    // This endpoint allows clients to manually trigger expiration check
    // In production, this would typically be a scheduled job
    return this.clientRequestService.expireStaleRequests();
  }

  @Get('therapist/:therapistId/status')
  @ApiOperation({
    summary: 'Retrieve get request status with therapist',

    description: 'Retrieve get request status with therapist',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getRequestStatusWithTherapist(
    @Param('therapistId') therapistId: string,
    @CurrentUserId() clientId: string,
  ) {
    this.logger.log(
      `Client ${clientId} checking request status with therapist ${therapistId}`,
    );

    // Validate therapist ID format
    if (!therapistId || therapistId.length !== 36) {
      throw new BadRequestException('Invalid therapist ID format');
    }

    const requests = await this.clientRequestService.getClientRequests(
      clientId,
      {
        therapistId,
        page: 1,
        limit: 1,
        sortBy: 'requestedAt',
        sortOrder: 'desc',
      },
    );

    const hasActiveRequest = requests.requests.length > 0;
    const latestRequest = hasActiveRequest ? requests.requests[0] : null;

    return {
      success: true,
      hasActiveRequest,
      latestRequest: latestRequest
        ? {
            id: latestRequest.id,
            status: latestRequest.status,
            requestedAt: latestRequest.requestedAt,
            respondedAt: latestRequest.respondedAt,
            expiresAt: latestRequest.expiresAt,
          }
        : null,
      canSendNewRequest:
        !hasActiveRequest ||
        (latestRequest &&
          !['PENDING', 'ACCEPTED'].includes(latestRequest.status)),
    };
  }

  @Get('filters/options')
  @ApiOperation({
    summary: 'Retrieve get filter options',

    description: 'Retrieve get filter options',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getFilterOptions(@CurrentUserId() clientId: string) {
    this.logger.log(`Client ${clientId} fetching filter options`);

    // Return available filter options for the frontend
    return {
      success: true,
      filterOptions: {
        statuses: [
          'PENDING',
          'ACCEPTED',
          'DECLINED',
          'EXPIRED',
          'CANCELLED',
          'WITHDRAWN',
        ],
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
      },
    };
  }
}
