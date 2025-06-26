import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistAvailabilityWhereInputSchema } from '../inputTypeSchemas/TherapistAvailabilityWhereInputSchema'
import { TherapistAvailabilityOrderByWithRelationInputSchema } from '../inputTypeSchemas/TherapistAvailabilityOrderByWithRelationInputSchema'
import { TherapistAvailabilityWhereUniqueInputSchema } from '../inputTypeSchemas/TherapistAvailabilityWhereUniqueInputSchema'

export const TherapistAvailabilityAggregateArgsSchema: z.ZodType<Prisma.TherapistAvailabilityAggregateArgs> = z.object({
  where: TherapistAvailabilityWhereInputSchema.optional(),
  orderBy: z.union([ TherapistAvailabilityOrderByWithRelationInputSchema.array(),TherapistAvailabilityOrderByWithRelationInputSchema ]).optional(),
  cursor: TherapistAvailabilityWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default TherapistAvailabilityAggregateArgsSchema;
