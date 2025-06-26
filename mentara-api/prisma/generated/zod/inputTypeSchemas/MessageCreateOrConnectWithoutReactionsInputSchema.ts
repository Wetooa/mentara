import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';
import { MessageCreateWithoutReactionsInputSchema } from './MessageCreateWithoutReactionsInputSchema';
import { MessageUncheckedCreateWithoutReactionsInputSchema } from './MessageUncheckedCreateWithoutReactionsInputSchema';

export const MessageCreateOrConnectWithoutReactionsInputSchema: z.ZodType<Prisma.MessageCreateOrConnectWithoutReactionsInput> = z.object({
  where: z.lazy(() => MessageWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MessageCreateWithoutReactionsInputSchema),z.lazy(() => MessageUncheckedCreateWithoutReactionsInputSchema) ]),
}).strict();

export default MessageCreateOrConnectWithoutReactionsInputSchema;
