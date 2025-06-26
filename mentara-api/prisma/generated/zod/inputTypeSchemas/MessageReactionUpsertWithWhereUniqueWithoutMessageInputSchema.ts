import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReactionWhereUniqueInputSchema } from './MessageReactionWhereUniqueInputSchema';
import { MessageReactionUpdateWithoutMessageInputSchema } from './MessageReactionUpdateWithoutMessageInputSchema';
import { MessageReactionUncheckedUpdateWithoutMessageInputSchema } from './MessageReactionUncheckedUpdateWithoutMessageInputSchema';
import { MessageReactionCreateWithoutMessageInputSchema } from './MessageReactionCreateWithoutMessageInputSchema';
import { MessageReactionUncheckedCreateWithoutMessageInputSchema } from './MessageReactionUncheckedCreateWithoutMessageInputSchema';

export const MessageReactionUpsertWithWhereUniqueWithoutMessageInputSchema: z.ZodType<Prisma.MessageReactionUpsertWithWhereUniqueWithoutMessageInput> = z.object({
  where: z.lazy(() => MessageReactionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MessageReactionUpdateWithoutMessageInputSchema),z.lazy(() => MessageReactionUncheckedUpdateWithoutMessageInputSchema) ]),
  create: z.union([ z.lazy(() => MessageReactionCreateWithoutMessageInputSchema),z.lazy(() => MessageReactionUncheckedCreateWithoutMessageInputSchema) ]),
}).strict();

export default MessageReactionUpsertWithWhereUniqueWithoutMessageInputSchema;
