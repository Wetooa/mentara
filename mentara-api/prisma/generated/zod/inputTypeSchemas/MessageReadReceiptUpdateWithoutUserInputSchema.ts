import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { MessageUpdateOneRequiredWithoutReadReceiptsNestedInputSchema } from './MessageUpdateOneRequiredWithoutReadReceiptsNestedInputSchema';

export const MessageReadReceiptUpdateWithoutUserInputSchema: z.ZodType<Prisma.MessageReadReceiptUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  readAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.lazy(() => MessageUpdateOneRequiredWithoutReadReceiptsNestedInputSchema).optional()
}).strict();

export default MessageReadReceiptUpdateWithoutUserInputSchema;
