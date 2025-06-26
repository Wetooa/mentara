import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const WorksheetCreateManyTherapistInputSchema: z.ZodType<Prisma.WorksheetCreateManyTherapistInput> = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default WorksheetCreateManyTherapistInputSchema;
