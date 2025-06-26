import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';
import { TherapistCreateWithoutProcessedByAdminInputSchema } from './TherapistCreateWithoutProcessedByAdminInputSchema';
import { TherapistUncheckedCreateWithoutProcessedByAdminInputSchema } from './TherapistUncheckedCreateWithoutProcessedByAdminInputSchema';

export const TherapistCreateOrConnectWithoutProcessedByAdminInputSchema: z.ZodType<Prisma.TherapistCreateOrConnectWithoutProcessedByAdminInput> = z.object({
  where: z.lazy(() => TherapistWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TherapistCreateWithoutProcessedByAdminInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutProcessedByAdminInputSchema) ]),
}).strict();

export default TherapistCreateOrConnectWithoutProcessedByAdminInputSchema;
