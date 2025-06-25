import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistUpdateWithoutUserInputSchema } from './TherapistUpdateWithoutUserInputSchema';
import { TherapistUncheckedUpdateWithoutUserInputSchema } from './TherapistUncheckedUpdateWithoutUserInputSchema';
import { TherapistCreateWithoutUserInputSchema } from './TherapistCreateWithoutUserInputSchema';
import { TherapistUncheckedCreateWithoutUserInputSchema } from './TherapistUncheckedCreateWithoutUserInputSchema';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';

export const TherapistUpsertWithoutUserInputSchema: z.ZodType<Prisma.TherapistUpsertWithoutUserInput> = z.object({
  update: z.union([ z.lazy(() => TherapistUpdateWithoutUserInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => TherapistCreateWithoutUserInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutUserInputSchema) ]),
  where: z.lazy(() => TherapistWhereInputSchema).optional()
}).strict();

export default TherapistUpsertWithoutUserInputSchema;
