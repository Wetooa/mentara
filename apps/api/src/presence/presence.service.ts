import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeenAt: Date;
  currentSessionId?: string;
  status?: 'available' | 'busy' | 'away' | 'in-session';
}

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
  private readonly PRESENCE_TTL = 300; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Mark user as online
   */
  async markOnline(userId: string, sessionId?: string): Promise<void> {
    const presence: UserPresence = {
      userId,
      isOnline: true,
      lastSeenAt: new Date(),
      currentSessionId: sessionId,
      status: 'available',
    };


    // Emit presence event
    this.eventEmitter.emit('user.online', { userId, sessionId });

    this.logger.debug(`User ${userId} marked as online`);
  }

  /**
   * Mark user as offline
   */
  async markOffline(userId: string): Promise<void> {
    const presence = await this.getPresence(userId);
    
    const updatedPresence: UserPresence = {
      userId,
      isOnline: false,
      lastSeenAt: presence?.lastSeenAt || new Date(),
      status: undefined,
    };


    // Emit presence event
    this.eventEmitter.emit('user.offline', { userId });

    this.logger.debug(`User ${userId} marked as offline`);
  }

  /**
   * Update user's last seen timestamp
   */
  async updateLastSeen(userId: string): Promise<void> {
    const presence = await this.getPresence(userId);
    
    if (presence) {
      presence.lastSeenAt = new Date();
    } else {
      // If no presence record, create one as offline
      await this.markOffline(userId);
    }
  }

  /**
   * Update user status
   */
  async updateStatus(
    userId: string,
    status: 'available' | 'busy' | 'away' | 'in-session',
  ): Promise<void> {
    const presence = await this.getPresence(userId);
    
    if (presence) {
      presence.status = status;
      
      this.eventEmitter.emit('user.status.changed', { userId, status });
    }
  }

  /**
   * Get user presence
   */
  async getPresence(userId: string): Promise<UserPresence | null> {
    
    // If not in cache, check database for last activity
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastLoginAt: true },
    });

    if (user?.lastLoginAt) {
      return {
        userId,
        isOnline: false,
        lastSeenAt: user.lastLoginAt,
        status: undefined,
      };
    }

    return null;
  }

  /**
   * Get multiple users' presence
   */
  async getBulkPresence(userIds: string[]): Promise<Map<string, UserPresence>> {
    const presenceMap = new Map<string, UserPresence>();
    

    // For users not in cache, fetch from database
    const missingUserIds = userIds.filter((id) => !presenceMap.has(id));
    if (missingUserIds.length > 0) {
      const users = await this.prisma.user.findMany({
        where: { id: { in: missingUserIds } },
        select: { id: true, lastLoginAt: true },
      });

      users.forEach((user) => {
        presenceMap.set(user.id, {
          userId: user.id,
          isOnline: false,
          lastSeenAt: user.lastLoginAt || new Date(),
          status: undefined,
        });
      });
    }

    return presenceMap;
  }

  /**
   * Check if user is online
   */
  async isOnline(userId: string): Promise<boolean> {
    const presence = await this.getPresence(userId);
    return presence?.isOnline || false;
  }

  /**
   * Get online users count
   */
  async getOnlineUsersCount(): Promise<number> {
    // This would require Redis SCAN or a separate set of online user IDs
    // For now, return cached count or estimate

    // Fallback: return 0 if not cached
    return 0;
  }
}

