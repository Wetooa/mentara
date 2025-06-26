import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReactionWhereUniqueInputSchema } from './MessageReactionWhereUniqueInputSchema';
import { MessageReactionCreateWithoutMessageInputSchema } from './MessageReactionCreateWithoutMessageInputSchema';
import { MessageReactionUncheckedCreateWithoutMessageInputSchema } from './MessageReactionUncheckedCreateWithoutMessageInputSchema';

export const MessageReactionCreateOrConnectWithoutMessageInputSchema: z.ZodType<Prisma.MessageReactionCreateOrConnectWithoutMessageInput> = z.object({
  where: z.lazy(() => MessageReactionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MessageReactionCreateWithoutMessageInputSchema),z.lazy(() => MessageReactionUncheckedCreateWithoutMessageInputSchema) ]),
}).strict();

export default MessageReactionCreateOrConnectWithoutMessageInputSchema;
