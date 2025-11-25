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
        const redisUrl = configService.get<string>('REDIS_URL');
        const redisHost = configService.get<string>('REDIS_HOST') || 'localhost';
        const redisPort = configService.get<number>('REDIS_PORT') || 6379;
        
        // Use Redis if URL or host is configured, otherwise use in-memory cache
        if (redisUrl || redisHost) {
          try {
            const store = await redisStore({
              url: redisUrl || `redis://${redisHost}:${redisPort}`,
              ttl: 300 * 1000, // 5 minutes in milliseconds
            });
            
            logger.log(`✅ Redis cache connected: ${redisUrl || `${redisHost}:${redisPort}`}`);
            
            return {
              store: () => store,
              ttl: 300 * 1000, // 5 minutes default TTL
            };
          } catch (error) {
            logger.warn(`⚠️ Failed to connect to Redis: ${error.message}. Falling back to in-memory cache.`);
            return {
              ttl: 300, // 5 minutes default TTL
              max: 1000, // Maximum number of items in cache
            };
          }
        } else {
          logger.log('📦 Using in-memory cache (Redis not configured)');
          return {
            ttl: 300, // 5 minutes default TTL
            max: 1000, // Maximum number of items in cache
          };
        }
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}

