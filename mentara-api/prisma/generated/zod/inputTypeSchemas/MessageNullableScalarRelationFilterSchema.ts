import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageWhereInputSchema } from './MessageWhereInputSchema';

export const MessageNullableScalarRelationFilterSchema: z.ZodType<Prisma.MessageNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => MessageWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => MessageWhereInputSchema).optional().nullable()
}).strict();

export default MessageNullableScalarRelationFilterSchema;
