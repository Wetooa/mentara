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
   * For in-memory cache, this will attempt to match keys
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const store = (this.cacheManager as any).store;
      
      // If using Redis store, use Redis pattern matching
      if (store && store.client) {
        // Redis implementation using SCAN for better performance than KEYS
        const client = store.client;
        const keys: string[] = [];
        let cursor = '0';
        
        do {
          const result = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
          cursor = result[0];
          keys.push(...result[1]);
        } while (cursor !== '0');
        
        if (keys.length > 0) {
          // Delete keys in batches to avoid blocking
          const batchSize = 100;
          for (let i = 0; i < keys.length; i += batchSize) {
            const batch = keys.slice(i, i + batchSize);
            await Promise.all(batch.map((key: string) => this.del(key)));
          }
          this.logger.log(`✅ Invalidated ${keys.length} Redis cache keys matching pattern: ${pattern}`);
        } else {
          this.logger.debug(`No keys found matching pattern: ${pattern}`);
        }
      } else {
        // For in-memory cache, try to match keys if store supports it
        if (store && typeof store.keys === 'function') {
          const keys = await store.keys();
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          const matchingKeys = keys.filter((key: string) => regex.test(key));
          await Promise.all(matchingKeys.map((key: string) => this.del(key)));
          this.logger.log(`Invalidated ${matchingKeys.length} cache keys matching pattern: ${pattern}`);
        } else {
          this.logger.warn(`Pattern invalidation requested for ${pattern}, but store doesn't support key enumeration`);
        }
      }
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

