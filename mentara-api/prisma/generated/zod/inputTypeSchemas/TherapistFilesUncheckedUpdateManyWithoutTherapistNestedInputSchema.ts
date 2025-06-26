import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistFilesCreateWithoutTherapistInputSchema } from './TherapistFilesCreateWithoutTherapistInputSchema';
import { TherapistFilesUncheckedCreateWithoutTherapistInputSchema } from './TherapistFilesUncheckedCreateWithoutTherapistInputSchema';
import { TherapistFilesCreateOrConnectWithoutTherapistInputSchema } from './TherapistFilesCreateOrConnectWithoutTherapistInputSchema';
import { TherapistFilesUpsertWithWhereUniqueWithoutTherapistInputSchema } from './TherapistFilesUpsertWithWhereUniqueWithoutTherapistInputSchema';
import { TherapistFilesCreateManyTherapistInputEnvelopeSchema } from './TherapistFilesCreateManyTherapistInputEnvelopeSchema';
import { TherapistFilesWhereUniqueInputSchema } from './TherapistFilesWhereUniqueInputSchema';
import { TherapistFilesUpdateWithWhereUniqueWithoutTherapistInputSchema } from './TherapistFilesUpdateWithWhereUniqueWithoutTherapistInputSchema';
import { TherapistFilesUpdateManyWithWhereWithoutTherapistInputSchema } from './TherapistFilesUpdateManyWithWhereWithoutTherapistInputSchema';
import { TherapistFilesScalarWhereInputSchema } from './TherapistFilesScalarWhereInputSchema';

export const TherapistFilesUncheckedUpdateManyWithoutTherapistNestedInputSchema: z.ZodType<Prisma.TherapistFilesUncheckedUpdateManyWithoutTherapistNestedInput> = z.object({
  create: z.union([ z.lazy(() => TherapistFilesCreateWithoutTherapistInputSchema),z.lazy(() => TherapistFilesCreateWithoutTherapistInputSchema).array(),z.lazy(() => TherapistFilesUncheckedCreateWithoutTherapistInputSchema),z.lazy(() => TherapistFilesUncheckedCreateWithoutTherapistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TherapistFilesCreateOrConnectWithoutTherapistInputSchema),z.lazy(() => TherapistFilesCreateOrConnectWithoutTherapistInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TherapistFilesUpsertWithWhereUniqueWithoutTherapistInputSchema),z.lazy(() => TherapistFilesUpsertWithWhereUniqueWithoutTherapistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TherapistFilesCreateManyTherapistInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TherapistFilesWhereUniqueInputSchema),z.lazy(() => TherapistFilesWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TherapistFilesWhereUniqueInputSchema),z.lazy(() => TherapistFilesWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TherapistFilesWhereUniqueInputSchema),z.lazy(() => TherapistFilesWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TherapistFilesWhereUniqueInputSchema),z.lazy(() => TherapistFilesWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TherapistFilesUpdateWithWhereUniqueWithoutTherapistInputSchema),z.lazy(() => TherapistFilesUpdateWithWhereUniqueWithoutTherapistInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TherapistFilesUpdateManyWithWhereWithoutTherapistInputSchema),z.lazy(() => TherapistFilesUpdateManyWithWhereWithoutTherapistInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TherapistFilesScalarWhereInputSchema),z.lazy(() => TherapistFilesScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default TherapistFilesUncheckedUpdateManyWithoutTherapistNestedInputSchema;
