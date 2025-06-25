import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';
import { TherapistUpdateWithoutMeetingsInputSchema } from './TherapistUpdateWithoutMeetingsInputSchema';
import { TherapistUncheckedUpdateWithoutMeetingsInputSchema } from './TherapistUncheckedUpdateWithoutMeetingsInputSchema';

export const TherapistUpdateToOneWithWhereWithoutMeetingsInputSchema: z.ZodType<Prisma.TherapistUpdateToOneWithWhereWithoutMeetingsInput> = z.object({
  where: z.lazy(() => TherapistWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => TherapistUpdateWithoutMeetingsInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutMeetingsInputSchema) ]),
}).strict();

export default TherapistUpdateToOneWithWhereWithoutMeetingsInputSchema;
