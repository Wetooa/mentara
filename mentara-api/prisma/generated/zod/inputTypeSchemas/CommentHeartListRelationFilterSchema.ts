import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentHeartWhereInputSchema } from './CommentHeartWhereInputSchema';

export const CommentHeartListRelationFilterSchema: z.ZodType<Prisma.CommentHeartListRelationFilter> = z.object({
  every: z.lazy(() => CommentHeartWhereInputSchema).optional(),
  some: z.lazy(() => CommentHeartWhereInputSchema).optional(),
  none: z.lazy(() => CommentHeartWhereInputSchema).optional()
}).strict();

export default CommentHeartListRelationFilterSchema;
