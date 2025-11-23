import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseDto, ErrorDetail } from '../dto/api-response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const errorObj = exceptionResponse as any;
        message = errorObj.message || message;
        errors = Array.isArray(errorObj.message)
          ? errorObj.message
          : errorObj.error
            ? [errorObj.error]
            : [];
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.stack);
    }

    this.logger.error(
      `HTTP ${status} Error - ${request.method} ${request.url}: ${message}`,
    );

    const errorResponse = ApiResponseDto.error(
      message,
      errors.length > 0 ? ApiResponseDto.convertStringErrorsToDetails(errors) : undefined,
      status,
      request.url,
    );

    // Ensure CORS headers are set on error responses
    const origin = request.headers.origin;
    if (origin) {
      const allowedOrigins = process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL?.split(',').map((url) => url.trim()) || []
        : [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'http://localhost:10001',
            'http://127.0.0.1:10001',
          ];
      
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        response.setHeader('Access-Control-Allow-Origin', origin);
        response.setHeader('Access-Control-Allow-Credentials', 'true');
      }
    }

    response.status(status).json(errorResponse);
  }
}
