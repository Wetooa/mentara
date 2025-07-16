import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

export interface AuthenticatedUser {
  userId: string;
  role?: string;
}

@Injectable()
export class WebSocketAuthService {
  private readonly logger = new Logger(WebSocketAuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async authenticateSocket(socket: Socket): Promise<AuthenticatedUser | null> {
    try {
      // Extract token from various sources
      const token = this.extractToken(socket);

      if (!token) {
        this.logger.warn(`Socket ${socket.id} connected without valid token`);
        return null;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);

      if (!payload.sub) {
        this.logger.warn(`Socket ${socket.id} has invalid token payload`);
        return null;
      }

      // Validate user exists in database and is not deactivated
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
          deactivatedAt: null,
        },
        select: {
          id: true,
          role: true,
          emailVerified: true,
        },
      });

      if (!user) {
        this.logger.warn(`Socket ${socket.id} user not found or deactivated`);
        return null;
      }

      this.logger.log(
        `Socket ${socket.id} authenticated as user ${user.id} with role ${user.role}`,
      );

      return {
        userId: user.id,
        role: user.role,
      };
    } catch (error) {
      this.logger.error(
        `Socket ${socket.id} authentication failed:`,
        error instanceof Error ? error.message : error,
      );
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
}
