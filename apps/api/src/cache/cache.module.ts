import { Module, Global, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('CacheModule');
        // Purpose-based env: CACHE_STORE_* preferred; REDIS_* kept for backward compatibility
        const cacheStoreUrl =
          configService.get<string>('CACHE_STORE_URL') ||
          configService.get<string>('REDIS_URL');
        const cacheStoreHost =
          configService.get<string>('CACHE_STORE_HOST') ||
          configService.get<string>('REDIS_HOST') ||
          'localhost';
        const cacheStorePort =
          configService.get<number>('CACHE_STORE_PORT') ||
          configService.get<number>('REDIS_PORT') ||
          6379;

        if (cacheStoreUrl || cacheStoreHost) {
          try {
            const store = await redisStore({
              url:
                cacheStoreUrl || `redis://${cacheStoreHost}:${cacheStorePort}`,
              ttl: 300 * 1000, // 5 minutes in milliseconds
            });

            logger.log(
              `Cache store connected: ${cacheStoreUrl || `${cacheStoreHost}:${cacheStorePort}`}`,
            );

            return {
              store: () => store,
              ttl: 300 * 1000,
            };
          } catch (error: any) {
            logger.warn(
              `Cache store unavailable (${error?.message ?? error}). Using in-memory cache.`,
            );
            return {
              ttl: 300,
              max: 1000,
            };
          }
        }

        logger.log('Using in-memory cache (no cache store configured)');
        return {
          ttl: 300,
          max: 1000,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}

