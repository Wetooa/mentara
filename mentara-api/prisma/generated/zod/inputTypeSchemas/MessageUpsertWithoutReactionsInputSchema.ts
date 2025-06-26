import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageUpdateWithoutReactionsInputSchema } from './MessageUpdateWithoutReactionsInputSchema';
import { MessageUncheckedUpdateWithoutReactionsInputSchema } from './MessageUncheckedUpdateWithoutReactionsInputSchema';
import { MessageCreateWithoutReactionsInputSchema } from './MessageCreateWithoutReactionsInputSchema';
import { MessageUncheckedCreateWithoutReactionsInputSchema } from './MessageUncheckedCreateWithoutReactionsInputSchema';
import { MessageWhereInputSchema } from './MessageWhereInputSchema';

export const MessageUpsertWithoutReactionsInputSchema: z.ZodType<Prisma.MessageUpsertWithoutReactionsInput> = z.object({
  update: z.union([ z.lazy(() => MessageUpdateWithoutReactionsInputSchema),z.lazy(() => MessageUncheckedUpdateWithoutReactionsInputSchema) ]),
  create: z.union([ z.lazy(() => MessageCreateWithoutReactionsInputSchema),z.lazy(() => MessageUncheckedCreateWithoutReactionsInputSchema) ]),
  where: z.lazy(() => MessageWhereInputSchema).optional()
}).strict();

export default MessageUpsertWithoutReactionsInputSchema;
