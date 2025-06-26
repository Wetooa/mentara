import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { CommentUncheckedUpdateManyWithoutParentNestedInputSchema } from './CommentUncheckedUpdateManyWithoutParentNestedInputSchema';
import { CommentHeartUncheckedUpdateManyWithoutCommentNestedInputSchema } from './CommentHeartUncheckedUpdateManyWithoutCommentNestedInputSchema';
import { CommentFileUncheckedUpdateManyWithoutCommentNestedInputSchema } from './CommentFileUncheckedUpdateManyWithoutCommentNestedInputSchema';
import { ReplyUncheckedUpdateManyWithoutCommentNestedInputSchema } from './ReplyUncheckedUpdateManyWithoutCommentNestedInputSchema';

export const CommentUncheckedUpdateInputSchema: z.ZodType<Prisma.CommentUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  postId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  heartCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  parentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  children: z.lazy(() => CommentUncheckedUpdateManyWithoutParentNestedInputSchema).optional(),
  hearts: z.lazy(() => CommentHeartUncheckedUpdateManyWithoutCommentNestedInputSchema).optional(),
  files: z.lazy(() => CommentFileUncheckedUpdateManyWithoutCommentNestedInputSchema).optional(),
  replies: z.lazy(() => ReplyUncheckedUpdateManyWithoutCommentNestedInputSchema).optional()
}).strict();

export default CommentUncheckedUpdateInputSchema;
