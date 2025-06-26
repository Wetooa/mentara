import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';
import { TherapistUpdateWithoutProcessedByAdminInputSchema } from './TherapistUpdateWithoutProcessedByAdminInputSchema';
import { TherapistUncheckedUpdateWithoutProcessedByAdminInputSchema } from './TherapistUncheckedUpdateWithoutProcessedByAdminInputSchema';
import { TherapistCreateWithoutProcessedByAdminInputSchema } from './TherapistCreateWithoutProcessedByAdminInputSchema';
import { TherapistUncheckedCreateWithoutProcessedByAdminInputSchema } from './TherapistUncheckedCreateWithoutProcessedByAdminInputSchema';

export const TherapistUpsertWithWhereUniqueWithoutProcessedByAdminInputSchema: z.ZodType<Prisma.TherapistUpsertWithWhereUniqueWithoutProcessedByAdminInput> = z.object({
  where: z.lazy(() => TherapistWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => TherapistUpdateWithoutProcessedByAdminInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutProcessedByAdminInputSchema) ]),
  create: z.union([ z.lazy(() => TherapistCreateWithoutProcessedByAdminInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutProcessedByAdminInputSchema) ]),
}).strict();

export default TherapistUpsertWithWhereUniqueWithoutProcessedByAdminInputSchema;
