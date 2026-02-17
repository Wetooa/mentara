import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheService } from '../../cache/cache.service';

/**
 * Interceptor to invalidate cache on mutations
 * Automatically clears related cache entries when data is modified
 */
@Injectable()
export class CacheInvalidationInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private cacheService: CacheService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.path;

    // Only invalidate on mutations (POST, PUT, PATCH, DELETE)
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async () => {
        // Invalidate cache based on the endpoint
        await this.invalidateCacheForPath(path, request);
      }),
    );
  }

  private async invalidateCacheForPath(path: string, request: any): Promise<void> {
    try {
      const userId = request.user?.id;

      // Dashboard invalidation
      if (path.includes('/dashboard')) {
        if (userId) {
          await this.cacheService.del(
            this.cacheService.generateKey('dashboard', 'client', userId),
          );
          await this.cacheService.del(
            this.cacheService.generateKey('dashboard', 'therapist', userId),
          );
        }
        // Invalidate all dashboard caches
        await this.cacheService.invalidatePattern('dashboard:*');
      }

      // Post invalidation
      if (path.includes('/posts')) {
        await this.cacheService.invalidatePattern('posts:*');
        if (userId) {
          await this.cacheService.invalidatePattern(`posts:user:${userId}:*`);
        }
      }

      // Community invalidation
      if (path.includes('/communities')) {
        await this.cacheService.invalidatePattern('communities:*');
      }

      // Therapist invalidation
      if (path.includes('/therapists')) {
        await this.cacheService.invalidatePattern('therapists:*');
        await this.cacheService.del(this.cacheService.generateKey('therapists', 'metadata'));
      }

      // Meeting/Booking invalidation
      if (path.includes('/meetings') || path.includes('/booking')) {
        if (userId) {
          await this.cacheService.del(
            this.cacheService.generateKey('dashboard', 'client', userId),
          );
          await this.cacheService.del(
            this.cacheService.generateKey('dashboard', 'therapist', userId),
          );
        }
      }

      // Analytics invalidation (on data changes)
      if (
        path.includes('/posts') ||
        path.includes('/comments') ||
        path.includes('/meetings') ||
        path.includes('/users')
      ) {
        await this.cacheService.invalidatePattern('analytics:*');
      }
    } catch (error) {
      // Don't fail the request if cache invalidation fails
      console.error('Cache invalidation error:', error);
    }
  }
}

