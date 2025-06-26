import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistFilesWhereUniqueInputSchema } from './TherapistFilesWhereUniqueInputSchema';
import { TherapistFilesUpdateWithoutTherapistInputSchema } from './TherapistFilesUpdateWithoutTherapistInputSchema';
import { TherapistFilesUncheckedUpdateWithoutTherapistInputSchema } from './TherapistFilesUncheckedUpdateWithoutTherapistInputSchema';

export const TherapistFilesUpdateWithWhereUniqueWithoutTherapistInputSchema: z.ZodType<Prisma.TherapistFilesUpdateWithWhereUniqueWithoutTherapistInput> = z.object({
  where: z.lazy(() => TherapistFilesWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => TherapistFilesUpdateWithoutTherapistInputSchema),z.lazy(() => TherapistFilesUncheckedUpdateWithoutTherapistInputSchema) ]),
}).strict();

export default TherapistFilesUpdateWithWhereUniqueWithoutTherapistInputSchema;
