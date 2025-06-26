import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReadReceiptScalarWhereInputSchema } from './MessageReadReceiptScalarWhereInputSchema';
import { MessageReadReceiptUpdateManyMutationInputSchema } from './MessageReadReceiptUpdateManyMutationInputSchema';
import { MessageReadReceiptUncheckedUpdateManyWithoutMessageInputSchema } from './MessageReadReceiptUncheckedUpdateManyWithoutMessageInputSchema';

export const MessageReadReceiptUpdateManyWithWhereWithoutMessageInputSchema: z.ZodType<Prisma.MessageReadReceiptUpdateManyWithWhereWithoutMessageInput> = z.object({
  where: z.lazy(() => MessageReadReceiptScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MessageReadReceiptUpdateManyMutationInputSchema),z.lazy(() => MessageReadReceiptUncheckedUpdateManyWithoutMessageInputSchema) ]),
}).strict();

export default MessageReadReceiptUpdateManyWithWhereWithoutMessageInputSchema;
