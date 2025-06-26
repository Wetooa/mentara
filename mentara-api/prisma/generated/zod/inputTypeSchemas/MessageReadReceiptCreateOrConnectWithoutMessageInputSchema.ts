import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReadReceiptWhereUniqueInputSchema } from './MessageReadReceiptWhereUniqueInputSchema';
import { MessageReadReceiptCreateWithoutMessageInputSchema } from './MessageReadReceiptCreateWithoutMessageInputSchema';
import { MessageReadReceiptUncheckedCreateWithoutMessageInputSchema } from './MessageReadReceiptUncheckedCreateWithoutMessageInputSchema';

export const MessageReadReceiptCreateOrConnectWithoutMessageInputSchema: z.ZodType<Prisma.MessageReadReceiptCreateOrConnectWithoutMessageInput> = z.object({
  where: z.lazy(() => MessageReadReceiptWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MessageReadReceiptCreateWithoutMessageInputSchema),z.lazy(() => MessageReadReceiptUncheckedCreateWithoutMessageInputSchema) ]),
}).strict();

export default MessageReadReceiptCreateOrConnectWithoutMessageInputSchema;
