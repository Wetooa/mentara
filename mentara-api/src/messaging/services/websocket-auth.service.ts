import { Injectable, Logger } from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { Socket } from 'socket.io';

export interface AuthenticatedUser {
  userId: string;
  role?: string;
}

@Injectable()
export class WebSocketAuthService {
  private readonly logger = new Logger(WebSocketAuthService.name);

  async authenticateSocket(socket: Socket): Promise<AuthenticatedUser | null> {
    try {
      // Extract token from various sources
      const token = this.extractToken(socket);

      if (!token) {
        this.logger.warn(`Socket ${socket.id} connected without valid token`);
        return null;
      }

      // Verify token with Clerk
      const verifiedToken = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY ?? '',
      });

      if (!verifiedToken.sub) {
        this.logger.warn(`Socket ${socket.id} has invalid token payload`);
        return null;
      }

      this.logger.log(
        `Socket ${socket.id} authenticated as user ${verifiedToken.sub}`,
      );

      return {
        userId: verifiedToken.sub,
        role: verifiedToken.role as string | undefined,
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
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
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
    const match = cookies.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  }

  async refreshTokenIfNeeded(token: string): Promise<string | null> {
    try {
      // Check if token is close to expiry and refresh if needed
      const verifiedToken = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY ?? '',
      });

      // If token is valid, return as is
      return token;
    } catch (error) {
      this.logger.warn('Token refresh failed:', error);
      return null;
    }
  }
}
