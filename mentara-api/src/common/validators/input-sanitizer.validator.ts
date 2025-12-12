import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';

/**
 * Input sanitization pipe
 * Removes potentially dangerous characters and normalizes input
 */
@Injectable()
export class InputSanitizerPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value as Record<string, unknown>);
    }

    return value;
  }

  private sanitizeString(input: string): string {
    // Remove null bytes
    let sanitized = input.replace(/\0/g, '');

    // Remove control characters except newlines and tabs
    sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

    // Trim whitespace
    sanitized = sanitized.trim();

    // Limit length (prevent DoS)
    const maxLength = 10000;
    if (sanitized.length > maxLength) {
      throw new BadRequestException(`Input exceeds maximum length of ${maxLength} characters`);
    }

    return sanitized;
  }

  private sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item) => {
          if (typeof item === 'string') {
            return this.sanitizeString(item);
          }
          if (typeof item === 'object' && item !== null) {
            return this.sanitizeObject(item as Record<string, unknown>);
          }
          return item;
        });
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}


