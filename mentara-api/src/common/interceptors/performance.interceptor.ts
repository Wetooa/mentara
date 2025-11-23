import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PerformanceMonitorService } from '../../monitoring/performance-monitor.service';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(
    private readonly performanceMonitor: PerformanceMonitorService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode || 200;

          // Record performance metrics
          this.performanceMonitor.recordRequest(
            url,
            method,
            duration,
            statusCode,
          );

          // Log slow requests
          if (duration > 1000) {
            console.warn(
              `⚠️  Slow request: ${method} ${url} took ${duration}ms`,
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          this.performanceMonitor.recordRequest(
            url,
            method,
            duration,
            statusCode,
          );

          console.error(
            `❌ Request error: ${method} ${url} took ${duration}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}

