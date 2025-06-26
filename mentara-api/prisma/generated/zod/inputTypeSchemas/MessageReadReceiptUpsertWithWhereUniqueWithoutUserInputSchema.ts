import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReadReceiptWhereUniqueInputSchema } from './MessageReadReceiptWhereUniqueInputSchema';
import { MessageReadReceiptUpdateWithoutUserInputSchema } from './MessageReadReceiptUpdateWithoutUserInputSchema';
import { MessageReadReceiptUncheckedUpdateWithoutUserInputSchema } from './MessageReadReceiptUncheckedUpdateWithoutUserInputSchema';
import { MessageReadReceiptCreateWithoutUserInputSchema } from './MessageReadReceiptCreateWithoutUserInputSchema';
import { MessageReadReceiptUncheckedCreateWithoutUserInputSchema } from './MessageReadReceiptUncheckedCreateWithoutUserInputSchema';

export const MessageReadReceiptUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.MessageReadReceiptUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => MessageReadReceiptWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MessageReadReceiptUpdateWithoutUserInputSchema),z.lazy(() => MessageReadReceiptUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => MessageReadReceiptCreateWithoutUserInputSchema),z.lazy(() => MessageReadReceiptUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default MessageReadReceiptUpsertWithWhereUniqueWithoutUserInputSchema;
