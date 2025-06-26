import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageCreateNestedOneWithoutReadReceiptsInputSchema } from './MessageCreateNestedOneWithoutReadReceiptsInputSchema';

export const MessageReadReceiptCreateWithoutUserInputSchema: z.ZodType<Prisma.MessageReadReceiptCreateWithoutUserInput> = z.object({
  id: z.string().uuid().optional(),
  readAt: z.coerce.date().optional(),
  message: z.lazy(() => MessageCreateNestedOneWithoutReadReceiptsInputSchema)
}).strict();

export default MessageReadReceiptCreateWithoutUserInputSchema;
