import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationWhereInputSchema } from '../inputTypeSchemas/ConversationWhereInputSchema'
import { ConversationOrderByWithRelationInputSchema } from '../inputTypeSchemas/ConversationOrderByWithRelationInputSchema'
import { ConversationWhereUniqueInputSchema } from '../inputTypeSchemas/ConversationWhereUniqueInputSchema'

export const ConversationAggregateArgsSchema: z.ZodType<Prisma.ConversationAggregateArgs> = z.object({
  where: ConversationWhereInputSchema.optional(),
  orderBy: z.union([ ConversationOrderByWithRelationInputSchema.array(),ConversationOrderByWithRelationInputSchema ]).optional(),
  cursor: ConversationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ConversationAggregateArgsSchema;
