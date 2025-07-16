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
  type ApproveTherapistDto,
  type RejectTherapistDto,
  type UpdateTherapistStatusDto,
  type PendingTherapistFiltersDto,
} from 'mentara-commons';

@Injectable()
export class AdminTherapistService {
  private readonly logger = new Logger(AdminTherapistService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ===== THERAPIST APPLICATION RETRIEVAL =====

  async getPendingApplications(filters: PendingTherapistFiltersDto) {
    try {
      const {
        status = 'pending',
        province,
        submittedAfter,
        processedBy,
        providerType,
        limit = 50,
      } = filters;

      const where: Prisma.TherapistWhereInput = {};

      // Apply status filter
      if (status) {
        where.status = status;
      }

      // Apply province filter
      if (province) {
        where.province = {
          contains: province,
          mode: 'insensitive',
        };
      }

      // Apply date filter
      if (submittedAfter) {
        where.submissionDate = {
          gte: new Date(submittedAfter),
        };
      }

      // Apply processed by filter
      if (processedBy) {
        where.processedByAdminId = processedBy;
      }

      // Apply provider type filter
      if (providerType) {
        where.providerType = {
          contains: providerType,
          mode: 'insensitive',
        };
      }

      const applications = await this.prisma.therapist.findMany({
        where,
        take: limit,
        orderBy: [{ submissionDate: 'desc' }, { createdAt: 'desc' }],
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              createdAt: true,
              lastLoginAt: true,
            },
          },
          processedByAdmin: {
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
        },
      });

      // Calculate summary statistics
      const totalPending = await this.prisma.therapist.count({
        where: { status: 'pending' },
      });

      const totalApproved = await this.prisma.therapist.count({
        where: { status: 'approved' },
      });

      const totalRejected = await this.prisma.therapist.count({
        where: { status: 'rejected' },
      });

      this.logger.log(
        `Retrieved ${applications.length} therapist applications with filters: ${JSON.stringify(filters)}`,
      );

      return {
        applications,
        summary: {
          totalPending,
          totalApproved,
          totalRejected,
          filtered: applications.length,
        },
        filters: filters,
      };
    } catch (error) {
      this.logger.error('Failed to retrieve pending applications:', error);
      throw error;
    }
  }

  async getApplicationDetails(therapistId: string) {
    try {
      const application = await this.prisma.therapist.findUnique({
        where: { userId: therapistId },
        include: {
          user: {
            include: {
              client: true, // Check if user also has client profile
            },
          },
          processedByAdmin: {
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
          // Include related data for comprehensive view
          assignedClients: {
            take: 5, // Show recent clients if any
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
            },
          },
          reviews: {
            take: 5, // Show recent reviews if any
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
            },
          },
        },
      });

      if (!application) {
        throw new NotFoundException(
          `Therapist application with ID ${therapistId} not found`,
        );
      }

      // Get audit trail for this therapist
      const auditTrail = await this.prisma.auditLog.findMany({
        where: {
          entity: 'therapist',
          entityId: therapistId,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(
        `Retrieved detailed application for therapist ${therapistId}`,
      );

      return {
        application,
        auditTrail,
        statistics: {
          totalClients: application.assignedClients.length,
          averageRating:
            application.reviews.length > 0
              ? application.reviews.reduce(
                  (sum, review) => sum + review.rating,
                  0,
                ) / application.reviews.length
              : 0,
          totalReviews: application.reviews.length,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve application details for ${therapistId}:`,
        error,
      );
      throw error;
    }
  }

  // ===== THERAPIST APPROVAL WORKFLOW =====

  async approveTherapist(
    therapistId: string,
    adminId: string,
    approvalData: ApproveTherapistDto,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Verify therapist exists and is pending
        const existingTherapist = await tx.therapist.findUnique({
          where: { userId: therapistId },
          include: { user: true },
        });

        if (!existingTherapist) {
          throw new NotFoundException(
            `Therapist with ID ${therapistId} not found`,
          );
        }

        if (existingTherapist.status !== 'pending') {
          throw new ConflictException(
            `Therapist ${therapistId} is not pending approval (current status: ${existingTherapist.status})`,
          );
        }

        // 2. Update therapist status to approved
        const approvedTherapist = await tx.therapist.update({
          where: { userId: therapistId },
          data: {
            status: 'approved',
            processedByAdminId: adminId,
            processingDate: new Date(),
            licenseVerified: approvalData.verifyLicense || false,
          },
        });

        // 3. Update user role to therapist
        await tx.user.update({
          where: { id: therapistId },
          data: {
            role: 'therapist',
            isVerified: true, // Mark as verified when approved
          },
        });

        // 4. Create audit log
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'APPROVE_THERAPIST_APPLICATION',
            entity: 'therapist',
            entityId: therapistId,
            metadata: {
              therapistId,
              approvalMessage: approvalData.approvalMessage,
              verifyLicense: approvalData.verifyLicense,
              grantSpecialPermissions: approvalData.grantSpecialPermissions,
              adminId,
              timestamp: new Date().toISOString(),
            },
          },
        });

        // 5. Send approval notification
        await this.notificationsService.createTherapistApplicationNotification(
          therapistId,
          'approved',
        );

        // 6. Create custom approval notification if message provided
        if (approvalData.approvalMessage) {
          await this.notificationsService.create({
            userId: therapistId,
            title: 'Welcome to Mentara - Application Approved!',
            message: approvalData.approvalMessage,
            type: 'THERAPIST_APPROVED',
            priority: 'HIGH',
            actionUrl: '/therapist/dashboard',
          });
        }

        this.logger.log(
          `Admin ${adminId} approved therapist application ${therapistId}`,
        );

        return {
          success: true,
          therapist: approvedTherapist,
          message: 'Therapist application approved successfully',
          approvalData,
        };
      });
    } catch (error) {
      this.logger.error(`Failed to approve therapist ${therapistId}:`, error);
      throw error;
    }
  }

  async rejectTherapist(
    therapistId: string,
    adminId: string,
    rejectionData: RejectTherapistDto,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Verify therapist exists and can be rejected
        const existingTherapist = await tx.therapist.findUnique({
          where: { userId: therapistId },
          include: { user: true },
        });

        if (!existingTherapist) {
          throw new NotFoundException(
            `Therapist with ID ${therapistId} not found`,
          );
        }

        if (existingTherapist.status === 'approved') {
          throw new ForbiddenException(
            `Cannot reject already approved therapist ${therapistId}`,
          );
        }

        // 2. Update therapist status to rejected
        const rejectedTherapist = await tx.therapist.update({
          where: { userId: therapistId },
          data: {
            status: 'rejected',
            processedByAdminId: adminId,
            processingDate: new Date(),
          },
        });

        // 3. Create audit log
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'REJECT_THERAPIST_APPLICATION',
            entity: 'therapist',
            entityId: therapistId,
            metadata: {
              therapistId,
              rejectionReason: rejectionData.rejectionReason,
              rejectionMessage: rejectionData.rejectionMessage,
              allowReapplication: rejectionData.allowReapplication,
              adminId,
              timestamp: new Date().toISOString(),
            },
          },
        });

        // 4. Send rejection notification with detailed message
        await this.notificationsService.create({
          userId: therapistId,
          title: 'Therapist Application Update',
          message: `Your therapist application has been reviewed. ${rejectionData.rejectionMessage}`,
          type: 'THERAPIST_REJECTED',
          priority: 'HIGH',
          actionUrl: rejectionData.allowReapplication
            ? '/therapist/reapply'
            : '/therapist/application',
        });

        this.logger.log(
          `Admin ${adminId} rejected therapist application ${therapistId} for reason: ${rejectionData.rejectionReason}`,
        );

        return {
          success: true,
          therapist: rejectedTherapist,
          message: 'Therapist application rejected',
          rejectionData,
        };
      });
    } catch (error) {
      this.logger.error(`Failed to reject therapist ${therapistId}:`, error);
      throw error;
    }
  }

  // ===== THERAPIST STATUS MANAGEMENT =====

  async updateTherapistStatus(
    therapistId: string,
    adminId: string,
    statusData: UpdateTherapistStatusDto,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Verify therapist exists
        const existingTherapist = await tx.therapist.findUnique({
          where: { userId: therapistId },
          include: { user: true },
        });

        if (!existingTherapist) {
          throw new NotFoundException(
            `Therapist with ID ${therapistId} not found`,
          );
        }

        // 2. Validate status transition
        const validTransitions = this.getValidStatusTransitions(
          existingTherapist.status,
        );
        if (!validTransitions.includes(statusData.status)) {
          throw new BadRequestException(
            `Invalid status transition from ${existingTherapist.status} to ${statusData.status}`,
          );
        }

        // 3. Update therapist status
        const updatedTherapist = await tx.therapist.update({
          where: { userId: therapistId },
          data: {
            status: statusData.status,
            processedByAdminId: adminId,
            processingDate: new Date(),
          },
        });

        // 4. Update user status if necessary
        if (statusData.status === 'suspended') {
          await tx.user.update({
            where: { id: therapistId },
            data: {
              isActive: false,
              suspendedAt: new Date(),
              suspendedBy: adminId,
              suspensionReason: statusData.reason || 'Status updated by admin',
            },
          });
        } else if (statusData.status === 'approved') {
          await tx.user.update({
            where: { id: therapistId },
            data: {
              role: 'therapist',
              isActive: true,
              suspendedAt: null,
              suspendedBy: null,
              suspensionReason: null,
            },
          });
        }

        // 5. Create audit log
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'UPDATE_THERAPIST_STATUS',
            entity: 'therapist',
            entityId: therapistId,
            metadata: {
              therapistId,
              previousStatus: existingTherapist.status,
              newStatus: statusData.status,
              reason: statusData.reason,
              adminId,
              timestamp: new Date().toISOString(),
            },
          },
        });

        // 6. Send status change notification
        const notificationTitle = this.getStatusChangeNotificationTitle(
          statusData.status,
        );
        const notificationMessage = this.getStatusChangeNotificationMessage(
          statusData.status,
          statusData.reason,
        );

        await this.notificationsService.create({
          userId: therapistId,
          title: notificationTitle,
          message: notificationMessage,
          type: 'THERAPIST_STATUS_UPDATED',
          priority: statusData.status === 'suspended' ? 'HIGH' : 'NORMAL',
          actionUrl: '/therapist/dashboard',
        });

        this.logger.log(
          `Admin ${adminId} updated therapist ${therapistId} status from ${existingTherapist.status} to ${statusData.status}`,
        );

        return {
          success: true,
          therapist: updatedTherapist,
          previousStatus: existingTherapist.status,
          newStatus: statusData.status,
          message: `Therapist status updated to ${statusData.status}`,
        };
      });
    } catch (error) {
      this.logger.error(
        `Failed to update therapist status for ${therapistId}:`,
        error,
      );
      throw error;
    }
  }

  // ===== ANALYTICS AND REPORTING =====

  async getTherapistApplicationMetrics(startDate?: string, endDate?: string) {
    try {
      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const [
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        recentApplications,
        processingTimes,
      ] = await Promise.all([
        // Total applications in period
        this.prisma.therapist.count({
          where: {
            submissionDate: { gte: start, lte: end },
          },
        }),
        // Pending applications
        this.prisma.therapist.count({
          where: {
            status: 'pending',
            submissionDate: { gte: start, lte: end },
          },
        }),
        // Approved applications in period
        this.prisma.therapist.count({
          where: {
            status: 'approved',
            processingDate: { gte: start, lte: end },
          },
        }),
        // Rejected applications in period
        this.prisma.therapist.count({
          where: {
            status: 'rejected',
            processingDate: { gte: start, lte: end },
          },
        }),
        // Recent applications for trend analysis
        this.prisma.therapist.findMany({
          where: {
            submissionDate: { gte: start, lte: end },
          },
          select: {
            submissionDate: true,
            status: true,
            processingDate: true,
          },
          orderBy: { submissionDate: 'desc' },
        }),
        // Processing times for approved/rejected applications
        this.prisma.therapist.findMany({
          where: {
            processingDate: { gte: start, lte: end },
            status: { in: ['approved', 'rejected'] },
          },
          select: {
            submissionDate: true,
            processingDate: true,
            status: true,
          },
        }),
      ]);

      // Calculate average processing time
      const averageProcessingTime =
        processingTimes.reduce((acc, app) => {
          if (app.processingDate && app.submissionDate) {
            const processingTimeMs =
              app.processingDate.getTime() - app.submissionDate.getTime();
            return acc + processingTimeMs / (1000 * 60 * 60 * 24); // Convert to days
          }
          return acc;
        }, 0) / (processingTimes.length || 1);

      // Calculate approval rate
      const processedApplications = approvedApplications + rejectedApplications;
      const approvalRate =
        processedApplications > 0
          ? (approvedApplications / processedApplications) * 100
          : 0;

      this.logger.log(
        `Generated therapist application metrics for period ${start} to ${end}`,
      );

      return {
        period: { start, end },
        summary: {
          totalApplications,
          pendingApplications,
          approvedApplications,
          rejectedApplications,
          processedApplications,
        },
        metrics: {
          approvalRate: Math.round(approvalRate * 100) / 100,
          averageProcessingTimeDays:
            Math.round(averageProcessingTime * 100) / 100,
          applicationTrend: this.calculateApplicationTrend(recentApplications),
        },
        recentActivity: recentApplications.slice(0, 10),
      };
    } catch (error) {
      this.logger.error(
        'Failed to generate therapist application metrics:',
        error,
      );
      throw error;
    }
  }

  // ===== HELPER METHODS =====

  private getValidStatusTransitions(currentStatus: string): string[] {
    const transitions = {
      pending: ['approved', 'rejected', 'under_review'],
      under_review: ['approved', 'rejected', 'pending'],
      approved: ['suspended', 'under_review'],
      rejected: ['pending', 'under_review'], // Allow resubmission
      suspended: ['approved', 'rejected'],
    };

    return transitions[currentStatus] || [];
  }

  private getStatusChangeNotificationTitle(status: string): string {
    const titles = {
      approved: 'Application Approved!',
      rejected: 'Application Status Update',
      suspended: 'Account Suspended',
      under_review: 'Application Under Review',
      pending: 'Application Status Changed',
    };

    return titles[status] || 'Status Update';
  }

  private getStatusChangeNotificationMessage(
    status: string,
    reason?: string,
  ): string {
    const baseMessages = {
      approved:
        'Congratulations! Your therapist application has been approved.',
      rejected: 'Your therapist application has been reviewed.',
      suspended: 'Your therapist account has been temporarily suspended.',
      under_review: 'Your application is currently under additional review.',
      pending: 'Your application status has been updated.',
    };

    const baseMessage =
      baseMessages[status] || 'Your account status has been updated.';
    return reason ? `${baseMessage} Reason: ${reason}` : baseMessage;
  }

  private calculateApplicationTrend(
    applications: any[],
  ): 'increasing' | 'decreasing' | 'stable' {
    if (applications.length < 7) return 'stable';

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentWeekCount = applications.filter(
      (app) => app.submissionDate >= weekAgo,
    ).length;
    const previousWeekCount = applications.filter(
      (app) =>
        app.submissionDate >= twoWeeksAgo && app.submissionDate < weekAgo,
    ).length;

    if (recentWeekCount > previousWeekCount * 1.1) return 'increasing';
    if (recentWeekCount < previousWeekCount * 0.9) return 'decreasing';
    return 'stable';
  }
}
