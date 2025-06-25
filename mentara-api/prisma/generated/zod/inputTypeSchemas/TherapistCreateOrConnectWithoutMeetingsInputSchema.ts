import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';
import { TherapistCreateWithoutMeetingsInputSchema } from './TherapistCreateWithoutMeetingsInputSchema';
import { TherapistUncheckedCreateWithoutMeetingsInputSchema } from './TherapistUncheckedCreateWithoutMeetingsInputSchema';

export const TherapistCreateOrConnectWithoutMeetingsInputSchema: z.ZodType<Prisma.TherapistCreateOrConnectWithoutMeetingsInput> = z.object({
  where: z.lazy(() => TherapistWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TherapistCreateWithoutMeetingsInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutMeetingsInputSchema) ]),
}).strict();

export default TherapistCreateOrConnectWithoutMeetingsInputSchema;
