import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageReactionWhereInputSchema } from '../inputTypeSchemas/MessageReactionWhereInputSchema'
import { MessageReactionOrderByWithRelationInputSchema } from '../inputTypeSchemas/MessageReactionOrderByWithRelationInputSchema'
import { MessageReactionWhereUniqueInputSchema } from '../inputTypeSchemas/MessageReactionWhereUniqueInputSchema'

export const MessageReactionAggregateArgsSchema: z.ZodType<Prisma.MessageReactionAggregateArgs> = z.object({
  where: MessageReactionWhereInputSchema.optional(),
  orderBy: z.union([ MessageReactionOrderByWithRelationInputSchema.array(),MessageReactionOrderByWithRelationInputSchema ]).optional(),
  cursor: MessageReactionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default MessageReactionAggregateArgsSchema;
