import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorCommunityWhereInputSchema } from '../inputTypeSchemas/ModeratorCommunityWhereInputSchema'
import { ModeratorCommunityOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ModeratorCommunityOrderByWithAggregationInputSchema'
import { ModeratorCommunityScalarFieldEnumSchema } from '../inputTypeSchemas/ModeratorCommunityScalarFieldEnumSchema'
import { ModeratorCommunityScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ModeratorCommunityScalarWhereWithAggregatesInputSchema'

export const ModeratorCommunityGroupByArgsSchema: z.ZodType<Prisma.ModeratorCommunityGroupByArgs> = z.object({
  where: ModeratorCommunityWhereInputSchema.optional(),
  orderBy: z.union([ ModeratorCommunityOrderByWithAggregationInputSchema.array(),ModeratorCommunityOrderByWithAggregationInputSchema ]).optional(),
  by: ModeratorCommunityScalarFieldEnumSchema.array(),
  having: ModeratorCommunityScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ModeratorCommunityGroupByArgsSchema;
