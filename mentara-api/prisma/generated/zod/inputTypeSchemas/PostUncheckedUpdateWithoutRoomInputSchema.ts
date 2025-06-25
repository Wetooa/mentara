import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { PostFileUncheckedUpdateManyWithoutPostNestedInputSchema } from './PostFileUncheckedUpdateManyWithoutPostNestedInputSchema';
import { CommentUncheckedUpdateManyWithoutPostNestedInputSchema } from './CommentUncheckedUpdateManyWithoutPostNestedInputSchema';
import { PostHeartUncheckedUpdateManyWithoutPostNestedInputSchema } from './PostHeartUncheckedUpdateManyWithoutPostNestedInputSchema';

export const PostUncheckedUpdateWithoutRoomInputSchema: z.ZodType<Prisma.PostUncheckedUpdateWithoutRoomInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  files: z.lazy(() => PostFileUncheckedUpdateManyWithoutPostNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedUpdateManyWithoutPostNestedInputSchema).optional(),
  hearts: z.lazy(() => PostHeartUncheckedUpdateManyWithoutPostNestedInputSchema).optional()
}).strict();

export default PostUncheckedUpdateWithoutRoomInputSchema;
