import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';
import { MessageUpdateWithoutConversationInputSchema } from './MessageUpdateWithoutConversationInputSchema';
import { MessageUncheckedUpdateWithoutConversationInputSchema } from './MessageUncheckedUpdateWithoutConversationInputSchema';
import { MessageCreateWithoutConversationInputSchema } from './MessageCreateWithoutConversationInputSchema';
import { MessageUncheckedCreateWithoutConversationInputSchema } from './MessageUncheckedCreateWithoutConversationInputSchema';

export const MessageUpsertWithWhereUniqueWithoutConversationInputSchema: z.ZodType<Prisma.MessageUpsertWithWhereUniqueWithoutConversationInput> = z.object({
  where: z.lazy(() => MessageWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MessageUpdateWithoutConversationInputSchema),z.lazy(() => MessageUncheckedUpdateWithoutConversationInputSchema) ]),
  create: z.union([ z.lazy(() => MessageCreateWithoutConversationInputSchema),z.lazy(() => MessageUncheckedCreateWithoutConversationInputSchema) ]),
}).strict();

export default MessageUpsertWithWhereUniqueWithoutConversationInputSchema;
