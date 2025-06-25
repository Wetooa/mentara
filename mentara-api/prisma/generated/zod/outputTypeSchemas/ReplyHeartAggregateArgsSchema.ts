import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyHeartWhereInputSchema } from '../inputTypeSchemas/ReplyHeartWhereInputSchema'
import { ReplyHeartOrderByWithRelationInputSchema } from '../inputTypeSchemas/ReplyHeartOrderByWithRelationInputSchema'
import { ReplyHeartWhereUniqueInputSchema } from '../inputTypeSchemas/ReplyHeartWhereUniqueInputSchema'

export const ReplyHeartAggregateArgsSchema: z.ZodType<Prisma.ReplyHeartAggregateArgs> = z.object({
  where: ReplyHeartWhereInputSchema.optional(),
  orderBy: z.union([ ReplyHeartOrderByWithRelationInputSchema.array(),ReplyHeartOrderByWithRelationInputSchema ]).optional(),
  cursor: ReplyHeartWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ReplyHeartAggregateArgsSchema;
