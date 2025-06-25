import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateWithoutWorksheetsInputSchema } from './TherapistCreateWithoutWorksheetsInputSchema';
import { TherapistUncheckedCreateWithoutWorksheetsInputSchema } from './TherapistUncheckedCreateWithoutWorksheetsInputSchema';
import { TherapistCreateOrConnectWithoutWorksheetsInputSchema } from './TherapistCreateOrConnectWithoutWorksheetsInputSchema';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';

export const TherapistCreateNestedOneWithoutWorksheetsInputSchema: z.ZodType<Prisma.TherapistCreateNestedOneWithoutWorksheetsInput> = z.object({
  create: z.union([ z.lazy(() => TherapistCreateWithoutWorksheetsInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutWorksheetsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TherapistCreateOrConnectWithoutWorksheetsInputSchema).optional(),
  connect: z.lazy(() => TherapistWhereUniqueInputSchema).optional()
}).strict();

export default TherapistCreateNestedOneWithoutWorksheetsInputSchema;
