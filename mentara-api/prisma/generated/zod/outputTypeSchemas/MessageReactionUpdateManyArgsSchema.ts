import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageReactionUpdateManyMutationInputSchema } from '../inputTypeSchemas/MessageReactionUpdateManyMutationInputSchema'
import { MessageReactionUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/MessageReactionUncheckedUpdateManyInputSchema'
import { MessageReactionWhereInputSchema } from '../inputTypeSchemas/MessageReactionWhereInputSchema'

export const MessageReactionUpdateManyArgsSchema: z.ZodType<Prisma.MessageReactionUpdateManyArgs> = z.object({
  data: z.union([ MessageReactionUpdateManyMutationInputSchema,MessageReactionUncheckedUpdateManyInputSchema ]),
  where: MessageReactionWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default MessageReactionUpdateManyArgsSchema;
