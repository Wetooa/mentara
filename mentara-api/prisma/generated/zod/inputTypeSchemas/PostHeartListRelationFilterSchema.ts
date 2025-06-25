import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostHeartWhereInputSchema } from './PostHeartWhereInputSchema';

export const PostHeartListRelationFilterSchema: z.ZodType<Prisma.PostHeartListRelationFilter> = z.object({
  every: z.lazy(() => PostHeartWhereInputSchema).optional(),
  some: z.lazy(() => PostHeartWhereInputSchema).optional(),
  none: z.lazy(() => PostHeartWhereInputSchema).optional()
}).strict();

export default PostHeartListRelationFilterSchema;
