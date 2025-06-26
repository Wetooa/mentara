import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentHeartUncheckedCreateNestedManyWithoutCommentInputSchema } from './CommentHeartUncheckedCreateNestedManyWithoutCommentInputSchema';
import { CommentFileUncheckedCreateNestedManyWithoutCommentInputSchema } from './CommentFileUncheckedCreateNestedManyWithoutCommentInputSchema';
import { ReplyUncheckedCreateNestedManyWithoutCommentInputSchema } from './ReplyUncheckedCreateNestedManyWithoutCommentInputSchema';

export const CommentUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.CommentUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().uuid().optional(),
  postId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  hearts: z.lazy(() => CommentHeartUncheckedCreateNestedManyWithoutCommentInputSchema).optional(),
  files: z.lazy(() => CommentFileUncheckedCreateNestedManyWithoutCommentInputSchema).optional(),
  replies: z.lazy(() => ReplyUncheckedCreateNestedManyWithoutCommentInputSchema).optional()
}).strict();

export default CommentUncheckedCreateWithoutUserInputSchema;
