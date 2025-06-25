import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistWhereInputSchema } from '../inputTypeSchemas/TherapistWhereInputSchema'
import { TherapistOrderByWithAggregationInputSchema } from '../inputTypeSchemas/TherapistOrderByWithAggregationInputSchema'
import { TherapistScalarFieldEnumSchema } from '../inputTypeSchemas/TherapistScalarFieldEnumSchema'
import { TherapistScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/TherapistScalarWhereWithAggregatesInputSchema'

export const TherapistGroupByArgsSchema: z.ZodType<Prisma.TherapistGroupByArgs> = z.object({
  where: TherapistWhereInputSchema.optional(),
  orderBy: z.union([ TherapistOrderByWithAggregationInputSchema.array(),TherapistOrderByWithAggregationInputSchema ]).optional(),
  by: TherapistScalarFieldEnumSchema.array(),
  having: TherapistScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default TherapistGroupByArgsSchema;
