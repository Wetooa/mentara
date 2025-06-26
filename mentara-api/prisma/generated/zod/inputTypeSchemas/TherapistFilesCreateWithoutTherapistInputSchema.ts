import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const TherapistFilesCreateWithoutTherapistInputSchema: z.ZodType<Prisma.TherapistFilesCreateWithoutTherapistInput> = z.object({
  id: z.string(),
  fileUrl: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default TherapistFilesCreateWithoutTherapistInputSchema;
