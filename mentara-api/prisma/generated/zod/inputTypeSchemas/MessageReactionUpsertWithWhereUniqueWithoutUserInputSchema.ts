import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReactionWhereUniqueInputSchema } from './MessageReactionWhereUniqueInputSchema';
import { MessageReactionUpdateWithoutUserInputSchema } from './MessageReactionUpdateWithoutUserInputSchema';
import { MessageReactionUncheckedUpdateWithoutUserInputSchema } from './MessageReactionUncheckedUpdateWithoutUserInputSchema';
import { MessageReactionCreateWithoutUserInputSchema } from './MessageReactionCreateWithoutUserInputSchema';
import { MessageReactionUncheckedCreateWithoutUserInputSchema } from './MessageReactionUncheckedCreateWithoutUserInputSchema';

export const MessageReactionUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.MessageReactionUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => MessageReactionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MessageReactionUpdateWithoutUserInputSchema),z.lazy(() => MessageReactionUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => MessageReactionCreateWithoutUserInputSchema),z.lazy(() => MessageReactionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default MessageReactionUpsertWithWhereUniqueWithoutUserInputSchema;
