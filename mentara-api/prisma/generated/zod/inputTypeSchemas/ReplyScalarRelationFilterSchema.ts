import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyWhereInputSchema } from './ReplyWhereInputSchema';

export const ReplyScalarRelationFilterSchema: z.ZodType<Prisma.ReplyScalarRelationFilter> = z.object({
  is: z.lazy(() => ReplyWhereInputSchema).optional(),
  isNot: z.lazy(() => ReplyWhereInputSchema).optional()
}).strict();

export default ReplyScalarRelationFilterSchema;
