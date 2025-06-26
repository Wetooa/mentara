import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateNestedOneWithoutHeartsInputSchema } from './CommentCreateNestedOneWithoutHeartsInputSchema';
import { UserCreateNestedOneWithoutCommentHeartsInputSchema } from './UserCreateNestedOneWithoutCommentHeartsInputSchema';

export const CommentHeartCreateInputSchema: z.ZodType<Prisma.CommentHeartCreateInput> = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  comment: z.lazy(() => CommentCreateNestedOneWithoutHeartsInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutCommentHeartsInputSchema).optional()
}).strict();

export default CommentHeartCreateInputSchema;
