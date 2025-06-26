import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { CommentHeartUncheckedUpdateManyWithoutCommentNestedInputSchema } from './CommentHeartUncheckedUpdateManyWithoutCommentNestedInputSchema';
import { CommentFileUncheckedUpdateManyWithoutCommentNestedInputSchema } from './CommentFileUncheckedUpdateManyWithoutCommentNestedInputSchema';
import { ReplyUncheckedUpdateManyWithoutCommentNestedInputSchema } from './ReplyUncheckedUpdateManyWithoutCommentNestedInputSchema';

export const CommentUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.CommentUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  postId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hearts: z.lazy(() => CommentHeartUncheckedUpdateManyWithoutCommentNestedInputSchema).optional(),
  files: z.lazy(() => CommentFileUncheckedUpdateManyWithoutCommentNestedInputSchema).optional(),
  replies: z.lazy(() => ReplyUncheckedUpdateManyWithoutCommentNestedInputSchema).optional()
}).strict();

export default CommentUncheckedUpdateWithoutUserInputSchema;
