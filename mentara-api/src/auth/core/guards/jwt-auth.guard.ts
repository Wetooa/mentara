import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // For public endpoints, still try to extract user from token if present
      // but don't require it (don't throw if missing/invalid)
      const result = super.canActivate(context);
      
      // Handle Promise result
      if (result instanceof Promise) {
        return result.then((authResult) => {
          // Token was valid, authentication will happen in handleRequest
          return true; // Always allow public endpoints
        }).catch((error) => {
          // Token missing or invalid - that's OK for public endpoints
          // Just continue without authentication
          this.logger.debug('Public endpoint: token not provided or invalid, continuing without auth');
          return true; // Allow request to proceed
        });
      }
      
      // Handle Observable result (convert to Promise)
      if (result instanceof Observable) {
        return firstValueFrom(result).then(() => {
          return true; // Always allow public endpoints
        }).catch(() => {
          this.logger.debug('Public endpoint: token not provided or invalid, continuing without auth');
          return true; // Allow request to proceed
        });
      }
      
      // Handle boolean result (synchronous)
      return true; // Always allow public endpoints
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Log authentication attempt
    if (authHeader) {
      const tokenPreview = authHeader.substring(0, 20) + '...';
      // Debug log removed to reduce noise
    } else if (!isPublic) {
      this.logger.warn(`JWT authentication attempt from ${request.ip} - no Authorization header found`);
    }

    // For public endpoints, allow requests without authentication
    if (isPublic && (err || !user)) {
      // Public endpoint - no auth required, just continue
      this.logger.debug(`Public endpoint: continuing without authentication`);
      return null; // Return null to indicate no user, but don't throw
    }

    // For protected endpoints, authentication is required
    if (!isPublic && (err || !user)) {
      // Log detailed error information
      if (err) {
        this.logger.error(`JWT authentication error: ${err.message || err}`, err.stack);
      } else if (info) {
        this.logger.warn(`JWT authentication failed: ${info.message || JSON.stringify(info)}`);
      } else {
        this.logger.warn(`JWT authentication failed: no user returned from strategy`);
      }
      
      throw err || new UnauthorizedException('Invalid token');
    }

    // Set user data on request for decorators to access
    if (user) {
      request.user = user;
      request.userId = user.userId; // For @CurrentUserId() decorator
      request.userRole = user.role; // For @CurrentUserRole() decorator

      // Debug log removed to reduce noise
    }
    
    return user;
  }
}
