import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageReactionSelectSchema } from '../inputTypeSchemas/MessageReactionSelectSchema';
import { MessageReactionIncludeSchema } from '../inputTypeSchemas/MessageReactionIncludeSchema';

export const MessageReactionArgsSchema: z.ZodType<Prisma.MessageReactionDefaultArgs> = z.object({
  select: z.lazy(() => MessageReactionSelectSchema).optional(),
  include: z.lazy(() => MessageReactionIncludeSchema).optional(),
}).strict();

export default MessageReactionArgsSchema;
