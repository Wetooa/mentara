import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { MessageUpdateOneRequiredWithoutReactionsNestedInputSchema } from './MessageUpdateOneRequiredWithoutReactionsNestedInputSchema';
import { UserUpdateOneRequiredWithoutMessageReactionsNestedInputSchema } from './UserUpdateOneRequiredWithoutMessageReactionsNestedInputSchema';

export const MessageReactionUpdateInputSchema: z.ZodType<Prisma.MessageReactionUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emoji: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.lazy(() => MessageUpdateOneRequiredWithoutReactionsNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutMessageReactionsNestedInputSchema).optional()
}).strict();

export default MessageReactionUpdateInputSchema;
