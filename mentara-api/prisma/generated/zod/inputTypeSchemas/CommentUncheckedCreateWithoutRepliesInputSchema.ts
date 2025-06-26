import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentUncheckedCreateNestedManyWithoutParentInputSchema } from './CommentUncheckedCreateNestedManyWithoutParentInputSchema';
import { CommentHeartUncheckedCreateNestedManyWithoutCommentInputSchema } from './CommentHeartUncheckedCreateNestedManyWithoutCommentInputSchema';
import { CommentFileUncheckedCreateNestedManyWithoutCommentInputSchema } from './CommentFileUncheckedCreateNestedManyWithoutCommentInputSchema';

export const CommentUncheckedCreateWithoutRepliesInputSchema: z.ZodType<Prisma.CommentUncheckedCreateWithoutRepliesInput> = z.object({
  id: z.string().uuid().optional(),
  postId: z.string(),
  userId: z.string(),
  content: z.string(),
  heartCount: z.number().int().optional(),
  parentId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  children: z.lazy(() => CommentUncheckedCreateNestedManyWithoutParentInputSchema).optional(),
  hearts: z.lazy(() => CommentHeartUncheckedCreateNestedManyWithoutCommentInputSchema).optional(),
  files: z.lazy(() => CommentFileUncheckedCreateNestedManyWithoutCommentInputSchema).optional()
}).strict();

export default CommentUncheckedCreateWithoutRepliesInputSchema;
