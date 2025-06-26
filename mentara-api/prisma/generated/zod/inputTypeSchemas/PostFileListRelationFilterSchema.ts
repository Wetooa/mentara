import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostFileWhereInputSchema } from './PostFileWhereInputSchema';

export const PostFileListRelationFilterSchema: z.ZodType<Prisma.PostFileListRelationFilter> = z.object({
  every: z.lazy(() => PostFileWhereInputSchema).optional(),
  some: z.lazy(() => PostFileWhereInputSchema).optional(),
  none: z.lazy(() => PostFileWhereInputSchema).optional()
}).strict();

export default PostFileListRelationFilterSchema;
