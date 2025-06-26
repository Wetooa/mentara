import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReactionWhereUniqueInputSchema } from './MessageReactionWhereUniqueInputSchema';
import { MessageReactionCreateWithoutUserInputSchema } from './MessageReactionCreateWithoutUserInputSchema';
import { MessageReactionUncheckedCreateWithoutUserInputSchema } from './MessageReactionUncheckedCreateWithoutUserInputSchema';

export const MessageReactionCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.MessageReactionCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => MessageReactionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MessageReactionCreateWithoutUserInputSchema),z.lazy(() => MessageReactionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default MessageReactionCreateOrConnectWithoutUserInputSchema;
