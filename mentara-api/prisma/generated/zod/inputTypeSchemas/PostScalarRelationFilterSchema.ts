import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostWhereInputSchema } from './PostWhereInputSchema';

export const PostScalarRelationFilterSchema: z.ZodType<Prisma.PostScalarRelationFilter> = z.object({
  is: z.lazy(() => PostWhereInputSchema).optional(),
  isNot: z.lazy(() => PostWhereInputSchema).optional()
}).strict();

export default PostScalarRelationFilterSchema;
