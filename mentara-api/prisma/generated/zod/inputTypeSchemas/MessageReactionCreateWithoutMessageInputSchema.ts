import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutMessageReactionsInputSchema } from './UserCreateNestedOneWithoutMessageReactionsInputSchema';

export const MessageReactionCreateWithoutMessageInputSchema: z.ZodType<Prisma.MessageReactionCreateWithoutMessageInput> = z.object({
  id: z.string().uuid().optional(),
  emoji: z.string(),
  createdAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutMessageReactionsInputSchema)
}).strict();

export default MessageReactionCreateWithoutMessageInputSchema;
