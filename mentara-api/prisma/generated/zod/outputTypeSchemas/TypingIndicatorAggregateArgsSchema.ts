import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TypingIndicatorWhereInputSchema } from '../inputTypeSchemas/TypingIndicatorWhereInputSchema'
import { TypingIndicatorOrderByWithRelationInputSchema } from '../inputTypeSchemas/TypingIndicatorOrderByWithRelationInputSchema'
import { TypingIndicatorWhereUniqueInputSchema } from '../inputTypeSchemas/TypingIndicatorWhereUniqueInputSchema'

export const TypingIndicatorAggregateArgsSchema: z.ZodType<Prisma.TypingIndicatorAggregateArgs> = z.object({
  where: TypingIndicatorWhereInputSchema.optional(),
  orderBy: z.union([ TypingIndicatorOrderByWithRelationInputSchema.array(),TypingIndicatorOrderByWithRelationInputSchema ]).optional(),
  cursor: TypingIndicatorWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default TypingIndicatorAggregateArgsSchema;
