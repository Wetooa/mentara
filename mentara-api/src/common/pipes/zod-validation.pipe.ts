import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodType<any, any, any>) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      // Validate all types: body, query, param
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => {
          const path = err.path.length > 0 ? err.path.join('.') : 'root';
          return `${path}: ${err.message}`;
        });
        
        throw new BadRequestException({
          message: 'Validation failed',
          errors: errorMessages,
          statusCode: 400,
          type: metadata.type
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}

// Factory function to create validation pipes
export function ZodValidationPipeFactory(schema: z.ZodType<any, any, any>) {
  return new ZodValidationPipe(schema);
}

// Decorator for easy parameter validation
export function ValidateBody(schema: z.ZodType<any, any, any>) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    // This would work with a custom decorator implementation
    // For now, we'll use the pipe directly in controllers
  };
}

// Decorator for query validation
export function ValidateQuery(schema: z.ZodType<any, any, any>) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    // This would work with a custom decorator implementation
  };
}

// Decorator for param validation
export function ValidateParam(schema: z.ZodType<any, any, any>) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    // This would work with a custom decorator implementation  
  };
}