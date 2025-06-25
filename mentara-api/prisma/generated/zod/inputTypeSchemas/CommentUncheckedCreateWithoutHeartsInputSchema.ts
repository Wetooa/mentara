import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentFileUncheckedCreateNestedManyWithoutCommentInputSchema } from './CommentFileUncheckedCreateNestedManyWithoutCommentInputSchema';
import { ReplyUncheckedCreateNestedManyWithoutCommentInputSchema } from './ReplyUncheckedCreateNestedManyWithoutCommentInputSchema';

export const CommentUncheckedCreateWithoutHeartsInputSchema: z.ZodType<Prisma.CommentUncheckedCreateWithoutHeartsInput> = z.object({
  id: z.string().uuid().optional(),
  postId: z.string(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  files: z.lazy(() => CommentFileUncheckedCreateNestedManyWithoutCommentInputSchema).optional(),
  replies: z.lazy(() => ReplyUncheckedCreateNestedManyWithoutCommentInputSchema).optional()
}).strict();

export default CommentUncheckedCreateWithoutHeartsInputSchema;
