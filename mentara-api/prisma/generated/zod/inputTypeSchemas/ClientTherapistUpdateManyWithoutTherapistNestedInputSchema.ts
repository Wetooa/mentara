import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientTherapistCreateWithoutTherapistInputSchema } from './ClientTherapistCreateWithoutTherapistInputSchema';
import { ClientTherapistUncheckedCreateWithoutTherapistInputSchema } from './ClientTherapistUncheckedCreateWithoutTherapistInputSchema';
import { ClientTherapistCreateOrConnectWithoutTherapistInputSchema } from './ClientTherapistCreateOrConnectWithoutTherapistInputSchema';
import { ClientTherapistUpsertWithWhereUniqueWithoutTherapistInputSchema } from './ClientTherapistUpsertWithWhereUniqueWithoutTherapistInputSchema';
import { ClientTherapistCreateManyTherapistInputEnvelopeSchema } from './ClientTherapistCreateManyTherapistInputEnvelopeSchema';
import { ClientTherapistWhereUniqueInputSchema } from './ClientTherapistWhereUniqueInputSchema';
import { ClientTherapistUpdateWithWhereUniqueWithoutTherapistInputSchema } from './ClientTherapistUpdateWithWhereUniqueWithoutTherapistInputSchema';
import { ClientTherapistUpdateManyWithWhereWithoutTherapistInputSchema } from './ClientTherapistUpdateManyWithWhereWithoutTherapistInputSchema';
import { ClientTherapistScalarWhereInputSchema } from './ClientTherapistScalarWhereInputSchema';

export const ClientTherapistUpdateManyWithoutTherapistNestedInputSchema: z.ZodType<Prisma.ClientTherapistUpdateManyWithoutTherapistNestedInput> = z.object({
  create: z.union([ z.lazy(() => ClientTherapistCreateWithoutTherapistInputSchema),z.lazy(() => ClientTherapistCreateWithoutTherapistInputSchema).array(),z.lazy(() => ClientTherapistUncheckedCreateWithoutTherapistInputSchema),z.lazy(() => ClientTherapistUncheckedCreateWithoutTherapistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ClientTherapistCreateOrConnectWithoutTherapistInputSchema),z.lazy(() => ClientTherapistCreateOrConnectWithoutTherapistInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ClientTherapistUpsertWithWhereUniqueWithoutTherapistInputSchema),z.lazy(() => ClientTherapistUpsertWithWhereUniqueWithoutTherapistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ClientTherapistCreateManyTherapistInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ClientTherapistWhereUniqueInputSchema),z.lazy(() => ClientTherapistWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ClientTherapistWhereUniqueInputSchema),z.lazy(() => ClientTherapistWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ClientTherapistWhereUniqueInputSchema),z.lazy(() => ClientTherapistWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ClientTherapistWhereUniqueInputSchema),z.lazy(() => ClientTherapistWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ClientTherapistUpdateWithWhereUniqueWithoutTherapistInputSchema),z.lazy(() => ClientTherapistUpdateWithWhereUniqueWithoutTherapistInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ClientTherapistUpdateManyWithWhereWithoutTherapistInputSchema),z.lazy(() => ClientTherapistUpdateManyWithWhereWithoutTherapistInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ClientTherapistScalarWhereInputSchema),z.lazy(() => ClientTherapistScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ClientTherapistUpdateManyWithoutTherapistNestedInputSchema;
