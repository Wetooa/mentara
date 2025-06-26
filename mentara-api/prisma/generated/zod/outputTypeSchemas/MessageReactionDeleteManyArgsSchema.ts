import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageReactionWhereInputSchema } from '../inputTypeSchemas/MessageReactionWhereInputSchema'

export const MessageReactionDeleteManyArgsSchema: z.ZodType<Prisma.MessageReactionDeleteManyArgs> = z.object({
  where: MessageReactionWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default MessageReactionDeleteManyArgsSchema;
