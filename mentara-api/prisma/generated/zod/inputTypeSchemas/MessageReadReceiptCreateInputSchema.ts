import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageCreateNestedOneWithoutReadReceiptsInputSchema } from './MessageCreateNestedOneWithoutReadReceiptsInputSchema';
import { UserCreateNestedOneWithoutMessageReadReceiptsInputSchema } from './UserCreateNestedOneWithoutMessageReadReceiptsInputSchema';

export const MessageReadReceiptCreateInputSchema: z.ZodType<Prisma.MessageReadReceiptCreateInput> = z.object({
  id: z.string().uuid().optional(),
  readAt: z.coerce.date().optional(),
  message: z.lazy(() => MessageCreateNestedOneWithoutReadReceiptsInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutMessageReadReceiptsInputSchema)
}).strict();

export default MessageReadReceiptCreateInputSchema;
