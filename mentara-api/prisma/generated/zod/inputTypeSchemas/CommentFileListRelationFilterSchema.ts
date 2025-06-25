import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentFileWhereInputSchema } from './CommentFileWhereInputSchema';

export const CommentFileListRelationFilterSchema: z.ZodType<Prisma.CommentFileListRelationFilter> = z.object({
  every: z.lazy(() => CommentFileWhereInputSchema).optional(),
  some: z.lazy(() => CommentFileWhereInputSchema).optional(),
  none: z.lazy(() => CommentFileWhereInputSchema).optional()
}).strict();

export default CommentFileListRelationFilterSchema;
