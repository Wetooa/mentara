import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';
import { MessageCreateWithoutReplyToInputSchema } from './MessageCreateWithoutReplyToInputSchema';
import { MessageUncheckedCreateWithoutReplyToInputSchema } from './MessageUncheckedCreateWithoutReplyToInputSchema';

export const MessageCreateOrConnectWithoutReplyToInputSchema: z.ZodType<Prisma.MessageCreateOrConnectWithoutReplyToInput> = z.object({
  where: z.lazy(() => MessageWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MessageCreateWithoutReplyToInputSchema),z.lazy(() => MessageUncheckedCreateWithoutReplyToInputSchema) ]),
}).strict();

export default MessageCreateOrConnectWithoutReplyToInputSchema;
