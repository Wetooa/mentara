import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';
import { TherapistCreateWithoutUserInputSchema } from './TherapistCreateWithoutUserInputSchema';
import { TherapistUncheckedCreateWithoutUserInputSchema } from './TherapistUncheckedCreateWithoutUserInputSchema';

export const TherapistCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.TherapistCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => TherapistWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TherapistCreateWithoutUserInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default TherapistCreateOrConnectWithoutUserInputSchema;
