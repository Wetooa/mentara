import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl ? ttl * 1000 : undefined);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  /**
   * Clear all cache
   */
  async reset(): Promise<void> {
    try {
      // cache-manager v5 doesn't have reset, use store.reset() if available
      const store = (this.cacheManager as any).store;
      if (store && typeof store.reset === 'function') {
        await store.reset();
      } else {
        this.logger.warn('Cache reset not available for current cache store');
      }
    } catch (error) {
      this.logger.error('Error resetting cache:', error);
    }
  }

  /**
   * Generate cache key with prefix
   */
  generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  /**
   * Invalidate cache by pattern (requires Redis)
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      // This requires Redis-specific implementation
      // For now, we'll log a warning if pattern invalidation is needed
      this.logger.warn(`Pattern invalidation requested for ${pattern}, but not implemented in in-memory cache`);
    } catch (error) {
      this.logger.error(`Error invalidating cache pattern ${pattern}:`, error);
    }
  }

  /**
   * Check if cache is available
   */
  isAvailable(): boolean {
    return !!this.cacheManager;
  }
}

