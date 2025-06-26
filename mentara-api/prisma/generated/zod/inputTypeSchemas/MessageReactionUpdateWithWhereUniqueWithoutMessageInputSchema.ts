import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReactionWhereUniqueInputSchema } from './MessageReactionWhereUniqueInputSchema';
import { MessageReactionUpdateWithoutMessageInputSchema } from './MessageReactionUpdateWithoutMessageInputSchema';
import { MessageReactionUncheckedUpdateWithoutMessageInputSchema } from './MessageReactionUncheckedUpdateWithoutMessageInputSchema';

export const MessageReactionUpdateWithWhereUniqueWithoutMessageInputSchema: z.ZodType<Prisma.MessageReactionUpdateWithWhereUniqueWithoutMessageInput> = z.object({
  where: z.lazy(() => MessageReactionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MessageReactionUpdateWithoutMessageInputSchema),z.lazy(() => MessageReactionUncheckedUpdateWithoutMessageInputSchema) ]),
}).strict();

export default MessageReactionUpdateWithWhereUniqueWithoutMessageInputSchema;
