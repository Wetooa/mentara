import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TypingIndicatorWhereInputSchema } from '../inputTypeSchemas/TypingIndicatorWhereInputSchema'
import { TypingIndicatorOrderByWithAggregationInputSchema } from '../inputTypeSchemas/TypingIndicatorOrderByWithAggregationInputSchema'
import { TypingIndicatorScalarFieldEnumSchema } from '../inputTypeSchemas/TypingIndicatorScalarFieldEnumSchema'
import { TypingIndicatorScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/TypingIndicatorScalarWhereWithAggregatesInputSchema'

export const TypingIndicatorGroupByArgsSchema: z.ZodType<Prisma.TypingIndicatorGroupByArgs> = z.object({
  where: TypingIndicatorWhereInputSchema.optional(),
  orderBy: z.union([ TypingIndicatorOrderByWithAggregationInputSchema.array(),TypingIndicatorOrderByWithAggregationInputSchema ]).optional(),
  by: TypingIndicatorScalarFieldEnumSchema.array(),
  having: TypingIndicatorScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default TypingIndicatorGroupByArgsSchema;
