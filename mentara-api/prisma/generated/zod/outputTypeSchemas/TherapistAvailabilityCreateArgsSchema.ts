import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistAvailabilityIncludeSchema } from '../inputTypeSchemas/TherapistAvailabilityIncludeSchema'
import { TherapistAvailabilityCreateInputSchema } from '../inputTypeSchemas/TherapistAvailabilityCreateInputSchema'
import { TherapistAvailabilityUncheckedCreateInputSchema } from '../inputTypeSchemas/TherapistAvailabilityUncheckedCreateInputSchema'
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

export const TherapistAvailabilityCreateArgsSchema: z.ZodType<Prisma.TherapistAvailabilityCreateArgs> = z.object({
  select: TherapistAvailabilitySelectSchema.optional(),
  include: z.lazy(() => TherapistAvailabilityIncludeSchema).optional(),
  data: z.union([ TherapistAvailabilityCreateInputSchema,TherapistAvailabilityUncheckedCreateInputSchema ]),
}).strict() ;

export default TherapistAvailabilityCreateArgsSchema;
