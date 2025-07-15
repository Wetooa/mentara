import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JoinRequestStatus } from '@prisma/client';
import { CommunityMatchingService } from './community-matching.service';

interface CreateJoinRequestDto {
  userId: string;
  communityId: string;
  message?: string;
}

interface ProcessJoinRequestDto {
  requestId: string;
  moderatorId: string;
  action: 'approve' | 'reject';
  moderatorNote?: string;
}

interface JoinRequestResponse {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  community: {
    id: string;
    name: string;
    slug: string;
    description: string;
  };
  status: JoinRequestStatus;
  message?: string;
  moderatorNote?: string;
  assessmentProfile?: any;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  moderator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface JoinRequestFilters {
  communityId?: string;
  status?: JoinRequestStatus;
  moderatorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface JoinRequestStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  averageProcessingTime: number; // in hours
  approvalRate: number; // percentage
  byPriority: {
    urgent: number;
    high: number;
    normal: number;
    low: number;
  };
}

@Injectable()
export class JoinRequestService {
  private readonly logger = new Logger(JoinRequestService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly communityMatchingService: CommunityMatchingService
  ) {}

  /**
   * Create a new join request
   */
  async createJoinRequest(dto: CreateJoinRequestDto): Promise<JoinRequestResponse> {
    const { userId, communityId, message } = dto;

    try {
      // Check if user already has a pending request for this community
      const existingRequest = await this.prisma.communityJoinRequest.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId
          }
        }
      });

      if (existingRequest) {
        if (existingRequest.status === JoinRequestStatus.PENDING) {
          throw new BadRequestException('You already have a pending request for this community');
        }
        if (existingRequest.status === JoinRequestStatus.APPROVED) {
          throw new BadRequestException('You are already a member of this community');
        }
      }

      // Check if user is already a member
      const existingMembership = await this.prisma.membership.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId
          }
        }
      });

      if (existingMembership) {
        throw new BadRequestException('You are already a member of this community');
      }

      // Get user's assessment profile for better matching
      const assessmentProfile = await this.getUserAssessmentProfile(userId);

      // Create or update the join request
      const joinRequest = await this.prisma.communityJoinRequest.upsert({
        where: {
          userId_communityId: {
            userId,
            communityId
          }
        },
        update: {
          status: JoinRequestStatus.PENDING,
          message,
          assessmentProfile,
          processedAt: null,
          moderatorId: null,
          moderatorNote: null
        },
        create: {
          userId,
          communityId,
          status: JoinRequestStatus.PENDING,
          message,
          assessmentProfile
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true
            }
          },
          community: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true
            }
          }
        }
      });

      // Emit event for notifications to moderators
      this.eventEmitter.emit('community.join_request.created', {
        requestId: joinRequest.id,
        userId,
        communityId,
        communityName: joinRequest.community.name,
        userName: `${joinRequest.user.firstName} ${joinRequest.user.lastName}`,
        hasMessage: !!message,
        assessmentProfile,
        timestamp: new Date()
      });

      this.logger.log(`Join request created: ${joinRequest.id} for user ${userId} to community ${communityId}`);

      return this.formatJoinRequestResponse(joinRequest);

    } catch (error) {
      this.logger.error(`Error creating join request:`, error);
      throw error;
    }
  }

  /**
   * Get join requests with filters
   */
  async getJoinRequests(
    filters: JoinRequestFilters = {},
    page = 1,
    limit = 20
  ): Promise<{
    requests: JoinRequestResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const where: any = {};

      if (filters.communityId) where.communityId = filters.communityId;
      if (filters.status) where.status = filters.status;
      if (filters.moderatorId) where.moderatorId = filters.moderatorId;
      if (filters.dateFrom) where.createdAt = { ...where.createdAt, gte: filters.dateFrom };
      if (filters.dateTo) where.createdAt = { ...where.createdAt, lte: filters.dateTo };

      const [requests, total] = await Promise.all([
        this.prisma.communityJoinRequest.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true
              }
            },
            community: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true
              }
            },
            moderator: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: [
            { status: 'asc' }, // Pending first
            { createdAt: 'desc' }
          ],
          skip: (page - 1) * limit,
          take: limit
        }),
        this.prisma.communityJoinRequest.count({ where })
      ]);

      return {
        requests: requests.map(req => this.formatJoinRequestResponse(req)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };

    } catch (error) {
      this.logger.error(`Error getting join requests:`, error);
      throw error;
    }
  }

  /**
   * Get join requests for a specific user
   */
  async getUserJoinRequests(userId: string): Promise<JoinRequestResponse[]> {
    try {
      const requests = await this.prisma.communityJoinRequest.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true
            }
          },
          community: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true
            }
          },
          moderator: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return requests.map(req => this.formatJoinRequestResponse(req));

    } catch (error) {
      this.logger.error(`Error getting user join requests:`, error);
      throw error;
    }
  }

  /**
   * Process a join request (approve/reject)
   */
  async processJoinRequest(dto: ProcessJoinRequestDto): Promise<JoinRequestResponse> {
    const { requestId, moderatorId, action, moderatorNote } = dto;

    try {
      // Get the join request
      const joinRequest = await this.prisma.communityJoinRequest.findUnique({
        where: { id: requestId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true
            }
          },
          community: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true
            }
          }
        }
      });

      if (!joinRequest) {
        throw new NotFoundException(`Join request ${requestId} not found`);
      }

      if (joinRequest.status !== JoinRequestStatus.PENDING) {
        throw new BadRequestException(`Join request ${requestId} has already been processed`);
      }

      // Verify moderator has permission for this community
      await this.verifyModeratorPermission(moderatorId, joinRequest.communityId);

      const newStatus = action === 'approve' ? JoinRequestStatus.APPROVED : JoinRequestStatus.REJECTED;
      const processedAt = new Date();

      // Update the join request
      const updatedRequest = await this.prisma.communityJoinRequest.update({
        where: { id: requestId },
        data: {
          status: newStatus,
          moderatorId,
          moderatorNote,
          processedAt
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true
            }
          },
          community: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true
            }
          },
          moderator: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      // If approved, create community membership
      if (action === 'approve') {
        await this.createCommunityMembership(joinRequest.userId, joinRequest.communityId);
      }

      // Emit event for notifications
      this.eventEmitter.emit('community.join_request.processed', {
        requestId,
        userId: joinRequest.userId,
        communityId: joinRequest.communityId,
        communityName: joinRequest.community.name,
        userName: `${joinRequest.user.firstName} ${joinRequest.user.lastName}`,
        moderatorId,
        action,
        moderatorNote,
        timestamp: processedAt
      });

      this.logger.log(`Join request ${requestId} ${action}ed by moderator ${moderatorId}`);

      return this.formatJoinRequestResponse(updatedRequest);

    } catch (error) {
      this.logger.error(`Error processing join request ${requestId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a join request (by the user)
   */
  async cancelJoinRequest(requestId: string, userId: string): Promise<void> {
    try {
      const joinRequest = await this.prisma.communityJoinRequest.findUnique({
        where: { id: requestId }
      });

      if (!joinRequest) {
        throw new NotFoundException(`Join request ${requestId} not found`);
      }

      if (joinRequest.userId !== userId) {
        throw new ForbiddenException('You can only cancel your own join requests');
      }

      if (joinRequest.status !== JoinRequestStatus.PENDING) {
        throw new BadRequestException('You can only cancel pending join requests');
      }

      // Update status to cancelled
      await this.prisma.communityJoinRequest.update({
        where: { id: requestId },
        data: {
          status: JoinRequestStatus.CANCELLED,
          processedAt: new Date()
        }
      });

      // Emit event for notifications
      this.eventEmitter.emit('community.join_request.cancelled', {
        requestId,
        userId,
        communityId: joinRequest.communityId,
        timestamp: new Date()
      });

      this.logger.log(`Join request ${requestId} cancelled by user ${userId}`);

    } catch (error) {
      this.logger.error(`Error cancelling join request ${requestId}:`, error);
      throw error;
    }
  }

  /**
   * Get join request statistics
   */
  async getJoinRequestStats(
    communityId?: string,
    moderatorId?: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<JoinRequestStats> {
    try {
      const where: any = {};
      if (communityId) where.communityId = communityId;
      if (moderatorId) where.moderatorId = moderatorId;
      if (dateFrom) where.createdAt = { ...where.createdAt, gte: dateFrom };
      if (dateTo) where.createdAt = { ...where.createdAt, lte: dateTo };

      const [
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        cancelledRequests,
        avgProcessingTime
      ] = await Promise.all([
        this.prisma.communityJoinRequest.count({ where }),
        this.prisma.communityJoinRequest.count({ where: { ...where, status: JoinRequestStatus.PENDING } }),
        this.prisma.communityJoinRequest.count({ where: { ...where, status: JoinRequestStatus.APPROVED } }),
        this.prisma.communityJoinRequest.count({ where: { ...where, status: JoinRequestStatus.REJECTED } }),
        this.prisma.communityJoinRequest.count({ where: { ...where, status: JoinRequestStatus.CANCELLED } }),
        this.calculateAverageProcessingTime(where)
      ]);

      const processedRequests = approvedRequests + rejectedRequests;
      const approvalRate = processedRequests > 0 ? (approvedRequests / processedRequests) * 100 : 0;

      // Get priority breakdown (simplified - based on assessment scores)
      const byPriority = {
        urgent: 0,
        high: 0,
        normal: totalRequests,
        low: 0
      };

      return {
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        cancelledRequests,
        averageProcessingTime: avgProcessingTime,
        approvalRate: Math.round(approvalRate * 100) / 100,
        byPriority
      };

    } catch (error) {
      this.logger.error(`Error getting join request statistics:`, error);
      throw error;
    }
  }

  /**
   * Get pending requests requiring moderator attention
   */
  async getPendingRequestsForModerator(moderatorId: string): Promise<JoinRequestResponse[]> {
    try {
      // Get communities this moderator can moderate
      const moderatorCommunities = await this.prisma.moderatorCommunity.findMany({
        where: { moderatorId },
        select: { communityId: true }
      });

      const communityIds = moderatorCommunities.map(mc => mc.communityId);

      if (communityIds.length === 0) {
        return [];
      }

      const requests = await this.prisma.communityJoinRequest.findMany({
        where: {
          communityId: { in: communityIds },
          status: JoinRequestStatus.PENDING
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true
            }
          },
          community: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true
            }
          }
        },
        orderBy: { createdAt: 'asc' } // Oldest first
      });

      return requests.map(req => this.formatJoinRequestResponse(req));

    } catch (error) {
      this.logger.error(`Error getting pending requests for moderator ${moderatorId}:`, error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async getUserAssessmentProfile(userId: string): Promise<any> {
    try {
      const preAssessment = await this.prisma.preAssessment.findUnique({
        where: { userId },
        select: {
          phq9Score: true,
          gad7Score: true,
          ptsd5Score: true,
          completedAt: true
        }
      });

      if (!preAssessment) return null;

      return {
        phq9: preAssessment.phq9Score,
        gad7: preAssessment.gad7Score,
        ptsd5: preAssessment.ptsd5Score,
        completedAt: preAssessment.completedAt
      };

    } catch (error) {
      this.logger.error(`Error getting assessment profile for user ${userId}:`, error);
      return null;
    }
  }

  private async verifyModeratorPermission(moderatorId: string, communityId: string): Promise<void> {
    const moderatorCommunity = await this.prisma.moderatorCommunity.findUnique({
      where: {
        moderatorId_communityId: {
          moderatorId,
          communityId
        }
      }
    });

    if (!moderatorCommunity) {
      throw new ForbiddenException('You do not have permission to moderate this community');
    }
  }

  private async createCommunityMembership(userId: string, communityId: string): Promise<void> {
    try {
      await this.prisma.membership.create({
        data: {
          userId,
          communityId,
          role: 'member'
        }
      });

      // Emit event for community member joined
      this.eventEmitter.emit('community.member.joined', {
        userId,
        communityId,
        joinMethod: 'join_request_approved',
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error(`Error creating membership for user ${userId} in community ${communityId}:`, error);
      throw error;
    }
  }

  private async calculateAverageProcessingTime(where: any): Promise<number> {
    try {
      const processedRequests = await this.prisma.communityJoinRequest.findMany({
        where: {
          ...where,
          status: { in: [JoinRequestStatus.APPROVED, JoinRequestStatus.REJECTED] },
          processedAt: { not: null }
        },
        select: {
          createdAt: true,
          processedAt: true
        }
      });

      if (processedRequests.length === 0) return 0;

      const totalHours = processedRequests.reduce((sum, request) => {
        const hours = (request.processedAt!.getTime() - request.createdAt.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);

      return Math.round((totalHours / processedRequests.length) * 100) / 100;

    } catch (error) {
      this.logger.error('Error calculating average processing time:', error);
      return 0;
    }
  }

  private formatJoinRequestResponse(request: any): JoinRequestResponse {
    return {
      id: request.id,
      user: request.user,
      community: request.community,
      status: request.status,
      message: request.message,
      moderatorNote: request.moderatorNote,
      assessmentProfile: request.assessmentProfile,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      processedAt: request.processedAt,
      moderator: request.moderator
    };
  }
}