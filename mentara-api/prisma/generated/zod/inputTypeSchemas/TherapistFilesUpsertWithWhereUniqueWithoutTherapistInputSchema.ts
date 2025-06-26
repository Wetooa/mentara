import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistFilesWhereUniqueInputSchema } from './TherapistFilesWhereUniqueInputSchema';
import { TherapistFilesUpdateWithoutTherapistInputSchema } from './TherapistFilesUpdateWithoutTherapistInputSchema';
import { TherapistFilesUncheckedUpdateWithoutTherapistInputSchema } from './TherapistFilesUncheckedUpdateWithoutTherapistInputSchema';
import { TherapistFilesCreateWithoutTherapistInputSchema } from './TherapistFilesCreateWithoutTherapistInputSchema';
import { TherapistFilesUncheckedCreateWithoutTherapistInputSchema } from './TherapistFilesUncheckedCreateWithoutTherapistInputSchema';

export const TherapistFilesUpsertWithWhereUniqueWithoutTherapistInputSchema: z.ZodType<Prisma.TherapistFilesUpsertWithWhereUniqueWithoutTherapistInput> = z.object({
  where: z.lazy(() => TherapistFilesWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => TherapistFilesUpdateWithoutTherapistInputSchema),z.lazy(() => TherapistFilesUncheckedUpdateWithoutTherapistInputSchema) ]),
  create: z.union([ z.lazy(() => TherapistFilesCreateWithoutTherapistInputSchema),z.lazy(() => TherapistFilesUncheckedCreateWithoutTherapistInputSchema) ]),
}).strict();

export default TherapistFilesUpsertWithWhereUniqueWithoutTherapistInputSchema;
