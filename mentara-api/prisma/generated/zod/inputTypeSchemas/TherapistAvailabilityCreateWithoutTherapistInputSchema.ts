import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const TherapistAvailabilityCreateWithoutTherapistInputSchema: z.ZodType<Prisma.TherapistAvailabilityCreateWithoutTherapistInput> = z.object({
  id: z.string().uuid().optional(),
  dayOfWeek: z.number().int(),
  startTime: z.string(),
  endTime: z.string(),
  isAvailable: z.boolean().optional(),
  notes: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default TherapistAvailabilityCreateWithoutTherapistInputSchema;
