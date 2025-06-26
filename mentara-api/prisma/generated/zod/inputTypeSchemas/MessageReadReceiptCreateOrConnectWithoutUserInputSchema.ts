import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReadReceiptWhereUniqueInputSchema } from './MessageReadReceiptWhereUniqueInputSchema';
import { MessageReadReceiptCreateWithoutUserInputSchema } from './MessageReadReceiptCreateWithoutUserInputSchema';
import { MessageReadReceiptUncheckedCreateWithoutUserInputSchema } from './MessageReadReceiptUncheckedCreateWithoutUserInputSchema';

export const MessageReadReceiptCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.MessageReadReceiptCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => MessageReadReceiptWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MessageReadReceiptCreateWithoutUserInputSchema),z.lazy(() => MessageReadReceiptUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default MessageReadReceiptCreateOrConnectWithoutUserInputSchema;
