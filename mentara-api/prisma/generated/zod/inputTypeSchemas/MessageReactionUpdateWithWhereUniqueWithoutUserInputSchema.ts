import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReactionWhereUniqueInputSchema } from './MessageReactionWhereUniqueInputSchema';
import { MessageReactionUpdateWithoutUserInputSchema } from './MessageReactionUpdateWithoutUserInputSchema';
import { MessageReactionUncheckedUpdateWithoutUserInputSchema } from './MessageReactionUncheckedUpdateWithoutUserInputSchema';

export const MessageReactionUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.MessageReactionUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => MessageReactionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MessageReactionUpdateWithoutUserInputSchema),z.lazy(() => MessageReactionUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default MessageReactionUpdateWithWhereUniqueWithoutUserInputSchema;
