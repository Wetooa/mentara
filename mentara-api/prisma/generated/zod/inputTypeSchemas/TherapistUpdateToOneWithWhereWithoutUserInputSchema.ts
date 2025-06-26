import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';
import { TherapistUpdateWithoutUserInputSchema } from './TherapistUpdateWithoutUserInputSchema';
import { TherapistUncheckedUpdateWithoutUserInputSchema } from './TherapistUncheckedUpdateWithoutUserInputSchema';

export const TherapistUpdateToOneWithWhereWithoutUserInputSchema: z.ZodType<Prisma.TherapistUpdateToOneWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => TherapistWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => TherapistUpdateWithoutUserInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default TherapistUpdateToOneWithWhereWithoutUserInputSchema;
