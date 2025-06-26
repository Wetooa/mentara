import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';
import { MessageCreateWithoutSenderInputSchema } from './MessageCreateWithoutSenderInputSchema';
import { MessageUncheckedCreateWithoutSenderInputSchema } from './MessageUncheckedCreateWithoutSenderInputSchema';

export const MessageCreateOrConnectWithoutSenderInputSchema: z.ZodType<Prisma.MessageCreateOrConnectWithoutSenderInput> = z.object({
  where: z.lazy(() => MessageWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MessageCreateWithoutSenderInputSchema),z.lazy(() => MessageUncheckedCreateWithoutSenderInputSchema) ]),
}).strict();

export default MessageCreateOrConnectWithoutSenderInputSchema;
