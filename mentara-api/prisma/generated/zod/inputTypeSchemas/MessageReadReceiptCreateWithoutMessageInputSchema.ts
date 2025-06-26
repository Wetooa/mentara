import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutMessageReadReceiptsInputSchema } from './UserCreateNestedOneWithoutMessageReadReceiptsInputSchema';

export const MessageReadReceiptCreateWithoutMessageInputSchema: z.ZodType<Prisma.MessageReadReceiptCreateWithoutMessageInput> = z.object({
  id: z.string().uuid().optional(),
  readAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutMessageReadReceiptsInputSchema)
}).strict();

export default MessageReadReceiptCreateWithoutMessageInputSchema;
