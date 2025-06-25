import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';
import { TherapistUpdateWithoutWorksheetsInputSchema } from './TherapistUpdateWithoutWorksheetsInputSchema';
import { TherapistUncheckedUpdateWithoutWorksheetsInputSchema } from './TherapistUncheckedUpdateWithoutWorksheetsInputSchema';

export const TherapistUpdateToOneWithWhereWithoutWorksheetsInputSchema: z.ZodType<Prisma.TherapistUpdateToOneWithWhereWithoutWorksheetsInput> = z.object({
  where: z.lazy(() => TherapistWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => TherapistUpdateWithoutWorksheetsInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutWorksheetsInputSchema) ]),
}).strict();

export default TherapistUpdateToOneWithWhereWithoutWorksheetsInputSchema;
