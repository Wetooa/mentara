import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageReactionCreateManyInputSchema } from '../inputTypeSchemas/MessageReactionCreateManyInputSchema'

export const MessageReactionCreateManyArgsSchema: z.ZodType<Prisma.MessageReactionCreateManyArgs> = z.object({
  data: z.union([ MessageReactionCreateManyInputSchema,MessageReactionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default MessageReactionCreateManyArgsSchema;
