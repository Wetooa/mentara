import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { NotificationsService } from '../../notifications/notifications.service';
import { Prisma } from '@prisma/client';
import {
  type SendTherapistRequestDto,
  type ClientRequestFiltersDto,
  type CancelClientRequestDto,
} from 'mentara-commons';

@Injectable()
export class ClientRequestService {
  private readonly logger = new Logger(ClientRequestService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ===== SENDING THERAPIST REQUESTS =====

  async sendTherapistRequest(
    clientId: string,
    therapistId: string,
    requestDto: SendTherapistRequestDto,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Verify client exists and is active
        const client = await tx.client.findUnique({
          where: { userId: clientId },
          include: { user: true },
        });

        if (!client) {
          throw new NotFoundException(`Client with ID ${clientId} not found`);
        }

        if (!client.user.isActive) {
          throw new ForbiddenException('Client account is not active');
        }

        // 2. Verify therapist exists and is approved
        const therapist = await tx.therapist.findUnique({
          where: { userId: therapistId },
          include: { user: true },
        });

        if (!therapist) {
          throw new NotFoundException(
            `Therapist with ID ${therapistId} not found`,
          );
        }

        if (therapist.status !== 'approved') {
          throw new BadRequestException(
            'Cannot send request to unapproved therapist',
          );
        }

        if (!therapist.user.isActive) {
          throw new BadRequestException('Therapist is not currently active');
        }

        // 3. Check for existing active requests
        const existingRequest = await tx.clientTherapistRequest.findFirst({
          where: {
            clientId,
            therapistId,
            status: { in: ['PENDING', 'ACCEPTED'] },
          },
        });

        if (existingRequest) {
          throw new ConflictException(
            `An active request already exists between client ${clientId} and therapist ${therapistId}`,
          );
        }

        // 4. Check for existing client-therapist relationship
        const existingRelationship = await tx.clientTherapist.findFirst({
          where: {
            clientId,
            therapistId,
            status: 'active',
          },
        });

        if (existingRelationship) {
          throw new ConflictException(
            'Client already has an active relationship with this therapist',
          );
        }

        // 5. Create the request with auto-expiry (7 days)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        const request = await tx.clientTherapistRequest.create({
          data: {
            clientId,
            therapistId,
            status: 'PENDING',
            priority: requestDto.priority || 'NORMAL',
            clientMessage: requestDto.message,
            recommendationRank: requestDto.recommendationRank,
            matchScore: requestDto.matchScore,
            expiresAt: expiryDate,
          },
          include: {
            client: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            therapist: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        });

        // 6. Send notification to therapist
        await this.notificationsService.create({
          userId: therapistId,
          title: 'New Client Request',
          message: `${client.user.firstName} ${client.user.lastName} has sent you a therapy request.`,
          type: 'CLIENT_REQUEST_RECEIVED',
          priority:
            requestDto.priority === 'HIGH' || requestDto.priority === 'URGENT'
              ? 'HIGH'
              : 'NORMAL',
          actionUrl: `/therapist/requests/${request.id}`,
          data: {
            requestId: request.id,
            clientId,
            clientName: `${client.user.firstName} ${client.user.lastName}`,
          },
        });

        // 7. Create audit log
        await tx.auditLog.create({
          data: {
            userId: clientId,
            action: 'SEND_THERAPIST_REQUEST',
            entity: 'client_therapist_request',
            entityId: request.id,
            metadata: {
              clientId,
              therapistId,
              priority: requestDto.priority,
              hasMessage: !!requestDto.message,
              recommendationRank: requestDto.recommendationRank,
              timestamp: new Date().toISOString(),
            },
          },
        });

        this.logger.log(
          `Client ${clientId} sent request to therapist ${therapistId} with priority ${requestDto.priority}`,
        );

        return {
          success: true,
          request,
          message: 'Therapist request sent successfully',
          expiresAt: expiryDate,
        };
      });
    } catch (error) {
      this.logger.error(
        `Failed to send therapist request from ${clientId} to ${therapistId}:`,
        error,
      );
      throw error;
    }
  }

  async sendMultipleTherapistRequests(
    clientId: string,
    requestData: {
      therapistIds: string[];
      message?: string;
      priority?: string;
    },
  ) {
    try {
      const { therapistIds, message, priority = 'NORMAL' } = requestData;

      // Validate therapist IDs limit
      if (therapistIds.length > 10) {
        throw new BadRequestException(
          'Cannot send requests to more than 10 therapists at once',
        );
      }

      const results: {
        successful: Array<{
          therapistId: string;
          requestId: string;
          status: string;
        }>;
        failed: Array<{ therapistId: string; error: string }>;
        totalSent: number;
      } = {
        successful: [],
        failed: [],
        totalSent: 0,
      };

      // Send requests sequentially to avoid database conflicts
      for (const therapistId of therapistIds) {
        try {
          const result = await this.sendTherapistRequest(
            clientId,
            therapistId,
            {
              message,
              priority: priority as any,
            },
          );

          results.successful.push({
            therapistId,
            requestId: result.request.id,
            status: 'sent',
          });
          results.totalSent++;
        } catch (error: any) {
          results.failed.push({
            therapistId,
            error: error?.message || 'Unknown error',
          });
          this.logger.warn(
            `Failed to send request to therapist ${therapistId}: ${error?.message || 'Unknown error'}`,
          );
        }
      }

      this.logger.log(
        `Client ${clientId} sent bulk requests: ${results.totalSent} successful, ${results.failed.length} failed`,
      );

      return {
        success: true,
        results,
        summary: {
          totalRequested: therapistIds.length,
          totalSent: results.totalSent,
          totalFailed: results.failed.length,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to send multiple therapist requests for client ${clientId}:`,
        error,
      );
      throw error;
    }
  }

  // ===== RETRIEVING CLIENT REQUESTS =====

  async getClientRequests(clientId: string, filters: ClientRequestFiltersDto) {
    try {
      const {
        status,
        priority,
        therapistId,
        requestedAfter,
        requestedBefore,
        page = 1,
        limit = 20,
        sortBy = 'requestedAt',
        sortOrder = 'desc',
      } = filters;

      const skip = (page - 1) * limit;
      const where: Prisma.ClientTherapistRequestWhereInput = {
        clientId,
      };

      // Apply filters
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (therapistId) where.therapistId = therapistId;
      if (requestedAfter || requestedBefore) {
        const requestedAtFilter: any = {};
        if (requestedAfter) requestedAtFilter.gte = new Date(requestedAfter);
        if (requestedBefore) requestedAtFilter.lte = new Date(requestedBefore);
        where.requestedAt = requestedAtFilter;
      }

      const [requests, totalCount] = await Promise.all([
        this.prisma.clientTherapistRequest.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            therapist: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.clientTherapistRequest.count({ where }),
      ]);

      this.logger.log(
        `Retrieved ${requests.length} requests for client ${clientId}`,
      );

      return {
        requests,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        filters,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve requests for client ${clientId}:`,
        error,
      );
      throw error;
    }
  }

  // ===== REQUEST MANAGEMENT =====

  async cancelRequest(requestId: string, clientId: string, reason?: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Verify request exists and belongs to client
        const existingRequest = await tx.clientTherapistRequest.findUnique({
          where: { id: requestId },
          include: {
            therapist: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        });

        if (!existingRequest) {
          throw new NotFoundException(`Request with ID ${requestId} not found`);
        }

        if (existingRequest.clientId !== clientId) {
          throw new ForbiddenException('You can only cancel your own requests');
        }

        if (existingRequest.status !== 'PENDING') {
          throw new BadRequestException(
            `Cannot cancel request with status ${existingRequest.status}`,
          );
        }

        // 2. Update request status to cancelled
        const cancelledRequest = await tx.clientTherapistRequest.update({
          where: { id: requestId },
          data: {
            status: 'CANCELLED',
            respondedAt: new Date(),
          },
        });

        // 3. Notify therapist of cancellation
        await this.notificationsService.create({
          userId: existingRequest.therapistId,
          title: 'Client Request Cancelled',
          message: `A client request has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
          type: 'CLIENT_REQUEST_CANCELLED',
          priority: 'NORMAL',
          actionUrl: '/therapist/requests',
        });

        // 4. Create audit log
        await tx.auditLog.create({
          data: {
            userId: clientId,
            action: 'CANCEL_THERAPIST_REQUEST',
            entity: 'client_therapist_request',
            entityId: requestId,
            metadata: {
              requestId,
              therapistId: existingRequest.therapistId,
              reason,
              timestamp: new Date().toISOString(),
            },
          },
        });

        this.logger.log(`Client ${clientId} cancelled request ${requestId}`);

        return {
          success: true,
          request: cancelledRequest,
          message: 'Request cancelled successfully',
        };
      });
    } catch (error) {
      this.logger.error(
        `Failed to cancel request ${requestId} for client ${clientId}:`,
        error,
      );
      throw error;
    }
  }

  // ===== STATISTICS AND ANALYTICS =====

  async getClientRequestStatistics(clientId: string) {
    try {
      const [
        totalSent,
        pending,
        accepted,
        declined,
        expired,
        cancelled,
        recentRequests,
      ] = await Promise.all([
        // Total requests sent
        this.prisma.clientTherapistRequest.count({
          where: { clientId },
        }),
        // Pending requests
        this.prisma.clientTherapistRequest.count({
          where: { clientId, status: 'PENDING' },
        }),
        // Accepted requests
        this.prisma.clientTherapistRequest.count({
          where: { clientId, status: 'ACCEPTED' },
        }),
        // Declined requests
        this.prisma.clientTherapistRequest.count({
          where: { clientId, status: 'DECLINED' },
        }),
        // Expired requests
        this.prisma.clientTherapistRequest.count({
          where: { clientId, status: 'EXPIRED' },
        }),
        // Cancelled requests
        this.prisma.clientTherapistRequest.count({
          where: { clientId, status: 'CANCELLED' },
        }),
        // Recent requests for response time calculation
        this.prisma.clientTherapistRequest.findMany({
          where: {
            clientId,
            respondedAt: { not: null },
          },
          select: {
            requestedAt: true,
            respondedAt: true,
          },
          orderBy: { respondedAt: 'desc' },
          take: 10,
        }),
      ]);

      // Calculate acceptance rate
      const totalResponded = accepted + declined;
      const acceptanceRate =
        totalResponded > 0 ? (accepted / totalResponded) * 100 : 0;

      // Calculate average response time
      const responseTimes = recentRequests
        .filter((req) => req.respondedAt)
        .map((req) => {
          const responseTime =
            req.respondedAt!.getTime() - req.requestedAt.getTime();
          return responseTime / (1000 * 60 * 60); // Convert to hours
        });

      const averageResponseTime =
        responseTimes.length > 0
          ? responseTimes.reduce((sum, time) => sum + time, 0) /
            responseTimes.length
          : 0;

      // Get last request and response dates
      const lastRequest = await this.prisma.clientTherapistRequest.findFirst({
        where: { clientId },
        orderBy: { requestedAt: 'desc' },
        select: { requestedAt: true },
      });

      const lastResponse = await this.prisma.clientTherapistRequest.findFirst({
        where: { clientId, respondedAt: { not: null } },
        orderBy: { respondedAt: 'desc' },
        select: { respondedAt: true },
      });

      this.logger.log(`Generated request statistics for client ${clientId}`);

      return {
        totalSent,
        pending,
        accepted,
        declined,
        expired,
        cancelled,
        acceptanceRate: Math.round(acceptanceRate * 100) / 100,
        averageResponseTime: Math.round(averageResponseTime * 100) / 100,
        lastRequestAt: lastRequest?.requestedAt || null,
        lastResponseAt: lastResponse?.respondedAt || null,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate statistics for client ${clientId}:`,
        error,
      );
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  async expireStaleRequests() {
    try {
      const now = new Date();

      const expiredRequests =
        await this.prisma.clientTherapistRequest.updateMany({
          where: {
            status: 'PENDING',
            expiresAt: { lte: now },
          },
          data: {
            status: 'EXPIRED',
            respondedAt: now,
          },
        });

      this.logger.log(`Expired ${expiredRequests.count} stale requests`);

      return {
        success: true,
        expiredCount: expiredRequests.count,
      };
    } catch (error) {
      this.logger.error('Failed to expire stale requests:', error);
      throw error;
    }
  }
}
