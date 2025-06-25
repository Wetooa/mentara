import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateWithoutTherapistAvailabilitiesInputSchema } from './TherapistCreateWithoutTherapistAvailabilitiesInputSchema';
import { TherapistUncheckedCreateWithoutTherapistAvailabilitiesInputSchema } from './TherapistUncheckedCreateWithoutTherapistAvailabilitiesInputSchema';
import { TherapistCreateOrConnectWithoutTherapistAvailabilitiesInputSchema } from './TherapistCreateOrConnectWithoutTherapistAvailabilitiesInputSchema';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';

export const TherapistCreateNestedOneWithoutTherapistAvailabilitiesInputSchema: z.ZodType<Prisma.TherapistCreateNestedOneWithoutTherapistAvailabilitiesInput> = z.object({
  create: z.union([ z.lazy(() => TherapistCreateWithoutTherapistAvailabilitiesInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutTherapistAvailabilitiesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TherapistCreateOrConnectWithoutTherapistAvailabilitiesInputSchema).optional(),
  connect: z.lazy(() => TherapistWhereUniqueInputSchema).optional()
}).strict();

export default TherapistCreateNestedOneWithoutTherapistAvailabilitiesInputSchema;
