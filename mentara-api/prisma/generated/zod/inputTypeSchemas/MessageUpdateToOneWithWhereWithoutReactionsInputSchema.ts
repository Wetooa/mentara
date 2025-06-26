import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageWhereInputSchema } from './MessageWhereInputSchema';
import { MessageUpdateWithoutReactionsInputSchema } from './MessageUpdateWithoutReactionsInputSchema';
import { MessageUncheckedUpdateWithoutReactionsInputSchema } from './MessageUncheckedUpdateWithoutReactionsInputSchema';

export const MessageUpdateToOneWithWhereWithoutReactionsInputSchema: z.ZodType<Prisma.MessageUpdateToOneWithWhereWithoutReactionsInput> = z.object({
  where: z.lazy(() => MessageWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => MessageUpdateWithoutReactionsInputSchema),z.lazy(() => MessageUncheckedUpdateWithoutReactionsInputSchema) ]),
}).strict();

export default MessageUpdateToOneWithWhereWithoutReactionsInputSchema;
