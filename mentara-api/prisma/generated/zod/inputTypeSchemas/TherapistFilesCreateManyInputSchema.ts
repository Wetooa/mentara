import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const TherapistFilesCreateManyInputSchema: z.ZodType<Prisma.TherapistFilesCreateManyInput> = z.object({
  id: z.string(),
  therapistId: z.string(),
  fileUrl: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default TherapistFilesCreateManyInputSchema;
