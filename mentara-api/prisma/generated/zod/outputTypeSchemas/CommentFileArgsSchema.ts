import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentFileSelectSchema } from '../inputTypeSchemas/CommentFileSelectSchema';
import { CommentFileIncludeSchema } from '../inputTypeSchemas/CommentFileIncludeSchema';

export const CommentFileArgsSchema: z.ZodType<Prisma.CommentFileDefaultArgs> = z.object({
  select: z.lazy(() => CommentFileSelectSchema).optional(),
  include: z.lazy(() => CommentFileIncludeSchema).optional(),
}).strict();

export default CommentFileArgsSchema;
