import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const TherapistFilesUncheckedCreateWithoutTherapistInputSchema: z.ZodType<Prisma.TherapistFilesUncheckedCreateWithoutTherapistInput> = z.object({
  id: z.string(),
  fileUrl: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default TherapistFilesUncheckedCreateWithoutTherapistInputSchema;
