import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistUpdateWithoutTherapistFilesInputSchema } from './TherapistUpdateWithoutTherapistFilesInputSchema';
import { TherapistUncheckedUpdateWithoutTherapistFilesInputSchema } from './TherapistUncheckedUpdateWithoutTherapistFilesInputSchema';
import { TherapistCreateWithoutTherapistFilesInputSchema } from './TherapistCreateWithoutTherapistFilesInputSchema';
import { TherapistUncheckedCreateWithoutTherapistFilesInputSchema } from './TherapistUncheckedCreateWithoutTherapistFilesInputSchema';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';

export const TherapistUpsertWithoutTherapistFilesInputSchema: z.ZodType<Prisma.TherapistUpsertWithoutTherapistFilesInput> = z.object({
  update: z.union([ z.lazy(() => TherapistUpdateWithoutTherapistFilesInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutTherapistFilesInputSchema) ]),
  create: z.union([ z.lazy(() => TherapistCreateWithoutTherapistFilesInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutTherapistFilesInputSchema) ]),
  where: z.lazy(() => TherapistWhereInputSchema).optional()
}).strict();

export default TherapistUpsertWithoutTherapistFilesInputSchema;
