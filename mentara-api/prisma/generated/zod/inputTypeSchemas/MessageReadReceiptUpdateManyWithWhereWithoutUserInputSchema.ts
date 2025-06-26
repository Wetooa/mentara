import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReadReceiptScalarWhereInputSchema } from './MessageReadReceiptScalarWhereInputSchema';
import { MessageReadReceiptUpdateManyMutationInputSchema } from './MessageReadReceiptUpdateManyMutationInputSchema';
import { MessageReadReceiptUncheckedUpdateManyWithoutUserInputSchema } from './MessageReadReceiptUncheckedUpdateManyWithoutUserInputSchema';

export const MessageReadReceiptUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.MessageReadReceiptUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => MessageReadReceiptScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MessageReadReceiptUpdateManyMutationInputSchema),z.lazy(() => MessageReadReceiptUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export default MessageReadReceiptUpdateManyWithWhereWithoutUserInputSchema;
