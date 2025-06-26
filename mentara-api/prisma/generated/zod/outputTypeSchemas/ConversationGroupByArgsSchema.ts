import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationWhereInputSchema } from '../inputTypeSchemas/ConversationWhereInputSchema'
import { ConversationOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ConversationOrderByWithAggregationInputSchema'
import { ConversationScalarFieldEnumSchema } from '../inputTypeSchemas/ConversationScalarFieldEnumSchema'
import { ConversationScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ConversationScalarWhereWithAggregatesInputSchema'

export const ConversationGroupByArgsSchema: z.ZodType<Prisma.ConversationGroupByArgs> = z.object({
  where: ConversationWhereInputSchema.optional(),
  orderBy: z.union([ ConversationOrderByWithAggregationInputSchema.array(),ConversationOrderByWithAggregationInputSchema ]).optional(),
  by: ConversationScalarFieldEnumSchema.array(),
  having: ConversationScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ConversationGroupByArgsSchema;
