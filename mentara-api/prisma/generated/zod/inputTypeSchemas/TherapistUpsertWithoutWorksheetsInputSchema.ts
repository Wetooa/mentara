import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistUpdateWithoutWorksheetsInputSchema } from './TherapistUpdateWithoutWorksheetsInputSchema';
import { TherapistUncheckedUpdateWithoutWorksheetsInputSchema } from './TherapistUncheckedUpdateWithoutWorksheetsInputSchema';
import { TherapistCreateWithoutWorksheetsInputSchema } from './TherapistCreateWithoutWorksheetsInputSchema';
import { TherapistUncheckedCreateWithoutWorksheetsInputSchema } from './TherapistUncheckedCreateWithoutWorksheetsInputSchema';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';

export const TherapistUpsertWithoutWorksheetsInputSchema: z.ZodType<Prisma.TherapistUpsertWithoutWorksheetsInput> = z.object({
  update: z.union([ z.lazy(() => TherapistUpdateWithoutWorksheetsInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutWorksheetsInputSchema) ]),
  create: z.union([ z.lazy(() => TherapistCreateWithoutWorksheetsInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutWorksheetsInputSchema) ]),
  where: z.lazy(() => TherapistWhereInputSchema).optional()
}).strict();

export default TherapistUpsertWithoutWorksheetsInputSchema;
