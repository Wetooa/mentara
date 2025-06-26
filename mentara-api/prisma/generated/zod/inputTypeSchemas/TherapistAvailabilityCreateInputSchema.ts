import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateNestedOneWithoutTherapistAvailabilitiesInputSchema } from './TherapistCreateNestedOneWithoutTherapistAvailabilitiesInputSchema';

export const TherapistAvailabilityCreateInputSchema: z.ZodType<Prisma.TherapistAvailabilityCreateInput> = z.object({
  id: z.string().uuid().optional(),
  dayOfWeek: z.number().int(),
  startTime: z.string(),
  endTime: z.string(),
  isAvailable: z.boolean().optional(),
  notes: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  therapist: z.lazy(() => TherapistCreateNestedOneWithoutTherapistAvailabilitiesInputSchema)
}).strict();

export default TherapistAvailabilityCreateInputSchema;
