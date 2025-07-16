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
  type TherapistRequestResponseDto,
  type TherapistRequestFiltersDto,
  type BulkTherapistActionDto,
} from 'mentara-commons';

@Injectable()
export class TherapistRequestService {
  private readonly logger = new Logger(TherapistRequestService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ===== RETRIEVING THERAPIST REQUESTS =====

  async getTherapistRequests(
    therapistId: string,
    filters: TherapistRequestFiltersDto,
  ) {
    try {
      const {
        status,
        priority,
        clientId,
        requestedAfter,
        requestedBefore,
        respondedAfter,
        respondedBefore,
        page = 1,
        limit = 20,
        sortBy = 'requestedAt',
        sortOrder = 'desc',
        includeExpired = false,
      } = filters;

      const skip = (page - 1) * limit;
      const where: Prisma.ClientTherapistRequestWhereInput = {
        therapistId,
      };

      // Apply filters
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (clientId) where.clientId = clientId;
      if (requestedAfter) where.requestedAt = { gte: new Date(requestedAfter) };
      if (requestedBefore) {
        where.requestedAt = {
          ...(typeof where.requestedAt === 'object' ? where.requestedAt : {}),
          lte: new Date(requestedBefore),
        };
      }
      if (respondedAfter) where.respondedAt = { gte: new Date(respondedAfter) };
      if (respondedBefore) {
        where.respondedAt = {
          ...(typeof where.respondedAt === 'object' ? where.respondedAt : {}),
          lte: new Date(respondedBefore),
        };
      }

      // Exclude expired requests unless specifically requested
      if (!includeExpired) {
        where.status = { not: 'EXPIRED' };
      }

      const [requests, totalCount] = await Promise.all([
        this.prisma.clientTherapistRequest.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            client: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.clientTherapistRequest.count({ where }),
      ]);

      // Get summary statistics
      const [pendingCount, highPriorityCount] = await Promise.all([
        this.prisma.clientTherapistRequest.count({
          where: { therapistId, status: 'PENDING' },
        }),
        this.prisma.clientTherapistRequest.count({
          where: {
            therapistId,
            status: 'PENDING',
            priority: { in: ['HIGH', 'URGENT'] },
          },
        }),
      ]);

      this.logger.log(
        `Retrieved ${requests.length} requests for therapist ${therapistId}`,
      );

      return {
        requests,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        summary: {
          pendingCount,
          highPriorityCount,
          filteredCount: requests.length,
        },
        filters,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve requests for therapist ${therapistId}:`,
        error,
      );
      throw error;
    }
  }

  // ===== ACCEPTING CLIENT REQUESTS =====

  async acceptClientRequest(
    requestId: string,
    therapistId: string,
    responseDto: TherapistRequestResponseDto,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Verify request exists and belongs to therapist
        const existingRequest = await tx.clientTherapistRequest.findUnique({
          where: { id: requestId },
          include: {
            client: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
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
                  },
                },
              },
            },
          },
        });

        if (!existingRequest) {
          throw new NotFoundException(`Request with ID ${requestId} not found`);
        }

        if (existingRequest.therapistId !== therapistId) {
          throw new ForbiddenException(
            'You can only respond to your own requests',
          );
        }

        if (existingRequest.status !== 'PENDING') {
          throw new BadRequestException(
            `Cannot accept request with status ${existingRequest.status}`,
          );
        }

        // 2. Check if request has expired
        if (
          existingRequest.expiresAt &&
          existingRequest.expiresAt < new Date()
        ) {
          await tx.clientTherapistRequest.update({
            where: { id: requestId },
            data: { status: 'EXPIRED', respondedAt: new Date() },
          });
          throw new BadRequestException(
            'Request has expired and cannot be accepted',
          );
        }

        // 3. Verify therapist is still approved and active
        const therapist = await tx.therapist.findUnique({
          where: { userId: therapistId },
          include: { user: true },
        });

        if (
          !therapist ||
          therapist.status !== 'approved' ||
          !therapist.user.isActive
        ) {
          throw new BadRequestException(
            'Therapist is not currently approved or active',
          );
        }

        // 4. Check for existing client-therapist relationship
        const existingRelationship = await tx.clientTherapist.findFirst({
          where: {
            clientId: existingRequest.clientId,
            therapistId,
            status: 'active',
          },
        });

        if (existingRelationship) {
          throw new ConflictException(
            'Client already has an active relationship with this therapist',
          );
        }

        // 5. Update request status to accepted
        const acceptedRequest = await tx.clientTherapistRequest.update({
          where: { id: requestId },
          data: {
            status: 'ACCEPTED',
            respondedAt: new Date(),
            therapistResponse: responseDto.response,
          },
        });

        // 6. Create client-therapist relationship
        const clientTherapistRelationship = await tx.clientTherapist.create({
          data: {
            clientId: existingRequest.clientId,
            therapistId,
            status: 'active',
            assignedAt: new Date(),
            notes: `Relationship started from accepted request. ${responseDto.schedulingMessage || ''}`,
          },
        });

        // 7. Send acceptance notification to client
        await this.notificationsService.create({
          userId: existingRequest.clientId,
          title: 'Therapist Request Accepted!',
          message: `${existingRequest.therapist.user.firstName} ${existingRequest.therapist.user.lastName} has accepted your therapy request. ${responseDto.response}`,
          type: 'THERAPIST_REQUEST_ACCEPTED',
          priority: 'HIGH',
          actionUrl: `/client/therapists/${therapistId}`,
          data: {
            requestId,
            therapistId,
            relationshipId: clientTherapistRelationship.id,
            response: responseDto.response,
            schedulingMessage: responseDto.schedulingMessage,
          },
        });

        // 8. Send additional scheduling notification if provided
        if (responseDto.schedulingMessage) {
          await this.notificationsService.create({
            userId: existingRequest.clientId,
            title: 'Scheduling Information',
            message: responseDto.schedulingMessage,
            type: 'SCHEDULING_INFO',
            priority: 'NORMAL',
            actionUrl: `/client/therapists/${therapistId}/schedule`,
          });
        }

        // 9. Create audit log
        await tx.auditLog.create({
          data: {
            userId: therapistId,
            action: 'ACCEPT_CLIENT_REQUEST',
            entity: 'client_therapist_request',
            entityId: requestId,
            metadata: {
              requestId,
              clientId: existingRequest.clientId,
              relationshipId: clientTherapistRelationship.id,
              hasSchedulingMessage: !!responseDto.schedulingMessage,
              preferredContactMethod: responseDto.preferredContactMethod,
              timestamp: new Date().toISOString(),
            },
          },
        });

        this.logger.log(
          `Therapist ${therapistId} accepted request ${requestId} from client ${existingRequest.clientId}`,
        );

        return {
          success: true,
          request: acceptedRequest,
          relationship: clientTherapistRelationship,
          message: 'Client request accepted successfully',
          nextSteps: {
            scheduleSession: responseDto.schedulingMessage
              ? 'Contact information provided'
              : 'Schedule first session',
            clientNotified: true,
            relationshipEstablished: true,
          },
        };
      });
    } catch (error) {
      this.logger.error(
        `Failed to accept request ${requestId} for therapist ${therapistId}:`,
        error,
      );
      throw error;
    }
  }

  // ===== DECLINING CLIENT REQUESTS =====

  async declineClientRequest(
    requestId: string,
    therapistId: string,
    responseDto: TherapistRequestResponseDto,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Verify request exists and belongs to therapist
        const existingRequest = await tx.clientTherapistRequest.findUnique({
          where: { id: requestId },
          include: {
            client: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
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
                  },
                },
              },
            },
          },
        });

        if (!existingRequest) {
          throw new NotFoundException(`Request with ID ${requestId} not found`);
        }

        if (existingRequest.therapistId !== therapistId) {
          throw new ForbiddenException(
            'You can only respond to your own requests',
          );
        }

        if (existingRequest.status !== 'PENDING') {
          throw new BadRequestException(
            `Cannot decline request with status ${existingRequest.status}`,
          );
        }

        // 2. Update request status to declined
        const declinedRequest = await tx.clientTherapistRequest.update({
          where: { id: requestId },
          data: {
            status: 'DECLINED',
            respondedAt: new Date(),
            therapistResponse: responseDto.response,
          },
        });

        // 3. Send decline notification to client
        await this.notificationsService.create({
          userId: existingRequest.clientId,
          title: 'Therapist Request Update',
          message: `${existingRequest.therapist.user.firstName} ${existingRequest.therapist.user.lastName} has responded to your therapy request. ${responseDto.response}`,
          type: 'THERAPIST_REQUEST_DECLINED',
          priority: 'NORMAL',
          actionUrl: '/client/therapists/browse',
          data: {
            requestId,
            therapistId,
            response: responseDto.response,
          },
        });

        // 4. Provide alternative recommendations if therapist suggests
        if (responseDto.acceptNewClients === false) {
          await this.notificationsService.create({
            userId: existingRequest.clientId,
            title: 'Alternative Therapist Recommendations',
            message:
              'We can help you find other qualified therapists who may be a good fit.',
            type: 'ALTERNATIVE_RECOMMENDATIONS',
            priority: 'NORMAL',
            actionUrl: '/client/therapists/recommendations',
          });
        }

        // 5. Create audit log
        await tx.auditLog.create({
          data: {
            userId: therapistId,
            action: 'DECLINE_CLIENT_REQUEST',
            entity: 'client_therapist_request',
            entityId: requestId,
            metadata: {
              requestId,
              clientId: existingRequest.clientId,
              acceptNewClients: responseDto.acceptNewClients,
              preferredContactMethod: responseDto.preferredContactMethod,
              timestamp: new Date().toISOString(),
            },
          },
        });

        this.logger.log(
          `Therapist ${therapistId} declined request ${requestId} from client ${existingRequest.clientId}`,
        );

        return {
          success: true,
          request: declinedRequest,
          message: 'Client request declined',
          providedAlternatives: responseDto.acceptNewClients === false,
        };
      });
    } catch (error) {
      this.logger.error(
        `Failed to decline request ${requestId} for therapist ${therapistId}:`,
        error,
      );
      throw error;
    }
  }

  // ===== BULK ACTIONS =====

  async performBulkAction(
    therapistId: string,
    actionDto: BulkTherapistActionDto,
  ) {
    try {
      const { requestIds, action, response } = actionDto;

      const results = {
        successful: [] as any[],
        failed: [] as any[],
        totalProcessed: 0,
      };

      // Process requests sequentially to avoid conflicts
      for (const requestId of requestIds) {
        try {
          let result;

          switch (action) {
            case 'accept':
              if (!response) {
                throw new BadRequestException(
                  'Response message required for accept action',
                );
              }
              result = await this.acceptClientRequest(requestId, therapistId, {
                response,
                acceptNewClients: true,
                preferredContactMethod: 'platform',
              });
              break;

            case 'decline':
              if (!response) {
                throw new BadRequestException(
                  'Response message required for decline action',
                );
              }
              result = await this.declineClientRequest(requestId, therapistId, {
                response,
                acceptNewClients: true,
                preferredContactMethod: 'platform',
              });
              break;

            case 'mark_reviewed':
              // Custom action to mark as reviewed without accepting/declining
              result = await this.markRequestAsReviewed(requestId, therapistId);
              break;

            default:
              throw new BadRequestException(`Invalid action: ${action}`);
          }

          results.successful.push({
            requestId,
            action,
            status: 'completed',
          });
          results.totalProcessed++;
        } catch (error) {
          results.failed.push({
            requestId,
            action,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          this.logger.warn(
            `Failed to ${action} request ${requestId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      this.logger.log(
        `Therapist ${therapistId} performed bulk ${action}: ${results.totalProcessed} successful, ${results.failed.length} failed`,
      );

      return {
        success: true,
        results,
        summary: {
          totalRequested: requestIds.length,
          totalProcessed: results.totalProcessed,
          totalFailed: results.failed.length,
          action,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to perform bulk action for therapist ${therapistId}:`,
        error,
      );
      throw error;
    }
  }

  // ===== STATISTICS AND ANALYTICS =====

  async getTherapistRequestStatistics(therapistId: string) {
    try {
      const [
        totalReceived,
        pending,
        accepted,
        declined,
        expired,
        recentRequests,
        activeRelationships,
      ] = await Promise.all([
        // Total requests received
        this.prisma.clientTherapistRequest.count({
          where: { therapistId },
        }),
        // Pending requests
        this.prisma.clientTherapistRequest.count({
          where: { therapistId, status: 'PENDING' },
        }),
        // Accepted requests
        this.prisma.clientTherapistRequest.count({
          where: { therapistId, status: 'ACCEPTED' },
        }),
        // Declined requests
        this.prisma.clientTherapistRequest.count({
          where: { therapistId, status: 'DECLINED' },
        }),
        // Expired requests
        this.prisma.clientTherapistRequest.count({
          where: { therapistId, status: 'EXPIRED' },
        }),
        // Recent requests for response time calculation
        this.prisma.clientTherapistRequest.findMany({
          where: {
            therapistId,
            respondedAt: { not: null },
          },
          select: {
            requestedAt: true,
            respondedAt: true,
          },
          orderBy: { respondedAt: 'desc' },
          take: 20,
        }),
        // Active client relationships
        this.prisma.clientTherapist.count({
          where: { therapistId, status: 'active' },
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
        where: { therapistId },
        orderBy: { requestedAt: 'desc' },
        select: { requestedAt: true },
      });

      const lastResponse = await this.prisma.clientTherapistRequest.findFirst({
        where: { therapistId, respondedAt: { not: null } },
        orderBy: { respondedAt: 'desc' },
        select: { respondedAt: true },
      });

      this.logger.log(
        `Generated request statistics for therapist ${therapistId}`,
      );

      return {
        totalReceived,
        pending,
        accepted,
        declined,
        expired,
        activeRelationships,
        acceptanceRate: Math.round(acceptanceRate * 100) / 100,
        averageResponseTime: Math.round(averageResponseTime * 100) / 100,
        lastRequestAt: lastRequest?.requestedAt || null,
        lastResponseAt: lastResponse?.respondedAt || null,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate statistics for therapist ${therapistId}:`,
        error,
      );
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  private async markRequestAsReviewed(requestId: string, therapistId: string) {
    // Custom method for marking requests as reviewed without formal response
    const request = await this.prisma.clientTherapistRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.therapistId !== therapistId) {
      throw new NotFoundException(
        `Request ${requestId} not found or not accessible`,
      );
    }

    // This could update a custom "reviewed" field if it existed in the schema
    // For now, we'll just log the review action
    await this.prisma.auditLog.create({
      data: {
        userId: therapistId,
        action: 'REVIEW_CLIENT_REQUEST',
        entity: 'client_therapist_request',
        entityId: requestId,
        metadata: {
          requestId,
          reviewedAt: new Date().toISOString(),
        },
      },
    });

    return {
      success: true,
      requestId,
      message: 'Request marked as reviewed',
    };
  }
}
