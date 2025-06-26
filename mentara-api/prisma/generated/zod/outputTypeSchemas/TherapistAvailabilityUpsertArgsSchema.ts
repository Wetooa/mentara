import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistAvailabilityIncludeSchema } from '../inputTypeSchemas/TherapistAvailabilityIncludeSchema'
import { TherapistAvailabilityWhereUniqueInputSchema } from '../inputTypeSchemas/TherapistAvailabilityWhereUniqueInputSchema'
import { TherapistAvailabilityCreateInputSchema } from '../inputTypeSchemas/TherapistAvailabilityCreateInputSchema'
import { TherapistAvailabilityUncheckedCreateInputSchema } from '../inputTypeSchemas/TherapistAvailabilityUncheckedCreateInputSchema'
import { TherapistAvailabilityUpdateInputSchema } from '../inputTypeSchemas/TherapistAvailabilityUpdateInputSchema'
import { TherapistAvailabilityUncheckedUpdateInputSchema } from '../inputTypeSchemas/TherapistAvailabilityUncheckedUpdateInputSchema'
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

export const TherapistAvailabilityUpsertArgsSchema: z.ZodType<Prisma.TherapistAvailabilityUpsertArgs> = z.object({
  select: TherapistAvailabilitySelectSchema.optional(),
  include: z.lazy(() => TherapistAvailabilityIncludeSchema).optional(),
  where: TherapistAvailabilityWhereUniqueInputSchema,
  create: z.union([ TherapistAvailabilityCreateInputSchema,TherapistAvailabilityUncheckedCreateInputSchema ]),
  update: z.union([ TherapistAvailabilityUpdateInputSchema,TherapistAvailabilityUncheckedUpdateInputSchema ]),
}).strict() ;

export default TherapistAvailabilityUpsertArgsSchema;
