import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { validateSchema, formatValidationErrors } from 'mentara-commons';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    const result = validateSchema(this.schema, value);
    
    if (!result.success) {
      const errorMessage = formatValidationErrors(result.errors);
      throw new BadRequestException(`Validation failed: ${errorMessage}`);
    }
    
    return result.data;
  }
}

// Factory function to create validation pipes
export function ZodValidationPipeFactory(schema: z.ZodSchema) {
  return new ZodValidationPipe(schema);
}

// Decorator for easy use
export function ValidateZodSchema(schema: z.ZodSchema) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    descriptor.value = function (...args: any[]) {
      // Find body parameter and validate it
      const bodyIndex = Reflect.getMetadata('custom:body-index', target, propertyName) || 0;
      if (args[bodyIndex]) {
        const result = validateSchema(schema, args[bodyIndex]);
        if (!result.success) {
          const errorMessage = formatValidationErrors(result.errors);
          throw new BadRequestException(`Validation failed: ${errorMessage}`);
        }
        args[bodyIndex] = result.data;
      }
      return method.apply(this, args);
    };
  };
}