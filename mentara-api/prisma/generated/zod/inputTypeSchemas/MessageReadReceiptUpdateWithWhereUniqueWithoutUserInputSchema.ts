import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReadReceiptWhereUniqueInputSchema } from './MessageReadReceiptWhereUniqueInputSchema';
import { MessageReadReceiptUpdateWithoutUserInputSchema } from './MessageReadReceiptUpdateWithoutUserInputSchema';
import { MessageReadReceiptUncheckedUpdateWithoutUserInputSchema } from './MessageReadReceiptUncheckedUpdateWithoutUserInputSchema';

export const MessageReadReceiptUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.MessageReadReceiptUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => MessageReadReceiptWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MessageReadReceiptUpdateWithoutUserInputSchema),z.lazy(() => MessageReadReceiptUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default MessageReadReceiptUpdateWithWhereUniqueWithoutUserInputSchema;
