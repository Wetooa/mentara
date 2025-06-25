import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistAvailabilityCreateWithoutTherapistInputSchema } from './TherapistAvailabilityCreateWithoutTherapistInputSchema';
import { TherapistAvailabilityUncheckedCreateWithoutTherapistInputSchema } from './TherapistAvailabilityUncheckedCreateWithoutTherapistInputSchema';
import { TherapistAvailabilityCreateOrConnectWithoutTherapistInputSchema } from './TherapistAvailabilityCreateOrConnectWithoutTherapistInputSchema';
import { TherapistAvailabilityCreateManyTherapistInputEnvelopeSchema } from './TherapistAvailabilityCreateManyTherapistInputEnvelopeSchema';
import { TherapistAvailabilityWhereUniqueInputSchema } from './TherapistAvailabilityWhereUniqueInputSchema';

export const TherapistAvailabilityCreateNestedManyWithoutTherapistInputSchema: z.ZodType<Prisma.TherapistAvailabilityCreateNestedManyWithoutTherapistInput> = z.object({
  create: z.union([ z.lazy(() => TherapistAvailabilityCreateWithoutTherapistInputSchema),z.lazy(() => TherapistAvailabilityCreateWithoutTherapistInputSchema).array(),z.lazy(() => TherapistAvailabilityUncheckedCreateWithoutTherapistInputSchema),z.lazy(() => TherapistAvailabilityUncheckedCreateWithoutTherapistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TherapistAvailabilityCreateOrConnectWithoutTherapistInputSchema),z.lazy(() => TherapistAvailabilityCreateOrConnectWithoutTherapistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TherapistAvailabilityCreateManyTherapistInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TherapistAvailabilityWhereUniqueInputSchema),z.lazy(() => TherapistAvailabilityWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default TherapistAvailabilityCreateNestedManyWithoutTherapistInputSchema;
