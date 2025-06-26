import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyWhereInputSchema } from './ReplyWhereInputSchema';

export const ReplyListRelationFilterSchema: z.ZodType<Prisma.ReplyListRelationFilter> = z.object({
  every: z.lazy(() => ReplyWhereInputSchema).optional(),
  some: z.lazy(() => ReplyWhereInputSchema).optional(),
  none: z.lazy(() => ReplyWhereInputSchema).optional()
}).strict();

export default ReplyListRelationFilterSchema;
