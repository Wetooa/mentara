import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorWhereInputSchema } from '../inputTypeSchemas/ModeratorWhereInputSchema'
import { ModeratorOrderByWithRelationInputSchema } from '../inputTypeSchemas/ModeratorOrderByWithRelationInputSchema'
import { ModeratorWhereUniqueInputSchema } from '../inputTypeSchemas/ModeratorWhereUniqueInputSchema'

export const ModeratorAggregateArgsSchema: z.ZodType<Prisma.ModeratorAggregateArgs> = z.object({
  where: ModeratorWhereInputSchema.optional(),
  orderBy: z.union([ ModeratorOrderByWithRelationInputSchema.array(),ModeratorOrderByWithRelationInputSchema ]).optional(),
  cursor: ModeratorWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ModeratorAggregateArgsSchema;
