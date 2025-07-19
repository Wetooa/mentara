import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../providers/prisma-client.provider';
import { JwtPayload } from '../strategies/jwt.strategy';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface RefreshTokenData {
  token: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async generateTokenPair(
    userId: string,
    email: string,
    role: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    const refreshToken = await this.generateRefreshToken(
      userId,
      ipAddress,
      userAgent,
    );

    return {
      accessToken,
      refreshToken: refreshToken.token,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    };
  }

  private async generateRefreshToken(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RefreshTokenData> {
    // Generate cryptographically secure random token
    const token = crypto.randomBytes(64).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() +
        parseInt(process.env.JWT_REFRESH_EXPIRES_IN?.replace('d', '') || '7'),
    );

    // Extract device information from userAgent
    const deviceName = this.extractDeviceInfo(userAgent);

    // Store hashed token in database with enhanced session tracking
    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId,
        expiresAt,
        ipAddress,
        userAgent,
        deviceName,
        location: await this.getLocationFromIP(ipAddress),
        lastActivity: new Date(),
      },
    });

    return {
      token,
      userId,
      expiresAt,
      ipAddress,
      userAgent,
    };
  }

  async refreshAccessToken(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenPair> {
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    if (storedToken.revokedAt) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (storedToken.user.deactivatedAt) {
      throw new UnauthorizedException('User account deactivated');
    }

    // Update session activity before revoking
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { lastActivity: new Date() },
    });

    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new token pair
    return this.generateTokenPair(
      storedToken.userId,
      storedToken.user.email,
      storedToken.user.role,
      ipAddress,
      userAgent,
    );
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    await this.prisma.refreshToken.updateMany({
      where: {
        token: hashedToken,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { not: null } }],
      },
    });
  }

  // Password hashing utilities
  async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Email verification token generation
  async generateEmailVerificationToken(): Promise<{
    token: string;
    hashedToken: string;
    expiresAt: Date;
  }> {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    return { token, hashedToken, expiresAt };
  }

  // Password reset token generation
  async generatePasswordResetToken(): Promise<{
    token: string;
    hashedToken: string;
    expiresAt: Date;
  }> {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry for security

    return { token, hashedToken, expiresAt };
  }

  // Account lockout utilities
  async checkAccountLockout(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lockoutUntil: true, failedLoginCount: true },
    });

    if (!user) return false;

    // Check if account is currently locked
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      return true;
    }

    // Clear lockout if time has passed
    if (user.lockoutUntil && user.lockoutUntil <= new Date()) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          lockoutUntil: null,
          failedLoginCount: 0,
        },
      });
    }

    return false;
  }

  async handleFailedLogin(userId: string): Promise<void> {
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
    const lockoutDuration = parseInt(
      process.env.LOCKOUT_DURATION_MINUTES || '15',
    );

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { failedLoginCount: true },
    });

    if (!user) return;

    const newFailedCount = user.failedLoginCount + 1;
    const updateData: any = { failedLoginCount: newFailedCount };

    // Lock account if max attempts reached
    if (newFailedCount >= maxAttempts) {
      const lockoutUntil = new Date();
      lockoutUntil.setMinutes(lockoutUntil.getMinutes() + lockoutDuration);
      updateData.lockoutUntil = lockoutUntil;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  async resetFailedLoginCount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginCount: 0,
        lockoutUntil: null,
        lastLoginAt: new Date(),
      },
    });
  }

  /**
   * Validates a JWT token and returns the payload and expiration info
   * @param token - The JWT token to validate
   * @returns Promise with validation result
   */
  async validateToken(token: string): Promise<{
    valid: boolean;
    payload?: any;
    expires?: string;
    error?: string;
  }> {
    try {
      // Verify and decode the token
      const payload = this.jwtService.verify(token);

      // Check if token has expired
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return {
          valid: false,
          error: 'Token has expired',
        };
      }

      // Convert expiration timestamp to ISO string
      const expiresAt = payload.exp
        ? new Date(payload.exp * 1000).toISOString()
        : undefined;

      return {
        valid: true,
        payload,
        expires: expiresAt,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid token',
      };
    }
  }

  // Session Management Methods

  /**
   * Get current session information based on refresh token
   */
  async getSessionInfo(refreshToken: string): Promise<{
    sessionId: string;
    createdAt: string;
    lastActivity: string;
    device: string;
    location: string;
    ipAddress: string;
    userAgent: string;
  } | null> {
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const session = await this.prisma.refreshToken.findUnique({
      where: {
        token: hashedToken,
        revokedAt: null,
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return {
      sessionId: session.id,
      createdAt: session.createdAt.toISOString(),
      lastActivity: session.lastActivity.toISOString(),
      device: session.deviceName || 'Unknown Device',
      location: session.location || 'Unknown Location',
      ipAddress: session.ipAddress || 'Unknown IP',
      userAgent: session.userAgent || 'Unknown User Agent',
    };
  }

  /**
   * Get all active sessions for a user
   */
  async getActiveSessions(
    userId: string,
    currentRefreshToken?: string,
  ): Promise<{
    sessions: Array<{
      id: string;
      device: string;
      location: string;
      lastActivity: string;
      isCurrent: boolean;
      ipAddress: string;
      userAgent: string;
      createdAt: string;
    }>;
  }> {
    const sessions = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: {
        lastActivity: 'desc',
      },
    });

    let currentHashedToken: string | null = null;
    if (currentRefreshToken) {
      currentHashedToken = crypto
        .createHash('sha256')
        .update(currentRefreshToken)
        .digest('hex');
    }

    return {
      sessions: sessions.map((session) => ({
        id: session.id,
        device: session.deviceName || 'Unknown Device',
        location: session.location || 'Unknown Location',
        lastActivity: session.lastActivity.toISOString(),
        isCurrent: currentHashedToken === session.token,
        ipAddress: session.ipAddress || 'Unknown IP',
        userAgent: session.userAgent || 'Unknown User Agent',
        createdAt: session.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Terminate a specific session by session ID
   */
  async terminateSession(
    sessionId: string,
    userId: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const session = await this.prisma.refreshToken.findFirst({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
      },
    });

    if (!session) {
      return {
        success: false,
        message: 'Session not found or already terminated',
      };
    }

    await this.prisma.refreshToken.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    return {
      success: true,
      message: 'Session terminated successfully',
    };
  }

  /**
   * Terminate all other sessions except the current one
   */
  async terminateOtherSessions(
    userId: string,
    currentRefreshToken?: string,
  ): Promise<{
    success: boolean;
    terminatedCount: number;
    message: string;
  }> {
    let currentHashedToken: string | null = null;
    if (currentRefreshToken) {
      currentHashedToken = crypto
        .createHash('sha256')
        .update(currentRefreshToken)
        .digest('hex');
    }

    const whereClause: any = {
      userId,
      revokedAt: null,
    };

    if (currentHashedToken) {
      whereClause.token = { not: currentHashedToken };
    }

    const result = await this.prisma.refreshToken.updateMany({
      where: whereClause,
      data: { revokedAt: new Date() },
    });

    return {
      success: true,
      terminatedCount: result.count,
      message: `${result.count} sessions terminated successfully`,
    };
  }

  /**
   * Update session activity (called when tokens are used)
   */
  async updateSessionActivity(refreshToken: string): Promise<void> {
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    await this.prisma.refreshToken.updateMany({
      where: {
        token: hashedToken,
        revokedAt: null,
      },
      data: {
        lastActivity: new Date(),
      },
    });
  }

  /**
   * Helper method to extract device information from user agent
   */
  private extractDeviceInfo(userAgent?: string): string {
    if (!userAgent) return 'Unknown Device';

    const ua = userAgent.toLowerCase();

    // Mobile devices
    if (ua.includes('mobile') || ua.includes('android')) {
      if (ua.includes('android')) return 'Android Device';
      if (ua.includes('iphone')) return 'iPhone';
      if (ua.includes('ipad')) return 'iPad';
      return 'Mobile Device';
    }

    // Desktop browsers
    if (ua.includes('windows')) return 'Windows PC';
    if (ua.includes('macintosh') || ua.includes('mac os')) return 'Mac';
    if (ua.includes('linux')) return 'Linux PC';
    if (ua.includes('chrome')) return 'Chrome Browser';
    if (ua.includes('firefox')) return 'Firefox Browser';
    if (ua.includes('safari')) return 'Safari Browser';
    if (ua.includes('edge')) return 'Edge Browser';

    return 'Unknown Device';
  }

  /**
   * Helper method to get approximate location from IP address
   * This is a simple implementation - in production, you might want to use a proper geolocation service
   */
  private async getLocationFromIP(ipAddress?: string): Promise<string> {
    if (!ipAddress || ipAddress === '127.0.0.1' || ipAddress === '::1') {
      return 'Local';
    }

    // This is a placeholder - in production, you'd integrate with a geolocation service
    // like MaxMind GeoIP, IP2Location, or a similar service
    return 'Unknown Location';
  }
}
