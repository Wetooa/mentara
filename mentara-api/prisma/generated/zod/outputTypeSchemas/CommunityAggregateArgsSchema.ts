import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommunityWhereInputSchema } from '../inputTypeSchemas/CommunityWhereInputSchema'
import { CommunityOrderByWithRelationInputSchema } from '../inputTypeSchemas/CommunityOrderByWithRelationInputSchema'
import { CommunityWhereUniqueInputSchema } from '../inputTypeSchemas/CommunityWhereUniqueInputSchema'

export const CommunityAggregateArgsSchema: z.ZodType<Prisma.CommunityAggregateArgs> = z.object({
  where: CommunityWhereInputSchema.optional(),
  orderBy: z.union([ CommunityOrderByWithRelationInputSchema.array(),CommunityOrderByWithRelationInputSchema ]).optional(),
  cursor: CommunityWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default CommunityAggregateArgsSchema;
