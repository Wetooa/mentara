import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageReactionWhereInputSchema } from '../inputTypeSchemas/MessageReactionWhereInputSchema'
import { MessageReactionOrderByWithAggregationInputSchema } from '../inputTypeSchemas/MessageReactionOrderByWithAggregationInputSchema'
import { MessageReactionScalarFieldEnumSchema } from '../inputTypeSchemas/MessageReactionScalarFieldEnumSchema'
import { MessageReactionScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/MessageReactionScalarWhereWithAggregatesInputSchema'

export const MessageReactionGroupByArgsSchema: z.ZodType<Prisma.MessageReactionGroupByArgs> = z.object({
  where: MessageReactionWhereInputSchema.optional(),
  orderBy: z.union([ MessageReactionOrderByWithAggregationInputSchema.array(),MessageReactionOrderByWithAggregationInputSchema ]).optional(),
  by: MessageReactionScalarFieldEnumSchema.array(),
  having: MessageReactionScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default MessageReactionGroupByArgsSchema;
