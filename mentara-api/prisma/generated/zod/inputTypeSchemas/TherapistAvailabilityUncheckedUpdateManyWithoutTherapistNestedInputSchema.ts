import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistAvailabilityCreateWithoutTherapistInputSchema } from './TherapistAvailabilityCreateWithoutTherapistInputSchema';
import { TherapistAvailabilityUncheckedCreateWithoutTherapistInputSchema } from './TherapistAvailabilityUncheckedCreateWithoutTherapistInputSchema';
import { TherapistAvailabilityCreateOrConnectWithoutTherapistInputSchema } from './TherapistAvailabilityCreateOrConnectWithoutTherapistInputSchema';
import { TherapistAvailabilityUpsertWithWhereUniqueWithoutTherapistInputSchema } from './TherapistAvailabilityUpsertWithWhereUniqueWithoutTherapistInputSchema';
import { TherapistAvailabilityCreateManyTherapistInputEnvelopeSchema } from './TherapistAvailabilityCreateManyTherapistInputEnvelopeSchema';
import { TherapistAvailabilityWhereUniqueInputSchema } from './TherapistAvailabilityWhereUniqueInputSchema';
import { TherapistAvailabilityUpdateWithWhereUniqueWithoutTherapistInputSchema } from './TherapistAvailabilityUpdateWithWhereUniqueWithoutTherapistInputSchema';
import { TherapistAvailabilityUpdateManyWithWhereWithoutTherapistInputSchema } from './TherapistAvailabilityUpdateManyWithWhereWithoutTherapistInputSchema';
import { TherapistAvailabilityScalarWhereInputSchema } from './TherapistAvailabilityScalarWhereInputSchema';

export const TherapistAvailabilityUncheckedUpdateManyWithoutTherapistNestedInputSchema: z.ZodType<Prisma.TherapistAvailabilityUncheckedUpdateManyWithoutTherapistNestedInput> = z.object({
  create: z.union([ z.lazy(() => TherapistAvailabilityCreateWithoutTherapistInputSchema),z.lazy(() => TherapistAvailabilityCreateWithoutTherapistInputSchema).array(),z.lazy(() => TherapistAvailabilityUncheckedCreateWithoutTherapistInputSchema),z.lazy(() => TherapistAvailabilityUncheckedCreateWithoutTherapistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TherapistAvailabilityCreateOrConnectWithoutTherapistInputSchema),z.lazy(() => TherapistAvailabilityCreateOrConnectWithoutTherapistInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TherapistAvailabilityUpsertWithWhereUniqueWithoutTherapistInputSchema),z.lazy(() => TherapistAvailabilityUpsertWithWhereUniqueWithoutTherapistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TherapistAvailabilityCreateManyTherapistInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TherapistAvailabilityWhereUniqueInputSchema),z.lazy(() => TherapistAvailabilityWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TherapistAvailabilityWhereUniqueInputSchema),z.lazy(() => TherapistAvailabilityWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TherapistAvailabilityWhereUniqueInputSchema),z.lazy(() => TherapistAvailabilityWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TherapistAvailabilityWhereUniqueInputSchema),z.lazy(() => TherapistAvailabilityWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TherapistAvailabilityUpdateWithWhereUniqueWithoutTherapistInputSchema),z.lazy(() => TherapistAvailabilityUpdateWithWhereUniqueWithoutTherapistInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TherapistAvailabilityUpdateManyWithWhereWithoutTherapistInputSchema),z.lazy(() => TherapistAvailabilityUpdateManyWithWhereWithoutTherapistInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TherapistAvailabilityScalarWhereInputSchema),z.lazy(() => TherapistAvailabilityScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default TherapistAvailabilityUncheckedUpdateManyWithoutTherapistNestedInputSchema;
