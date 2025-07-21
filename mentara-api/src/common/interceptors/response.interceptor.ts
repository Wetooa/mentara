import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the controller already returns an ApiResponseDto, pass it through
        if (data instanceof ApiResponseDto) {
          return data;
        }

        // If the data has success property, it's already formatted
        if (data && typeof data === 'object' && 'success' in data) {
          return data as ApiResponse<T>;
        }

        // Otherwise, wrap the data in our standard response format
        return ApiResponseDto.success(data);
      }),
    );
  }
}
