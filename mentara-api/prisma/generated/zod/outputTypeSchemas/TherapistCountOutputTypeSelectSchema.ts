import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const TherapistCountOutputTypeSelectSchema: z.ZodType<Prisma.TherapistCountOutputTypeSelect> = z.object({
  meetings: z.boolean().optional(),
  therapistAvailabilities: z.boolean().optional(),
  worksheets: z.boolean().optional(),
  assignedClients: z.boolean().optional(),
  reviews: z.boolean().optional(),
  therapistFiles: z.boolean().optional(),
}).strict();

export default TherapistCountOutputTypeSelectSchema;
