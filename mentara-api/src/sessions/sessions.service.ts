import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { SessionLog, SessionStatus, SessionType, ActivityType, UserActionType } from '@prisma/client';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSessionLog(data: {
    clientId: string;
    therapistId?: string;
    sessionType: SessionType;
    meetingId?: string;
    platform?: string;
    startTime?: Date;
  }): Promise<SessionLog> {
    return this.prisma.sessionLog.create({
      data: {
        ...data,
        startTime: data.startTime || new Date(),
        status: SessionStatus.IN_PROGRESS,
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true,
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
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async findAllSessions(
    clientId?: string,
    therapistId?: string,
    status?: SessionStatus,
    sessionType?: SessionType,
  ): Promise<SessionLog[]> {
    const where: any = {};

    if (clientId) where.clientId = clientId;
    if (therapistId) where.therapistId = therapistId;
    if (status) where.status = status;
    if (sessionType) where.sessionType = sessionType;

    return this.prisma.sessionLog.findMany({
      where,
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true,
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
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        activities: true,
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async findSession(id: string): Promise<SessionLog | null> {
    return this.prisma.sessionLog.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true,
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
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        activities: {
          orderBy: { timestamp: 'asc' },
        },
        meeting: true,
      },
    });
  }

  async updateSession(id: string, data: Partial<SessionLog>): Promise<SessionLog> {
    const session = await this.findSession(id);
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return this.prisma.sessionLog.update({
      where: { id },
      data,
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true,
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
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async endSession(id: string, notes?: string, quality?: number): Promise<SessionLog> {
    const session = await this.findSession(id);
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    if (session.status !== SessionStatus.IN_PROGRESS) {
      throw new BadRequestException('Session is not in progress');
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 60000); // minutes

    return this.updateSession(id, {
      endTime,
      duration,
      status: SessionStatus.COMPLETED,
      notes,
      quality,
    });
  }

  async addSessionActivity(
    sessionId: string,
    activityType: ActivityType,
    description?: string,
    duration?: number,
    metadata?: any,
  ) {
    const session = await this.findSession(sessionId);
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    return this.prisma.sessionActivity.create({
      data: {
        sessionId,
        activityType,
        description,
        duration,
        metadata,
      },
    });
  }

  async getSessionActivities(sessionId: string) {
    return this.prisma.sessionActivity.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
    });
  }

  async logUserActivity(
    userId: string,
    action: UserActionType,
    page?: string,
    component?: string,
    metadata?: any,
    sessionId?: string,
    deviceInfo?: any,
  ) {
    return this.prisma.userActivity.create({
      data: {
        userId,
        action,
        page,
        component,
        metadata,
        sessionId,
        deviceInfo,
      },
    });
  }

  async getUserActivities(
    userId: string,
    action?: UserActionType,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = { userId };

    if (action) where.action = action;
    if (startDate) where.timestamp = { ...where.timestamp, gte: startDate };
    if (endDate) where.timestamp = { ...where.timestamp, lte: endDate };

    return this.prisma.userActivity.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 100, // Limit to recent activities
    });
  }

  async createTherapyProgress(data: {
    clientId: string;
    therapistId: string;
    progressScore: number;
    improvementAreas?: string[];
    concernAreas?: string[];
    goalsSet?: any;
    goalsAchieved?: any;
    nextMilestones?: any;
    moodScore?: number;
    anxietyScore?: number;
    depressionScore?: number;
    functionalScore?: number;
    therapistNotes?: string;
    clientFeedback?: string;
    recommendations?: string[];
  }) {
    return this.prisma.therapyProgress.create({
      data,
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true,
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
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async getTherapyProgress(
    clientId?: string,
    therapistId?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = {};

    if (clientId) where.clientId = clientId;
    if (therapistId) where.therapistId = therapistId;
    if (startDate) where.assessmentDate = { ...where.assessmentDate, gte: startDate };
    if (endDate) where.assessmentDate = { ...where.assessmentDate, lte: endDate };

    return this.prisma.therapyProgress.findMany({
      where,
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true,
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
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { assessmentDate: 'desc' },
    });
  }

  async getSessionStatistics(clientId?: string, therapistId?: string) {
    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (therapistId) where.therapistId = therapistId;

    const [
      totalSessions,
      completedSessions,
      averageDuration,
      sessionsByType,
    ] = await Promise.all([
      this.prisma.sessionLog.count({ where }),
      this.prisma.sessionLog.count({
        where: { ...where, status: SessionStatus.COMPLETED },
      }),
      this.prisma.sessionLog.aggregate({
        where: { ...where, status: SessionStatus.COMPLETED },
        _avg: { duration: true },
      }),
      this.prisma.sessionLog.groupBy({
        by: ['sessionType'],
        where,
        _count: { sessionType: true },
      }),
    ]);

    return {
      totalSessions,
      completedSessions,
      averageDuration: averageDuration._avg.duration || 0,
      sessionsByType,
      completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
    };
  }
}