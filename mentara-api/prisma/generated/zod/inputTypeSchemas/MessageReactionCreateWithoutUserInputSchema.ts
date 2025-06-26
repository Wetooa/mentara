import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageCreateNestedOneWithoutReactionsInputSchema } from './MessageCreateNestedOneWithoutReactionsInputSchema';

export const MessageReactionCreateWithoutUserInputSchema: z.ZodType<Prisma.MessageReactionCreateWithoutUserInput> = z.object({
  id: z.string().uuid().optional(),
  emoji: z.string(),
  createdAt: z.coerce.date().optional(),
  message: z.lazy(() => MessageCreateNestedOneWithoutReactionsInputSchema)
}).strict();

export default MessageReactionCreateWithoutUserInputSchema;
