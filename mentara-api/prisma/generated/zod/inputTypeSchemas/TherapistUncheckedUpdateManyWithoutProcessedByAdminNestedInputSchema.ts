import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateWithoutProcessedByAdminInputSchema } from './TherapistCreateWithoutProcessedByAdminInputSchema';
import { TherapistUncheckedCreateWithoutProcessedByAdminInputSchema } from './TherapistUncheckedCreateWithoutProcessedByAdminInputSchema';
import { TherapistCreateOrConnectWithoutProcessedByAdminInputSchema } from './TherapistCreateOrConnectWithoutProcessedByAdminInputSchema';
import { TherapistUpsertWithWhereUniqueWithoutProcessedByAdminInputSchema } from './TherapistUpsertWithWhereUniqueWithoutProcessedByAdminInputSchema';
import { TherapistCreateManyProcessedByAdminInputEnvelopeSchema } from './TherapistCreateManyProcessedByAdminInputEnvelopeSchema';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';
import { TherapistUpdateWithWhereUniqueWithoutProcessedByAdminInputSchema } from './TherapistUpdateWithWhereUniqueWithoutProcessedByAdminInputSchema';
import { TherapistUpdateManyWithWhereWithoutProcessedByAdminInputSchema } from './TherapistUpdateManyWithWhereWithoutProcessedByAdminInputSchema';
import { TherapistScalarWhereInputSchema } from './TherapistScalarWhereInputSchema';

export const TherapistUncheckedUpdateManyWithoutProcessedByAdminNestedInputSchema: z.ZodType<Prisma.TherapistUncheckedUpdateManyWithoutProcessedByAdminNestedInput> = z.object({
  create: z.union([ z.lazy(() => TherapistCreateWithoutProcessedByAdminInputSchema),z.lazy(() => TherapistCreateWithoutProcessedByAdminInputSchema).array(),z.lazy(() => TherapistUncheckedCreateWithoutProcessedByAdminInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutProcessedByAdminInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TherapistCreateOrConnectWithoutProcessedByAdminInputSchema),z.lazy(() => TherapistCreateOrConnectWithoutProcessedByAdminInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TherapistUpsertWithWhereUniqueWithoutProcessedByAdminInputSchema),z.lazy(() => TherapistUpsertWithWhereUniqueWithoutProcessedByAdminInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TherapistCreateManyProcessedByAdminInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TherapistWhereUniqueInputSchema),z.lazy(() => TherapistWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TherapistWhereUniqueInputSchema),z.lazy(() => TherapistWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TherapistWhereUniqueInputSchema),z.lazy(() => TherapistWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TherapistWhereUniqueInputSchema),z.lazy(() => TherapistWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TherapistUpdateWithWhereUniqueWithoutProcessedByAdminInputSchema),z.lazy(() => TherapistUpdateWithWhereUniqueWithoutProcessedByAdminInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TherapistUpdateManyWithWhereWithoutProcessedByAdminInputSchema),z.lazy(() => TherapistUpdateManyWithWhereWithoutProcessedByAdminInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TherapistScalarWhereInputSchema),z.lazy(() => TherapistScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default TherapistUncheckedUpdateManyWithoutProcessedByAdminNestedInputSchema;
