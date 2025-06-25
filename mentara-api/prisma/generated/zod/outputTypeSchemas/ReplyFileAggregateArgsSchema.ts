import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyFileWhereInputSchema } from '../inputTypeSchemas/ReplyFileWhereInputSchema'
import { ReplyFileOrderByWithRelationInputSchema } from '../inputTypeSchemas/ReplyFileOrderByWithRelationInputSchema'
import { ReplyFileWhereUniqueInputSchema } from '../inputTypeSchemas/ReplyFileWhereUniqueInputSchema'

export const ReplyFileAggregateArgsSchema: z.ZodType<Prisma.ReplyFileAggregateArgs> = z.object({
  where: ReplyFileWhereInputSchema.optional(),
  orderBy: z.union([ ReplyFileOrderByWithRelationInputSchema.array(),ReplyFileOrderByWithRelationInputSchema ]).optional(),
  cursor: ReplyFileWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ReplyFileAggregateArgsSchema;
