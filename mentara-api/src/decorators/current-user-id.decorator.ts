import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type Request } from 'express';

export const CurrentUserId = createParamDecorator(
  (_, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    return request.userId;
  },
);
