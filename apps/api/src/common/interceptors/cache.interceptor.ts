import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CACHE_TTL_KEY, CACHE_KEY_PREFIX } from '../decorators/cache.decorator';
import { Request } from 'express';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    const controller = context.getClass();

    // Get cache TTL from metadata
    const ttl = this.reflector.get<number>(CACHE_TTL_KEY, handler);
    const keyPrefix = this.reflector.get<string>(CACHE_KEY_PREFIX, handler);

    // If no TTL is set, don't cache
    if (!ttl) {
      return next.handle();
    }

    // Generate cache key from request
    const cacheKey = this.generateCacheKey(
      keyPrefix || `${controller.name}:${handler.name}`,
      request,
    );

    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return of(cached);
    }

    // If not cached, execute handler and cache result
    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheManager.set(cacheKey, data, ttl * 1000);
      }),
    );
  }

  private generateCacheKey(prefix: string, request: Request): string {
    const queryString = JSON.stringify(request.query);
    const params = JSON.stringify(request.params);
    const userId = (request as any).user?.id || 'anonymous';
    return `${prefix}:${userId}:${params}:${queryString}`;
  }
}

