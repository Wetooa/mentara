import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { ReplyHeartUncheckedUpdateManyWithoutReplyNestedInputSchema } from './ReplyHeartUncheckedUpdateManyWithoutReplyNestedInputSchema';
import { ReplyFileUncheckedUpdateManyWithoutReplyNestedInputSchema } from './ReplyFileUncheckedUpdateManyWithoutReplyNestedInputSchema';

export const ReplyUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.ReplyUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  commentId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hearts: z.lazy(() => ReplyHeartUncheckedUpdateManyWithoutReplyNestedInputSchema).optional(),
  files: z.lazy(() => ReplyFileUncheckedUpdateManyWithoutReplyNestedInputSchema).optional()
}).strict();

export default ReplyUncheckedUpdateWithoutUserInputSchema;
