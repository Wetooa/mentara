import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';
import { TherapistCreateWithoutWorksheetsInputSchema } from './TherapistCreateWithoutWorksheetsInputSchema';
import { TherapistUncheckedCreateWithoutWorksheetsInputSchema } from './TherapistUncheckedCreateWithoutWorksheetsInputSchema';

export const TherapistCreateOrConnectWithoutWorksheetsInputSchema: z.ZodType<Prisma.TherapistCreateOrConnectWithoutWorksheetsInput> = z.object({
  where: z.lazy(() => TherapistWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TherapistCreateWithoutWorksheetsInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutWorksheetsInputSchema) ]),
}).strict();

export default TherapistCreateOrConnectWithoutWorksheetsInputSchema;
