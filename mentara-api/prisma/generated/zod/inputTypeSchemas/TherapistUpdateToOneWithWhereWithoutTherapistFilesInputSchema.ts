import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';
import { TherapistUpdateWithoutTherapistFilesInputSchema } from './TherapistUpdateWithoutTherapistFilesInputSchema';
import { TherapistUncheckedUpdateWithoutTherapistFilesInputSchema } from './TherapistUncheckedUpdateWithoutTherapistFilesInputSchema';

export const TherapistUpdateToOneWithWhereWithoutTherapistFilesInputSchema: z.ZodType<Prisma.TherapistUpdateToOneWithWhereWithoutTherapistFilesInput> = z.object({
  where: z.lazy(() => TherapistWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => TherapistUpdateWithoutTherapistFilesInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutTherapistFilesInputSchema) ]),
}).strict();

export default TherapistUpdateToOneWithWhereWithoutTherapistFilesInputSchema;
