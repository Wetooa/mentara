import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorWhereInputSchema } from '../inputTypeSchemas/ModeratorWhereInputSchema'
import { ModeratorOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ModeratorOrderByWithAggregationInputSchema'
import { ModeratorScalarFieldEnumSchema } from '../inputTypeSchemas/ModeratorScalarFieldEnumSchema'
import { ModeratorScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ModeratorScalarWhereWithAggregatesInputSchema'

export const ModeratorGroupByArgsSchema: z.ZodType<Prisma.ModeratorGroupByArgs> = z.object({
  where: ModeratorWhereInputSchema.optional(),
  orderBy: z.union([ ModeratorOrderByWithAggregationInputSchema.array(),ModeratorOrderByWithAggregationInputSchema ]).optional(),
  by: ModeratorScalarFieldEnumSchema.array(),
  having: ModeratorScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ModeratorGroupByArgsSchema;
