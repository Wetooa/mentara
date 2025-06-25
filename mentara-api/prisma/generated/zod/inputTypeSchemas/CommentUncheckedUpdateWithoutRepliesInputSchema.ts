import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { CommentHeartUncheckedUpdateManyWithoutCommentNestedInputSchema } from './CommentHeartUncheckedUpdateManyWithoutCommentNestedInputSchema';
import { CommentFileUncheckedUpdateManyWithoutCommentNestedInputSchema } from './CommentFileUncheckedUpdateManyWithoutCommentNestedInputSchema';

export const CommentUncheckedUpdateWithoutRepliesInputSchema: z.ZodType<Prisma.CommentUncheckedUpdateWithoutRepliesInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  postId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hearts: z.lazy(() => CommentHeartUncheckedUpdateManyWithoutCommentNestedInputSchema).optional(),
  files: z.lazy(() => CommentFileUncheckedUpdateManyWithoutCommentNestedInputSchema).optional()
}).strict();

export default CommentUncheckedUpdateWithoutRepliesInputSchema;
