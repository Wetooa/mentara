import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

export interface AuthenticatedUser {
  userId: string;
  role?: string;
  lastAuthenticated?: Date;
  connectionCount?: number;
}

interface ConnectionAttempt {
  timestamp: Date;
  success: boolean;
  ipAddress?: string;
}

@Injectable()
export class WebSocketAuthService {
  private readonly logger = new Logger(WebSocketAuthService.name);
  private readonly connectionAttempts = new Map<string, ConnectionAttempt[]>();
  private readonly authenticatedConnections = new Map<
    string,
    AuthenticatedUser
  >();
  private readonly MAX_ATTEMPTS_PER_MINUTE = 10;
  private readonly MAX_CONNECTIONS_PER_USER = 5;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {
    // Clean up connection tracking every 5 minutes
    setInterval(() => this.cleanupConnectionTracking(), 5 * 60 * 1000);
  }

  async authenticateSocket(socket: Socket): Promise<AuthenticatedUser | null> {
    const clientIp = this.getClientIp(socket);

    try {
      this.logger.log(`🔐 [WebSocketAuth] Authenticating socket ${socket.id} from IP ${clientIp}`);
      
      // Log handshake details for debugging
      this.logger.debug(`🔍 [WebSocketAuth] Handshake details:`, {
        headers: socket.handshake.headers,
        auth: socket.handshake.auth,
        query: socket.handshake.query,
        url: socket.handshake.url,
      });

      // Rate limiting check
      if (!this.checkRateLimit(clientIp)) {
        this.logger.warn(`⚠️ [WebSocketAuth] Rate limit exceeded for IP ${clientIp}`);
        this.recordConnectionAttempt(clientIp, false);
        return null;
      }

      // Extract token from various sources
      const token = this.extractToken(socket);

      if (!token) {
        this.logger.warn(`❌ [WebSocketAuth] Socket ${socket.id} connected without valid token`);
        this.logger.warn(`🔍 [WebSocketAuth] Token extraction failed - available sources:`, {
          authHeader: socket.handshake.headers.authorization ? 'present' : 'missing',
          authToken: socket.handshake.auth?.token ? 'present' : 'missing', 
          queryToken: socket.handshake.query?.token ? 'present' : 'missing',
          cookies: socket.handshake.headers.cookie ? 'present' : 'missing',
        });
        this.recordConnectionAttempt(clientIp, false);
        return null;
      }

      this.logger.log(`✅ [WebSocketAuth] Token extracted successfully for socket ${socket.id}`);
      this.logger.debug(`🔑 [WebSocketAuth] Token preview: ${token.substring(0, 20)}...`);

      // Verify JWT token with additional security checks
      let payload;
      try {
        payload = this.jwtService.verify(token, {
          algorithms: ['HS256'], // Restrict to specific algorithm
        });
        this.logger.log(`✅ [WebSocketAuth] JWT token verified successfully for socket ${socket.id}`);
      } catch (jwtError) {
        this.logger.warn(`❌ [WebSocketAuth] JWT verification failed for socket ${socket.id}:`, jwtError.message);
        this.recordConnectionAttempt(clientIp, false);
        return null;
      }

      if (!payload.sub || !payload.email) {
        this.logger.warn(`❌ [WebSocketAuth] Socket ${socket.id} has invalid token payload - missing sub or email`);
        this.logger.debug(`🔍 [WebSocketAuth] Payload:`, { sub: payload.sub, email: payload.email, iat: payload.iat, exp: payload.exp });
        this.recordConnectionAttempt(clientIp, false);
        return null;
      }

      // Check for token freshness (prevent replay attacks)
      const tokenAge = Date.now() / 1000 - payload.iat;
      if (tokenAge > 24 * 60 * 60) {
        // 24 hours
        this.logger.warn(`❌ [WebSocketAuth] Socket ${socket.id} using stale token (age: ${Math.round(tokenAge / 3600)} hours)`);
        this.recordConnectionAttempt(clientIp, false);
        return null;
      }

      // Check connection limit per user
      const existingConnections = this.getUserConnectionCount(payload.sub);
      if (existingConnections >= this.MAX_CONNECTIONS_PER_USER) {
        this.logger.warn(
          `❌ [WebSocketAuth] User ${payload.sub} exceeded connection limit (${existingConnections}/${this.MAX_CONNECTIONS_PER_USER})`,
        );
        this.recordConnectionAttempt(clientIp, false);
        return null;
      }

      // Validate user exists in database and is not deactivated
      this.logger.debug(`🔍 [WebSocketAuth] Looking up user ${payload.sub} in database...`);
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
          deactivatedAt: null,
          isActive: true,
        },
        select: {
          id: true,
          role: true,
          emailVerified: true,
          lockoutUntil: true,
          failedLoginCount: true,
        },
      });

      if (!user) {
        this.logger.warn(`❌ [WebSocketAuth] Socket ${socket.id} user ${payload.sub} not found or deactivated`);
        this.recordConnectionAttempt(clientIp, false);
        return null;
      }

      this.logger.log(`✅ [WebSocketAuth] User ${payload.sub} found in database with role ${user.role}`);

      // Check if user account is locked
      if (user.lockoutUntil && user.lockoutUntil > new Date()) {
        this.logger.warn(
          `❌ [WebSocketAuth] Socket ${socket.id} user account is locked until ${user.lockoutUntil}`,
        );
        this.recordConnectionAttempt(clientIp, false);
        return null;
      }

      const authenticatedUser: AuthenticatedUser = {
        userId: user.id,
        role: user.role,
        lastAuthenticated: new Date(),
        connectionCount: existingConnections + 1,
      };

      // Track successful authentication
      this.authenticatedConnections.set(socket.id, authenticatedUser);
      this.recordConnectionAttempt(clientIp, true);

      this.logger.log(
        `Socket ${socket.id} authenticated as user ${user.id} with role ${user.role} (${authenticatedUser.connectionCount} connections)`,
      );

      this.logger.log(`🎉 [WebSocketAuth] Socket ${socket.id} authenticated successfully as user ${user.id} (${user.role})`);
      return authenticatedUser;
    } catch (error) {
      this.logger.error(
        `💥 [WebSocketAuth] Socket ${socket.id} authentication failed:`,
        error instanceof Error ? error.message : error,
      );
      this.logger.error(`🔍 [WebSocketAuth] Full error stack:`, error instanceof Error ? error.stack : error);
      this.recordConnectionAttempt(clientIp, false);
      return null;
    }
  }

  private extractToken(socket: Socket): string | null {
    // Try different token sources in order of preference

    // 1. Authorization header (Bearer token)
    const authHeader = socket.handshake.headers.authorization;
    if (
      authHeader &&
      typeof authHeader === 'string' &&
      authHeader.startsWith('Bearer ')
    ) {
      const token = authHeader.substring(7).trim();
      return token.length > 0 ? token : null;
    }

    // 2. Auth object in handshake
    const authToken = socket.handshake.auth?.token;
    if (authToken && typeof authToken === 'string') {
      return authToken;
    }

    // 3. Query parameter
    const queryToken = socket.handshake.query?.token;
    if (queryToken && typeof queryToken === 'string') {
      return queryToken;
    }

    // 4. Cookie (for browser connections)
    const cookies = socket.handshake.headers.cookie;
    if (cookies) {
      const sessionCookie = this.extractCookieValue(cookies, '__session');
      if (sessionCookie) {
        return sessionCookie;
      }
    }

    return null;
  }

  private extractCookieValue(cookies: string, name: string): string | null {
    try {
      // Escape special regex characters in cookie name
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const match = cookies.match(new RegExp(`(^| )${escapedName}=([^;]+)`));
      if (match && match[2]) {
        return decodeURIComponent(match[2]);
      }
      return null;
    } catch (error) {
      this.logger.warn(`Failed to extract cookie value for ${name}:`, error);
      return null;
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      // Simply verify if the JWT token is valid
      const payload = this.jwtService.verify(token);

      // Additional validation: check if user still exists and is active
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
          deactivatedAt: null,
        },
        select: { id: true },
      });

      return !!user;
    } catch (error) {
      this.logger.warn('Token validation failed:', error);
      return false;
    }
  }

  /**
   * Clean up connection tracking when socket disconnects
   */
  cleanupConnection(socketId: string): void {
    this.authenticatedConnections.delete(socketId);
  }

  /**
   * Get client IP address from socket
   */
  private getClientIp(socket: Socket): string {
    return (
      (socket.handshake.headers['x-forwarded-for'] as string) ||
      (socket.handshake.headers['x-real-ip'] as string) ||
      socket.handshake.address ||
      socket.conn.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Check rate limiting for connection attempts
   */
  private checkRateLimit(ipAddress: string): boolean {
    const attempts = this.connectionAttempts.get(ipAddress) || [];
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    // Filter to attempts in the last minute
    const recentAttempts = attempts.filter(
      (attempt) => attempt.timestamp > oneMinuteAgo,
    );

    return recentAttempts.length < this.MAX_ATTEMPTS_PER_MINUTE;
  }

  /**
   * Record connection attempt for rate limiting
   */
  private recordConnectionAttempt(ipAddress: string, success: boolean): void {
    if (!this.connectionAttempts.has(ipAddress)) {
      this.connectionAttempts.set(ipAddress, []);
    }

    const attempts = this.connectionAttempts.get(ipAddress)!;
    attempts.push({
      timestamp: new Date(),
      success,
      ipAddress,
    });

    // Keep only recent attempts
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAttempts = attempts.filter(
      (attempt) => attempt.timestamp > oneHourAgo,
    );
    this.connectionAttempts.set(ipAddress, recentAttempts);
  }

  /**
   * Get current connection count for a user
   */
  private getUserConnectionCount(userId: string): number {
    return Array.from(this.authenticatedConnections.values()).filter(
      (user) => user.userId === userId,
    ).length;
  }

  /**
   * Clean up old connection tracking data
   */
  private cleanupConnectionTracking(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Clean up connection attempts
    for (const [ip, attempts] of this.connectionAttempts.entries()) {
      const recentAttempts = attempts.filter(
        (attempt) => attempt.timestamp > oneHourAgo,
      );
      if (recentAttempts.length === 0) {
        this.connectionAttempts.delete(ip);
      } else {
        this.connectionAttempts.set(ip, recentAttempts);
      }
    }

    this.logger.debug('Cleaned up connection tracking data');
  }

  /**
   * Get connection statistics for monitoring
   */
  getConnectionStats() {
    return {
      totalConnections: this.authenticatedConnections.size,
      uniqueUsers: new Set(
        Array.from(this.authenticatedConnections.values()).map(
          (user) => user.userId,
        ),
      ).size,
      trackedIps: this.connectionAttempts.size,
      maxConnectionsPerUser: this.MAX_CONNECTIONS_PER_USER,
      maxAttemptsPerMinute: this.MAX_ATTEMPTS_PER_MINUTE,
    };
  }
}

/**
 * Simplified WebSocket Authentication Middleware
 * Replaces complex WebSocketAuthService with a clean middleware pattern
 * Following Socket.IO best practices for connection-time authentication
 */
@Injectable()
export class WebSocketAuthMiddleware {
  private readonly logger = new Logger(WebSocketAuthMiddleware.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Simple, reliable authentication middleware for Socket.IO connections
   * Validates JWT at connection time using middleware pattern
   */
  createAuthMiddleware() {
    return async (socket: Socket, next: (err?: Error) => void) => {
      try {
        const token = this.extractToken(socket);
        
        if (!token) {
          this.logger.warn(`No token provided for socket ${socket.id}`);
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token with expiration check
        let payload: any;
        try {
          payload = this.jwtService.verify(token);
        } catch (jwtError: any) {
          if (jwtError.name === 'TokenExpiredError') {
            this.logger.warn(`Token expired for socket ${socket.id}`);
            return next(new Error('Token expired'));
          }
          if (jwtError.name === 'JsonWebTokenError') {
            this.logger.warn(`Invalid token for socket ${socket.id}`);
            return next(new Error('Invalid token'));
          }
          throw jwtError;
        }

        if (!payload.sub || !payload.email) {
          this.logger.warn(`Invalid token payload for socket ${socket.id}`);
          return next(new Error('Invalid token payload'));
        }

        // Validate user exists and is active
        const user = await this.prisma.user.findUnique({
          where: {
            id: payload.sub,
            deactivatedAt: null,
            isActive: true,
          },
          select: {
            id: true,
            role: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        });

        if (!user) {
          this.logger.warn(`User not found or inactive for socket ${socket.id}, userId: ${payload.sub}`);
          return next(new Error('User not found or inactive'));
        }

        // Attach user info to socket for later use
        (socket as any).userId = user.id;
        (socket as any).user = user;

        this.logger.debug(`Socket ${socket.id} authenticated as user ${user.id} (${user.firstName} ${user.lastName})`);
        next();
      } catch (error) {
        this.logger.error(`Auth middleware error for socket ${socket.id}:`, error instanceof Error ? error.message : String(error));
        next(new Error('Authentication failed'));
      }
    };
  }

  /**
   * Extract token from socket handshake - simplified version
   */
  private extractToken(socket: Socket): string | null {
    // 1. Authorization header (Bearer token)
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }

    // 2. Auth object in handshake
    const authToken = socket.handshake.auth?.token;
    if (authToken && typeof authToken === 'string') {
      return authToken;
    }

    // 3. Query parameter
    const queryToken = socket.handshake.query?.token;
    if (queryToken && typeof queryToken === 'string') {
      return queryToken;
    }

    return null;
  }
}
