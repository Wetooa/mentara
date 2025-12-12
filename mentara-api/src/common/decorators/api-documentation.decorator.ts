import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';

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
      decorators.push(
        ApiResponse({
          status: response.status,
          description: response.description,
          type: response.type,
        }),
      );
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
    decorators.push(
      ApiBody({
        description: options.body.description,
        type: options.body.type as unknown,
      }),
    );
  }

  return applyDecorators(...decorators);
}


