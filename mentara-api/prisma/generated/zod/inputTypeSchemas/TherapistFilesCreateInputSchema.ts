import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateNestedOneWithoutTherapistFilesInputSchema } from './TherapistCreateNestedOneWithoutTherapistFilesInputSchema';

export const TherapistFilesCreateInputSchema: z.ZodType<Prisma.TherapistFilesCreateInput> = z.object({
  id: z.string(),
  fileUrl: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  therapist: z.lazy(() => TherapistCreateNestedOneWithoutTherapistFilesInputSchema)
}).strict();

export default TherapistFilesCreateInputSchema;
