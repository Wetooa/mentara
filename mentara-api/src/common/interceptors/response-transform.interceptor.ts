import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto, PaginatedResponseDto, createPaginationMeta } from '../dto/api-response.dto';
import { Request } from 'express';

/**
 * Response transformation interceptor
 * Standardizes all API responses to use ApiResponseDto format
 */
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.url;

    return next.handle().pipe(
      map((data) => {
        // If data is already in ApiResponseDto format, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Handle paginated responses
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return PaginatedResponseDto.success(data.data, data.meta);
        }

        // Handle array responses (could be paginated)
        if (Array.isArray(data) && 'meta' in data) {
          const { meta, ...items } = data as unknown as { meta: unknown; [key: string]: unknown };
          return PaginatedResponseDto.success(
            items as unknown[],
            meta as { total: number; page: number; limit: number }
          );
        }

        // Standard success response
        return ApiResponseDto.success(data);
      }),
    );
  }
}


