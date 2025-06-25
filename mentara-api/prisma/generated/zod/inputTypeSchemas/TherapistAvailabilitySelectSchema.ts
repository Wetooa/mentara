import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistArgsSchema } from "../outputTypeSchemas/TherapistArgsSchema"

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

export default TherapistAvailabilitySelectSchema;
