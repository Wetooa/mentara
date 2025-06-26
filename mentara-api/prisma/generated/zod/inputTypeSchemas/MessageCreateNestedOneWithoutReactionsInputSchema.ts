import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageCreateWithoutReactionsInputSchema } from './MessageCreateWithoutReactionsInputSchema';
import { MessageUncheckedCreateWithoutReactionsInputSchema } from './MessageUncheckedCreateWithoutReactionsInputSchema';
import { MessageCreateOrConnectWithoutReactionsInputSchema } from './MessageCreateOrConnectWithoutReactionsInputSchema';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';

export const MessageCreateNestedOneWithoutReactionsInputSchema: z.ZodType<Prisma.MessageCreateNestedOneWithoutReactionsInput> = z.object({
  create: z.union([ z.lazy(() => MessageCreateWithoutReactionsInputSchema),z.lazy(() => MessageUncheckedCreateWithoutReactionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => MessageCreateOrConnectWithoutReactionsInputSchema).optional(),
  connect: z.lazy(() => MessageWhereUniqueInputSchema).optional()
}).strict();

export default MessageCreateNestedOneWithoutReactionsInputSchema;
