import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistUpdateWithoutMeetingsInputSchema } from './TherapistUpdateWithoutMeetingsInputSchema';
import { TherapistUncheckedUpdateWithoutMeetingsInputSchema } from './TherapistUncheckedUpdateWithoutMeetingsInputSchema';
import { TherapistCreateWithoutMeetingsInputSchema } from './TherapistCreateWithoutMeetingsInputSchema';
import { TherapistUncheckedCreateWithoutMeetingsInputSchema } from './TherapistUncheckedCreateWithoutMeetingsInputSchema';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';

export const TherapistUpsertWithoutMeetingsInputSchema: z.ZodType<Prisma.TherapistUpsertWithoutMeetingsInput> = z.object({
  update: z.union([ z.lazy(() => TherapistUpdateWithoutMeetingsInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutMeetingsInputSchema) ]),
  create: z.union([ z.lazy(() => TherapistCreateWithoutMeetingsInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutMeetingsInputSchema) ]),
  where: z.lazy(() => TherapistWhereInputSchema).optional()
}).strict();

export default TherapistUpsertWithoutMeetingsInputSchema;
