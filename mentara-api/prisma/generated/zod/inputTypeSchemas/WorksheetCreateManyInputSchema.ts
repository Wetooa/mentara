import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const WorksheetCreateManyInputSchema: z.ZodType<Prisma.WorksheetCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string(),
  therapistId: z.string().optional().nullable(),
  title: z.string(),
  description: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default WorksheetCreateManyInputSchema;
