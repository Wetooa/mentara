import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyHeartWhereInputSchema } from './ReplyHeartWhereInputSchema';

export const ReplyHeartListRelationFilterSchema: z.ZodType<Prisma.ReplyHeartListRelationFilter> = z.object({
  every: z.lazy(() => ReplyHeartWhereInputSchema).optional(),
  some: z.lazy(() => ReplyHeartWhereInputSchema).optional(),
  none: z.lazy(() => ReplyHeartWhereInputSchema).optional()
}).strict();

export default ReplyHeartListRelationFilterSchema;
