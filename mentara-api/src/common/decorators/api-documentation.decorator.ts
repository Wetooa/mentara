import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, type ApiResponseOptions, type ApiBodyOptions } from '@nestjs/swagger';

/**
 * Helper decorator for comprehensive API documentation
 */
export function ApiDocumentation(options: {
  summary: string;
  description?: string;
  responses?: Array<{ status: number; description: string; type?: unknown }>;
  params?: Array<{ name: string; description: string; type?: string }>;
  queries?: Array<{ name: string; description: string; required?: boolean; type?: string }>;
  body?: { description: string; type?: unknown };
}) {
  const decorators = [
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
  ];

  if (options.responses) {
    options.responses.forEach((response) => {
      const responseOptions: ApiResponseOptions = {
        status: response.status,
        description: response.description,
      };
      if (response.type) {
        (responseOptions as { type?: unknown }).type = response.type;
      }
      decorators.push(ApiResponse(responseOptions as ApiResponseOptions));
    });
  }

  if (options.params) {
    options.params.forEach((param) => {
      decorators.push(
        ApiParam({
          name: param.name,
          description: param.description,
          type: param.type as string,
        }),
      );
    });
  }

  if (options.queries) {
    options.queries.forEach((query) => {
      decorators.push(
        ApiQuery({
          name: query.name,
          description: query.description,
          required: query.required,
          type: query.type as string,
        }),
      );
    });
  }

  if (options.body) {
    const bodyOptions: ApiBodyOptions = {
      description: options.body.description,
    };
    if (options.body.type) {
      (bodyOptions as { type?: unknown }).type = options.body.type;
    }
    decorators.push(ApiBody(bodyOptions as ApiBodyOptions));
  }

  return applyDecorators(...decorators);
}


