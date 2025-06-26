import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyWhereInputSchema } from '../inputTypeSchemas/ReplyWhereInputSchema'
import { ReplyOrderByWithRelationInputSchema } from '../inputTypeSchemas/ReplyOrderByWithRelationInputSchema'
import { ReplyWhereUniqueInputSchema } from '../inputTypeSchemas/ReplyWhereUniqueInputSchema'

export const ReplyAggregateArgsSchema: z.ZodType<Prisma.ReplyAggregateArgs> = z.object({
  where: ReplyWhereInputSchema.optional(),
  orderBy: z.union([ ReplyOrderByWithRelationInputSchema.array(),ReplyOrderByWithRelationInputSchema ]).optional(),
  cursor: ReplyWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ReplyAggregateArgsSchema;
