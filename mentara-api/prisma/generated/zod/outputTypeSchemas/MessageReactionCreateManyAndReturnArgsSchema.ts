import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageReactionCreateManyInputSchema } from '../inputTypeSchemas/MessageReactionCreateManyInputSchema'

export const MessageReactionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.MessageReactionCreateManyAndReturnArgs> = z.object({
  data: z.union([ MessageReactionCreateManyInputSchema,MessageReactionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default MessageReactionCreateManyAndReturnArgsSchema;
