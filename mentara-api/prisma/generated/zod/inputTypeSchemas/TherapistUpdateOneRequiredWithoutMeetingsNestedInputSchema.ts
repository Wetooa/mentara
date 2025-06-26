import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateWithoutMeetingsInputSchema } from './TherapistCreateWithoutMeetingsInputSchema';
import { TherapistUncheckedCreateWithoutMeetingsInputSchema } from './TherapistUncheckedCreateWithoutMeetingsInputSchema';
import { TherapistCreateOrConnectWithoutMeetingsInputSchema } from './TherapistCreateOrConnectWithoutMeetingsInputSchema';
import { TherapistUpsertWithoutMeetingsInputSchema } from './TherapistUpsertWithoutMeetingsInputSchema';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';
import { TherapistUpdateToOneWithWhereWithoutMeetingsInputSchema } from './TherapistUpdateToOneWithWhereWithoutMeetingsInputSchema';
import { TherapistUpdateWithoutMeetingsInputSchema } from './TherapistUpdateWithoutMeetingsInputSchema';
import { TherapistUncheckedUpdateWithoutMeetingsInputSchema } from './TherapistUncheckedUpdateWithoutMeetingsInputSchema';

export const TherapistUpdateOneRequiredWithoutMeetingsNestedInputSchema: z.ZodType<Prisma.TherapistUpdateOneRequiredWithoutMeetingsNestedInput> = z.object({
  create: z.union([ z.lazy(() => TherapistCreateWithoutMeetingsInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutMeetingsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TherapistCreateOrConnectWithoutMeetingsInputSchema).optional(),
  upsert: z.lazy(() => TherapistUpsertWithoutMeetingsInputSchema).optional(),
  connect: z.lazy(() => TherapistWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TherapistUpdateToOneWithWhereWithoutMeetingsInputSchema),z.lazy(() => TherapistUpdateWithoutMeetingsInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutMeetingsInputSchema) ]).optional(),
}).strict();

export default TherapistUpdateOneRequiredWithoutMeetingsNestedInputSchema;
