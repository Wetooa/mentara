import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const TherapistAvailabilityTherapistIdDayOfWeekStartTimeEndTimeCompoundUniqueInputSchema: z.ZodType<Prisma.TherapistAvailabilityTherapistIdDayOfWeekStartTimeEndTimeCompoundUniqueInput> = z.object({
  therapistId: z.string(),
  dayOfWeek: z.number(),
  startTime: z.string(),
  endTime: z.string()
}).strict();

export default TherapistAvailabilityTherapistIdDayOfWeekStartTimeEndTimeCompoundUniqueInputSchema;
