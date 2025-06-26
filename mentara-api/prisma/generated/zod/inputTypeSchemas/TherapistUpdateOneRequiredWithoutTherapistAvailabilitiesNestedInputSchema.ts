import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateWithoutTherapistAvailabilitiesInputSchema } from './TherapistCreateWithoutTherapistAvailabilitiesInputSchema';
import { TherapistUncheckedCreateWithoutTherapistAvailabilitiesInputSchema } from './TherapistUncheckedCreateWithoutTherapistAvailabilitiesInputSchema';
import { TherapistCreateOrConnectWithoutTherapistAvailabilitiesInputSchema } from './TherapistCreateOrConnectWithoutTherapistAvailabilitiesInputSchema';
import { TherapistUpsertWithoutTherapistAvailabilitiesInputSchema } from './TherapistUpsertWithoutTherapistAvailabilitiesInputSchema';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';
import { TherapistUpdateToOneWithWhereWithoutTherapistAvailabilitiesInputSchema } from './TherapistUpdateToOneWithWhereWithoutTherapistAvailabilitiesInputSchema';
import { TherapistUpdateWithoutTherapistAvailabilitiesInputSchema } from './TherapistUpdateWithoutTherapistAvailabilitiesInputSchema';
import { TherapistUncheckedUpdateWithoutTherapistAvailabilitiesInputSchema } from './TherapistUncheckedUpdateWithoutTherapistAvailabilitiesInputSchema';

export const TherapistUpdateOneRequiredWithoutTherapistAvailabilitiesNestedInputSchema: z.ZodType<Prisma.TherapistUpdateOneRequiredWithoutTherapistAvailabilitiesNestedInput> = z.object({
  create: z.union([ z.lazy(() => TherapistCreateWithoutTherapistAvailabilitiesInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutTherapistAvailabilitiesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TherapistCreateOrConnectWithoutTherapistAvailabilitiesInputSchema).optional(),
  upsert: z.lazy(() => TherapistUpsertWithoutTherapistAvailabilitiesInputSchema).optional(),
  connect: z.lazy(() => TherapistWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TherapistUpdateToOneWithWhereWithoutTherapistAvailabilitiesInputSchema),z.lazy(() => TherapistUpdateWithoutTherapistAvailabilitiesInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutTherapistAvailabilitiesInputSchema) ]).optional(),
}).strict();

export default TherapistUpdateOneRequiredWithoutTherapistAvailabilitiesNestedInputSchema;
