import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorCommunityWhereInputSchema } from '../inputTypeSchemas/ModeratorCommunityWhereInputSchema'
import { ModeratorCommunityOrderByWithRelationInputSchema } from '../inputTypeSchemas/ModeratorCommunityOrderByWithRelationInputSchema'
import { ModeratorCommunityWhereUniqueInputSchema } from '../inputTypeSchemas/ModeratorCommunityWhereUniqueInputSchema'

export const ModeratorCommunityAggregateArgsSchema: z.ZodType<Prisma.ModeratorCommunityAggregateArgs> = z.object({
  where: ModeratorCommunityWhereInputSchema.optional(),
  orderBy: z.union([ ModeratorCommunityOrderByWithRelationInputSchema.array(),ModeratorCommunityOrderByWithRelationInputSchema ]).optional(),
  cursor: ModeratorCommunityWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ModeratorCommunityAggregateArgsSchema;
