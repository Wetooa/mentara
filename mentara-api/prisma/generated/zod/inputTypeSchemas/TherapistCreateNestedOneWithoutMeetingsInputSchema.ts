import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateWithoutMeetingsInputSchema } from './TherapistCreateWithoutMeetingsInputSchema';
import { TherapistUncheckedCreateWithoutMeetingsInputSchema } from './TherapistUncheckedCreateWithoutMeetingsInputSchema';
import { TherapistCreateOrConnectWithoutMeetingsInputSchema } from './TherapistCreateOrConnectWithoutMeetingsInputSchema';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';

export const TherapistCreateNestedOneWithoutMeetingsInputSchema: z.ZodType<Prisma.TherapistCreateNestedOneWithoutMeetingsInput> = z.object({
  create: z.union([ z.lazy(() => TherapistCreateWithoutMeetingsInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutMeetingsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TherapistCreateOrConnectWithoutMeetingsInputSchema).optional(),
  connect: z.lazy(() => TherapistWhereUniqueInputSchema).optional()
}).strict();

export default TherapistCreateNestedOneWithoutMeetingsInputSchema;
