import { Module, Global, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('CacheModule');
        const redisUrl = configService.get<string>('REDIS_URL');
        
        // For now, use in-memory cache
        // Redis integration can be added later with cache-manager-redis-yet package
        if (redisUrl) {
          logger.log(`Redis URL configured: ${redisUrl} (Redis store will be implemented)`);
        } else {
          logger.log('Using in-memory cache (Redis not configured)');
        }
        
        return {
          ttl: 300, // 5 minutes default TTL
          max: 1000, // Maximum number of items in cache
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}

