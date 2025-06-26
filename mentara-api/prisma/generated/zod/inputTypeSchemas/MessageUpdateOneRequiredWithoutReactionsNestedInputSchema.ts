import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageCreateWithoutReactionsInputSchema } from './MessageCreateWithoutReactionsInputSchema';
import { MessageUncheckedCreateWithoutReactionsInputSchema } from './MessageUncheckedCreateWithoutReactionsInputSchema';
import { MessageCreateOrConnectWithoutReactionsInputSchema } from './MessageCreateOrConnectWithoutReactionsInputSchema';
import { MessageUpsertWithoutReactionsInputSchema } from './MessageUpsertWithoutReactionsInputSchema';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';
import { MessageUpdateToOneWithWhereWithoutReactionsInputSchema } from './MessageUpdateToOneWithWhereWithoutReactionsInputSchema';
import { MessageUpdateWithoutReactionsInputSchema } from './MessageUpdateWithoutReactionsInputSchema';
import { MessageUncheckedUpdateWithoutReactionsInputSchema } from './MessageUncheckedUpdateWithoutReactionsInputSchema';

export const MessageUpdateOneRequiredWithoutReactionsNestedInputSchema: z.ZodType<Prisma.MessageUpdateOneRequiredWithoutReactionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => MessageCreateWithoutReactionsInputSchema),z.lazy(() => MessageUncheckedCreateWithoutReactionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => MessageCreateOrConnectWithoutReactionsInputSchema).optional(),
  upsert: z.lazy(() => MessageUpsertWithoutReactionsInputSchema).optional(),
  connect: z.lazy(() => MessageWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => MessageUpdateToOneWithWhereWithoutReactionsInputSchema),z.lazy(() => MessageUpdateWithoutReactionsInputSchema),z.lazy(() => MessageUncheckedUpdateWithoutReactionsInputSchema) ]).optional(),
}).strict();

export default MessageUpdateOneRequiredWithoutReactionsNestedInputSchema;
