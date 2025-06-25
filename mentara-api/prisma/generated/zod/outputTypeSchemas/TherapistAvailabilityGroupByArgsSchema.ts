import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistAvailabilityWhereInputSchema } from '../inputTypeSchemas/TherapistAvailabilityWhereInputSchema'
import { TherapistAvailabilityOrderByWithAggregationInputSchema } from '../inputTypeSchemas/TherapistAvailabilityOrderByWithAggregationInputSchema'
import { TherapistAvailabilityScalarFieldEnumSchema } from '../inputTypeSchemas/TherapistAvailabilityScalarFieldEnumSchema'
import { TherapistAvailabilityScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/TherapistAvailabilityScalarWhereWithAggregatesInputSchema'

export const TherapistAvailabilityGroupByArgsSchema: z.ZodType<Prisma.TherapistAvailabilityGroupByArgs> = z.object({
  where: TherapistAvailabilityWhereInputSchema.optional(),
  orderBy: z.union([ TherapistAvailabilityOrderByWithAggregationInputSchema.array(),TherapistAvailabilityOrderByWithAggregationInputSchema ]).optional(),
  by: TherapistAvailabilityScalarFieldEnumSchema.array(),
  having: TherapistAvailabilityScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default TherapistAvailabilityGroupByArgsSchema;
