import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistWhereInputSchema } from '../inputTypeSchemas/TherapistWhereInputSchema'
import { TherapistOrderByWithRelationInputSchema } from '../inputTypeSchemas/TherapistOrderByWithRelationInputSchema'
import { TherapistWhereUniqueInputSchema } from '../inputTypeSchemas/TherapistWhereUniqueInputSchema'

export const TherapistAggregateArgsSchema: z.ZodType<Prisma.TherapistAggregateArgs> = z.object({
  where: TherapistWhereInputSchema.optional(),
  orderBy: z.union([ TherapistOrderByWithRelationInputSchema.array(),TherapistOrderByWithRelationInputSchema ]).optional(),
  cursor: TherapistWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default TherapistAggregateArgsSchema;
