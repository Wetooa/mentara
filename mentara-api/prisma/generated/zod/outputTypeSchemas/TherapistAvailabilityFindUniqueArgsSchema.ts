import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistAvailabilityIncludeSchema } from '../inputTypeSchemas/TherapistAvailabilityIncludeSchema'
import { TherapistAvailabilityWhereUniqueInputSchema } from '../inputTypeSchemas/TherapistAvailabilityWhereUniqueInputSchema'
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

export const TherapistAvailabilityFindUniqueArgsSchema: z.ZodType<Prisma.TherapistAvailabilityFindUniqueArgs> = z.object({
  select: TherapistAvailabilitySelectSchema.optional(),
  include: z.lazy(() => TherapistAvailabilityIncludeSchema).optional(),
  where: TherapistAvailabilityWhereUniqueInputSchema,
}).strict() ;

export default TherapistAvailabilityFindUniqueArgsSchema;
