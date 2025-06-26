import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommunityWhereInputSchema } from '../inputTypeSchemas/CommunityWhereInputSchema'
import { CommunityOrderByWithAggregationInputSchema } from '../inputTypeSchemas/CommunityOrderByWithAggregationInputSchema'
import { CommunityScalarFieldEnumSchema } from '../inputTypeSchemas/CommunityScalarFieldEnumSchema'
import { CommunityScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/CommunityScalarWhereWithAggregatesInputSchema'

export const CommunityGroupByArgsSchema: z.ZodType<Prisma.CommunityGroupByArgs> = z.object({
  where: CommunityWhereInputSchema.optional(),
  orderBy: z.union([ CommunityOrderByWithAggregationInputSchema.array(),CommunityOrderByWithAggregationInputSchema ]).optional(),
  by: CommunityScalarFieldEnumSchema.array(),
  having: CommunityScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default CommunityGroupByArgsSchema;
