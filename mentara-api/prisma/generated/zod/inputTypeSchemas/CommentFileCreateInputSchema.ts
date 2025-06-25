import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateNestedOneWithoutFilesInputSchema } from './CommentCreateNestedOneWithoutFilesInputSchema';

export const CommentFileCreateInputSchema: z.ZodType<Prisma.CommentFileCreateInput> = z.object({
  id: z.string().uuid().optional(),
  url: z.string(),
  type: z.string().optional().nullable(),
  comment: z.lazy(() => CommentCreateNestedOneWithoutFilesInputSchema)
}).strict();

export default CommentFileCreateInputSchema;
