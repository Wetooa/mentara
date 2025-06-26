import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageCreateNestedOneWithoutReactionsInputSchema } from './MessageCreateNestedOneWithoutReactionsInputSchema';
import { UserCreateNestedOneWithoutMessageReactionsInputSchema } from './UserCreateNestedOneWithoutMessageReactionsInputSchema';

export const MessageReactionCreateInputSchema: z.ZodType<Prisma.MessageReactionCreateInput> = z.object({
  id: z.string().uuid().optional(),
  emoji: z.string(),
  createdAt: z.coerce.date().optional(),
  message: z.lazy(() => MessageCreateNestedOneWithoutReactionsInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutMessageReactionsInputSchema)
}).strict();

export default MessageReactionCreateInputSchema;
