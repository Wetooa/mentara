import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistAvailabilityIncludeSchema } from '../inputTypeSchemas/TherapistAvailabilityIncludeSchema'
import { TherapistAvailabilityWhereInputSchema } from '../inputTypeSchemas/TherapistAvailabilityWhereInputSchema'
import { TherapistAvailabilityOrderByWithRelationInputSchema } from '../inputTypeSchemas/TherapistAvailabilityOrderByWithRelationInputSchema'
import { TherapistAvailabilityWhereUniqueInputSchema } from '../inputTypeSchemas/TherapistAvailabilityWhereUniqueInputSchema'
import { TherapistAvailabilityScalarFieldEnumSchema } from '../inputTypeSchemas/TherapistAvailabilityScalarFieldEnumSchema'
import { TherapistArgsSchema } from "../outputTypeSchemas/TherapistArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const TherapistAvailabilitySelectSchema: z.ZodType<Prisma.TherapistAvailabilitySelect> = z.object({
  id: z.boolean().optional(),
  therapistId: z.boolean().optional(),
  dayOfWeek: z.boolean().optional(),
  startTime: z.boolean().optional(),
  endTime: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  notes: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  therapist: z.union([z.boolean(),z.lazy(() => TherapistArgsSchema)]).optional(),
}).strict()

export const TherapistAvailabilityFindFirstArgsSchema: z.ZodType<Prisma.TherapistAvailabilityFindFirstArgs> = z.object({
  select: TherapistAvailabilitySelectSchema.optional(),
  include: z.lazy(() => TherapistAvailabilityIncludeSchema).optional(),
  where: TherapistAvailabilityWhereInputSchema.optional(),
  orderBy: z.union([ TherapistAvailabilityOrderByWithRelationInputSchema.array(),TherapistAvailabilityOrderByWithRelationInputSchema ]).optional(),
  cursor: TherapistAvailabilityWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TherapistAvailabilityScalarFieldEnumSchema,TherapistAvailabilityScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default TherapistAvailabilityFindFirstArgsSchema;
