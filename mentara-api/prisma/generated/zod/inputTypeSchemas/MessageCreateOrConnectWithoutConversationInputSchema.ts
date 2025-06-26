import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';
import { MessageCreateWithoutConversationInputSchema } from './MessageCreateWithoutConversationInputSchema';
import { MessageUncheckedCreateWithoutConversationInputSchema } from './MessageUncheckedCreateWithoutConversationInputSchema';

export const MessageCreateOrConnectWithoutConversationInputSchema: z.ZodType<Prisma.MessageCreateOrConnectWithoutConversationInput> = z.object({
  where: z.lazy(() => MessageWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MessageCreateWithoutConversationInputSchema),z.lazy(() => MessageUncheckedCreateWithoutConversationInputSchema) ]),
}).strict();

export default MessageCreateOrConnectWithoutConversationInputSchema;
