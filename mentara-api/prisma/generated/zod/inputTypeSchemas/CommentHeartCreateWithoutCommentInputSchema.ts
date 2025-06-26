import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutCommentHeartsInputSchema } from './UserCreateNestedOneWithoutCommentHeartsInputSchema';

export const CommentHeartCreateWithoutCommentInputSchema: z.ZodType<Prisma.CommentHeartCreateWithoutCommentInput> = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutCommentHeartsInputSchema).optional()
}).strict();

export default CommentHeartCreateWithoutCommentInputSchema;
