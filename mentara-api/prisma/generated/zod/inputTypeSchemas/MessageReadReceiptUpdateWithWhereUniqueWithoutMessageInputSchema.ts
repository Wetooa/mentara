import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReadReceiptWhereUniqueInputSchema } from './MessageReadReceiptWhereUniqueInputSchema';
import { MessageReadReceiptUpdateWithoutMessageInputSchema } from './MessageReadReceiptUpdateWithoutMessageInputSchema';
import { MessageReadReceiptUncheckedUpdateWithoutMessageInputSchema } from './MessageReadReceiptUncheckedUpdateWithoutMessageInputSchema';

export const MessageReadReceiptUpdateWithWhereUniqueWithoutMessageInputSchema: z.ZodType<Prisma.MessageReadReceiptUpdateWithWhereUniqueWithoutMessageInput> = z.object({
  where: z.lazy(() => MessageReadReceiptWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MessageReadReceiptUpdateWithoutMessageInputSchema),z.lazy(() => MessageReadReceiptUncheckedUpdateWithoutMessageInputSchema) ]),
}).strict();

export default MessageReadReceiptUpdateWithWhereUniqueWithoutMessageInputSchema;
