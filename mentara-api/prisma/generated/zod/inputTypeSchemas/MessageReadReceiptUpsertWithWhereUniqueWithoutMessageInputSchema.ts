import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReadReceiptWhereUniqueInputSchema } from './MessageReadReceiptWhereUniqueInputSchema';
import { MessageReadReceiptUpdateWithoutMessageInputSchema } from './MessageReadReceiptUpdateWithoutMessageInputSchema';
import { MessageReadReceiptUncheckedUpdateWithoutMessageInputSchema } from './MessageReadReceiptUncheckedUpdateWithoutMessageInputSchema';
import { MessageReadReceiptCreateWithoutMessageInputSchema } from './MessageReadReceiptCreateWithoutMessageInputSchema';
import { MessageReadReceiptUncheckedCreateWithoutMessageInputSchema } from './MessageReadReceiptUncheckedCreateWithoutMessageInputSchema';

export const MessageReadReceiptUpsertWithWhereUniqueWithoutMessageInputSchema: z.ZodType<Prisma.MessageReadReceiptUpsertWithWhereUniqueWithoutMessageInput> = z.object({
  where: z.lazy(() => MessageReadReceiptWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MessageReadReceiptUpdateWithoutMessageInputSchema),z.lazy(() => MessageReadReceiptUncheckedUpdateWithoutMessageInputSchema) ]),
  create: z.union([ z.lazy(() => MessageReadReceiptCreateWithoutMessageInputSchema),z.lazy(() => MessageReadReceiptUncheckedCreateWithoutMessageInputSchema) ]),
}).strict();

export default MessageReadReceiptUpsertWithWhereUniqueWithoutMessageInputSchema;
